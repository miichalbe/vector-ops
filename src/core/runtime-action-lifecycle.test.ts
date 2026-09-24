import { describe, expect, it } from 'vitest';

import type { Action } from './contracts';
import {
  processDueScenarioTimeEvents,
  type ScenarioTimeEventDefinition,
} from './runtime-events';
import type { ScenarioRuntimeState } from './runtime-state';
import { scenario01InitialState } from '../scenarios/scenario-01/scenario';

const RECORDED_AT = '2026-09-24T14:45:00.000Z';

function selectedAction(): Action {
  return {
    id: 'action.test.external-recommendation',
    type: 'test-recommendation',
    title: 'Test external recommendation',
    scope: {},
    authority: 'operator',
    lifecycle: 'selected',
    expectedEffects: [],
    displacedRisks: [],
    reversible: true,
  };
}

function stateWithSelectedAction(now: number): ScenarioRuntimeState {
  return {
    ...scenario01InitialState,
    now,
    status: 'running',
    actions: [selectedAction()],
    events: [],
  };
}

function lifecycleEvent(
  id: string,
  at: number,
  lifecycle: Action['lifecycle'],
): ScenarioTimeEventDefinition {
  return {
    id,
    trigger: { type: 'scenarioTime', at },
    event: {
      type: `test.action.${lifecycle}`,
      producer: { type: 'external', id: 'test-external-operator' },
      payload: { lifecycle },
    },
    effects: [
      {
        type: 'updateActionLifecycle',
        actionId: 'action.test.external-recommendation',
        lifecycle,
      },
    ],
  };
}

describe('scenario event Action lifecycle effects', () => {
  it('applies requested, accepted and completed transitions in event order', () => {
    const start = scenario01InitialState.now;
    const state = stateWithSelectedAction(start + 6);
    const definitions = [
      lifecycleEvent('event.action.requested', start + 1, 'requested'),
      lifecycleEvent('event.action.accepted', start + 3, 'accepted'),
      lifecycleEvent('event.action.completed', start + 6, 'completed'),
    ];

    const processed = processDueScenarioTimeEvents(
      state,
      definitions,
      RECORDED_AT,
    );

    expect(processed.actions).toHaveLength(1);
    expect(processed.actions[0]?.lifecycle).toBe('completed');
    expect(processed.events.map((event) => event.id)).toEqual([
      'event.action.requested',
      'event.action.accepted',
      'event.action.completed',
    ]);
    expect(state.actions[0]?.lifecycle).toBe('selected');
  });

  it('allows a local selected Action to complete without an external request', () => {
    const now = scenario01InitialState.now + 2;
    const processed = processDueScenarioTimeEvents(
      stateWithSelectedAction(now),
      [lifecycleEvent('event.action.local-complete', now, 'completed')],
      RECORDED_AT,
    );

    expect(processed.actions[0]?.lifecycle).toBe('completed');
  });

  it('rejects lifecycle effects for an unknown Action', () => {
    const now = scenario01InitialState.now;
    const definition: ScenarioTimeEventDefinition = {
      id: 'event.action.unknown',
      trigger: { type: 'scenarioTime', at: now },
      event: {
        type: 'test.action.requested',
        producer: { type: 'external', id: 'test-external-operator' },
        payload: {},
      },
      effects: [
        {
          type: 'updateActionLifecycle',
          actionId: 'action.unknown',
          lifecycle: 'requested',
        },
      ],
    };

    expect(() =>
      processDueScenarioTimeEvents(
        stateWithSelectedAction(now),
        [definition],
        RECORDED_AT,
      ),
    ).toThrow(
      'Scenario event event.action.unknown references unknown action: action.unknown',
    );
  });

  it('rejects invalid lifecycle transitions', () => {
    const now = scenario01InitialState.now;

    expect(() =>
      processDueScenarioTimeEvents(
        stateWithSelectedAction(now),
        [lifecycleEvent('event.action.invalid', now, 'accepted')],
        RECORDED_AT,
      ),
    ).toThrow(
      'Invalid action lifecycle transition for action.test.external-recommendation: selected -> accepted',
    );
  });
});
