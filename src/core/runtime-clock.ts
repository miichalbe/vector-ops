import type { ScenarioRuntimeState } from './runtime-state';

const CLOCK_ADVANCING_STATUSES = new Set<ScenarioRuntimeState['status']>([
  'running',
  'resolving',
]);

export function canAdvanceScenarioTime(
  state: ScenarioRuntimeState,
): boolean {
  return CLOCK_ADVANCING_STATUSES.has(state.status);
}

export function advanceScenarioTime(
  state: ScenarioRuntimeState,
  elapsedMinutes: number,
): ScenarioRuntimeState {
  if (!Number.isInteger(elapsedMinutes) || elapsedMinutes < 0) {
    throw new Error(
      'Elapsed scenario time must be a non-negative integer number of minutes.',
    );
  }

  if (elapsedMinutes === 0 || !canAdvanceScenarioTime(state)) {
    return state;
  }

  return {
    ...state,
    now: state.now + elapsedMinutes,
  };
}
