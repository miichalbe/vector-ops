import { describe, expect, it } from 'vitest';

import type { ActionId, DecisionId } from '../../core/contracts';
import { recordDecisionSelection } from '../../core/runtime-decision-selection';
import { advanceScenarioRuntime } from '../../core/runtime-step';
import type {
  ConditionProfileId,
  OpeningVariantId,
  ScenarioRuntimeState,
} from '../../core/runtime-state';
import {
  scenario01ActionIds,
  scenario01DecisionIds,
} from './decision-1-ids';
import {
  scenario01Decision2ActionIds,
  scenario01Decision2Ids,
} from './decision-2-ids';
import {
  scenario01Decision3ActionIds,
  scenario01Decision3Ids,
} from './decision-3-ids';
import {
  createScenario01Run,
  scenario01InitialData,
} from './scenario';

const RECORDED_AT = '2026-09-25T10:00:00.000Z';
const MAX_RUNTIME_STEPS = 180;

interface SeedMatrixCase {
  seed: string;
  openingVariant: OpeningVariantId;
  dominantProfile: ConditionProfileId;
}

const representativeSelections: Record<DecisionId, ActionId> = {
  [scenario01DecisionIds.informationPosture]:
    scenario01ActionIds.openCrossDomainIncident,
  [scenario01Decision2Ids.generatorRecommendation]:
    scenario01Decision2ActionIds.recommendGeneratorForR4,
  [scenario01Decision3Ids.coordinationPosture]:
    scenario01Decision3ActionIds.recommendVoivodeshipCoordination,
};

function matrixKey(
  openingVariant: OpeningVariantId,
  dominantProfile: ConditionProfileId,
): string {
  return `${openingVariant}|${dominantProfile}`;
}

function findSeedMatrix(): SeedMatrixCase[] {
  const cases = new Map<string, SeedMatrixCase>();

  for (let index = 0; index < 1_000 && cases.size < 12; index += 1) {
    const seed = `fresh-seed-regression-${index}`;
    const run = createScenario01Run(seed);
    const key = matrixKey(
      run.runConfig.openingVariant,
      run.runConfig.dominantProfile,
    );

    if (!cases.has(key)) {
      cases.set(key, {
        seed,
        openingVariant: run.runConfig.openingVariant,
        dominantProfile: run.runConfig.dominantProfile,
      });
    }
  }

  if (cases.size !== 12) {
    throw new Error(
      `Could not resolve the full opening/profile regression matrix for ${scenario01InitialData.id}.`,
    );
  }

  return [...cases.values()].sort((left, right) =>
    matrixKey(left.openingVariant, left.dominantProfile).localeCompare(
      matrixKey(right.openingVariant, right.dominantProfile),
    ),
  );
}

function completeRepresentativeRun(seed: string): ScenarioRuntimeState {
  const run = createScenario01Run(seed);
  let state = run.initialState;

  for (let step = 0; step < MAX_RUNTIME_STEPS; step += 1) {
    if (state.status === 'completed') {
      break;
    }

    if (state.status === 'awaitingDecision') {
      const pendingDecision = state.decisions.find(
        (decision) => decision.selectedActionId === undefined,
      );

      if (!pendingDecision) {
        throw new Error(
          `${seed} entered awaitingDecision without a pending Decision.`,
        );
      }

      const actionId = representativeSelections[pendingDecision.id];

      if (!actionId) {
        throw new Error(
          `${seed} opened unexpected Decision ${pendingDecision.id}.`,
        );
      }

      state = recordDecisionSelection(
        state,
        pendingDecision.id,
        actionId,
        RECORDED_AT,
      );
      continue;
    }

    state = advanceScenarioRuntime(
      state,
      1,
      run.runtimeDefinition,
      RECORDED_AT,
    );
  }

  return state;
}

const seedMatrix = findSeedMatrix();

describe('Scenario 01 fresh-seed end-to-end regression', () => {
  it('covers every opening variant across every dominant condition profile', () => {
    expect(seedMatrix).toHaveLength(12);
    expect(
      new Set(seedMatrix.map((entry) => entry.openingVariant)),
    ).toEqual(
      new Set<OpeningVariantId>([
        'power-first',
        'communications-first',
        'water-first',
      ]),
    );
    expect(
      new Set(seedMatrix.map((entry) => entry.dominantProfile)),
    ).toEqual(
      new Set<ConditionProfileId>([
        'communications-fragile',
        'access-constrained',
        'resource-constrained',
        'low-confidence-data',
      ]),
    );
  });

  it.each(seedMatrix)(
    '$openingVariant / $dominantProfile ($seed) completes through handover',
    ({ seed, openingVariant, dominantProfile }) => {
      const state = completeRepresentativeRun(seed);

      expect(state.run.openingVariant).toBe(openingVariant);
      expect(state.run.dominantProfile).toBe(dominantProfile);
      expect(state.status).toBe('completed');
      expect(state.phase).toBe('resolution');
      expect(state.decisions).toHaveLength(3);
      expect(
        state.decisions.every((decision) => decision.selectedActionId),
      ).toBe(true);
      expect(
        state.events.some(
          (event) => event.type === 'operational.handover.prepared',
        ),
      ).toBe(true);
      expect(
        state.events.some((event) => event.type === 'scenario.completed'),
      ).toBe(true);
      expect(state.now).toBeLessThanOrEqual(9 * 60 + 30);
    },
  );

  it('replays the same seed and Decisions into the same completed runtime state', () => {
    const seed = seedMatrix[0]?.seed;

    if (!seed) {
      throw new Error('Fresh-seed regression matrix is empty.');
    }

    const first = completeRepresentativeRun(seed);
    const replay = completeRepresentativeRun(seed);

    expect(replay).toEqual(first);
  });
});
