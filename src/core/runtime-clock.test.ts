import { describe, expect, it } from 'vitest';

import { advanceScenarioTime, canAdvanceScenarioTime } from './runtime-clock';
import type {
  ScenarioRunStatus,
  ScenarioRuntimeState,
} from './runtime-state';
import { scenario01InitialState } from '../scenarios/scenario-01/scenario';

function stateWithStatus(status: ScenarioRunStatus): ScenarioRuntimeState {
  return {
    ...scenario01InitialState,
    status,
  };
}

describe('scenario runtime clock', () => {
  it('advances a running scenario without mutating the previous state', () => {
    const initialState = stateWithStatus('running');
    const initialTime = initialState.now;

    const advancedState = advanceScenarioTime(initialState, 15);

    expect(advancedState).not.toBe(initialState);
    expect(advancedState.now).toBe(initialTime + 15);
    expect(initialState.now).toBe(initialTime);
    expect(advancedState.entitiesById).toBe(initialState.entitiesById);
  });

  it('advances time while the scenario is resolving', () => {
    const initialState = stateWithStatus('resolving');

    expect(canAdvanceScenarioTime(initialState)).toBe(true);
    expect(advanceScenarioTime(initialState, 5).now).toBe(
      initialState.now + 5,
    );
  });

  for (const status of [
    'briefing',
    'awaitingDecision',
    'completed',
  ] as const) {
    it(`keeps time paused while the scenario status is ${status}`, () => {
      const initialState = stateWithStatus(status);

      expect(canAdvanceScenarioTime(initialState)).toBe(false);
      expect(advanceScenarioTime(initialState, 10)).toBe(initialState);
    });
  }

  it('returns the existing state when no time elapses', () => {
    const initialState = stateWithStatus('running');

    expect(advanceScenarioTime(initialState, 0)).toBe(initialState);
  });

  for (const invalidElapsedMinutes of [
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ]) {
    it(`rejects an invalid elapsed time value: ${invalidElapsedMinutes}`, () => {
      expect(() =>
        advanceScenarioTime(scenario01InitialState, invalidElapsedMinutes),
      ).toThrow(
        'Elapsed scenario time must be a non-negative integer number of minutes.',
      );
    });
  }
});
