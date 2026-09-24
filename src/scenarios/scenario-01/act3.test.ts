import { describe, expect, it } from 'vitest';

import type { Action, Decision, Observation } from '../../core/contracts';
import { advanceScenarioTime } from '../../core/runtime-clock';
import { processDueScenarioTimeEvents } from '../../core/runtime-events';
import { scenario01EntityIds } from './baseline';
import {
  scenario01ActionIds,
  scenario01DecisionIds,
} from './decision-1-ids';
import {
  scenario01Decision2ActionIds,
  scenario01Decision2Ids,
} from './decision-2-ids';
import {
  createScenario01Act3TimeEvents,
  scenario01Act3Offsets,
} from './act3';
import { scenario01InitialState } from './scenario';

const RECORDED_AT = '2026-09-24T15:10:00.000Z';
const D1_DECIDED_AT = 7 * 60 + 53;
const D2_DECIDED_AT = 8 * 60 + 18;

function decision1(actionId: string): Decision {
  return {
    id: scenario01DecisionIds.informationPosture,
    openedAt: D1_DECIDED_AT - 2,
    actionIds: Object.values(scenario01ActionIds),
    evidenceIds: [],
    unknowns: [],
    assumptions: [],
    selectedActionId: actionId,
    decidedAt: D1_DECIDED_AT,
    expectedEffects: [],
    observedEffects: [],
  };
}

function decision2(actionId: string): Decision {
  return {
    id: scenario01Decision2Ids.generatorRecommendation,
    openedAt: D2_DECIDED_AT - 2,
    actionIds: Object.values(scenario01Decision2ActionIds),
    evidenceIds: [],
    unknowns: [],
    assumptions: [],
    selectedActionId: actionId,
    decidedAt: D2_DECIDED_AT,
    expectedEffects: [],
    observedEffects: [],
  };
}

function selectedAction(actionId: string): Action {
  return {
    id: actionId,
    type: 'resource-recommendation',
    title: actionId,
    scope: {},
    authority: 'operator',
    lifecycle: 'selected',
    expectedEffects: [],
    displacedRisks: [],
    reversible: true,
  };
}

function restrictedRouteObservation(): Observation {
  return {
    id: 'observation.test.z17.travel-time-revised',
    entityId: scenario01EntityIds.accessRoute,
    metric: 'logistics.estimatedTravelTime',
    value: 23.4,
    unit: 'min',
    observedAt: D2_DECIDED_AT - 8,
    receivedAt: D2_DECIDED_AT - 8,
    source: { type: 'external', id: 'road-authority-feed' },
    quality: 'good',
    confidence: { level: 'high' },
    classification: 'fact',
  };
}

function stateAfterDecision2(
  d2ActionId: string,
  d1ActionId = scenario01ActionIds.continueSeparateMonitoring,
) {
  return {
    ...scenario01InitialState,
    now: D2_DECIDED_AT,
    status: 'running' as const,
    decisions: [decision1(d1ActionId), decision2(d2ActionId)],
    actions: [selectedAction(d2ActionId)],
    observations: [
      ...scenario01InitialState.observations,
      restrictedRouteObservation(),
    ],
  };
}

function definitionById(
  actionId: string,
  id: string,
  d1ActionId?: string,
) {
  return createScenario01Act3TimeEvents(
    stateAfterDecision2(actionId, d1ActionId),
  ).find((definition) => definition.id === id);
}

