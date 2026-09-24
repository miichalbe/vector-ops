import type { DomainEvent } from './contracts';
import type { ScenarioRuntimeState } from './runtime-state';

export type CompletionRuleContext = Readonly<
  Pick<
    ScenarioRuntimeState,
    | 'now'
    | 'run'
    | 'status'
    | 'phase'
    | 'observations'
    | 'assessments'
    | 'projections'
    | 'actions'
    | 'decisions'
    | 'events'
  >
>;

export interface CompletionRuleDefinition {
  id: string;
  evaluate(context: CompletionRuleContext): boolean;
}

function materializeCompletionEvent(
  rule: CompletionRuleDefinition,
  state: ScenarioRuntimeState,
  recordedAt: string,
): DomainEvent {
  return {
    id: `event.${rule.id}.completed`,
    type: 'scenario.completed',
    version: 1,
    scenarioTime: state.now,
    recordedAt,
    producer: {
      type: 'core',
      id: 'runtime-completion',
    },
    payload: {
      completionRuleId: rule.id,
    },
  };
}

export function evaluateCompletionRules(
  state: ScenarioRuntimeState,
  rules: readonly CompletionRuleDefinition[],
  recordedAt: string,
): ScenarioRuntimeState {
  if (!recordedAt.trim()) {
    throw new Error('Completion recording time must not be empty.');
  }

  if (state.status === 'completed' || rules.length === 0) {
    return state;
  }

  if (state.status !== 'running' && state.status !== 'resolving') {
    return state;
  }

  const ruleIds = new Set<string>();
  const context: CompletionRuleContext = {
    now: state.now,
    run: state.run,
    status: state.status,
    phase: state.phase,
    observations: state.observations,
    assessments: state.assessments,
    projections: state.projections,
    actions: state.actions,
    decisions: state.decisions,
    events: state.events,
  };

  for (const rule of rules) {
    if (!rule.id.trim()) {
      throw new Error('Completion rule id must not be empty.');
    }

    if (ruleIds.has(rule.id)) {
      throw new Error(`Duplicate completion rule id: ${rule.id}`);
    }

    ruleIds.add(rule.id);

    if (!rule.evaluate(context)) {
      continue;
    }

    const completionEvent = materializeCompletionEvent(
      rule,
      state,
      recordedAt,
    );

    if (state.events.some((event) => event.id === completionEvent.id)) {
      throw new Error(
        `Domain event already exists: ${completionEvent.id}`,
      );
    }

    return {
      ...state,
      status: 'completed',
      phase: 'resolution',
      events: [...state.events, completionEvent],
    };
  }

  return state;
}
