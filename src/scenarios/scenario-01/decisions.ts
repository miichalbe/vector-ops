import type {
  ActionDraft,
  DecisionGateDefinition,
} from '../../core/runtime-decisions';
import type {
  Assessment,
  Assumption,
  Observation,
  Projection,
} from '../../core/contracts';
import { scenario01AssessmentIds } from './assessments';
import { scenario01EntityIds } from './baseline';
import {
  scenario01ActionIds,
  scenario01DecisionIds,
} from './decision-1-ids';
import {
  scenario01Decision2ActionIds,
  scenario01Decision2Ids,
} from './decision-2-ids';
import { scenario01ProjectionIds } from './projections';

export {
  scenario01ActionIds,
  scenario01DecisionIds,
} from './decision-1-ids';
export {
  scenario01Decision2ActionIds,
  scenario01Decision2Ids,
} from './decision-2-ids';

const DECISION_2_SETTLE_MINUTES = 4;

const decision2EvidenceIds = {
  r4Backup: 'observation.scenario-01.r4.backup-power',
  r4LinkDegraded:
    'observation.scenario-01.r4.link-quality-degraded',
  suwReducedPumping:
    'observation.scenario-01.suw.reduced-pumping',
  routeRestricted: 'observation.scenario-01.z17.restricted',
  routeTravelTime:
    'observation.scenario-01.z17.travel-time-revised',
} as const;

