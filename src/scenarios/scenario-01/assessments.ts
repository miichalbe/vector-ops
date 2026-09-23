import type {
  ConfidenceLevel,
  Observation,
} from '../../core/contracts';
import type {
  AssessmentDraft,
  AssessmentRule,
} from '../../core/runtime-assessments';
import type { OpeningVariantId } from '../../core/runtime-state';
import { scenario01EntityIds } from './baseline';

export const scenario01AssessmentIds = {
  crossDomainDisruption:
    'assessment.scenario-01.cross-domain-disruption',
} as const;

export const scenario01AssessmentRuleIds = {
  crossDomainOpening:
    'rule.scenario-01.assessment.cross-domain-opening',
} as const;

const openingEvidenceIds = {
  'power-first': [
    'observation.scenario-01.gpz.power-quality-disturbance',
    'observation.scenario-01.suw.controller-restart',
    'observation.scenario-01.r4.packet-loss-rise',
  ],
  'communications-first': [
    'observation.scenario-01.r4.packet-loss-rise',
    'observation.scenario-01.suw.telemetry-delay',
    'observation.scenario-01.gpz.power-quality-disturbance',
  ],
  'water-first': [
    'observation.scenario-01.suw.controller-restart',
    'observation.scenario-01.gpz.power-quality-disturbance',
    'observation.scenario-01.r4.packet-loss-rise',
  ],
} as const satisfies Record<OpeningVariantId, readonly string[]>;

const openingAssessmentTitles = {
  'power-first':
    'Possible shared power-related disruption affecting dependent services',
  'communications-first':
    'Possible loss of operational visibility with emerging cross-domain correlation',
  'water-first':
    'Possible local service degradation with emerging cross-domain correlation',
} as const satisfies Record<OpeningVariantId, string>;

const sharedPowerDependencyIds = [
  'dependency.suw.powered-by.gpz',
  'dependency.r4.powered-by.gpz',
] as const;

const confidenceRank: Record<ConfidenceLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

function lowestConfidence(
  observations: readonly Observation[],
): ConfidenceLevel {
  return observations.reduce<ConfidenceLevel>(
    (lowest, observation) =>
      confidenceRank[observation.confidence.level] <
      confidenceRank[lowest]
        ? observation.confidence.level
        : lowest,
    'high',
  );
}

function crossDomainOpeningDraft(
  openingVariant: OpeningVariantId,
  observations: readonly Observation[],
): AssessmentDraft {
  const confidenceLevel = lowestConfidence(observations);
  const hasDegradedEvidence = observations.some(
    (observation) => observation.quality !== 'good',
  );
  const dependencyIds =
    openingVariant === 'communications-first'
      ? [
          ...sharedPowerDependencyIds,
          'dependency.suw.monitored-via.r4',
        ]
      : [...sharedPowerDependencyIds];

  return {
    title: openingAssessmentTitles[openingVariant],
    severity: 'warning',
    attention: 'review',
    confidence: {
      level: confidenceLevel,
      reasons: [
        {
          type: 'correlation',
          effect: 'increase',
          description:
            'Three operational observations affect services connected by registered dependencies.',
        },
        {
          type: 'dependency',
          effect: 'increase',
          description:
            'The dependency registry connects SUW Kępa and R-4 to GPZ Brzeziny.',
        },
        ...(hasDegradedEvidence
          ? [
              {
                type: 'evidence-quality',
                effect: 'decrease' as const,
                description:
                  'At least one supporting observation is delayed or degraded.',
              },
            ]
          : []),
        ...(confidenceLevel === 'low'
          ? [
              {
                type: 'source-confidence',
                effect: 'decrease' as const,
                description:
                  'At least one supporting observation currently has low confidence.',
              },
            ]
          : []),
      ],
    },
    entityIds: [
      scenario01EntityIds.gridSubstation,
      scenario01EntityIds.waterStation,
      scenario01EntityIds.communicationsGateway,
    ],
    evidenceIds: observations.map((observation) => observation.id),
    dependencyIds,
    assumptions: [
      {
        id: 'assumption.scenario-01.a01.shared-cause',
        statement:
          'The opening anomalies have a shared cause rather than coincidental local causes.',
        status: 'supported',
      },
      {
        id: 'assumption.scenario-01.a01.persistence',
        statement:
          'The automatically cleared GPZ disturbance may have continuing downstream effects.',
        status: 'unverified',
      },
    ],
    status: 'active',
  };
}

export const scenario01AssessmentRules: readonly AssessmentRule[] = [
  {
    id: scenario01AssessmentRuleIds.crossDomainOpening,
    assessmentId: scenario01AssessmentIds.crossDomainDisruption,
    evaluate(context) {
      const evidenceIds = openingEvidenceIds[context.run.openingVariant];
      const observations = evidenceIds
        .map((evidenceId) =>
          context.observations.find(
            (observation) => observation.id === evidenceId,
          ),
        )
        .filter(
          (observation): observation is Observation =>
            observation !== undefined,
        );

      if (observations.length !== evidenceIds.length) {
        return null;
      }

      return crossDomainOpeningDraft(
        context.run.openingVariant,
        observations,
      );
    },
  },
];
