import { describe, expect, it } from 'vitest';

import { resolveScenarioRunConfig } from '../../core/run-config';
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
  scenario01TimeEvents,
} from './scenario';
import {
  SCENARIO_01_FIRST_EVENT_TIME,
  createScenario01TimeEvents,
} from './timeline';

const RECORDED_AT = '2026-09-23T10:15:00.000Z';

const openingExpectations = [
  {
    openingVariant: 'power-first',
    eventIds: [
      'event.scenario-01.gpz.power-quality-disturbance',
      'event.scenario-01.suw.controller-restart',
      'event.scenario-01.r4.link-degradation',
    ],
    entityIds: [
      scenario01EntityIds.gridSubstation,
      scenario01EntityIds.waterStation,
      scenario01EntityIds.communicationsGateway,
    ],
  },
  {
    openingVariant: 'communications-first',
    eventIds: [
      'event.scenario-01.r4.link-degradation',
      'event.scenario-01.suw.telemetry-delayed',
      'event.scenario-01.gpz.power-quality-disturbance',
    ],
    entityIds: [
      scenario01EntityIds.communicationsGateway,
      scenario01EntityIds.waterStation,
      scenario01EntityIds.gridSubstation,
    ],
  },
  {
    openingVariant: 'water-first',
    eventIds: [
      'event.scenario-01.suw.controller-restart',
      'event.scenario-01.gpz.power-quality-disturbance',
      'event.scenario-01.r4.link-degradation',
    ],
    entityIds: [
      scenario01EntityIds.waterStation,
      scenario01EntityIds.gridSubstation,
      scenario01EntityIds.communicationsGateway,
    ],
  },
] satisfies readonly {
  openingVariant: OpeningVariantId;
  eventIds: readonly string[];
  entityIds: readonly string[];
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
    it(`preserves the ${expectation.openingVariant} evidence order`, () => {
      const initialState = stateForOpeningVariant(
        expectation.openingVariant,
      );
      const definitions = createScenario01TimeEvents(initialState.run);
      const finalOpeningTime =
        definitions[definitions.length - 1]?.trigger.at;

      expect(finalOpeningTime).toBeDefined();

      const stateAfterOpening = advanceScenarioTime(
        initialState,
        (finalOpeningTime as number) - initialState.now,
      );
      const processedState = processDueScenarioTimeEvents(
        stateAfterOpening,
        definitions,
        RECORDED_AT,
      );
      const repeatedState = processDueScenarioTimeEvents(
        processedState,
        definitions,
        RECORDED_AT,
      );
      const newObservations = processedState.observations.slice(
        initialState.observations.length,
      );

      expect(processedState.events.map((event) => event.id)).toEqual(
        expectation.eventIds,
      );
      expect(
        processedState.events.map((event) => event.entityIds?.[0]),
      ).toEqual(expectation.entityIds);
      expect(newObservations).toHaveLength(3);
      expect(
        newObservations.map((observation) => observation.entityId),
      ).toEqual(expectation.entityIds);
      expect(
        definitions.map((definition) => definition.trigger.at),
      ).toEqual(
        [...definitions]
          .map((definition) => definition.trigger.at)
          .sort((left, right) => left - right),
      );
      expect(repeatedState).toBe(processedState);
      expect(initialState.events).toHaveLength(0);
    });
  }

  it('applies the default low-confidence modifier to later evidence', () => {
    const definitions = scenario01TimeEvents;
    const observationEffects = definitions.map(
      (definition) => definition.effects?.[0]?.observation,
    );

    expect(
      definitions.map((definition) => definition.trigger.at),
    ).toEqual([
      SCENARIO_01_FIRST_EVENT_TIME,
      SCENARIO_01_FIRST_EVENT_TIME + 3,
      SCENARIO_01_FIRST_EVENT_TIME + 5,
    ]);
    const delayedObservation = observationEffects[1];

    expect(observationEffects[0]?.confidence.level).toBe('high');
    expect(delayedObservation).toBeDefined();
    expect(observationEffects[2]?.confidence.level).toBe('medium');

    if (!delayedObservation) {
      throw new Error('Expected the second opening observation');
    }

    expect(
      delayedObservation.receivedAt - delayedObservation.observedAt,
    ).toBe(2);
  });

  it('applies communications fragility without changing event order', () => {
    const run = resolveScenarioRunConfig({
      scenarioId: scenario01InitialData.id,
      scenarioVersion: scenario01InitialData.version,
      seed: 'communications-profile-reference',
      openingVariant: 'power-first',
      dominantProfile: 'communications-fragile',
      secondaryModifier: 'access-constrained',
    });
    const definitions = createScenario01TimeEvents(run);
    const communicationsEvent = definitions.find(
      (definition) =>
        definition.id ===
        'event.scenario-01.r4.link-degradation',
    );
    const packetLossObservation =
      communicationsEvent?.effects?.[0]?.observation;

    expect(definitions.map((definition) => definition.id)).toEqual(
      openingExpectations[0]?.eventIds,
    );
    expect(communicationsEvent?.event.payload).toMatchObject({
      packetLossPercentage: 4.2,
    });
    expect(packetLossObservation?.value).toBe(4.2);
    expect(communicationsEvent?.trigger.at).toBeGreaterThan(
      definitions[1]?.trigger.at ?? 0,
    );
  });
});
