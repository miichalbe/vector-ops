import { describe, expect, it } from 'vitest';

import {
  createScenario01Run,
  SCENARIO_01_DEFAULT_SEED,
  scenario01DefaultRunConfig,
  scenario01InitialState,
  scenario01RuntimeDefinition,
} from './scenario';

describe('Scenario 01 run factory', () => {
  it('recreates the same deterministic run from the same seed', () => {
    const first = createScenario01Run('REPLAY-01');
    const replay = createScenario01Run('REPLAY-01');

    expect(replay.runConfig).toEqual(first.runConfig);
    expect(replay.initialState).toEqual(first.initialState);
    expect(replay.runtimeDefinition.timeEvents).toEqual(
      first.runtimeDefinition.timeEvents,
    );

    expect(replay.initialState).not.toBe(first.initialState);
    expect(replay.runtimeDefinition).not.toBe(first.runtimeDefinition);
  });

  it('binds generated opening events to the resolved run configuration', () => {
    const run = createScenario01Run('FRESH-27');

    expect(run.initialState.run).toEqual(run.runConfig);
    expect(run.runtimeDefinition.timeEvents).toHaveLength(3);
    expect(
      run.runtimeDefinition.timeEvents.every((event) =>
        event.openingVariants?.includes(run.runConfig.openingVariant),
      ),
    ).toBe(true);
  });

  it('preserves the documented default run as a factory product', () => {
    const defaultRun = createScenario01Run(SCENARIO_01_DEFAULT_SEED);

    expect(defaultRun.runConfig).toEqual(scenario01DefaultRunConfig);
    expect(defaultRun.initialState).toEqual(scenario01InitialState);
    expect(defaultRun.runtimeDefinition.timeEvents).toEqual(
      scenario01RuntimeDefinition.timeEvents,
    );
  });
});
