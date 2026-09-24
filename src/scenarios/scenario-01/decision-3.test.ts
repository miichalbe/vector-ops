import { describe, expect, it } from 'vitest';

import type { ActionId } from '../../core/contracts';
import { recordDecisionSelection } from '../../core/runtime-decision-selection';
import { advanceScenarioRuntime } from '../../core/runtime-step';
import { createScenario01Act3TimeEvents } from './act3';
import {
  scenario01ActionIds,
  scenario01DecisionIds,
} from './decision-1-ids';
import {
  scenario01Decision2ActionIds,
  scenario01Decision2Ids,
} from './decision-2-ids';
import {
  scenario01Decision3ActionIds,
  scenario01Decision3Ids,
} from './decision-3-ids';
import {
  scenario01InitialState,
  scenario01RuntimeDefinition,
} from './scenario';

const RECORDED_AT = '2026-09-24T16:10:00.000Z';
const D2_MATURITY_OFFSET_MINUTES = 29;

function awaitingDecision1State() {
  const finalOpeningTime =
    scenario01RuntimeDefinition.timeEvents.at(-1)?.trigger.at;

  if (finalOpeningTime === undefined) {
    throw new Error('Expected Scenario 01 opening events.');
  }

  return advanceScenarioRuntime(
    scenario01InitialState,
    finalOpeningTime - scenario01InitialState.now,
    scenario01RuntimeDefinition,
    RECORDED_AT,
  );
}

function awaitingDecision2State() {
  const afterDecision1 = recordDecisionSelection(
    awaitingDecision1State(),
    scenario01DecisionIds.informationPosture,
    scenario01ActionIds.continueSeparateMonitoring,
    RECORDED_AT,
  );

  return advanceScenarioRuntime(
    afterDecision1,
    D2_MATURITY_OFFSET_MINUTES,
    scenario01RuntimeDefinition,
    RECORDED_AT,
  );
}

function selectedDecision2State(actionId: ActionId) {
  return recordDecisionSelection(
    awaitingDecision2State(),
    scenario01Decision2Ids.generatorRecommendation,
    actionId,
    RECORDED_AT,
  );
}

function hospitalAtFor(actionId: ActionId): number {
  const state = selectedDecision2State(actionId);
  const hospital = createScenario01Act3TimeEvents(state).find(
    (definition) =>
      definition.id === 'event.scenario-01.hospital.continuity-request',
  );

  if (!hospital) {
    throw new Error('Expected the shared hospital report event.');
  }

  return hospital.trigger.at;
}

function stateAtHospital(actionId: ActionId) {
  const state = selectedDecision2State(actionId);
  const hospitalAt = hospitalAtFor(actionId);

  return advanceScenarioRuntime(
    state,
    hospitalAt - state.now,
    scenario01RuntimeDefinition,
    RECORDED_AT,
  );
}

const d2Actions = [
  scenario01Decision2ActionIds.recommendGeneratorForSuw,
  scenario01Decision2ActionIds.recommendGeneratorForR4,
  scenario01Decision2ActionIds.waitForGridRestoration,
] as const;

const branchEvidence = {
  [scenario01Decision2ActionIds.recommendGeneratorForSuw]: [
    'observation.scenario-01.suw.generator-support-active',
    'observation.scenario-01.r4.link-quality-poor',
  ],
  [scenario01Decision2ActionIds.recommendGeneratorForR4]: [
    'observation.scenario-01.r4.generator-power',
    'observation.scenario-01.suw.service-margin-declining',
  ],
  [scenario01Decision2ActionIds.waitForGridRestoration]: [
    'observation.scenario-01.gpz.restoration-window',
    'observation.scenario-01.suw.service-margin-declining-while-waiting',
    'observation.scenario-01.r4.link-quality-poor-while-waiting',
  ],
} as const;

describe('Scenario 01 Decision 3 gate', () => {
  it('does not open before the hospital report arrives', () => {
    const actionId =
      scenario01Decision2ActionIds.recommendGeneratorForR4;
    const selected = selectedDecision2State(actionId);
    const hospitalAt = hospitalAtFor(actionId);
    const state = advanceScenarioRuntime(
      selected,
      hospitalAt - selected.now - 1,
      scenario01RuntimeDefinition,
      RECORDED_AT,
    );

    expect(
      state.decisions.some(
        (decision) =>
          decision.id === scenario01Decision3Ids.coordinationPosture,
      ),
    ).toBe(false);
    expect(state.status).toBe('running');
  });

  for (const actionId of d2Actions) {
    it(`opens the same D3 coordination gate after ${actionId}`, () => {
      const state = stateAtHospital(actionId);
      const decision = state.decisions.find(
        (candidate) =>
          candidate.id === scenario01Decision3Ids.coordinationPosture,
      );
      const actions = state.actions.filter((action) =>
        decision?.actionIds.includes(action.id),
      );

      expect(state.status).toBe('awaitingDecision');
      expect(decision?.selectedActionId).toBeUndefined();
      expect(decision?.actionIds).toEqual([
        scenario01Decision3ActionIds.targetedContingency,
        scenario01Decision3ActionIds.recommendVoivodeshipCoordination,
        scenario01Decision3ActionIds.continueOperatorCoordination,
      ]);
      expect(decision?.evidenceIds).toContain(
        'observation.scenario-01.hospital.continuity-request',
      );
      expect(decision?.evidenceIds).toEqual(
        expect.arrayContaining(branchEvidence[actionId]),
      );
      expect(actions).toHaveLength(3);
      expect(
        actions.every((action) => action.lifecycle === 'available'),
      ).toBe(true);
      expect(
        actions.every(
          (action) =>
            action.expectedEffects.length > 0 &&
            action.displacedRisks.length > 0,
        ),
      ).toBe(true);
    });
  }

  it('keeps D3 within the operator recommendation authority boundary', () => {
    const state = stateAtHospital(
      scenario01Decision2ActionIds.waitForGridRestoration,
    );
    const decision = state.decisions.find(
      (candidate) =>
        candidate.id === scenario01Decision3Ids.coordinationPosture,
    );
    const actions = state.actions.filter((action) =>
      decision?.actionIds.includes(action.id),
    );

    expect(actions.map((action) => action.title)).toEqual([
      'Targeted notification and contingency preparation',
      'Recommend voivodeship-level coordination',
      'Continue operator-level coordination while seeking confirmation',
    ]);
    expect(actions.every((action) => action.authority === 'operator')).toBe(
      true,
    );
    expect(decision?.unknowns).toEqual(
      expect.arrayContaining([
        'The provisional grid-restoration window remains subject to field confirmation.',
      ]),
    );
  });

  it('records a D3 selection through the generic Decision runtime', () => {
    const awaiting = stateAtHospital(
      scenario01Decision2ActionIds.recommendGeneratorForSuw,
    );
    const recorded = recordDecisionSelection(
      awaiting,
      scenario01Decision3Ids.coordinationPosture,
      scenario01Decision3ActionIds.targetedContingency,
      RECORDED_AT,
    );
    const decision = recorded.decisions.find(
      (candidate) =>
        candidate.id === scenario01Decision3Ids.coordinationPosture,
    );

    expect(recorded.status).toBe('running');
    expect(decision?.selectedActionId).toBe(
      scenario01Decision3ActionIds.targetedContingency,
    );
    expect(recorded.events.at(-1)?.type).toBe('decision.recorded');
  });
});
