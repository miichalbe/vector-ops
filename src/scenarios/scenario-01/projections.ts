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
  suwVisibility:
    'projection.scenario-01.suw-visibility',
} as const;

export const scenario01ProjectionRuleIds = {
  communicationsContinuity:
    'rule.scenario-01.projection.communications-continuity',
  suwVisibility:
    'rule.scenario-01.projection.suw-visibility',
} as const;

const R4_PACKET_LOSS_OBSERVATION_ID =
  'observation.scenario-01.r4.packet-loss-rise';
const R4_BACKUP_POWER_OBSERVATION_ID =
  'observation.scenario-01.r4.backup-power';
const R4_LINK_QUALITY_DEGRADED_OBSERVATION_ID =
  'observation.scenario-01.r4.link-quality-degraded';
const R4_LINK_QUALITY_POOR_OBSERVATION_IDS = [
  'observation.scenario-01.r4.link-quality-poor',
  'observation.scenario-01.r4.link-quality-poor-while-waiting',
] as const;
const R4_GENERATOR_POWER_OBSERVATION_ID =
  'observation.scenario-01.r4.generator-power';
const R4_LINK_STABILISING_OBSERVATION_ID =
  'observation.scenario-01.r4.link-stabilising';
const SUW_TELEMETRY_STALE_OBSERVATION_ID =
  'observation.scenario-01.suw.telemetry-stale';
const SUW_TELEMETRY_IMPROVING_OBSERVATION_ID =
  'observation.scenario-01.suw.telemetry-improving';

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

