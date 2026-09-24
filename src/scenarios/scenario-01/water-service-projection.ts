import type {
  ConfidenceFactor,
  ConfidenceLevel,
  Observation,
} from '../../core/contracts';
import type {
  ProjectionDraft,
  ProjectionRule,
  ProjectionRuleContext,
} from '../../core/runtime-projections';
import { scenario01EntityIds } from './baseline';

export const scenario01WaterServiceProjectionId =
  'projection.scenario-01.water-service-margin';

export const scenario01WaterServiceProjectionRuleId =
  'rule.scenario-01.projection.water-service-margin';

const SUW_REDUCED_PUMPING_OBSERVATION_ID =
  'observation.scenario-01.suw.reduced-pumping';
const HOSPITAL_CONTINUITY_REQUEST_OBSERVATION_ID =
  'observation.scenario-01.hospital.continuity-request';
const HOSPITAL_ESSENTIAL_SERVICES_OBSERVATION_ID =
  'observation.scenario-01.hospital.essential-services-maintained';

const confidenceRank: Record<ConfidenceLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

function lowestConfidence(observations: readonly Observation[]): ConfidenceLevel {
  return observations.reduce<ConfidenceLevel>(
    (lowest, observation) =>
      confidenceRank[observation.confidence.level] < confidenceRank[lowest]
        ? observation.confidence.level
        : lowest,
    'high',
  );
}

function findObservation(
  context: ProjectionRuleContext,
  observationId: string,
): Observation | undefined {
  return context.observations.find(
    (observation) => observation.id === observationId,
  );
}

function latestObservation(
  context: ProjectionRuleContext,
  entityId: string,
  metric: string,
): Observation | undefined {
  return context.observations
    .filter(
      (observation) =>
        observation.entityId === entityId && observation.metric === metric,
    )
    .reduce<Observation | undefined>(
      (latest, observation) =>
        !latest || observation.receivedAt > latest.receivedAt
          ? observation
          : latest,
      undefined,
    );
}

function decliningHorizon(
  context: ProjectionRuleContext,
  basis: Observation,
) {
  const marginMultiplier =
    context.run.parameters.resources.serviceMarginMultiplier;
  const earliestDelay = Math.max(10, Math.round(18 * marginMultiplier));
  const latestDelay =
    earliestDelay + Math.max(8, Math.round(14 * marginMultiplier));

  return {
    earliest: basis.receivedAt + earliestDelay,
    latest: basis.receivedAt + latestDelay,
  };
}

