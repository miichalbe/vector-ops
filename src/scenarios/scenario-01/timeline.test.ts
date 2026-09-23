import { describe, expect, it } from 'vitest';

import { advanceScenarioTime } from '../../core/runtime-clock';
import { processDueScenarioTimeEvents } from '../../core/runtime-events';
import {
  createInitialRuntimeState,
  type OpeningVariantId,
} from '../../core/runtime-state';
import { scenario01EntityIds } from './baseline';
import {
  scenario01DefaultRunConfig,
  scenario01InitialData,
  scenario01InitialState,
} from './scenario';
import {
  SCENARIO_01_FIRST_EVENT_TIME,
  scenario01TimeEvents,
} from './timeline';

const RECORDED_AT = '2026-09-23T10:15:00.000Z';

const openingExpectations = [
  {
    openingVariant: 'power-first',
    eventId: 'event.scenario-01.gpz.power-quality-disturbance',
    observationId:
      'observation.scenario-01.gpz.power-quality-disturbance',
    entityId: scenario01EntityIds.gridSubstation,
  },
  {
    openingVariant: 'communications-first',
    eventId: 'event.scenario-01.r4.link-degradation',
    observationId: 'observation.scenario-01.r4.packet-loss-rise',
    entityId: scenario01EntityIds.communicationsGateway,
  },
  {
    openingVariant: 'water-first',
    eventId: 'event.scenario-01.suw.controller-restart',
    observationId:
      'observation.scenario-01.suw.controller-restart',
    entityId: scenario01EntityIds.waterStation,
  },
] satisfies readonly {
  openingVariant: OpeningVariantId;
  eventId: string;
  observationId: string;
  entityId: string;
}[];

function stateForOpeningVariant(
  openingVariant: OpeningVariantId,
) {
  return createInitialRuntimeState(scenario01InitialData, {
    ...scenario01DefaultRunConfig,
    openingVariant,
  });
}

describe('Scenario 01 time-driven opening', () => {
  it('does not reveal an opening anomaly before its scenario time', () => {
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

  for (const expectation of openingExpectations) {
    it(`isolates the ${expectation.openingVariant} opening`, () => {
      const initialState = stateForOpeningVariant(
        expectation.openingVariant,
      );
      const stateAtEvent = advanceScenarioTime(
        initialState,
        SCENARIO_01_FIRST_EVENT_TIME - initialState.now,
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
      const newObservations = processedState.observations.slice(
        initialState.observations.length,
      );

      expect(processedState.events).toHaveLength(1);
      expect(processedState.events[0]).toMatchObject({
        id: expectation.eventId,
        scenarioTime: SCENARIO_01_FIRST_EVENT_TIME,
        recordedAt: RECORDED_AT,
        entityIds: [expectation.entityId],
      });
      expect(newObservations).toHaveLength(1);
      expect(newObservations[0]).toMatchObject({
        id: expectation.observationId,
        entityId: expectation.entityId,
        relatedEventId: expectation.eventId,
        observedAt: SCENARIO_01_FIRST_EVENT_TIME,
        receivedAt: SCENARIO_01_FIRST_EVENT_TIME,
      });
      expect(repeatedState).toBe(processedState);
      expect(initialState.events).toHaveLength(0);
    });
  }
});
