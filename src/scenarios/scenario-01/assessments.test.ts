import { describe, expect, it } from 'vitest';

import { resolveScenarioRunConfig } from '../../core/run-config';
import { evaluateAssessmentRules } from '../../core/runtime-assessments';
import { advanceScenarioTime } from '../../core/runtime-clock';
import { processDueScenarioTimeEvents } from '../../core/runtime-events';
import {
  createInitialRuntimeState,
  type ConditionProfileId,
  type OpeningVariantId,
} from '../../core/runtime-state';
import {
  scenario01AssessmentIds,
  scenario01AssessmentRules,
} from './assessments';
import {
  scenario01DefaultRunConfig,
  scenario01InitialData,
} from './scenario';
import { createScenario01TimeEvents } from './timeline';

const RECORDED_AT = '2026-09-23T11:30:00.000Z';

interface OpeningStateOptions {
  openingVariant: OpeningVariantId;
  dominantProfile?: ConditionProfileId;
  secondaryModifier?: ConditionProfileId;
  throughEventIndex?: number;
}

function stateWithOpeningEvidence({
  openingVariant,
  dominantProfile = 'access-constrained',
  secondaryModifier = 'resource-constrained',
  throughEventIndex = 2,
}: OpeningStateOptions) {
  const run = resolveScenarioRunConfig({
    scenarioId: scenario01InitialData.id,
    scenarioVersion: scenario01InitialData.version,
    seed: `assessment-${openingVariant}-${dominantProfile}-${secondaryModifier}`,
    openingVariant,
    dominantProfile,
    secondaryModifier,
  });
  const initialState = createInitialRuntimeState(
    scenario01InitialData,
    run,
  );
  const definitions = createScenario01TimeEvents(run);
  const finalDefinition = definitions[throughEventIndex];

  if (!finalDefinition) {
    throw new Error(
      `Missing opening event definition at index ${throughEventIndex}.`,
    );
  }

  const stateAtEvidenceTime = advanceScenarioTime(
    initialState,
    finalDefinition.trigger.at - initialState.now,
  );

  return processDueScenarioTimeEvents(
    stateAtEvidenceTime,
    definitions,
    RECORDED_AT,
  );
}

const openingExpectations = [
  {
    openingVariant: 'power-first',
    title:
      'Possible shared power-related disruption affecting dependent services',
    evidenceIds: [
      'observation.scenario-01.gpz.power-quality-disturbance',
      'observation.scenario-01.suw.controller-restart',
      'observation.scenario-01.r4.packet-loss-rise',
    ],
  },
  {
    openingVariant: 'communications-first',
    title:
      'Possible loss of operational visibility with emerging cross-domain correlation',
    evidenceIds: [
      'observation.scenario-01.r4.packet-loss-rise',
      'observation.scenario-01.suw.telemetry-delay',
      'observation.scenario-01.gpz.power-quality-disturbance',
    ],
  },
  {
    openingVariant: 'water-first',
    title:
      'Possible local service degradation with emerging cross-domain correlation',
    evidenceIds: [
      'observation.scenario-01.suw.controller-restart',
      'observation.scenario-01.gpz.power-quality-disturbance',
      'observation.scenario-01.r4.packet-loss-rise',
    ],
  },
] as const satisfies readonly {
  openingVariant: OpeningVariantId;
  title: string;
  evidenceIds: readonly string[];
}[];

describe('Scenario 01 opening Assessment', () => {
  it('does not create A-01 before all three opening observations arrive', () => {
    const stateAfterTwoObservations = stateWithOpeningEvidence({
      openingVariant: 'water-first',
      throughEventIndex: 1,
    });

    expect(
      evaluateAssessmentRules(
        stateAfterTwoObservations,
        scenario01AssessmentRules,
      ),
    ).toBe(stateAfterTwoObservations);
    expect(stateAfterTwoObservations.assessments).toHaveLength(0);
  });

  for (const expectation of openingExpectations) {
    it(`creates explainable A-01 for ${expectation.openingVariant}`, () => {
      const stateAfterOpening = stateWithOpeningEvidence({
        openingVariant: expectation.openingVariant,
      });
      const assessedState = evaluateAssessmentRules(
        stateAfterOpening,
        scenario01AssessmentRules,
      );
      const assessment = assessedState.assessments[0];

      expect(assessment).toMatchObject({
        id: scenario01AssessmentIds.crossDomainDisruption,
        revision: 1,
        title: expectation.title,
        severity: 'warning',
        attention: 'review',
        status: 'active',
        createdAt: stateAfterOpening.now,
        recalculatedAt: stateAfterOpening.now,
      });
      expect(assessment?.evidenceIds).toEqual(
        expectation.evidenceIds,
      );
      expect(assessment?.dependencyIds).toEqual(
        expect.arrayContaining([
          'dependency.suw.powered-by.gpz',
          'dependency.r4.powered-by.gpz',
        ]),
      );
      expect(assessment?.assumptions).toHaveLength(2);
      expect(
        evaluateAssessmentRules(
          assessedState,
          scenario01AssessmentRules,
        ),
      ).toBe(assessedState);
    });
  }

  it('uses medium confidence for the documented default run', () => {
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

    const stateAfterOpening = processDueScenarioTimeEvents(
      advanceScenarioTime(
        initialState,
        finalDefinition.trigger.at - initialState.now,
      ),
      definitions,
      RECORDED_AT,
    );
    const assessedState = evaluateAssessmentRules(
      stateAfterOpening,
      scenario01AssessmentRules,
    );

    expect(assessedState.assessments[0]?.confidence.level).toBe(
      'medium',
    );
  });

  it('reduces A-01 confidence when low-confidence data dominates', () => {
    const stateAfterOpening = stateWithOpeningEvidence({
      openingVariant: 'power-first',
      dominantProfile: 'low-confidence-data',
      secondaryModifier: 'access-constrained',
    });
    const assessedState = evaluateAssessmentRules(
      stateAfterOpening,
      scenario01AssessmentRules,
    );

    expect(assessedState.assessments[0]?.confidence.level).toBe('low');
    expect(
      assessedState.assessments[0]?.confidence.reasons,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'source-confidence',
          effect: 'decrease',
        }),
      ]),
    );
  });

  it('keeps high confidence when all opening evidence is current and strong', () => {
    const stateAfterOpening = stateWithOpeningEvidence({
      openingVariant: 'power-first',
    });
    const assessedState = evaluateAssessmentRules(
      stateAfterOpening,
      scenario01AssessmentRules,
    );

    expect(assessedState.assessments[0]?.confidence.level).toBe('high');
  });
});
