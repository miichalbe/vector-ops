import type { ScenarioTime } from '../../core/contracts';
import type { ScenarioTimeEventDefinition } from '../../core/runtime-events';
import { scenario01EntityIds } from './baseline';
import { SCENARIO_01_START_TIME } from './baseline-observations';

export const SCENARIO_01_FIRST_EVENT_TIME: ScenarioTime =
  SCENARIO_01_START_TIME + 4;

const powerQualityDisturbanceEventId =
  'event.scenario-01.gpz.power-quality-disturbance';
const communicationsDegradationEventId =
  'event.scenario-01.r4.link-degradation';
const waterControllerRestartEventId =
  'event.scenario-01.suw.controller-restart';

export const scenario01TimeEvents = [
  {
    id: powerQualityDisturbanceEventId,
    openingVariants: ['power-first'],
    trigger: {
      type: 'scenarioTime',
      at: SCENARIO_01_FIRST_EVENT_TIME,
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
          observedAt: SCENARIO_01_FIRST_EVENT_TIME,
          receivedAt: SCENARIO_01_FIRST_EVENT_TIME,
          source: {
            type: 'system',
            id: 'gpz-operator-channel',
          },
          quality: 'good',
          confidence: {
            level: 'high',
            reasons: [
              {
                type: 'source',
                effect: 'increase',
                description:
                  'Power-quality event confirmed through the independent GPZ operator channel.',
              },
            ],
          },
          classification: 'fact',
          relatedEventId: powerQualityDisturbanceEventId,
        },
      },
    ],
  },
  {
    id: communicationsDegradationEventId,
    openingVariants: ['communications-first'],
    trigger: {
      type: 'scenarioTime',
      at: SCENARIO_01_FIRST_EVENT_TIME,
    },
    event: {
      type: 'communications.link.degraded',
      producer: {
        type: 'scenario',
        id: 'scenario-01',
      },
      entityIds: [scenario01EntityIds.communicationsGateway],
      payload: {
        packetLossPercentage: 2.8,
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
          value: 2.8,
          unit: '%',
          observedAt: SCENARIO_01_FIRST_EVENT_TIME,
          receivedAt: SCENARIO_01_FIRST_EVENT_TIME,
          source: {
            type: 'telemetry',
            id: 'r4-telemetry',
          },
          quality: 'good',
          confidence: {
            level: 'high',
            reasons: [
              {
                type: 'source',
                effect: 'increase',
                description:
                  'Packet-loss increase received from the registered R-4 telemetry source.',
              },
            ],
          },
          classification: 'fact',
          relatedEventId: communicationsDegradationEventId,
        },
      },
    ],
  },
  {
    id: waterControllerRestartEventId,
    openingVariants: ['water-first'],
    trigger: {
      type: 'scenarioTime',
      at: SCENARIO_01_FIRST_EVENT_TIME,
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
      },
    },
    effects: [
      {
        type: 'appendObservation',
        observation: {
          id: 'observation.scenario-01.suw.controller-restart',
          entityId: scenario01EntityIds.waterStation,
          metric: 'water.controllerState',
          value: 'restarted',
          observedAt: SCENARIO_01_FIRST_EVENT_TIME,
          receivedAt: SCENARIO_01_FIRST_EVENT_TIME,
          source: {
            type: 'telemetry',
            id: 'suw-telemetry-via-r4',
          },
          quality: 'good',
          confidence: {
            level: 'high',
            reasons: [
              {
                type: 'source',
                effect: 'increase',
                description:
                  'Controller restart received from the registered SUW telemetry source.',
              },
            ],
          },
          classification: 'fact',
          relatedEventId: waterControllerRestartEventId,
        },
      },
    ],
  },
] satisfies readonly ScenarioTimeEventDefinition[];
