import { describe, expect, it } from 'vitest';

import { advanceScenarioRuntime } from './runtime-step';
import {
  scenario01InitialState,
  scenario01RuntimeDefinition,
} from '../scenarios/scenario-01/scenario';
import { SCENARIO_01_FIRST_EVENT_TIME } from '../scenarios/scenario-01/timeline';

const RECORDED_AT = '2026-09-23T12:30:00.000Z';

describe('composed scenario runtime step', () => {
  it('advances time without deriving claims before evidence is due', () => {
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
  });

  it('processes opening events before deriving Assessment and Projection', () => {
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

    expect(state.events).toHaveLength(3);
    expect(state.observations).toHaveLength(
      scenario01InitialState.observations.length + 3,
    );
    expect(state.assessments).toHaveLength(1);
    expect(state.projections).toHaveLength(1);
    expect(state.assessments[0]?.createdAt).toBe(finalOpeningTime);
    expect(state.projections[0]?.createdAt).toBe(finalOpeningTime);
  });

  it('is idempotent when no time or material state changes', () => {
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
