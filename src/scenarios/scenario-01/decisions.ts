import type {
  ActionDraft,
  DecisionGateDefinition,
} from '../../core/runtime-decisions';
import type {
  Assessment,
  Assumption,
  Projection,
} from '../../core/contracts';
import { scenario01AssessmentIds } from './assessments';
import { scenario01EntityIds } from './baseline';
import { scenario01ProjectionIds } from './projections';

export const scenario01DecisionIds = {
  informationPosture:
    'decision.scenario-01.information-posture',
} as const;

export const scenario01ActionIds = {
  openCrossDomainIncident:
    'action.scenario-01.d1.open-cross-domain-incident',
  continueSeparateMonitoring:
    'action.scenario-01.d1.continue-separate-monitoring',
  recommendRegionalEscalation:
    'action.scenario-01.d1.recommend-regional-escalation',
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

function mergeAssumptions(
  assessment: Assessment,
  projection: Projection,
): Assumption[] {
  const assumptionsById = new Map<string, Assumption>();

  for (const assumption of [
    ...assessment.assumptions,
    ...projection.assumptions,
  ]) {
    assumptionsById.set(assumption.id, { ...assumption });
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

      const assumptions = mergeAssumptions(
        assessment,
        projection,
      );
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
];