describe('Scenario 01 Act 3 downstream flow', () => {
  it('models the full AG-400 deployment lifecycle for D2-A', () => {
    const definitions = createScenario01Act3TimeEvents(
      stateAfterDecision2(
        scenario01Decision2ActionIds.recommendGeneratorForSuw,
      ),
    );
    const ids = definitions.map((definition) => definition.id);

    expect(ids).toContain('event.scenario-01.d2.suw.generator-requested');
    expect(ids).toContain('event.scenario-01.d2.suw.generator-accepted');
    expect(ids).toContain('event.scenario-01.d2.suw.generator-en-route');
    expect(ids).toContain('event.scenario-01.d2.suw.generator-on-site');
    expect(ids).toContain('event.scenario-01.d2.suw.generator-connecting');
    expect(ids).toContain('event.scenario-01.d2.suw.generator-operational');
    expect(ids).toContain('event.scenario-01.d2.suw.r4-risk-developing');
    expect(ids).toContain('event.scenario-01.hospital.continuity-request');

    expect(
      definitionById(
        scenario01Decision2ActionIds.recommendGeneratorForSuw,
        'event.scenario-01.d2.suw.generator-en-route',
      )?.event.payload,
    ).toMatchObject({ travelMinutes: 23 });
  });

  it('models the opposite protected margin for D2-B', () => {
    const definitions = createScenario01Act3TimeEvents(
      stateAfterDecision2(
        scenario01Decision2ActionIds.recommendGeneratorForR4,
      ),
    );
    const ids = definitions.map((definition) => definition.id);

    expect(ids).toContain('event.scenario-01.d2.r4.generator-operational');
    expect(ids).toContain('event.scenario-01.d2.r4.water-margin-declining');
    expect(ids).not.toContain('event.scenario-01.d2.suw.r4-risk-developing');
  });

  it('gives D2-C better restoration information without creating a generator deployment', () => {
    const definitions = createScenario01Act3TimeEvents(
      stateAfterDecision2(
        scenario01Decision2ActionIds.waitForGridRestoration,
      ),
    );
    const ids = definitions.map((definition) => definition.id);
    const restoration = definitions.find(
      (definition) =>
        definition.id === 'event.scenario-01.d2.wait.restoration-update',
    );

    expect(ids).toContain('event.scenario-01.d2.wait.restoration-update');
    expect(ids).toContain('event.scenario-01.d2.wait.dual-margin-declining');
    expect(ids).toContain('event.scenario-01.hospital.continuity-request');
    expect(ids.some((id) => id.includes('generator-en-route'))).toBe(false);
    expect(restoration?.event.payload).toMatchObject({
      fieldInspection: 'underway',
      provisional: true,
    });
  });

  it('uses earlier D1 regional awareness to shorten external acceptance timing', () => {
    const normalAcceptance = definitionById(
      scenario01Decision2ActionIds.recommendGeneratorForSuw,
      'event.scenario-01.d2.suw.generator-accepted',
      scenario01ActionIds.continueSeparateMonitoring,
    );
    const earlyAcceptance = definitionById(
      scenario01Decision2ActionIds.recommendGeneratorForSuw,
      'event.scenario-01.d2.suw.generator-accepted',
      scenario01ActionIds.recommendRegionalEscalation,
    );

    expect(earlyAcceptance?.trigger.at).toBe(
      (normalAcceptance?.trigger.at ?? 0) - 1,
    );
  });

  it('materializes D2-A deployment, observed support and the shared hospital report', () => {
    const state = stateAfterDecision2(
      scenario01Decision2ActionIds.recommendGeneratorForSuw,
    );
    const definitions = createScenario01Act3TimeEvents(state);
    const hospital = definitions.find(
      (definition) =>
        definition.id === 'event.scenario-01.hospital.continuity-request',
    );

    expect(hospital).toBeDefined();

    const advanced = advanceScenarioTime(
      state,
      (hospital?.trigger.at ?? D2_DECIDED_AT) - D2_DECIDED_AT,
    );
    const processed = processDueScenarioTimeEvents(
      advanced,
      definitions,
      RECORDED_AT,
    );
    const action = processed.actions.find(
      (candidate) =>
        candidate.id ===
        scenario01Decision2ActionIds.recommendGeneratorForSuw,
    );

    expect(action?.lifecycle).toBe('completed');
    expect(
      processed.observations.find(
        (observation) =>
          observation.id ===
          'observation.scenario-01.suw.generator-support-active',
      )?.value,
    ).toBe('ag-400');
    expect(
      processed.observations.find(
        (observation) =>
          observation.id ===
          'observation.scenario-01.hospital.continuity-request',
      ),
    ).toMatchObject({
      classification: 'report',
      value: 'water-and-communications',
    });
  });

  it('never emits the hospital report before the minimum reconvergence window', () => {
    for (const actionId of Object.values(scenario01Decision2ActionIds)) {
      const hospital = createScenario01Act3TimeEvents(
        stateAfterDecision2(actionId),
      ).find(
        (definition) =>
          definition.id === 'event.scenario-01.hospital.continuity-request',
      );

      expect(hospital?.trigger.at).toBeGreaterThanOrEqual(
        D2_DECIDED_AT + scenario01Act3Offsets.hospitalMinimum,
      );
    }
  });
});
