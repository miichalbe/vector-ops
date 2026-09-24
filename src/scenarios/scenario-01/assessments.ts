import type {
  Action,
  ConfidenceLevel,
  Observation,
} from '../../core/contracts';
import type {
  AssessmentDraft,
  AssessmentRule,
} from '../../core/runtime-assessments';
import type { OpeningVariantId } from '../../core/runtime-state';
import { scenario01EntityIds } from './baseline';
import { scenario01ActionIds } from './decision-1-ids';
import { getDecision1DownstreamModifiers } from './decision-1-outcomes';

export const scenario01AssessmentIds = {
  crossDomainDisruption:
    'assessment.scenario-01.cross-domain-disruption',
} as const;

export const scenario01AssessmentRuleIds = {
  crossDomainOpening:
    'rule.scenario-01.assessment.cross-domain-opening',
} as const;

const F12_ISOLATED_OBSERVATION_ID =
  'observation.scenario-01.gpz.f12-isolated';

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

function raiseConfidenceOneLevel(
  confidence: ConfidenceLevel,
): ConfidenceLevel {
  if (confidence === 'low') {
    return 'medium';
  }

  return 'high';
}

function selectedDecision1Action(
  actions: readonly Action[],
): Action | undefined {
  const decision1ActionIds = new Set<string>(
    Object.values(scenario01ActionIds),
  );

  return actions.find(
    (action) =>
      action.lifecycle === 'selected' &&
      decision1ActionIds.has(action.id),
  );
}

function decision1ConfidenceSupport(
  actions: readonly Action[],
) {
  const selectedAction = selectedDecision1Action(actions);

  return selectedAction
    ? getDecision1DownstreamModifiers(selectedAction.id)
        .confidenceSupport
    : 'none';
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

function persistentFeederDraft(
  openingVariant: OpeningVariantId,
  openingObservations: readonly Observation[],
  feederObservation: Observation,
  actions: readonly Action[],
): AssessmentDraft {
  const observations = [...openingObservations, feederObservation];
  const baseConfidence = lowestConfidence(observations);
  const confidenceSupport = decision1ConfidenceSupport(actions);
  const confidenceLevel =
    confidenceSupport === 'moderate'
      ? raiseConfidenceOneLevel(baseConfidence)
      : baseConfidence;
  const hasDegradedEvidence = openingObservations.some(
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
    title:
      'Persistent F-12 disruption confirms continuing risk to dependent services',
    severity: 'warning',
    attention: 'review',
    confidence: {
      level: confidenceLevel,
      reasons: [
        {
          type: 'persistence',
          effect: 'increase',
          description:
            'F-12 is now confirmed isolated, resolving the earlier uncertainty about persistence.',
        },
        {
          type: 'dependency',
          effect: 'increase',
          description:
            'Registered dependencies connect SUW Kępa and R-4 to the affected GPZ feeder.',
        },
        ...(confidenceSupport === 'moderate'
          ? [
              {
                type: 'coordinated-confirmation',
                effect: 'increase' as const,
                description:
                  'Earlier synchronised confirmation provides additional support for the cross-domain interpretation.',
              },
            ]
          : []),
        ...(hasDegradedEvidence
          ? [
              {
                type: 'evidence-quality',
                effect: 'decrease' as const,
                description:
                  'Some opening evidence remains delayed or degraded even though feeder persistence is now confirmed.',
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
        status: 'confirmed',
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

      const feederObservation = context.observations.find(
        (observation) => observation.id === F12_ISOLATED_OBSERVATION_ID,
      );

      if (feederObservation) {
        return persistentFeederDraft(
          context.run.openingVariant,
          observations,
          feederObservation,
          context.actions,
        );
      }

      return crossDomainOpeningDraft(
        context.run.openingVariant,
        observations,
      );
    },
  },
];
