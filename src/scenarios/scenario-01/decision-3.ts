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
  scenario01Decision2ActionIds,
  scenario01Decision2Ids,
} from './decision-2-ids';
import {
  scenario01Decision3ActionIds,
  scenario01Decision3Ids,
} from './decision-3-ids';
import { scenario01ProjectionIds } from './projections';
import { scenario01WaterServiceProjectionId } from './water-service-projection';

const HOSPITAL_CONTINUITY_REQUEST_OBSERVATION_ID =
  'observation.scenario-01.hospital.continuity-request';

function latestAssessment(
  assessments: readonly Assessment[],
  assessmentId: string,
): Assessment | undefined {
  return assessments
    .filter(
      (assessment) =>
        assessment.id === assessmentId && assessment.status === 'active',
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
    .filter((projection) => projection.id === projectionId)
    .reduce<Projection | undefined>(
      (latest, projection) =>
        !latest || projection.revision > latest.revision
          ? projection
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

function materialEvidenceIds(actionId: string): readonly string[] {
  switch (actionId) {
    case scenario01Decision2ActionIds.recommendGeneratorForSuw:
      return [
        'observation.scenario-01.suw.generator-support-active',
        'observation.scenario-01.r4.link-quality-poor',
      ];

    case scenario01Decision2ActionIds.recommendGeneratorForR4:
      return [
        'observation.scenario-01.r4.generator-power',
        'observation.scenario-01.suw.service-margin-declining',
      ];

    case scenario01Decision2ActionIds.waitForGridRestoration:
      return [
        'observation.scenario-01.gpz.restoration-window',
        'observation.scenario-01.suw.service-margin-declining-while-waiting',
        'observation.scenario-01.r4.link-quality-poor-while-waiting',
      ];

    default:
      return [];
  }
}

const coordinationScope = {
  entityIds: [
    scenario01EntityIds.gridSubstation,
    scenario01EntityIds.waterStation,
    scenario01EntityIds.communicationsGateway,
    scenario01EntityIds.countyHospital,
  ],
  assessmentIds: [scenario01AssessmentIds.crossDomainDisruption],
  projectionIds: [
    scenario01ProjectionIds.communicationsContinuity,
    scenario01ProjectionIds.suwVisibility,
    scenario01WaterServiceProjectionId,
  ],
} as const;

const coordinationActions: readonly ActionDraft[] = [
  {
    id: scenario01Decision3ActionIds.targetedContingency,
    type: 'coordination-posture',
    title: 'Targeted notification and contingency preparation',
    scope: {
      entityIds: [...coordinationScope.entityIds],
      assessmentIds: [...coordinationScope.assessmentIds],
      projectionIds: [...coordinationScope.projectionIds],
    },
    authority: 'operator',
    expectedEffects: [
      {
        type: 'coordination.targeted-notification',
        entityIds: [
          scenario01EntityIds.waterStation,
          scenario01EntityIds.communicationsGateway,
          scenario01EntityIds.countyHospital,
        ],
        description:
          'Affected organisations receive targeted notification of the current disruption and dependencies.',
      },
      {
        type: 'contingency.preparation',
        entityIds: [scenario01EntityIds.countyHospital],
        description:
          'Local contingency preparation begins without activating broader voivodeship-level coordination.',
      },
    ],
    displacedRisks: [
      {
        type: 'coordination.capacity',
        description:
          'Broader regional coordination capacity is not activated if the disruption widens or current mitigations deteriorate.',
      },
    ],
    reversible: true,
  },
  {
    id: scenario01Decision3ActionIds.recommendVoivodeshipCoordination,
    type: 'coordination-posture',
    title: 'Recommend voivodeship-level coordination',
    scope: {
      entityIds: [...coordinationScope.entityIds],
      assessmentIds: [...coordinationScope.assessmentIds],
      projectionIds: [...coordinationScope.projectionIds],
    },
    authority: 'operator',
    expectedEffects: [
      {
        type: 'coordination.regional-package',
        description:
          'A broader coordination package is prepared and escalated to the responsible authority.',
      },
      {
        type: 'regional.awareness',
        entityIds: [...coordinationScope.entityIds],
        description:
          'Wider organisational awareness and access to response capacity may improve if the recommendation is accepted.',
      },
    ],
    displacedRisks: [
      {
        type: 'coordination.load',
        description:
          'A wider coordination posture increases organisational load while restoration timing and final service consequences remain uncertain.',
      },
    ],
    reversible: false,
  },
  {
    id: scenario01Decision3ActionIds.continueOperatorCoordination,
    type: 'coordination-posture',
    title: 'Continue operator-level coordination while seeking confirmation',
    scope: {
      entityIds: [...coordinationScope.entityIds],
      assessmentIds: [...coordinationScope.assessmentIds],
      projectionIds: [...coordinationScope.projectionIds],
    },
    authority: 'operator',
    expectedEffects: [
      {
        type: 'coordination.current-level',
        description:
          'The current coordination level is maintained while remaining operational confirmation is requested.',
      },
      {
        type: 'information.confirmation',
        entityIds: [...coordinationScope.entityIds],
        description:
          'Additional confirmation may reduce uncertainty before broader escalation is recommended.',
      },
    ],
    displacedRisks: [
      {
        type: 'response.timing',
        description:
          'Broader coordination is delayed while service margins and current mitigations may continue to change.',
      },
    ],
    reversible: true,
  },
];

export const scenario01Decision3Gate: DecisionGateDefinition = {
  id: scenario01Decision3Ids.coordinationPosture,
  question:
    'Persistent infrastructure disruption now affects multiple services. What coordination posture should be recommended?',
  actions: coordinationActions,
  evaluate(context) {
    const decision2 = context.decisions.find(
      (decision) =>
        decision.id === scenario01Decision2Ids.generatorRecommendation,
    );

    if (!decision2?.selectedActionId || decision2.decidedAt === undefined) {
      return null;
    }

    const hospitalRequest = context.observations.find(
      (observation) =>
        observation.id === HOSPITAL_CONTINUITY_REQUEST_OBSERVATION_ID,
    );
    const requiredMaterialIds = materialEvidenceIds(
      decision2.selectedActionId,
    );
    const materialObservations = requiredMaterialIds
      .map((observationId) =>
        context.observations.find(
          (observation) => observation.id === observationId,
        ),
      )
      .filter(
        (observation): observation is Observation =>
          observation !== undefined,
      );
    const assessment = latestAssessment(
      context.assessments,
      scenario01AssessmentIds.crossDomainDisruption,
    );
    const waterProjection = latestProjection(
      context.projections,
      scenario01WaterServiceProjectionId,
    );

    if (
      !hospitalRequest ||
      requiredMaterialIds.length === 0 ||
      materialObservations.length !== requiredMaterialIds.length ||
      !assessment ||
      !waterProjection
    ) {
      return null;
    }

    const communicationsProjection = latestProjection(
      context.projections,
      scenario01ProjectionIds.communicationsContinuity,
    );
    const visibilityProjection = latestProjection(
      context.projections,
      scenario01ProjectionIds.suwVisibility,
    );
    const claims = [
      assessment,
      waterProjection,
      ...(communicationsProjection ? [communicationsProjection] : []),
      ...(visibilityProjection ? [visibilityProjection] : []),
    ];
    const evidenceIds = [
      ...new Set([
        hospitalRequest.id,
        ...materialObservations.map((observation) => observation.id),
        ...claims.flatMap((claim) => claim.evidenceIds),
      ]),
    ];
    const restorationWindow = context.observations.find(
      (observation) =>
        observation.id === 'observation.scenario-01.gpz.restoration-window',
    );
    const unknowns = [
      restorationWindow
        ? 'The provisional grid-restoration window remains subject to field confirmation.'
        : 'Grid-restoration timing for F-12 remains unconfirmed.',
      'Hospital essential services are currently maintained, but future water and communications continuity still depends on current mitigations and local buffers.',
      'The duration and effectiveness of the current mitigation posture remain uncertain.',
    ];

    return {
      evidenceIds,
      unknowns,
      assumptions: mergeAssumptions(...claims),
    };
  },
};
