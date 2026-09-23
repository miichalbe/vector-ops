import type {
  Assessment,
  ConfidenceFactor,
  ConfidenceLevel,
  Observation,
} from '../../core/contracts';
import type {
  ProjectionDraft,
  ProjectionRule,
  ProjectionRuleContext,
} from '../../core/runtime-projections';
import { scenario01AssessmentIds } from './assessments';
import { scenario01EntityIds } from './baseline';

export const scenario01ProjectionIds = {
  communicationsContinuity:
    'projection.scenario-01.communications-continuity',
} as const;

export const scenario01ProjectionRuleIds = {
  communicationsContinuity:
    'rule.scenario-01.projection.communications-continuity',
} as const;

const R4_PACKET_LOSS_OBSERVATION_ID =
  'observation.scenario-01.r4.packet-loss-rise';

const confidenceRank: Record<ConfidenceLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

function lowerConfidence(
  left: ConfidenceLevel,
  right: ConfidenceLevel,
): ConfidenceLevel {
  return confidenceRank[left] <= confidenceRank[right]
    ? left
    : right;
}

function latestActiveAssessment(
  context: ProjectionRuleContext,
  assessmentId: string,
): Assessment | undefined {
  return context.assessments
    .filter(
      (assessment) =>
        assessment.id === assessmentId &&
        assessment.status === 'active',
    )
    .reduce<Assessment | undefined>(
      (latest, assessment) =>
        !latest || assessment.revision > latest.revision
          ? assessment
          : latest,
      undefined,
    );
}

function communicationsHorizon(
  context: ProjectionRuleContext,
  packetLossObservation: Observation,
) {
  const packetLoss = packetLossObservation.value;

  if (typeof packetLoss !== 'number') {
    return null;
  }

  const degradation = context.run.parameters.communications;
  const information = context.run.parameters.information;
  const packetLossAdvance =
    packetLoss >= 4 ? 2 : packetLoss >= 3.2 ? 1 : 0;
  const earliestDelay = Math.max(
    8,
    16 -
      degradation.degradationLeadMinutes -
      packetLossAdvance,
  );
  const latestDelay = Math.max(
    earliestDelay + 4,
    24 -
      degradation.degradationLeadMinutes +
      information.reportDelayMinutes,
  );

  return {
    earliest: packetLossObservation.receivedAt + earliestDelay,
    latest: packetLossObservation.receivedAt + latestDelay,
  };
}

function communicationsProjectionDraft(
  context: ProjectionRuleContext,
  assessment: Assessment,
  packetLossObservation: Observation,
): ProjectionDraft | null {
  const horizon = communicationsHorizon(
    context,
    packetLossObservation,
  );

  if (!horizon) {
    return null;
  }

  const confidenceLevel = lowerConfidence(
    assessment.confidence.level,
    packetLossObservation.confidence.level,
  );
  const confidenceReasons: ConfidenceFactor[] = [
    {
      type: 'assessment',
      effect: 'increase',
      description:
        'The active cross-domain Assessment correlates R-4 degradation with the opening infrastructure observations.',
    },
    {
      type: 'dependency',
      effect: 'increase',
      description:
        'Registered dependencies show that R-4 supports SUW monitoring and receives normal power from GPZ Brzeziny.',
    },
  ];

  if (
    packetLossObservation.quality !== 'good' ||
    confidenceLevel !== 'high'
  ) {
    confidenceReasons.push({
      type: 'evidence-quality',
      effect: 'decrease',
      description:
        'The projected window remains sensitive to delayed or lower-confidence opening evidence.',
    });
  }

  return {
    title:
      'Primary R-4 communications may be lost if current degradation continues',
    severity: 'warning',
    attention: 'review',
    confidence: {
      level: confidenceLevel,
      reasons: confidenceReasons,
    },
    entityIds: [
      scenario01EntityIds.communicationsGateway,
      scenario01EntityIds.waterStation,
    ],
    evidenceIds: [...assessment.evidenceIds],
    dependencyIds: [
      'dependency.r4.powered-by.gpz',
      'dependency.suw.monitored-via.r4',
    ],
    assumptions: [
      {
        id: 'assumption.scenario-01.p01.degradation-continues',
        statement:
          'The observed R-4 packet-loss trend continues instead of stabilising.',
        status: 'supported',
      },
      {
        id: 'assumption.scenario-01.p01.no-intervention',
        statement:
          'No effective communications or power intervention occurs before the projected window.',
        status: 'unverified',
      },
    ],
    horizon,
    mainUncertainty:
      'Whether R-4 degradation persists or stabilises before the projected window.',
    status: 'projected',
  };
}

export const scenario01ProjectionRules: readonly ProjectionRule[] = [
  {
    id: scenario01ProjectionRuleIds.communicationsContinuity,
    evaluate(context) {
      const assessment = latestActiveAssessment(
        context,
        scenario01AssessmentIds.crossDomainDisruption,
      );
      const packetLossObservation = context.observations.find(
        (observation) =>
          observation.id === R4_PACKET_LOSS_OBSERVATION_ID,
      );

      if (!assessment || !packetLossObservation) {
        return [];
      }

      const draft = communicationsProjectionDraft(
        context,
        assessment,
        packetLossObservation,
      );

      return draft
        ? [
            {
              projectionId:
                scenario01ProjectionIds.communicationsContinuity,
              draft,
            },
          ]
        : [];
    },
  },
];
