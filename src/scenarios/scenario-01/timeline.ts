import type { ScenarioTime } from '../../core/contracts';
import type { ScenarioTimeEventDefinition } from '../../core/runtime-events';
import { scenario01EntityIds } from './baseline';
import { SCENARIO_01_START_TIME } from './baseline-observations';

export const SCENARIO_01_FIRST_EVENT_TIME: ScenarioTime =
  SCENARIO_01_START_TIME + 4;

const powerQualityDisturbanceEventId =
  'event.scenario-01.gpz.power-quality-disturbance';

export const scenario01TimeEvents = [
  {
    id: powerQualityDisturbanceEventId,
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
] satisfies readonly ScenarioTimeEventDefinition[];
