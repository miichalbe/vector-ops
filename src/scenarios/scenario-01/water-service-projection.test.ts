import { describe, expect, it } from 'vitest';

import type { Observation } from '../../core/contracts';
import { evaluateProjectionRules } from '../../core/runtime-projections';
import { scenario01EntityIds } from './baseline';
import { scenario01InitialState } from './scenario';
import {
  scenario01WaterServiceProjectionId,
  scenario01WaterServiceProjectionRule,
} from './water-service-projection';

function observation(
  id: string,
  entityId: string,
  metric: string,
  value: unknown,
  receivedAt: number,
): Observation {
  return {
    id,
    entityId,
    metric,
    value,
    observedAt: receivedAt,
    receivedAt,
    source: { type: 'system', id: 'projection-test' },
    quality: 'good',
    confidence: { level: 'high' },
    classification: 'fact',
  };
}

function stateWith(...observations: Observation[]) {
  return {
    ...scenario01InitialState,
    now: observations.at(-1)?.receivedAt ?? scenario01InitialState.now,
    observations: [...scenario01InitialState.observations, ...observations],
    projections: [],
  };
}

const reducedPumping = observation(
  'observation.scenario-01.suw.reduced-pumping',
  scenario01EntityIds.waterStation,
  'water.pumpState',
  { pump1: 'running', pump2: 'stopped', pump3: 'standby' },
  8 * 60 + 16,
);

describe('Scenario 01 water-service Projection P-03', () => {
  it('does not create P-03 before reduced pumping is observed', () => {
    const state = evaluateProjectionRules(
      scenario01InitialState,
      [scenario01WaterServiceProjectionRule],
    );

    expect(state).toBe(scenario01InitialState);
  });

  it('creates a bounded water-service margin Projection from reduced pumping', () => {
    const initial = stateWith(reducedPumping);
    const state = evaluateProjectionRules(
      initial,
      [scenario01WaterServiceProjectionRule],
    );
    const projection = state.projections.at(-1);

    expect(projection).toMatchObject({
      id: scenario01WaterServiceProjectionId,
      revision: 1,
      title:
        'Water-service margin may continue to decrease while reduced pumping persists',
      severity: 'warning',
      attention: 'review',
      status: 'projected',
    });
    expect(projection?.entityIds).toEqual([
      scenario01EntityIds.waterStation,
      scenario01EntityIds.countyHospital,
    ]);
    expect(projection?.dependencyIds).toEqual([
      'dependency.suw.powered-by.gpz',
      'dependency.hospital.supplied-by.suw',
    ]);
    expect(projection?.horizon.earliest).toBeGreaterThan(
      reducedPumping.receivedAt,
    );
  });

  it('revises P-03 as developing when the service margin is directly observed declining', () => {
    const declining = observation(
      'observation.scenario-01.suw.service-margin-declining',
      scenario01EntityIds.waterStation,
      'water.serviceMarginTrend',
      'declining',
      8 * 60 + 36,
    );
    const initial = stateWith(reducedPumping);
    const first = evaluateProjectionRules(
      initial,
      [scenario01WaterServiceProjectionRule],
    );
    const second = evaluateProjectionRules(
      {
        ...first,
        now: declining.receivedAt,
        observations: [...first.observations, declining],
      },
      [scenario01WaterServiceProjectionRule],
    );
    const projection = second.projections.at(-1);

    expect(projection).toMatchObject({
      revision: 2,
      title: 'Water-service margin is declining while reduced pumping persists',
      status: 'developing',
      attention: 'review',
    });
    expect(projection?.evidenceIds).toContain(declining.id);
  });

  it('adds critical-service context when the hospital requests continuity assurance', () => {
    const declining = observation(
      'observation.scenario-01.suw.service-margin-declining',
      scenario01EntityIds.waterStation,
      'water.serviceMarginTrend',
      'declining',
      8 * 60 + 36,
    );
    const hospitalServices = {
      ...observation(
        'observation.scenario-01.hospital.essential-services-maintained',
        scenario01EntityIds.countyHospital,
        'health.essentialServicesPosture',
        'maintained',
        8 * 60 + 53,
      ),
      classification: 'report' as const,
      source: {
        type: 'human-report' as const,
        id: 'hospital-duty-report',
      },
    };
    const hospitalRequest = {
      ...observation(
        'observation.scenario-01.hospital.continuity-request',
        scenario01EntityIds.countyHospital,
        'health.continuityRequest',
        'water-and-communications',
        8 * 60 + 53,
      ),
      classification: 'report' as const,
      source: {
        type: 'human-report' as const,
        id: 'hospital-duty-report',
      },
    };
    const state = evaluateProjectionRules(
      stateWith(
        reducedPumping,
        declining,
        hospitalServices,
        hospitalRequest,
      ),
      [scenario01WaterServiceProjectionRule],
    );
    const projection = state.projections.at(-1);

    expect(projection).toMatchObject({
      title:
        'Declining water-service margin increases contingency relevance for County Hospital Nowy Brzeg',
      status: 'developing',
      attention: 'act',
    });
    expect(projection?.evidenceIds).toEqual(
      expect.arrayContaining([hospitalServices.id, hospitalRequest.id]),
    );
    expect(
      projection?.assumptions.find(
        (assumption) =>
          assumption.id ===
          'assumption.scenario-01.p03.local-buffer-maintains-service',
      )?.status,
    ).toBe('supported');
  });

  it('marks the declining-margin consequence avoided after AG-400 support stabilises SUW', () => {
    const support = observation(
      'observation.scenario-01.suw.generator-support-active',
      scenario01EntityIds.waterStation,
      'water.powerSupport',
      'ag-400',
      8 * 60 + 50,
    );
    const stabilising = observation(
      'observation.scenario-01.suw.service-margin-stabilising',
      scenario01EntityIds.waterStation,
      'water.serviceMarginTrend',
      'stabilising',
      8 * 60 + 50,
    );
    const state = evaluateProjectionRules(
      stateWith(reducedPumping, support, stabilising),
      [scenario01WaterServiceProjectionRule],
    );
    const projection = state.projections.at(-1);

    expect(projection).toMatchObject({
      title:
        'Water-service margin risk is reducing after AG-400 support at SUW Kępa',
      severity: 'normal',
      attention: 'monitor',
      status: 'avoided',
    });
    expect(projection?.dependencyIds).toContain(
      'dependency.suw.supported-by.ag400',
    );
    expect(
      projection?.assumptions.find(
        (assumption) =>
          assumption.id === 'assumption.scenario-01.p03.no-effective-support',
      )?.status,
    ).toBe('invalidated');
  });
});