function waterServiceProjectionDraft(
  context: ProjectionRuleContext,
  reducedPumping: Observation,
): ProjectionDraft {
  const marginTrend = latestObservation(
    context,
    scenario01EntityIds.waterStation,
    'water.serviceMarginTrend',
  );
  const generatorSupport = latestObservation(
    context,
    scenario01EntityIds.waterStation,
    'water.powerSupport',
  );
  const restorationEstimate = latestObservation(
    context,
    scenario01EntityIds.gridSubstation,
    'power.restorationEstimate',
  );
  const hospitalRequest = findObservation(
    context,
    HOSPITAL_CONTINUITY_REQUEST_OBSERVATION_ID,
  );
  const hospitalServices = findObservation(
    context,
    HOSPITAL_ESSENTIAL_SERVICES_OBSERVATION_ID,
  );
  const stabilising =
    marginTrend?.value === 'stabilising' || generatorSupport?.value === 'ag-400';
  const declining = marginTrend?.value === 'declining';
  const evidence = [
    reducedPumping,
    ...(marginTrend ? [marginTrend] : []),
    ...(generatorSupport ? [generatorSupport] : []),
    ...(restorationEstimate ? [restorationEstimate] : []),
    ...(hospitalServices ? [hospitalServices] : []),
    ...(hospitalRequest ? [hospitalRequest] : []),
  ];
  const confidenceReasons: ConfidenceFactor[] = [
    {
      type: 'physical-state',
      effect: 'increase',
      description:
        'SUW Kępa is confirmed operating with reduced pumping following the persistent feeder disruption.',
    },
    {
      type: 'dependency',
      effect: 'increase',
      description:
        'The registered dependency model identifies County Hospital Nowy Brzeg as a critical recipient of SUW Kępa water service.',
    },
  ];

  if (declining) {
    confidenceReasons.push({
      type: 'service-margin-trend',
      effect: 'increase',
      description:
        'The SUW operator channel now reports that water-service margin is declining.',
    });
  }

  if (stabilising) {
    confidenceReasons.push({
      type: 'intervention',
      effect: 'increase',
      description:
        'AG-400 support is active and the SUW service-margin trend is stabilising.',
    });
  }

  if (hospitalRequest) {
    confidenceReasons.push({
      type: 'critical-service-report',
      effect: 'neutral',
      description:
        'The hospital reports essential services maintained while requesting assurance about expected water continuity.',
    });
  }

  const baseDependencies = [
    'dependency.suw.powered-by.gpz',
    'dependency.hospital.supplied-by.suw',
  ];
  const assumptions = [
    {
      id: 'assumption.scenario-01.p03.no-effective-support',
      statement:
        'No effective water-service intervention stabilises the margin before the projected window.',
      status: stabilising
        ? ('invalidated' as const)
        : declining
          ? ('supported' as const)
          : ('unverified' as const),
    },
    {
      id: 'assumption.scenario-01.p03.local-buffer-maintains-service',
      statement:
        'Local hospital buffers and procedures continue to maintain essential services during the projected window.',
      status: hospitalServices
        ? ('supported' as const)
        : ('unverified' as const),
    },
  ];

  if (stabilising) {
    const basis = marginTrend ?? generatorSupport ?? reducedPumping;

    return {
      title: hospitalRequest
        ? 'AG-400 support is stabilising water-service margin while hospital continuity remains under review'
        : 'Water-service margin risk is reducing after AG-400 support at SUW Kępa',
      severity: 'normal',
      attention: hospitalRequest ? 'review' : 'monitor',
      confidence: {
        level: lowestConfidence(evidence),
        reasons: confidenceReasons,
      },
      entityIds: [
        scenario01EntityIds.waterStation,
        scenario01EntityIds.countyHospital,
      ],
      evidenceIds: [...new Set(evidence.map((observation) => observation.id))],
      dependencyIds: [
        ...baseDependencies,
        'dependency.suw.supported-by.ag400',
      ],
      assumptions,
      horizon: {
        earliest: basis.receivedAt,
        latest: basis.receivedAt,
      },
      mainUncertainty:
        'Whether AG-400 support and local operating conditions remain sufficient until grid service is restored.',
      status: 'avoided',
    };
  }

  const basis = marginTrend ?? reducedPumping;

  return {
    title: hospitalRequest
      ? 'Declining water-service margin increases contingency relevance for County Hospital Nowy Brzeg'
      : declining
        ? 'Water-service margin is declining while reduced pumping persists'
        : 'Water-service margin may continue to decrease while reduced pumping persists',
    severity: 'warning',
    attention: hospitalRequest ? 'act' : 'review',
    confidence: {
      level: lowestConfidence(evidence),
      reasons: confidenceReasons,
    },
    entityIds: [
      scenario01EntityIds.waterStation,
      scenario01EntityIds.countyHospital,
    ],
    evidenceIds: [...new Set(evidence.map((observation) => observation.id))],
    dependencyIds: baseDependencies,
    assumptions,
    horizon: decliningHorizon(context, basis),
    mainUncertainty: restorationEstimate
      ? 'Whether the provisional grid-restoration window is achieved before local water-service margin becomes more restrictive.'
      : 'How long local water buffers and reduced pumping can maintain required service before additional contingency action is needed.',
    status: declining ? 'developing' : 'projected',
  };
}

export const scenario01WaterServiceProjectionRule: ProjectionRule = {
  id: scenario01WaterServiceProjectionRuleId,
  evaluate(context) {
    const reducedPumping = findObservation(
      context,
      SUW_REDUCED_PUMPING_OBSERVATION_ID,
    );

    if (!reducedPumping) {
      return [];
    }

    return [
      {
        projectionId: scenario01WaterServiceProjectionId,
        draft: waterServiceProjectionDraft(context, reducedPumping),
      },
    ];
  },
};
