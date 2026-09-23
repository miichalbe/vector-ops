import type {
  ConfidenceLevel,
  ObservationQuality,
  ScenarioTime,
} from '../../core/contracts';
import type { ScenarioTimeEventDefinition } from '../../core/runtime-events';
import type {
  OpeningVariantId,
  ScenarioRunConfig,
} from '../../core/runtime-state';
import { scenario01EntityIds } from './baseline';
import { SCENARIO_01_START_TIME } from './baseline-observations';

export const SCENARIO_01_FIRST_EVENT_TIME: ScenarioTime =
  SCENARIO_01_START_TIME + 4;

type OpeningAnomaly =
  | 'power'
  | 'communications'
  | 'water-controller'
  | 'water-telemetry';

const openingOrders = {
  'power-first': [
    'power',
    'water-controller',
    'communications',
  ],
  'communications-first': [
    'communications',
    'water-telemetry',
    'power',
  ],
  'water-first': [
    'water-controller',
    'power',
    'communications',
  ],
} as const satisfies Record<
  OpeningVariantId,
  readonly OpeningAnomaly[]
>;

interface EvidencePresentation {
  observedAt: ScenarioTime;
  quality: ObservationQuality;
  confidenceLevel: ConfidenceLevel;
  confidenceReason: string;
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function evidencePresentation(
  run: ScenarioRunConfig,
  position: number,
  receivedAt: ScenarioTime,
  forceDegraded = false,
): EvidencePresentation {
  const information = run.parameters.information;
  const delay =
    position === 0 ? 0 : information.reportDelayMinutes;

  let confidenceLevel: ConfidenceLevel = 'high';

  if (position > 0 && information.confidencePenalty === 1) {
    confidenceLevel = 'medium';
  }

  if (position > 0 && information.confidencePenalty === 2) {
    confidenceLevel = position === 1 ? 'medium' : 'low';
  }

  if (forceDegraded && confidenceLevel === 'high') {
    confidenceLevel = 'medium';
  }

  return {
    observedAt: receivedAt - delay,
    quality: forceDegraded || delay > 0 ? 'degraded' : 'good',
    confidenceLevel,
    confidenceReason:
      delay > 0
        ? `Evidence received ${delay} scenario minutes after observation.`
        : 'Evidence received from the registered operational source.',
  };
}

function createPowerEvent(
  run: ScenarioRunConfig,
  position: number,
  at: ScenarioTime,
): ScenarioTimeEventDefinition {
  const eventId =
    'event.scenario-01.gpz.power-quality-disturbance';
  const evidence = evidencePresentation(run, position, at);

  return {
    id: eventId,
    openingVariants: [run.openingVariant],
    trigger: {
      type: 'scenarioTime',
      at,
    },
    event: {
      type: 'power.quality.disturbance',
      producer: {
        type: 'scenario',
        id: 'scenario-01',
      },
      entityIds: [scenario01EntityIds.gridSubstation],
      payload: {
        feederId: 'F-12',
        disturbanceType: 'voltage-dip',
        durationSeconds: 18,
        clearedAutomatically: true,
      },
    },
    effects: [
      {
        type: 'appendObservation',
        observation: {
          id: 'observation.scenario-01.gpz.power-quality-disturbance',
          entityId: scenario01EntityIds.gridSubstation,
          metric: 'power.qualityEvent',
          value: {
            feederId: 'F-12',
            type: 'voltage-dip',
            durationSeconds: 18,
            state: 'cleared',
          },
          observedAt: evidence.observedAt,
          receivedAt: at,
          source: {
            type: 'system',
            id: 'gpz-operator-channel',
          },
          quality: evidence.quality,
          confidence: {
            level: evidence.confidenceLevel,
            reasons: [
              {
                type: 'source',
                effect: 'increase',
                description: evidence.confidenceReason,
              },
            ],
          },
          classification: 'fact',
          relatedEventId: eventId,
        },
      },
    ],
  };
}

function createCommunicationsEvent(
  run: ScenarioRunConfig,
  position: number,
  at: ScenarioTime,
): ScenarioTimeEventDefinition {
  const eventId = 'event.scenario-01.r4.link-degradation';
  const evidence = evidencePresentation(run, position, at);
  const packetLossPercentage = roundToOneDecimal(
    2.8 *
      run.parameters.communications.linkDegradationMultiplier,
  );

  return {
    id: eventId,
    openingVariants: [run.openingVariant],
    trigger: {
      type: 'scenarioTime',
      at,
    },
    event: {
      type: 'communications.link.degraded',
      producer: {
        type: 'scenario',
        id: 'scenario-01',
      },
      entityIds: [scenario01EntityIds.communicationsGateway],
      payload: {
        packetLossPercentage,
        latencyTrend: 'rising',
      },
    },
    effects: [
      {
        type: 'appendObservation',
        observation: {
          id: 'observation.scenario-01.r4.packet-loss-rise',
          entityId: scenario01EntityIds.communicationsGateway,
          metric: 'communications.packetLoss',
          value: packetLossPercentage,
          unit: '%',
          observedAt: evidence.observedAt,
          receivedAt: at,
          source: {
            type: 'telemetry',
            id: 'r4-telemetry',
          },
          quality: evidence.quality,
          confidence: {
            level: evidence.confidenceLevel,
            reasons: [
              {
                type: 'source',
                effect: 'increase',
                description: evidence.confidenceReason,
              },
            ],
          },
          classification: 'fact',
          relatedEventId: eventId,
        },
      },
    ],
  };
}

function createWaterControllerEvent(
  run: ScenarioRunConfig,
  position: number,
  at: ScenarioTime,
): ScenarioTimeEventDefinition {
  const eventId = 'event.scenario-01.suw.controller-restart';
  const evidence = evidencePresentation(run, position, at);
  const outputPressureBar = roundToOneDecimal(
    4.2 * run.parameters.resources.serviceMarginMultiplier,
  );

  return {
    id: eventId,
    openingVariants: [run.openingVariant],
    trigger: {
      type: 'scenarioTime',
      at,
    },
    event: {
      type: 'water.controller.restarted',
      producer: {
        type: 'scenario',
        id: 'scenario-01',
      },
      entityIds: [scenario01EntityIds.waterStation],
      payload: {
        controllerId: 'suw-main-controller',
        restartCount: 1,
        recoveredAutomatically: true,
        outputPressureBar,
      },
    },
    effects: [
      {
        type: 'appendObservation',
        observation: {
          id: 'observation.scenario-01.suw.controller-restart',
          entityId: scenario01EntityIds.waterStation,
          metric: 'water.controllerState',
          value: {
            state: 'restarted',
            outputPressureBar,
          },
          observedAt: evidence.observedAt,
          receivedAt: at,
          source: {
            type: 'telemetry',
            id: 'suw-telemetry-via-r4',
          },
          quality: evidence.quality,
          confidence: {
            level: evidence.confidenceLevel,
            reasons: [
              {
                type: 'source',
                effect: 'increase',
                description: evidence.confidenceReason,
              },
            ],
          },
          classification: 'fact',
          relatedEventId: eventId,
        },
      },
    ],
  };
}

function createWaterTelemetryEvent(
  run: ScenarioRunConfig,
  position: number,
  at: ScenarioTime,
): ScenarioTimeEventDefinition {
  const eventId = 'event.scenario-01.suw.telemetry-delayed';
  const evidence = evidencePresentation(
    run,
    position,
    at,
    true,
  );

  return {
    id: eventId,
    openingVariants: [run.openingVariant],
    trigger: {
      type: 'scenarioTime',
      at,
    },
    event: {
      type: 'water.telemetry.delayed',
      producer: {
        type: 'scenario',
        id: 'scenario-01',
      },
      entityIds: [scenario01EntityIds.waterStation],
      payload: {
        delayMinutes: Math.max(
          1,
          run.parameters.information.reportDelayMinutes,
        ),
        deliveryPattern: 'irregular',
      },
    },
    effects: [
      {
        type: 'appendObservation',
        observation: {
          id: 'observation.scenario-01.suw.telemetry-delay',
          entityId: scenario01EntityIds.waterStation,
          metric: 'water.telemetryFreshness',
          value: 'delayed',
          observedAt: evidence.observedAt,
          receivedAt: at,
          source: {
            type: 'telemetry',
            id: 'suw-telemetry-via-r4',
          },
          quality: 'degraded',
          confidence: {
            level: evidence.confidenceLevel,
            reasons: [
              {
                type: 'source',
                effect: 'decrease',
                description:
                  'SUW telemetry delivery is irregular and delayed.',
              },
            ],
          },
          classification: 'fact',
          relatedEventId: eventId,
        },
      },
    ],
  };
}

function createOpeningEvent(
  anomaly: OpeningAnomaly,
  run: ScenarioRunConfig,
  position: number,
  at: ScenarioTime,
): ScenarioTimeEventDefinition {
  switch (anomaly) {
    case 'power':
      return createPowerEvent(run, position, at);
    case 'communications':
      return createCommunicationsEvent(run, position, at);
    case 'water-controller':
      return createWaterControllerEvent(run, position, at);
    case 'water-telemetry':
      return createWaterTelemetryEvent(run, position, at);
    default: {
      const unsupportedAnomaly: never = anomaly;
      throw new Error(
        `Unsupported opening anomaly: ${unsupportedAnomaly}`,
      );
    }
  }
}

export function createScenario01TimeEvents(
  run: ScenarioRunConfig,
): ScenarioTimeEventDefinition[] {
  const order = openingOrders[run.openingVariant];
  let previousTime = SCENARIO_01_FIRST_EVENT_TIME - 1;

  return order.map((anomaly, position) => {
    let at: ScenarioTime;

    if (position === 0) {
      at = SCENARIO_01_FIRST_EVENT_TIME;
    } else {
      const delay =
        position === 1
          ? run.parameters.opening.secondObservationDelayMinutes
          : run.parameters.opening.thirdObservationDelayMinutes;
      at = previousTime + delay;
    }

    if (anomaly === 'communications' && position > 0) {
      at = Math.max(
        previousTime + 1,
        at -
          run.parameters.communications.degradationLeadMinutes,
      );
    }

    const event = createOpeningEvent(anomaly, run, position, at);
    previousTime = at;

    return event;
  });
}
