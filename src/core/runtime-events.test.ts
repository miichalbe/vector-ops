import { describe, expect, it } from 'vitest';

import {
  processDueScenarioTimeEvents,
  type ScenarioTimeEventDefinition,
} from './runtime-events';
import type {
  ScenarioRunStatus,
  ScenarioRuntimeState,
} from './runtime-state';
import { scenario01InitialState } from '../scenarios/scenario-01/scenario';

const RECORDED_AT = '2026-09-23T10:00:00.000Z';

function stateAt(
  now: number,
  status: ScenarioRunStatus = 'running',
): ScenarioRuntimeState {
  return {
    ...scenario01InitialState,
    now,
    status,
    events: [],
  };
}

function eventDefinition(
  id: string,
  at: number,
): ScenarioTimeEventDefinition<{ sequence: number }> {
  return {
    id,
    trigger: {
      type: 'scenarioTime',
      at,
    },
    event: {
      type: 'test.event.occurred',
      producer: {
        type: 'scenario',
        id: 'scenario-01',
      },
      entityIds: ['entity.test'],
      payload: {
        sequence: at,
      },
    },
  };
}

describe('scenario time event processing', () => {
  it('processes due events in deterministic time and id order', () => {
    const initialTime = scenario01InitialState.now;
    const initialState = stateAt(initialTime + 5);
    const definitions = [
      eventDefinition('event.future', initialTime + 10),
      eventDefinition('event.due.b', initialTime + 5),
      eventDefinition('event.due.a', initialTime + 5),
      eventDefinition('event.earlier', initialTime + 2),
    ];

    const processedState = processDueScenarioTimeEvents(
      initialState,
      definitions,
      RECORDED_AT,
    );

    expect(processedState).not.toBe(initialState);
    expect(processedState.events.map((event) => event.id)).toEqual([
      'event.earlier',
      'event.due.a',
      'event.due.b',
    ]);
    expect(processedState.events.map((event) => event.scenarioTime)).toEqual([
      initialTime + 2,
      initialTime + 5,
      initialTime + 5,
    ]);
    expect(processedState.events.every(
      (event) => event.recordedAt === RECORDED_AT,
    )).toBe(true);
    expect(initialState.events).toHaveLength(0);
    expect(processedState.entitiesById).toBe(initialState.entitiesById);
  });

  it('keeps the existing state when no events are due', () => {
    const initialTime = scenario01InitialState.now;
    const initialState = stateAt(initialTime);

    expect(
      processDueScenarioTimeEvents(
        initialState,
        [eventDefinition('event.future', initialTime + 1)],
        RECORDED_AT,
      ),
    ).toBe(initialState);
  });

  it('processes each event at most once', () => {
    const initialTime = scenario01InitialState.now;
    const definition = eventDefinition('event.once', initialTime);
    const firstState = processDueScenarioTimeEvents(
      stateAt(initialTime),
      [definition],
      RECORDED_AT,
    );
    const laterState = {
      ...firstState,
      now: initialTime + 5,
    };

    const secondState = processDueScenarioTimeEvents(
      laterState,
      [definition],
      RECORDED_AT,
    );

    expect(secondState).toBe(laterState);
    expect(secondState.events).toHaveLength(1);
  });

  it('processes due events while the scenario is resolving', () => {
    const initialTime = scenario01InitialState.now;
    const initialState = stateAt(initialTime, 'resolving');

    expect(
      processDueScenarioTimeEvents(
        initialState,
        [eventDefinition('event.resolving', initialTime)],
        RECORDED_AT,
      ).events.map((event) => event.id),
    ).toEqual(['event.resolving']);
  });

  for (const status of [
    'briefing',
    'awaitingDecision',
    'completed',
  ] as const) {
    it(`keeps events paused while the scenario status is ${status}`, () => {
      const initialTime = scenario01InitialState.now;
      const initialState = stateAt(initialTime, status);

      expect(
        processDueScenarioTimeEvents(
          initialState,
          [eventDefinition('event.paused', initialTime)],
          RECORDED_AT,
        ),
      ).toBe(initialState);
    });
  }

  it('rejects duplicate event definitions', () => {
    const initialTime = scenario01InitialState.now;
    const duplicate = eventDefinition('event.duplicate', initialTime);

    expect(() =>
      processDueScenarioTimeEvents(
        stateAt(initialTime),
        [duplicate, duplicate],
        RECORDED_AT,
      ),
    ).toThrow('Duplicate scenario event id: event.duplicate');
  });

  for (const invalidScenarioTime of [
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ]) {
    it(`rejects an invalid trigger time: ${invalidScenarioTime}`, () => {
      expect(() =>
        processDueScenarioTimeEvents(
          stateAt(scenario01InitialState.now),
          [eventDefinition('event.invalid-time', invalidScenarioTime)],
          RECORDED_AT,
        ),
      ).toThrow(
        'Scenario event event.invalid-time must use a non-negative integer scenario time.',
      );
    });
  }

  it('requires an explicit event recording time', () => {
    expect(() =>
      processDueScenarioTimeEvents(
        stateAt(scenario01InitialState.now),
        [],
        '   ',
      ),
    ).toThrow('Event recording time must not be empty.');
  });
});
