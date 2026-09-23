import { describe, expect, it } from 'vitest';

import { recordDecisionSelection } from './runtime-decision-selection';
import { advanceScenarioRuntime } from './runtime-step';
import {
  scenario01InitialState,
  scenario01RuntimeDefinition,
} from '../scenarios/scenario-01/scenario';
import {
  scenario01ActionIds,
  scenario01DecisionIds,
} from '../scenarios/scenario-01/decisions';

const RECORDED_AT = '2026-09-23T15:40:00.000Z';

function openDecision1() {
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

describe('runtime decision selection', () => {
  it('records the selected Action and resumes the runtime', () => {
    const openedState = openDecision1();
    const actionId = scenario01ActionIds.openCrossDomainIncident;
    const originalAction = openedState.actions.find(
      (action) => action.id === actionId,
    );

    if (!originalAction) {
      throw new Error('Expected Decision 1 Action.');
    }

    const state = recordDecisionSelection(
      openedState,
      scenario01DecisionIds.informationPosture,
      actionId,
      RECORDED_AT,
    );
    const decision = state.decisions.find(
      (candidate) =>
        candidate.id === scenario01DecisionIds.informationPosture,
    );
    const selectedAction = state.actions.find(
      (action) => action.id === actionId,
    );

    expect(state.status).toBe('running');
    expect(selectedAction?.lifecycle).toBe('selected');
    expect(decision?.selectedActionId).toBe(actionId);
    expect(decision?.decidedAt).toBe(openedState.now);
    expect(decision?.expectedEffects).toEqual(
      originalAction.expectedEffects,
    );
    expect(decision?.observedEffects).toEqual([]);
    expect(state.events.slice(-2).map((event) => event.type)).toEqual([
      'action.selected',
      'decision.recorded',
    ]);
    expect(openedState.status).toBe('awaitingDecision');
    expect(originalAction.lifecycle).toBe('available');
    expect(
      openedState.decisions.find(
        (candidate) =>
          candidate.id === scenario01DecisionIds.informationPosture,
      )?.selectedActionId,
    ).toBeUndefined();
  });

  it('is idempotent when the same selection is recorded again', () => {
    const openedState = openDecision1();
    const firstState = recordDecisionSelection(
      openedState,
      scenario01DecisionIds.informationPosture,
      scenario01ActionIds.continueSeparateMonitoring,
      RECORDED_AT,
    );

    expect(
      recordDecisionSelection(
        firstState,
        scenario01DecisionIds.informationPosture,
        scenario01ActionIds.continueSeparateMonitoring,
        RECORDED_AT,
      ),
    ).toBe(firstState);
  });

  it('rejects a different Action after the Decision is recorded', () => {
    const openedState = openDecision1();
    const recordedState = recordDecisionSelection(
      openedState,
      scenario01DecisionIds.informationPosture,
      scenario01ActionIds.openCrossDomainIncident,
      RECORDED_AT,
    );

    expect(() =>
      recordDecisionSelection(
        recordedState,
        scenario01DecisionIds.informationPosture,
        scenario01ActionIds.recommendRegionalEscalation,
        RECORDED_AT,
      ),
    ).toThrow(/already recorded/);
  });

  it('rejects an Action that does not belong to the Decision', () => {
    const openedState = openDecision1();

    expect(() =>
      recordDecisionSelection(
        openedState,
        scenario01DecisionIds.informationPosture,
        'action.scenario-01.invalid',
        RECORDED_AT,
      ),
    ).toThrow(/not available for Decision/);
  });

  it('requires the runtime to be awaiting the Decision', () => {
    const openedState = openDecision1();
    const invalidState = {
      ...openedState,
      status: 'running' as const,
    };

    expect(() =>
      recordDecisionSelection(
        invalidState,
        scenario01DecisionIds.informationPosture,
        scenario01ActionIds.openCrossDomainIncident,
        RECORDED_AT,
      ),
    ).toThrow(/only be recorded while runtime is awaiting a decision/);
  });
});
