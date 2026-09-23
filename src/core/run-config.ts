import {
  type ConditionProfileId,
  type OpeningVariantId,
  type ScenarioRunConfig,
} from './runtime-state';
import { createSeededRandom } from './seeded-random';

export const openingVariantIds = [
  'power-first',
  'communications-first',
  'water-first',
] as const satisfies readonly OpeningVariantId[];

export const conditionProfileIds = [
  'communications-fragile',
  'access-constrained',
  'resource-constrained',
  'low-confidence-data',
] as const satisfies readonly ConditionProfileId[];

export interface ScenarioRunConfigSeedInput {
  scenarioId: string;
  scenarioVersion: string;
  seed: string;
  openingVariant?: OpeningVariantId;
  dominantProfile?: ConditionProfileId;
  secondaryModifier?: ConditionProfileId;
}

function assertNonEmpty(value: string, label: string) {
  if (!value.trim()) {
    throw new Error(`${label} must not be empty.`);
  }
}

export function resolveScenarioRunConfig(
  input: ScenarioRunConfigSeedInput,
): ScenarioRunConfig {
  assertNonEmpty(input.scenarioId, 'Scenario id');
  assertNonEmpty(input.scenarioVersion, 'Scenario version');
  assertNonEmpty(input.seed, 'Run config seed');

  const scenarioId = input.scenarioId.trim();
  const scenarioVersion = input.scenarioVersion.trim();
  const seed = input.seed.trim();
  const random = createSeededRandom(
    `run:${scenarioId}#${scenarioVersion}#${seed}:v1`,
  );

  const generatedOpeningVariant = random.pick(openingVariantIds);
  const generatedDominantProfile = random.pick(conditionProfileIds);

  const openingVariant =
    input.openingVariant ?? generatedOpeningVariant;
  const dominantProfile =
    input.dominantProfile ?? generatedDominantProfile;
  const availableSecondaryProfiles = conditionProfileIds.filter(
    (profile) => profile !== dominantProfile,
  );
  const generatedSecondaryModifier = random.pick(
    availableSecondaryProfiles,
  );
  const secondaryModifier =
    input.secondaryModifier ?? generatedSecondaryModifier;

  if (dominantProfile === secondaryModifier) {
    throw new Error(
      'Run config dominant profile and secondary modifier must be different.',
    );
  }

  return {
    scenarioId,
    scenarioVersion,
    seed,
    openingVariant,
    dominantProfile,
    secondaryModifier,
  };
}
