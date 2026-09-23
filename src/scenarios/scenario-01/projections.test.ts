import { describe, expect, it } from 'vitest';

import { resolveScenarioRunConfig } from '../../core/run-config';
import { evaluateAssessmentRules } from '../../core/runtime-assessments';
import { advanceScenarioTime } from '../../core/runtime-clock';
import { processDueScenarioTimeEvents } from '../../core/runtime-events';
import { evaluateProjectionRules } from '../../core/runtime-projections';
import {
  createInitialRuntimeState,
  type ConditionProfileId,
  type OpeningVariantId,
  type ScenarioRuntimeState,
} from '../../core/runtime-state';
import { scenario01AssessmentRules } from './assessments';
import {
  scenario01ProjectionIds,
  scenario01ProjectionRules,
} from './projections';
import {
  scenario01DefaultRunConfig,
  scenario01InitialData,
} from './scenario';
import { createScenario01TimeEvents } from './timeline';

const RECORDED_AT = '2026-09-23T12:00:00.000Z';
const R4_PACKET_LOSS_OBSERVATION_ID =
  'observation.scenario-01.r4.packet-loss-rise';

interface OpeningStateOptions {
  openingVariant: OpeningVariantId;
  dominantProfile?: ConditionProfileId;
  secondaryModifier?: ConditionProfileId;
  seed?: string;
}

function stateAfterOpening(
  options: OpeningStateOptions,
): ScenarioRuntimeState {
  const dominantProfile =
    options.dominantProfile ?? 'access-constrained';
  const secondaryModifier =
    options.secondaryModifier ?? 'resource-constrained';
  const run = resolveScenarioRunConfig({
    scenarioId: scenario01InitialData.id,
    scenarioVersion: scenario01InitialData.version,
    seed:
      options.seed ??
      `projection-${options.openingVariant}-${dominantProfile}-${secondaryModifier}`,
    openingVariant: options.openingVariant,
    dominantProfile,
    secondaryModifier,
  });
  const initialState = createInitialRuntimeState(
    scenario01InitialData,
    run,
  );
  const definitions = createScenario01TimeEvents(run);
  const finalDefinition = definitions.at(-1);

  if (!finalDefinition) {
    throw new Error('Expected Scenario 01 opening events.');
  }

  return processDueScenarioTimeEvents(
    advanceScenarioTime(
      initialState,
      finalDefinition.trigger.at - initialState.now,
    ),
    definitions,
    RECORDED_AT,
  );
}

function stateWithOpeningAssessment(
  options: OpeningStateOptions,
): ScenarioRuntimeState {
  return evaluateAssessmentRules(
    stateAfterOpening(options),
    scenario01AssessmentRules,
  );
}

function packetLossReceivedAt(state: ScenarioRuntimeState): number {
  const observation = state.observations.find(
    ({ id }) => id === R4_PACKET_LOSS_OBSERVATION_ID,
  );

  if (!observation) {
    throw new Error('Expected the R-4 packet-loss Observation.');
  }

  return observation.receivedAt;
}

describe('Scenario 01 opening Projection', () => {
  it('does not create P-01 before the cross-domain Assessment exists', () => {
    const state = stateAfterOpening({
      openingVariant: 'water-first',
    });

    expect(
      evaluateProjectionRules(state, scenario01ProjectionRules),
    ).toBe(state);
    expect(state.projections).toHaveLength(0);
  });

  for (const openingVariant of [
    'power-first',
    'communications-first',
    'water-first',
  ] as const) {
    it(`creates explainable P-01 for ${openingVariant}`, () => {
      const assessedState = stateWithOpeningAssessment({
        openingVariant,
      });
      const projectedState = evaluateProjectionRules(
        assessedState,
        scenario01ProjectionRules,
      );
      const projection = projectedState.projections[0];

      expect(projection).toMatchObject({
        id: scenario01ProjectionIds.communicationsContinuity,
        revision: 1,
        title:
          'Primary R-4 communications may be lost if current degradation continues',
        severity: 'warning',
        attention: 'review',
        status: 'projected',
        createdAt: assessedState.now,
        recalculatedAt: assessedState.now,
      });
      expect(projection?.evidenceIds).toEqual(
        assessedState.assessments[0]?.evidenceIds,
      );
      expect(projection?.dependencyIds).toEqual([
        'dependency.r4.powered-by.gpz',
        'dependency.suw.monitored-via.r4',
      ]);
      expect(projection?.horizon.earliest).toBeGreaterThan(
        packetLossReceivedAt(assessedState),
      );
      expect(
        evaluateProjectionRules(
          projectedState,
          scenario01ProjectionRules,
        ),
      ).toBe(projectedState);
    });
  }

  it('widens the documented default horizon for delayed evidence', () => {
    const initialState = createInitialRuntimeState(
      scenario01InitialData,
      scenario01DefaultRunConfig,
    );
    const definitions = createScenario01TimeEvents(
      scenario01DefaultRunConfig,
    );
    const finalDefinition = definitions.at(-1);

    if (!finalDefinition) {
      throw new Error('Expected Scenario 01 opening events.');
    }

    const observedState = processDueScenarioTimeEvents(
      advanceScenarioTime(
        initialState,
        finalDefinition.trigger.at - initialState.now,
      ),
      definitions,
      RECORDED_AT,
    );
    const assessedState = evaluateAssessmentRules(
      observedState,
      scenario01AssessmentRules,
    );
    const projectedState = evaluateProjectionRules(
      assessedState,
      scenario01ProjectionRules,
    );
    const receivedAt = packetLossReceivedAt(projectedState);

    expect(projectedState.projections[0]?.horizon).toEqual({
      earliest: receivedAt + 16,
      latest: receivedAt + 26,
    });
    expect(projectedState.projections[0]?.confidence.level).toBe(
      'medium',
    );
  });

  it('projects an earlier window when communications fragility dominates', () => {
    const neutralState = stateWithOpeningAssessment({
      openingVariant: 'power-first',
      dominantProfile: 'access-constrained',
      secondaryModifier: 'resource-constrained',
      seed: 'projection-profile-comparison',
    });
    const fragileState = stateWithOpeningAssessment({
      openingVariant: 'power-first',
      dominantProfile: 'communications-fragile',
      secondaryModifier: 'access-constrained',
      seed: 'projection-profile-comparison',
    });
    const neutralProjection = evaluateProjectionRules(
      neutralState,
      scenario01ProjectionRules,
    ).projections[0];
    const fragileProjection = evaluateProjectionRules(
      fragileState,
      scenario01ProjectionRules,
    ).projections[0];
    const neutralOffset =
      (neutralProjection?.horizon.earliest ?? 0) -
      packetLossReceivedAt(neutralState);
    const fragileOffset =
      (fragileProjection?.horizon.earliest ?? 0) -
      packetLossReceivedAt(fragileState);

    expect(neutralOffset).toBe(16);
    expect(fragileOffset).toBe(12);
    expect(fragileOffset).toBeLessThan(neutralOffset);
  });

  it('preserves low confidence when uncertain data drives A-01', () => {
    const assessedState = stateWithOpeningAssessment({
      openingVariant: 'power-first',
      dominantProfile: 'low-confidence-data',
      secondaryModifier: 'access-constrained',
    });
    const projectedState = evaluateProjectionRules(
      assessedState,
      scenario01ProjectionRules,
    );

    expect(projectedState.projections[0]?.confidence.level).toBe('low');
    expect(
      projectedState.projections[0]?.mainUncertainty,
    ).toBe(
      'Whether R-4 degradation persists or stabilises before the projected window.',
    );
  });
});
