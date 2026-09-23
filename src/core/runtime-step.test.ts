import { describe, expect, it } from 'vitest';

import { advanceScenarioRuntime } from './runtime-step';
import {
  scenario01InitialState,
  scenario01RuntimeDefinition,
} from '../scenarios/scenario-01/scenario';
import { scenario01DecisionIds } from '../scenarios/scenario-01/decisions';
import { SCENARIO_01_FIRST_EVENT_TIME } from '../scenarios/scenario-01/timeline';

const RECORDED_AT = '2026-09-23T12:30:00.000Z';

describe('composed scenario runtime step', () => {
  it('advances time without deriving claims or decisions before evidence is due', () => {
    const elapsedMinutes =
      SCENARIO_01_FIRST_EVENT_TIME -
      scenario01InitialState.now -
      1;
    const state = advanceScenarioRuntime(
      scenario01InitialState,
      elapsedMinutes,
      scenario01RuntimeDefinition,
      RECORDED_AT,
    );

    expect(state.now).toBe(
      scenario01InitialState.now + elapsedMinutes,
    );
    expect(state.events).toHaveLength(0);
    expect(state.assessments).toHaveLength(0);
    expect(state.projections).toHaveLength(0);
    expect(state.actions).toHaveLength(0);
    expect(state.decisions).toHaveLength(0);
    expect(state.status).toBe('running');
  });

  it('processes opening events, derives claims and opens Decision 1', () => {
    const finalOpeningTime =
      scenario01RuntimeDefinition.timeEvents.at(-1)?.trigger.at;

    if (finalOpeningTime === undefined) {
      throw new Error('Expected Scenario 01 opening events.');
    }

    const state = advanceScenarioRuntime(
      scenario01InitialState,
      finalOpeningTime - scenario01InitialState.now,
      scenario01RuntimeDefinition,
      RECORDED_AT,
    );

    expect(state.events).toHaveLength(7);
    expect(state.observations).toHaveLength(
      scenario01InitialState.observations.length + 3,
    );
    expect(state.assessments).toHaveLength(1);
    expect(state.projections).toHaveLength(1);
    expect(state.assessments[0]?.createdAt).toBe(finalOpeningTime);
    expect(state.projections[0]?.createdAt).toBe(finalOpeningTime);
    expect(state.actions).toHaveLength(3);
    expect(
      state.actions.every((action) => action.lifecycle === 'available'),
    ).toBe(true);
    expect(state.decisions).toHaveLength(1);
    expect(state.decisions[0]?.id).toBe(
      scenario01DecisionIds.informationPosture,
    );
    expect(state.decisions[0]?.openedAt).toBe(finalOpeningTime);
    expect(state.decisions[0]?.actionIds).toEqual(
      state.actions.map((action) => action.id),
    );
    expect(state.status).toBe('awaitingDecision');
    expect(state.events.slice(-4).map((event) => event.type)).toEqual([
      'action.available',
      'action.available',
      'action.available',
      'decision.opened',
    ]);
  });

  it('is idempotent after Decision 1 opens', () => {
    const finalOpeningTime =
      scenario01RuntimeDefinition.timeEvents.at(-1)?.trigger.at;

    if (finalOpeningTime === undefined) {
      throw new Error('Expected Scenario 01 opening events.');
    }

    const firstState = advanceScenarioRuntime(
      scenario01InitialState,
      finalOpeningTime - scenario01InitialState.now,
      scenario01RuntimeDefinition,
      RECORDED_AT,
    );

    expect(
      advanceScenarioRuntime(
        firstState,
        0,
        scenario01RuntimeDefinition,
        RECORDED_AT,
      ),
    ).toBe(firstState);
  });

  it('respects a runtime status that pauses scenario time and events', () => {
    const pausedState = {
      ...scenario01InitialState,
      status: 'awaitingDecision' as const,
    };
    const state = advanceScenarioRuntime(
      pausedState,
      10,
      scenario01RuntimeDefinition,
      RECORDED_AT,
    );

    expect(state).toBe(pausedState);
    expect(state.now).toBe(scenario01InitialState.now);
    expect(state.events).toHaveLength(0);
  });
});
