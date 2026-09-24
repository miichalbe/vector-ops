import { describe, expect, it } from 'vitest';

import { recordDecisionSelection } from './runtime-decision-selection';
import {
  processDueScenarioTimeEvents,
  type ScenarioTimeEventDefinition,
} from './runtime-events';
import { advanceScenarioRuntime } from './runtime-step';
import {
  scenario01ActionIds,
  scenario01DecisionIds,
} from '../scenarios/scenario-01/decision-1-ids';
import {
  scenario01InitialState,
  scenario01RuntimeDefinition,
} from '../scenarios/scenario-01/scenario';

const RECORDED_AT = '2026-09-24T20:15:00.000Z';

function recordedDecision1State() {
  const finalOpeningTime =
    scenario01RuntimeDefinition.timeEvents.at(-1)?.trigger.at;

  if (finalOpeningTime === undefined) {
    throw new Error('Expected Scenario 01 opening events.');
  }

  const opened = advanceScenarioRuntime(
    scenario01InitialState,
    finalOpeningTime - scenario01InitialState.now,
    scenario01RuntimeDefinition,
    RECORDED_AT,
  );

  return recordDecisionSelection(
    opened,
    scenario01DecisionIds.informationPosture,
    scenario01ActionIds.continueSeparateMonitoring,
    RECORDED_AT,
  );
}

describe('scenario event bookkeeping effects', () => {
  it('records observed Decision effects, closes the Action and advances scenario phase', () => {
    const state = recordedDecision1State();
    const definition: ScenarioTimeEventDefinition = {
      id: 'event.test.bookkeeping',
      trigger: { type: 'scenarioTime', at: state.now },
      event: {
        type: 'test.bookkeeping.occurred',
        producer: { type: 'scenario', id: 'test' },
        payload: {},
      },
      effects: [
        {
          type: 'updateActionLifecycle',
          actionId: scenario01ActionIds.continueSeparateMonitoring,
          lifecycle: 'completed',
        },
        {
          type: 'appendDecisionObservedEffect',
          decisionId: scenario01DecisionIds.informationPosture,
          effect: {
            type: 'test.outcome',
            description: 'A material downstream result was observed.',
          },
        },
        {
          type: 'updateScenarioPhase',
          phase: 'dependency',
        },
      ],
    };
    const processed = processDueScenarioTimeEvents(
      state,
      [definition],
      RECORDED_AT,
    );
    const decision = processed.decisions.find(
      (candidate) => candidate.id === scenario01DecisionIds.informationPosture,
    );
    const action = processed.actions.find(
      (candidate) => candidate.id === scenario01ActionIds.continueSeparateMonitoring,
    );

    expect(state.phase).toBe('detection');
    expect(processed.phase).toBe('dependency');
    expect(action?.lifecycle).toBe('completed');
    expect(decision?.observedEffects).toEqual([
      {
        type: 'test.outcome',
        description: 'A material downstream result was observed.',
      },
    ]);
  });

  it('rejects a non-sequential scenario phase transition', () => {
    const state = recordedDecision1State();
    const definition: ScenarioTimeEventDefinition = {
      id: 'event.test.invalid-phase',
      trigger: { type: 'scenarioTime', at: state.now },
      event: {
        type: 'test.invalid-phase.occurred',
        producer: { type: 'scenario', id: 'test' },
        payload: {},
      },
      effects: [
        {
          type: 'updateScenarioPhase',
          phase: 'resolution',
        },
      ],
    };

    expect(() =>
      processDueScenarioTimeEvents(state, [definition], RECORDED_AT),
    ).toThrow(/Invalid scenario phase transition/);
  });

  it('rejects an observed effect for a Decision that has not been recorded', () => {
    const finalOpeningTime =
      scenario01RuntimeDefinition.timeEvents.at(-1)?.trigger.at;

    if (finalOpeningTime === undefined) {
      throw new Error('Expected Scenario 01 opening events.');
    }

    const opened = advanceScenarioRuntime(
      scenario01InitialState,
      finalOpeningTime - scenario01InitialState.now,
      scenario01RuntimeDefinition,
      RECORDED_AT,
    );
    const definition: ScenarioTimeEventDefinition = {
      id: 'event.test.unrecorded-decision-effect',
      trigger: { type: 'scenarioTime', at: opened.now },
      event: {
        type: 'test.unrecorded-decision-effect.occurred',
        producer: { type: 'scenario', id: 'test' },
        payload: {},
      },
      effects: [
        {
          type: 'appendDecisionObservedEffect',
          decisionId: scenario01DecisionIds.informationPosture,
          effect: {
            type: 'test.outcome',
            description: 'Should not be accepted before the Decision is recorded.',
          },
        },
      ],
    };

    expect(() =>
      processDueScenarioTimeEvents(
        { ...opened, status: 'running' },
        [definition],
        RECORDED_AT,
      ),
    ).toThrow(/unrecorded Decision/);
  });
});