function lowestConfidence(
  levels: readonly ConfidenceLevel[],
): ConfidenceLevel {
  return levels.reduce<ConfidenceLevel>(lowerConfidence, 'high');
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

function findObservation(
  context: ProjectionRuleContext,
  observationId: string,
): Observation | undefined {
  return context.observations.find(
    (observation) => observation.id === observationId,
  );
}

function latestObservationFromIds(
  context: ProjectionRuleContext,
  observationIds: readonly string[],
): Observation | undefined {
  return context.observations
    .filter((observation) => observationIds.includes(observation.id))
    .reduce<Observation | undefined>(
      (latest, observation) =>
        !latest || observation.receivedAt > latest.receivedAt
          ? observation
          : latest,
      undefined,
    );
}

function communicationsHorizon(
  context: ProjectionRuleContext,
  packetLossObservation: Observation,
  backupObservation?: Observation,
  degradedLinkObservation?: Observation,
) {
  if (degradedLinkObservation) {
    return {
      earliest: degradedLinkObservation.receivedAt + 4,
      latest:
        degradedLinkObservation.receivedAt +
        10 +
        context.run.parameters.information.reportDelayMinutes,
    };
  }

  if (backupObservation) {
    return {
      earliest: backupObservation.receivedAt + 8,
      latest:
        backupObservation.receivedAt +
        16 +
        context.run.parameters.information.reportDelayMinutes,
    };
  }

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

function communicationsPostDecision2Draft(
  context: ProjectionRuleContext,
  assessment: Assessment,
  packetLossObservation: Observation,
  backupObservation?: Observation,
  degradedLinkObservation?: Observation,
): ProjectionDraft | null {
  const generatorPowerObservation = findObservation(
    context,
    R4_GENERATOR_POWER_OBSERVATION_ID,
  );
  const stabilisingLinkObservation = findObservation(
    context,
    R4_LINK_STABILISING_OBSERVATION_ID,
  );

  if (generatorPowerObservation && stabilisingLinkObservation) {
    const confidenceLevel = lowestConfidence([
      assessment.confidence.level,
      generatorPowerObservation.confidence.level,
      stabilisingLinkObservation.confidence.level,
    ]);

    return {
      title:
        'R-4 communications continuity risk is reducing after AG-400 support',
      severity: 'normal',
      attention: 'monitor',
      confidence: {
        level: confidenceLevel,
        reasons: [
          {
            type: 'intervention-observed',
            effect: 'increase',
            description:
              'AG-400 generator power is observed at R-4 and link quality is now stabilising.',
          },
          {
            type: 'dependency',
            effect: 'increase',
            description:
              'AG-400 is a registered compatible support resource for R-4.',
          },
        ],
      },
      entityIds: [
        scenario01EntityIds.communicationsGateway,
        scenario01EntityIds.waterStation,
      ],
      evidenceIds: [
        ...new Set([
          ...assessment.evidenceIds,
          packetLossObservation.id,
          ...(backupObservation ? [backupObservation.id] : []),
          ...(degradedLinkObservation ? [degradedLinkObservation.id] : []),
          generatorPowerObservation.id,
          stabilisingLinkObservation.id,
        ]),
      ],
      dependencyIds: [
        'dependency.r4.powered-by.gpz',
        'dependency.r4.supported-by.ag400',
        'dependency.suw.monitored-via.r4',
      ],
      assumptions: [
        {
          id: 'assumption.scenario-01.p01.degradation-continues',
          statement:
            'The observed R-4 packet-loss trend continues instead of stabilising.',
          status: 'invalidated',
        },
        {
          id: 'assumption.scenario-01.p01.no-intervention',
          statement:
            'No effective communications or power intervention occurs before the projected window.',
          status: 'invalidated',
        },
        {
          id: 'assumption.scenario-01.p01.backup-finite',
          statement:
            'R-4 remains dependent on finite local backup power until an intervention or grid restoration occurs.',
          status: 'invalidated',
        },
      ],
      horizon: {
        earliest: stabilisingLinkObservation.receivedAt,
        latest: stabilisingLinkObservation.receivedAt,
      },
      mainUncertainty:
        'Whether improved R-4 link quality remains stable while AG-400 support continues.',
      status: 'avoided',
    };
  }

  const poorLinkObservation = latestObservationFromIds(
    context,
    R4_LINK_QUALITY_POOR_OBSERVATION_IDS,
  );

  if (!poorLinkObservation) {
    return null;
  }

  const confidenceLevel = lowestConfidence([
    assessment.confidence.level,
    packetLossObservation.confidence.level,
    poorLinkObservation.confidence.level,
  ]);

  return {
    title:
      'R-4 communications continuity risk has increased as link quality falls to poor',
    severity: 'warning',
    attention: 'act',
    confidence: {
      level: confidenceLevel,
      reasons: [
        {
          type: 'continuing-degradation',
          effect: 'increase',
          description:
            'R-4 link quality is now directly observed as poor after the resource decision.',
        },
        {
          type: 'backup-power',
          effect: 'increase',
          description:
            'No effective R-4 power intervention has yet replaced finite backup operation.',
        },
      ],
    },
    entityIds: [
      scenario01EntityIds.communicationsGateway,
      scenario01EntityIds.waterStation,
    ],
    evidenceIds: [
      ...new Set([
        ...assessment.evidenceIds,
        packetLossObservation.id,
        ...(backupObservation ? [backupObservation.id] : []),
        ...(degradedLinkObservation ? [degradedLinkObservation.id] : []),
        poorLinkObservation.id,
      ]),
    ],
    dependencyIds: [
      'dependency.r4.powered-by.gpz',
      'dependency.suw.monitored-via.r4',
    ],
    assumptions: [
      {
        id: 'assumption.scenario-01.p01.degradation-continues',
        statement:
          'The observed R-4 packet-loss trend continues instead of stabilising.',
        status: 'confirmed',
      },
      {
        id: 'assumption.scenario-01.p01.no-intervention',
        statement:
          'No effective communications or power intervention occurs before the projected window.',
        status: 'supported',
      },
      ...(backupObservation
        ? [
            {
              id: 'assumption.scenario-01.p01.backup-finite',
              statement:
                'R-4 remains dependent on finite local backup power until an intervention or grid restoration occurs.',
              status: 'supported' as const,
            },
          ]
        : []),
    ],
    horizon: {
      earliest: poorLinkObservation.receivedAt + 2,
      latest:
        poorLinkObservation.receivedAt +
        6 +
        context.run.parameters.information.reportDelayMinutes,
    },
    mainUncertainty:
      'How long R-4 can maintain usable service after link quality has fallen to poor.',
    status: 'developing',
  };
}

function communicationsProjectionDraft(
  context: ProjectionRuleContext,
  assessment: Assessment,
  packetLossObservation: Observation,
  backupObservation?: Observation,
  degradedLinkObservation?: Observation,
): ProjectionDraft | null {
  const horizon = communicationsHorizon(
    context,
    packetLossObservation,
    backupObservation,
    degradedLinkObservation,
  );

  if (!horizon) {
    return null;
  }

  const confidenceLevel = lowestConfidence([
    assessment.confidence.level,
    packetLossObservation.confidence.level,
    ...(backupObservation
      ? [backupObservation.confidence.level]
      : []),
    ...(degradedLinkObservation
      ? [degradedLinkObservation.confidence.level]
      : []),
  ]);
  const confidenceReasons: ConfidenceFactor[] = [
    {
      type: 'assessment',
      effect: 'increase',
      description:
        'The active cross-domain Assessment correlates R-4 degradation with the infrastructure disruption.',
    },
    {
      type: 'dependency',
      effect: 'increase',
      description:
        'Registered dependencies show that R-4 supports SUW monitoring and receives normal power from GPZ Brzeziny.',
    },
  ];

  if (backupObservation) {
    confidenceReasons.push({
      type: 'backup-power',
      effect: 'increase',
      description:
        'R-4 is confirmed on finite backup power following the persistent feeder isolation.',
    });
  }

  if (degradedLinkObservation) {
    confidenceReasons.push({
      type: 'continuing-degradation',
      effect: 'increase',
      description:
        'R-4 link quality is now directly observed as degraded while the gateway remains on backup power.',
    });
  }

  if (
    packetLossObservation.quality !== 'good' ||
    confidenceLevel !== 'high'
  ) {
    confidenceReasons.push({
      type: 'evidence-quality',
      effect: 'decrease',
      description:
        degradedLinkObservation
          ? 'The degraded communications path limits confidence in the exact remaining continuity window.'
          : 'The projected window remains sensitive to delayed or lower-confidence evidence.',
    });
  }

  const evidenceIds = [
    ...new Set([
      ...assessment.evidenceIds,
      packetLossObservation.id,
      ...(backupObservation ? [backupObservation.id] : []),
      ...(degradedLinkObservation ? [degradedLinkObservation.id] : []),
    ]),
  ];

  return {
    title: degradedLinkObservation
      ? 'R-4 communications may be lost as degraded service continues on finite backup power'
      : backupObservation
        ? 'R-4 communications continuity now depends on finite backup power'
        : 'Primary R-4 communications may be lost if current degradation continues',
    severity: 'warning',
    attention: degradedLinkObservation ? 'act' : 'review',
    confidence: {
      level: confidenceLevel,
      reasons: confidenceReasons,
    },
    entityIds: [
      scenario01EntityIds.communicationsGateway,
      scenario01EntityIds.waterStation,
    ],
    evidenceIds,
    dependencyIds: [
      'dependency.r4.powered-by.gpz',
      'dependency.suw.monitored-via.r4',
    ],
    assumptions: [
      {
        id: 'assumption.scenario-01.p01.degradation-continues',
        statement:
          'The observed R-4 packet-loss trend continues instead of stabilising.',
        status: degradedLinkObservation ? 'confirmed' : 'supported',
      },
      {
        id: 'assumption.scenario-01.p01.no-intervention',
        statement:
          'No effective communications or power intervention occurs before the projected window.',
        status: 'unverified',
      },
      ...(backupObservation
        ? [
            {
              id: 'assumption.scenario-01.p01.backup-finite',
              statement:
                'R-4 remains dependent on finite local backup power until an intervention or grid restoration occurs.',
              status: 'supported' as const,
            },
          ]
        : []),
    ],
    horizon,
    mainUncertainty: degradedLinkObservation
      ? 'How long R-4 can maintain usable service on finite backup power under continued link degradation.'
      : backupObservation
        ? 'Whether R-4 link degradation stabilises before finite backup power becomes limiting.'
        : 'Whether R-4 degradation persists or stabilises before the projected window.',
    status: backupObservation ? 'developing' : 'projected',
  };
}

function suwVisibilityPostDecision2Draft(
  context: ProjectionRuleContext,
  r4LinkObservation: Observation,
  suwTelemetryObservation: Observation,
  backupObservation?: Observation,
): ProjectionDraft | null {
  const stabilisingLinkObservation = findObservation(
    context,
    R4_LINK_STABILISING_OBSERVATION_ID,
  );
  const improvingTelemetryObservation = findObservation(
    context,
    SUW_TELEMETRY_IMPROVING_OBSERVATION_ID,
  );

  if (stabilisingLinkObservation && improvingTelemetryObservation) {
    const confidenceLevel = lowestConfidence([
      stabilisingLinkObservation.confidence.level,
      improvingTelemetryObservation.confidence.level,
    ]);

    return {
      title:
        'Remote SUW visibility is recovering after R-4 generator support',
      severity: 'normal',
      attention: 'monitor',
      confidence: {
        level: confidenceLevel,
        reasons: [
          {
            type: 'communications-recovery',
            effect: 'increase',
            description:
              'R-4 link quality is stabilising and SUW telemetry freshness has improved from stale to delayed.',
          },
          {
            type: 'state-separation',
            effect: 'neutral',
            description:
              'Improved remote visibility does not by itself change the local physical pumping state.',
          },
        ],
      },
      entityIds: [
        scenario01EntityIds.waterStation,
        scenario01EntityIds.communicationsGateway,
      ],
      evidenceIds: [
        ...new Set([
          ...(backupObservation ? [backupObservation.id] : []),
          r4LinkObservation.id,
          suwTelemetryObservation.id,
          stabilisingLinkObservation.id,
          improvingTelemetryObservation.id,
        ]),
      ],
      dependencyIds: [
        'dependency.suw.monitored-via.r4',
        'dependency.r4.supported-by.ag400',
      ],
      assumptions: [
        {
          id: 'assumption.scenario-01.p02.r4-remains-path',
          statement:
            'R-4 remains the operational path for remote SUW telemetry.',
          status: 'confirmed',
        },
        {
          id: 'assumption.scenario-01.p02.no-effective-recovery',
          statement:
            'No usable telemetry recovery occurs before remote visibility is lost.',
          status: 'invalidated',
        },
      ],
      horizon: {
        earliest: improvingTelemetryObservation.receivedAt,
        latest: improvingTelemetryObservation.receivedAt,
      },
      mainUncertainty:
        'Whether the recovering R-4 path can sustain sufficiently current SUW telemetry.',
      status: 'avoided',
    };
  }

  const poorLinkObservation = latestObservationFromIds(
    context,
    R4_LINK_QUALITY_POOR_OBSERVATION_IDS,
  );

  if (!poorLinkObservation) {
    return null;
  }

  const confidenceLevel = lowestConfidence([
    poorLinkObservation.confidence.level,
    suwTelemetryObservation.confidence.level,
  ]);

  return {
    title:
      'Remote SUW monitoring visibility is increasingly at risk as R-4 link quality falls to poor',
    severity: 'warning',
    attention: 'act',
    confidence: {
      level: confidenceLevel,
      reasons: [
        {
          type: 'communications-path',
          effect: 'increase',
          description:
            'R-4 link quality has fallen from degraded to poor while SUW telemetry remains stale.',
        },
        {
          type: 'state-separation',
          effect: 'neutral',
          description:
            'Worsening visibility still does not establish that local SUW pumping has stopped.',
        },
      ],
    },
    entityIds: [
      scenario01EntityIds.waterStation,
      scenario01EntityIds.communicationsGateway,
    ],
    evidenceIds: [
      ...new Set([
        ...(backupObservation ? [backupObservation.id] : []),
        r4LinkObservation.id,
        suwTelemetryObservation.id,
        poorLinkObservation.id,
      ]),
    ],
    dependencyIds: ['dependency.suw.monitored-via.r4'],
    assumptions: [
      {
        id: 'assumption.scenario-01.p02.r4-remains-path',
        statement:
          'R-4 remains the operational path for remote SUW telemetry.',
        status: 'supported',
      },
      {
        id: 'assumption.scenario-01.p02.no-alternative-path',
        statement:
          'No alternative telemetry path restores current SUW visibility before the projected window.',
        status: 'unverified',
      },
    ],
    horizon: {
      earliest: poorLinkObservation.receivedAt + 1,
      latest:
        poorLinkObservation.receivedAt +
        5 +
        context.run.parameters.information.reportDelayMinutes,
    },
    mainUncertainty:
      'Whether manual or fallback reporting can preserve enough current SUW information if the R-4 path deteriorates further.',
    status: 'developing',
  };
}

function suwVisibilityProjectionDraft(
  context: ProjectionRuleContext,
  r4LinkObservation: Observation,
  suwTelemetryObservation: Observation,
  backupObservation?: Observation,
): ProjectionDraft {
  const confidenceLevel = lowestConfidence([
    r4LinkObservation.confidence.level,
    suwTelemetryObservation.confidence.level,
    ...(backupObservation
      ? [backupObservation.confidence.level]
      : []),
  ]);
  const evidenceIds = [
    ...(backupObservation ? [backupObservation.id] : []),
    r4LinkObservation.id,
    suwTelemetryObservation.id,
  ];

  return {
    title:
      'Remote SUW monitoring visibility may become unavailable before local pumping stops',
    severity: 'warning',
    attention: 'review',
    confidence: {
      level: confidenceLevel,
      reasons: [
        {
          type: 'communications-path',
          effect: 'increase',
          description:
            'R-4 link quality is degraded and SUW telemetry using that path is now stale.',
        },
        {
          type: 'state-separation',
          effect: 'neutral',
          description:
            'Stale remote telemetry reduces visibility but does not by itself establish that local pumping has stopped.',
        },
      ],
    },
    entityIds: [
      scenario01EntityIds.waterStation,
      scenario01EntityIds.communicationsGateway,
    ],
    evidenceIds,
    dependencyIds: ['dependency.suw.monitored-via.r4'],
    assumptions: [
      {
        id: 'assumption.scenario-01.p02.r4-remains-path',
        statement:
          'R-4 remains the operational path for remote SUW telemetry.',
        status: 'supported',
      },
      {
        id: 'assumption.scenario-01.p02.no-alternative-path',
        statement:
          'No alternative telemetry path restores current SUW visibility before the projected window.',
        status: 'unverified',
      },
    ],
    horizon: {
      earliest: suwTelemetryObservation.receivedAt + 4,
      latest:
        suwTelemetryObservation.receivedAt +
        10 +
        context.run.parameters.information.reportDelayMinutes,
    },
    mainUncertainty:
      'Whether an alternative reporting path restores current SUW information before remote visibility is lost.',
    status: 'developing',
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
      const packetLossObservation = findObservation(
        context,
        R4_PACKET_LOSS_OBSERVATION_ID,
      );

      if (!assessment || !packetLossObservation) {
        return [];
      }

      const backupObservation = findObservation(
        context,
        R4_BACKUP_POWER_OBSERVATION_ID,
      );
      const degradedLinkObservation = findObservation(
        context,
        R4_LINK_QUALITY_DEGRADED_OBSERVATION_ID,
      );
      const draft =
        communicationsPostDecision2Draft(
          context,
          assessment,
          packetLossObservation,
          backupObservation,
          degradedLinkObservation,
        ) ??
        communicationsProjectionDraft(
          context,
          assessment,
          packetLossObservation,
          backupObservation,
          degradedLinkObservation,
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
  {
    id: scenario01ProjectionRuleIds.suwVisibility,
    evaluate(context) {
      const r4LinkObservation = findObservation(
        context,
        R4_LINK_QUALITY_DEGRADED_OBSERVATION_ID,
      );
      const suwTelemetryObservation = findObservation(
        context,
        SUW_TELEMETRY_STALE_OBSERVATION_ID,
      );

      if (!r4LinkObservation || !suwTelemetryObservation) {
        return [];
      }

      const backupObservation = findObservation(
        context,
        R4_BACKUP_POWER_OBSERVATION_ID,
      );
      const draft =
        suwVisibilityPostDecision2Draft(
          context,
          r4LinkObservation,
          suwTelemetryObservation,
          backupObservation,
        ) ??
        suwVisibilityProjectionDraft(
          context,
          r4LinkObservation,
          suwTelemetryObservation,
          backupObservation,
        );

      return [
        {
          projectionId: scenario01ProjectionIds.suwVisibility,
          draft,
        },
      ];
    },
  },
];