function latestAssessment(
  assessments: readonly Assessment[],
  assessmentId: string,
): Assessment | undefined {
  return assessments
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

function latestProjection(
  projections: readonly Projection[],
  projectionId: string,
): Projection | undefined {
  return projections
    .filter(
      (projection) =>
        projection.id === projectionId &&
        (projection.status === 'projected' ||
          projection.status === 'developing'),
    )
    .reduce<Projection | undefined>(
      (latest, projection) =>
        !latest || projection.revision > latest.revision
          ? projection
          : latest,
      undefined,
    );
}

function latestObservation(
  observations: readonly Observation[],
  entityId: string,
  metric: string,
): Observation | undefined {
  return observations
    .filter(
      (observation) =>
        observation.entityId === entityId &&
        observation.metric === metric,
    )
    .reduce<Observation | undefined>(
      (latest, observation) =>
        !latest || observation.receivedAt > latest.receivedAt
          ? observation
          : latest,
      undefined,
    );
}

function mergeAssumptions(
  ...claims: Array<{ assumptions: readonly Assumption[] }>
): Assumption[] {
  const assumptionsById = new Map<string, Assumption>();

  for (const claim of claims) {
    for (const assumption of claim.assumptions) {
      assumptionsById.set(assumption.id, { ...assumption });
    }
  }

  return [...assumptionsById.values()];
}

const sharedScope = {
  entityIds: [
    scenario01EntityIds.gridSubstation,
    scenario01EntityIds.waterStation,
    scenario01EntityIds.communicationsGateway,
  ],
  assessmentIds: [scenario01AssessmentIds.crossDomainDisruption],
  projectionIds: [scenario01ProjectionIds.communicationsContinuity],
} as const;

const informationPostureActions: readonly ActionDraft[] = [
  {
    id: scenario01ActionIds.openCrossDomainIncident,
    type: 'information-posture',
    title:
      'Open cross-domain incident and request synchronised confirmation',
    scope: {
      entityIds: [...sharedScope.entityIds],
      assessmentIds: [...sharedScope.assessmentIds],
      projectionIds: [...sharedScope.projectionIds],
    },
    authority: 'operator',
    expectedEffects: [
      {
        type: 'information.confirmation',
        entityIds: [...sharedScope.entityIds],
        description:
          'Coordinated confirmation is requested from the relevant organisations.',
      },
      {
        type: 'information.confidence',
        entityIds: [...sharedScope.entityIds],
        description:
          'Earlier confirmation may improve confidence in later Assessments.',
      },
    ],
    displacedRisks: [
      {
        type: 'coordination.load',
        description:
          'Creates a small coordination and time cost while the disruption remains only partly confirmed.',
      },
    ],
    reversible: true,
  },
  {
    id: scenario01ActionIds.continueSeparateMonitoring,
    type: 'information-posture',
    title: 'Continue separate monitoring',
    scope: {
      entityIds: [...sharedScope.entityIds],
      assessmentIds: [...sharedScope.assessmentIds],
      projectionIds: [...sharedScope.projectionIds],
    },
    authority: 'operator',
    expectedEffects: [
      {
        type: 'coordination.load',
        description:
          'No additional cross-domain coordination burden is introduced at this stage.',
      },
    ],
    displacedRisks: [
      {
        type: 'information.uncertainty',
        entityIds: [...sharedScope.entityIds],
        description:
          'Uncertainty is likely to persist longer and later correlation may rely on less contemporaneous evidence.',
      },
    ],
    reversible: true,
  },
  {
    id: scenario01ActionIds.recommendRegionalEscalation,
    type: 'information-posture',
    title:
      'Recommend early regional escalation with stated uncertainty',
    scope: {
      entityIds: [...sharedScope.entityIds],
      assessmentIds: [...sharedScope.assessmentIds],
      projectionIds: [...sharedScope.projectionIds],
    },
    authority: 'operator',
    expectedEffects: [
      {
        type: 'regional.awareness',
        entityIds: [...sharedScope.entityIds],
        description:
          'The wider coordination chain becomes aware of the possible disruption earlier.',
      },
      {
        type: 'response.timing',
        description:
          'A later external response may be able to begin sooner if escalation is accepted.',
      },
    ],
    displacedRisks: [
      {
        type: 'coordination.load',
        description:
          'Escalation begins before persistence is confirmed and may create unnecessary coordination burden.',
      },
    ],
    reversible: false,
  },
];

const generatorRecommendationScope = {
  entityIds: [
    scenario01EntityIds.mobileGenerator,
    scenario01EntityIds.waterStation,
    scenario01EntityIds.communicationsGateway,
    scenario01EntityIds.accessRoute,
  ],
  assessmentIds: [scenario01AssessmentIds.crossDomainDisruption],
  projectionIds: [
    scenario01ProjectionIds.communicationsContinuity,
    scenario01ProjectionIds.suwVisibility,
  ],
} as const;

const generatorRecommendationActions: readonly ActionDraft[] = [
  {
    id: scenario01Decision2ActionIds.recommendGeneratorForSuw,
    type: 'resource-recommendation',
    title: 'Recommend AG-400 for SUW Kępa',
    scope: {
      entityIds: [...generatorRecommendationScope.entityIds],
      assessmentIds: [...generatorRecommendationScope.assessmentIds],
      projectionIds: [...generatorRecommendationScope.projectionIds],
    },
    authority: 'operator',
    expectedEffects: [
      {
        type: 'resource.assignment',
        entityIds: [
          scenario01EntityIds.mobileGenerator,
          scenario01EntityIds.waterStation,
        ],
        description:
          'If accepted, AG-400 will be reserved and prepared for SUW Kępa.',
      },
      {
        type: 'water.service-margin',
        entityIds: [scenario01EntityIds.waterStation],
        description:
          'External deployment would protect pumping capacity and improve water-service margin.',
      },
    ],
    displacedRisks: [
      {
        type: 'communications.continuity',
        entityIds: [scenario01EntityIds.communicationsGateway],
        description:
          'R-4 remains dependent on finite backup power while communications degradation continues.',
      },
      {
        type: 'operational.visibility',
        entityIds: [
          scenario01EntityIds.communicationsGateway,
          scenario01EntityIds.waterStation,
        ],
        description:
          'Remote SUW visibility may continue to deteriorate if R-4 loses usable service.',
      },
    ],
    reversible: true,
  },
  {
    id: scenario01Decision2ActionIds.recommendGeneratorForR4,
    type: 'resource-recommendation',
    title: 'Recommend AG-400 for R-4',
    scope: {
      entityIds: [...generatorRecommendationScope.entityIds],
      assessmentIds: [...generatorRecommendationScope.assessmentIds],
      projectionIds: [...generatorRecommendationScope.projectionIds],
    },
    authority: 'operator',
    expectedEffects: [
      {
        type: 'resource.assignment',
        entityIds: [
          scenario01EntityIds.mobileGenerator,
          scenario01EntityIds.communicationsGateway,
        ],
        description:
          'If accepted, AG-400 will be reserved and prepared for R-4.',
      },
      {
        type: 'communications.continuity',
        entityIds: [scenario01EntityIds.communicationsGateway],
        description:
          'External deployment would protect communications continuity and preserve remote visibility for longer.',
      },
    ],
    displacedRisks: [
      {
        type: 'water.service-margin',
        entityIds: [scenario01EntityIds.waterStation],
        description:
          'SUW Kępa remains on reduced pumping and water-service margin continues to decrease.',
      },
    ],
    reversible: true,
  },
  {
    id: scenario01Decision2ActionIds.waitForGridRestoration,
    type: 'resource-recommendation',
    title: 'Wait briefly for firmer grid-restoration information',
    scope: {
      entityIds: [...generatorRecommendationScope.entityIds],
      assessmentIds: [...generatorRecommendationScope.assessmentIds],
      projectionIds: [...generatorRecommendationScope.projectionIds],
    },
    authority: 'operator',
    expectedEffects: [
      {
        type: 'resource.flexibility',
        entityIds: [scenario01EntityIds.mobileGenerator],
        description:
          'AG-400 remains uncommitted while firmer restoration information is sought.',
      },
    ],
    displacedRisks: [
      {
        type: 'time-margin',
        entityIds: [
          scenario01EntityIds.waterStation,
          scenario01EntityIds.communicationsGateway,
        ],
        description:
          'Waiting consumes time margin for both reduced pumping and finite R-4 backup power.',
      },
      {
        type: 'access.delay',
        entityIds: [scenario01EntityIds.accessRoute],
        description:
          'Restricted Z-17 access may increase the cost of a later deployment.',
      },
    ],
    reversible: true,
  },
];

export const scenario01DecisionGates: readonly DecisionGateDefinition[] = [
  {
    id: scenario01DecisionIds.informationPosture,
    question:
      'Evidence suggests a possible cross-domain disruption. How should the current information posture change?',
    actions: informationPostureActions,
    evaluate(context) {
      const assessment = latestAssessment(
        context.assessments,
        scenario01AssessmentIds.crossDomainDisruption,
      );
      const projection = latestProjection(
        context.projections,
        scenario01ProjectionIds.communicationsContinuity,
      );

      if (!assessment || !projection) {
        return null;
      }

      const assumptions = mergeAssumptions(assessment, projection);
      const evidenceIds = [
        ...new Set([
          ...assessment.evidenceIds,
          ...projection.evidenceIds,
        ]),
      ];
      const unknowns = assumptions
        .filter((assumption) => assumption.status === 'unverified')
        .map((assumption) => assumption.statement);

      if (
        projection.mainUncertainty &&
        !unknowns.includes(projection.mainUncertainty)
      ) {
        unknowns.push(projection.mainUncertainty);
      }

      return {
        evidenceIds,
        unknowns,
        assumptions,
      };
    },
  },
  {
    id: scenario01Decision2Ids.generatorRecommendation,
    question:
      'One compatible mobile generator is available. Which deployment should be recommended?',
    actions: generatorRecommendationActions,
    evaluate(context) {
      const decision1 = context.decisions.find(
        (decision) =>
          decision.id === scenario01DecisionIds.informationPosture,
      );

      if (
        !decision1?.selectedActionId ||
        decision1.decidedAt === undefined
      ) {
        return null;
      }

      const assessment = latestAssessment(
        context.assessments,
        scenario01AssessmentIds.crossDomainDisruption,
      );
      const communicationsProjection = latestProjection(
        context.projections,
        scenario01ProjectionIds.communicationsContinuity,
      );
      const visibilityProjection = latestProjection(
        context.projections,
        scenario01ProjectionIds.suwVisibility,
      );
      const generatorState = latestObservation(
        context.observations,
        scenario01EntityIds.mobileGenerator,
        'logistics.resourceState',
      );
      const requiredObservations = Object.values(decision2EvidenceIds)
        .map((observationId) =>
          context.observations.find(
            (observation) => observation.id === observationId,
          ),
        )
        .filter(
          (observation): observation is Observation =>
            observation !== undefined,
        );

      if (
        !assessment ||
        !communicationsProjection ||
        !visibilityProjection ||
        !generatorState ||
        generatorState.value !== 'available' ||
        requiredObservations.length !==
          Object.keys(decision2EvidenceIds).length
      ) {
        return null;
      }

      const maturityAt =
        Math.max(
          ...requiredObservations.map(
            (observation) => observation.receivedAt,
          ),
        ) + DECISION_2_SETTLE_MINUTES;

      if (context.now < maturityAt) {
        return null;
      }

      const assumptions = mergeAssumptions(
        assessment,
        communicationsProjection,
        visibilityProjection,
      );
      const evidenceIds = [
        ...new Set([
          generatorState.id,
          ...requiredObservations.map(
            (observation) => observation.id,
          ),
          ...assessment.evidenceIds,
          ...communicationsProjection.evidenceIds,
          ...visibilityProjection.evidenceIds,
        ]),
      ];
      const unknowns = [
        'Grid-restoration timing for F-12 remains unconfirmed.',
        'Exact remaining R-4 backup endurance remains uncertain.',
        'Water-service margin under sustained reduced pumping has not yet been directly confirmed.',
      ];

      for (const uncertainty of [
        communicationsProjection.mainUncertainty,
        visibilityProjection.mainUncertainty,
      ]) {
        if (uncertainty && !unknowns.includes(uncertainty)) {
          unknowns.push(uncertainty);
        }
      }

      return {
        evidenceIds,
        unknowns,
        assumptions,
      };
    },
  },
];
