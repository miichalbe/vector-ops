import { describe, expect, it } from 'vitest';

import {
  conditionProfileIds,
  openingVariantIds,
  resolveScenarioRunConfig,
  type ScenarioRunConfigSeedInput,
} from './run-config';

const baseInput = {
  scenarioId: 'scenario-01',
  scenarioVersion: '0.1.0',
  seed: '8F4C',
} satisfies ScenarioRunConfigSeedInput;

describe('seeded scenario run configuration', () => {
  it('resolves the documented 8F4C reference configuration', () => {
    expect(resolveScenarioRunConfig(baseInput)).toEqual({
      scenarioId: 'scenario-01',
      scenarioVersion: '0.1.0',
      seed: '8F4C',
      openingVariant: 'water-first',
      dominantProfile: 'access-constrained',
      secondaryModifier: 'low-confidence-data',
    });
  });

  it('returns the same configuration for the same inputs', () => {
    expect(resolveScenarioRunConfig(baseInput)).toEqual(
      resolveScenarioRunConfig(baseInput),
    );
  });

  it('includes the scenario version in deterministic resolution', () => {
    const currentVersion = resolveScenarioRunConfig(baseInput);
    const nextVersion = resolveScenarioRunConfig({
      ...baseInput,
      scenarioVersion: '0.2.0',
    });

    expect(nextVersion).not.toEqual(currentVersion);
  });

  it('always resolves two different condition profiles', () => {
    for (let index = 0; index < 100; index += 1) {
      const config = resolveScenarioRunConfig({
        ...baseInput,
        seed: `profile-seed-${index}`,
      });

      expect(config.secondaryModifier).not.toBe(
        config.dominantProfile,
      );
    }
  });

  it('can reach every opening variant and condition profile', () => {
    const resolvedConfigs = Array.from(
      { length: 256 },
      (_, index) =>
        resolveScenarioRunConfig({
          ...baseInput,
          seed: `coverage-seed-${index}`,
        }),
    );
    const reachedOpenings = new Set(
      resolvedConfigs.map((config) => config.openingVariant),
    );
    const reachedProfiles = new Set(
      resolvedConfigs.flatMap((config) => [
        config.dominantProfile,
        config.secondaryModifier,
      ]),
    );

    expect(reachedOpenings).toEqual(new Set(openingVariantIds));
    expect(reachedProfiles).toEqual(new Set(conditionProfileIds));
  });

  it('supports explicit overrides for repeatable reference runs', () => {
    expect(
      resolveScenarioRunConfig({
        ...baseInput,
        seed: 'P01',
        openingVariant: 'power-first',
        dominantProfile: 'communications-fragile',
        secondaryModifier: 'resource-constrained',
      }),
    ).toMatchObject({
      seed: 'P01',
      openingVariant: 'power-first',
      dominantProfile: 'communications-fragile',
      secondaryModifier: 'resource-constrained',
    });
  });

  it('rejects invalid seed and profile inputs', () => {
    expect(() =>
      resolveScenarioRunConfig({
        ...baseInput,
        seed: '   ',
      }),
    ).toThrow('Run config seed must not be empty.');

    expect(() =>
      resolveScenarioRunConfig({
        ...baseInput,
        dominantProfile: 'access-constrained',
        secondaryModifier: 'access-constrained',
      }),
    ).toThrow(
      'Run config dominant profile and secondary modifier must be different.',
    );
  });
});
