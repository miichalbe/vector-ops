import { describe, expect, it } from 'vitest';

import { advanceScenarioTime } from '../../core/runtime-clock';
import { processDueScenarioTimeEvents } from '../../core/runtime-events';
import { getEntityObservations } from '../../core/runtime-state';
import { scenario01EntityIds } from './baseline';
import { scenario01InitialState } from './scenario';
import {
  SCENARIO_01_FIRST_EVENT_TIME,
  scenario01TimeEvents,
} from './timeline';

const RECORDED_AT = '2026-09-23T10:15:00.000Z';

describe('Scenario 01 time-driven opening', () => {
  it('does not reveal the first anomaly before its scenario time', () => {
    const stateBeforeEvent = advanceScenarioTime(
      scenario01InitialState,
      SCENARIO_01_FIRST_EVENT_TIME - scenario01InitialState.now - 1,
    );

    const processedState = processDueScenarioTimeEvents(
      stateBeforeEvent,
      scenario01TimeEvents,
      RECORDED_AT,
    );

    expect(processedState).toBe(stateBeforeEvent);
    expect(processedState.events).toHaveLength(0);
    expect(processedState.observations).toHaveLength(
      scenario01InitialState.observations.length,
    );
  });

  it('records the event and appends its linked Observation exactly once', () => {
    const stateAtEvent = advanceScenarioTime(
      scenario01InitialState,
      SCENARIO_01_FIRST_EVENT_TIME - scenario01InitialState.now,
    );

    const processedState = processDueScenarioTimeEvents(
      stateAtEvent,
      scenario01TimeEvents,
      RECORDED_AT,
    );
    const repeatedState = processDueScenarioTimeEvents(
      processedState,
      scenario01TimeEvents,
      RECORDED_AT,
    );
    const gpzObservations = getEntityObservations(
      processedState,
      scenario01EntityIds.gridSubstation,
    );
    const disturbanceObservation = gpzObservations.find(
      (observation) =>
        observation.id ===
        'observation.scenario-01.gpz.power-quality-disturbance',
    );

    expect(processedState.events).toHaveLength(1);
    expect(processedState.events[0]).toMatchObject({
      id: 'event.scenario-01.gpz.power-quality-disturbance',
      type: 'power.quality.disturbance',
      scenarioTime: SCENARIO_01_FIRST_EVENT_TIME,
      recordedAt: RECORDED_AT,
    });
    expect(processedState.observations).toHaveLength(
      scenario01InitialState.observations.length + 1,
    );
    expect(disturbanceObservation).toMatchObject({
      entityId: scenario01EntityIds.gridSubstation,
      metric: 'power.qualityEvent',
      observedAt: SCENARIO_01_FIRST_EVENT_TIME,
      receivedAt: SCENARIO_01_FIRST_EVENT_TIME,
      relatedEventId:
        'event.scenario-01.gpz.power-quality-disturbance',
    });
    expect(repeatedState).toBe(processedState);
    expect(scenario01InitialState.events).toHaveLength(0);
  });
});
