import { describe, expect, it } from 'vitest';

import {
  evaluateCompletionRules,
  type CompletionRuleDefinition,
} from './runtime-completion';
import { advanceScenarioTime } from './runtime-clock';
import { scenario01InitialState } from '../scenarios/scenario-01/scenario';

const RECORDED_AT = '2026-09-24T16:50:00.000Z';

function completionRule(
  id: string,
  result: boolean,
): CompletionRuleDefinition {
  return {
    id,
    evaluate() {
      return result;
    },
  };
}

describe('runtime completion rules', () => {
  it('keeps the runtime running when no completion rule matches', () => {
    const state = {
      ...scenario01InitialState,
      status: 'running' as const,
    };

    expect(
      evaluateCompletionRules(
        state,
        [completionRule('completion.test.pending', false)],
        RECORDED_AT,
      ),
    ).toBe(state);
  });

  it('marks the runtime completed and records the completion event', () => {
    const state = {
      ...scenario01InitialState,
      now: scenario01InitialState.now + 10,
      status: 'running' as const,
      phase: 'escalation' as const,
    };
    const completed = evaluateCompletionRules(
      state,
      [completionRule('completion.test.ready', true)],
      RECORDED_AT,
    );

    expect(completed).toMatchObject({
      status: 'completed',
      phase: 'resolution',
    });
    expect(completed.events.at(-1)).toMatchObject({
      id: 'event.completion.test.ready.completed',
      type: 'scenario.completed',
      scenarioTime: state.now,
      recordedAt: RECORDED_AT,
      producer: {
        type: 'core',
        id: 'runtime-completion',
      },
      payload: {
        completionRuleId: 'completion.test.ready',
      },
    });
  });

  it('does not complete while a blocking decision is open', () => {
    const state = {
      ...scenario01InitialState,
      status: 'awaitingDecision' as const,
    };

    expect(
      evaluateCompletionRules(
        state,
        [completionRule('completion.test.ready', true)],
        RECORDED_AT,
      ),
    ).toBe(state);
  });

  it('is idempotent after completion and the scenario clock stays stopped', () => {
    const completed = evaluateCompletionRules(
      {
        ...scenario01InitialState,
        status: 'running' as const,
      },
      [completionRule('completion.test.ready', true)],
      RECORDED_AT,
    );
    const repeated = evaluateCompletionRules(
      completed,
      [completionRule('completion.test.ready', true)],
      RECORDED_AT,
    );

    expect(repeated).toBe(completed);
    expect(advanceScenarioTime(completed, 5)).toBe(completed);
  });

  it('rejects duplicate completion rule ids', () => {
    const rule = completionRule('completion.test.duplicate', false);

    expect(() =>
      evaluateCompletionRules(
        {
          ...scenario01InitialState,
          status: 'running' as const,
        },
        [rule, rule],
        RECORDED_AT,
      ),
    ).toThrow(
      'Duplicate completion rule id: completion.test.duplicate',
    );
  });

  it('requires an explicit completion recording time', () => {
    expect(() =>
      evaluateCompletionRules(
        scenario01InitialState,
        [],
        '   ',
      ),
    ).toThrow('Completion recording time must not be empty.');
  });
});
