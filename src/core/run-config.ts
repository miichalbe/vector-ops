import {
  type ConditionProfileId,
  type OpeningVariantId,
  type ScenarioRunConfig,
  type ScenarioRunParameters,
} from './runtime-state';
import {
  createSeededRandom,
  type SeededRandom,
} from './seeded-random';

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

type ProfileStrength = 0 | 1 | 2;

function assertNonEmpty(value: string, label: string) {
  if (!value.trim()) {
    throw new Error(`${label} must not be empty.`);
  }
}

function profileStrength(
  profile: ConditionProfileId,
  dominantProfile: ConditionProfileId,
  secondaryModifier: ConditionProfileId,
): ProfileStrength {
  if (profile === dominantProfile) {
    return 2;
  }

  if (profile === secondaryModifier) {
    return 1;
  }

  return 0;
}

function resolveRunParameters(
  random: SeededRandom,
  dominantProfile: ConditionProfileId,
  secondaryModifier: ConditionProfileId,
): ScenarioRunParameters {
  const communicationsStrength = profileStrength(
    'communications-fragile',
    dominantProfile,
    secondaryModifier,
  );
  const accessStrength = profileStrength(
    'access-constrained',
    dominantProfile,
    secondaryModifier,
  );
  const resourceStrength = profileStrength(
    'resource-constrained',
    dominantProfile,
    secondaryModifier,
  );
  const informationStrength = profileStrength(
    'low-confidence-data',
    dominantProfile,
    secondaryModifier,
  );

  return {
    opening: {
      secondObservationDelayMinutes: random.integer(2, 4),
      thirdObservationDelayMinutes: random.integer(2, 4),
    },
    communications: {
      degradationLeadMinutes: communicationsStrength,
      linkDegradationMultiplier:
        1 + 0.25 * communicationsStrength,
      confirmationDelayMinutes: 2 * communicationsStrength,
    },
    access: {
      restrictionLeadMinutes: 3 * accessStrength,
      travelTimeMultiplier: 1 + 0.15 * accessStrength,
      inspectionDelayMinutes: 4 * accessStrength,
    },
    resources: {
      serviceMarginMultiplier: 1 - 0.08 * resourceStrength,
      contingencyCapacityMultiplier:
        1 - 0.1 * resourceStrength,
      generatorPreparationDelayMinutes: 2 * resourceStrength,
    },
    information: {
      reportDelayMinutes: 2 * informationStrength,
      confidencePenalty: informationStrength,
      staleThresholdReductionMinutes: informationStrength,
    },
  };
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
    parameters: resolveRunParameters(
      random,
      dominantProfile,
      secondaryModifier,
    ),
  };
}
