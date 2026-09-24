import { describe, expect, it } from 'vitest';

import type { Observation } from '../core/contracts';
import { getEntityObservations } from '../core/runtime-state';
import { scenario01EntityIds } from '../scenarios/scenario-01/baseline';
import { getScenario01EntityPresentation } from '../scenarios/scenario-01/entity-presentation';
import { scenario01InitialState } from '../scenarios/scenario-01/scenario';
import {
  getEntityDependencies,
  resolveEntityMetricSlots,
} from './entity-state';

function observationForMetric(metric: string): Observation {
  const observation = scenario01InitialState.observations.find(
    (candidate) => candidate.metric === metric,
  );

  if (!observation) {
    throw new Error(`Missing baseline observation for ${metric}.`);
  }

  return observation;
}

describe('entity current-state presentation', () => {
  it('keeps stable SUW tile slots and resolves current values', () => {
    const schema = getScenario01EntityPresentation(
      scenario01EntityIds.waterStation,
    );
    const observations = getEntityObservations(
      scenario01InitialState,
      scenario01EntityIds.waterStation,
    );
    const metrics = resolveEntityMetricSlots(observations, schema.tile);

    expect(metrics.map((metric) => metric.label)).toEqual([
      'Output pressure',
      'Reservoir',
      'Pump 1',
      'Pump 2',
      'Telemetry',
    ]);
    expect(metrics.map((metric) => metric.value)).toEqual([
      '4.6 bar',
      '78 %',
      'running',
      'running',
      '—',
    ]);
  });

  it('changes a fixed slot value without changing tile anatomy', () => {
    const schema = getScenario01EntityPresentation(
      scenario01EntityIds.waterStation,
    );
    const baseline = getEntityObservations(
      scenario01InitialState,
      scenario01EntityIds.waterStation,
    );
    const pumpState = observationForMetric('water.pumpState');
    const updatedPumpState: Observation = {
      ...pumpState,
      id: 'observation.test.suw.pump-state',
      value: {
        pump1: 'running',
        pump2: 'stopped',
        pump3: 'standby',
      },
      observedAt: scenario01InitialState.now + 1,
      receivedAt: scenario01InitialState.now + 1,
    };

    const before = resolveEntityMetricSlots(baseline, schema.tile);
    const after = resolveEntityMetricSlots(
      [...baseline, updatedPumpState],
      schema.tile,
    );

    expect(after.map((metric) => metric.label)).toEqual(
      before.map((metric) => metric.label),
    );
    expect(before.find((metric) => metric.id === 'pump-2')?.value).toBe(
      'running',
    );
    expect(after.find((metric) => metric.id === 'pump-2')?.value).toBe(
      'stopped',
    );
  });

  it('preserves an empty slot when no observation exists yet', () => {
    const schema = getScenario01EntityPresentation(
      scenario01EntityIds.mobileGenerator,
    );
    const observations = getEntityObservations(
      scenario01InitialState,
      scenario01EntityIds.mobileGenerator,
    );
    const metrics = resolveEntityMetricSlots(observations, schema.tile);
    const assignment = metrics.find((metric) => metric.id === 'assignment');

    expect(assignment).toMatchObject({
      label: 'Assignment',
      value: '—',
    });
    expect(assignment?.observation).toBeUndefined();
  });

  it('resolves direct and capability-backed dependencies for entity detail', () => {
    const dependencies = getEntityDependencies(
      scenario01InitialState,
      scenario01EntityIds.waterStation,
    );

    expect(dependencies.map((dependency) => dependency.id)).toEqual(
      expect.arrayContaining([
        'dependency.suw.powered-by.gpz',
        'dependency.suw.communicates-via.r4',
        'dependency.suw.controlled-via.r4',
        'dependency.hospital.supplied-by.suw',
        'dependency.suw.supported-by.ag400',
      ]),
    );
  });
});
