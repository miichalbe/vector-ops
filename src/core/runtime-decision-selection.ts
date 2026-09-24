import type {
  Action,
  ActionId,
  Decision,
  DecisionId,
  DomainEvent,
  Effect,
} from './contracts';
import type { ScenarioRuntimeState } from './runtime-state';

function cloneEffect(effect: Effect): Effect {
  return {
    ...effect,
    ...(effect.entityIds ? { entityIds: [...effect.entityIds] } : {}),
  };
}

function materializeActionSelectedEvent(
  action: Action,
  decision: Decision,
  scenarioTime: number,
  recordedAt: string,
): DomainEvent {
  return {
    id: `event.${action.id}.selected`,
    type: 'action.selected',
    version: 1,
    scenarioTime,
    recordedAt,
    producer: {
      type: 'operator',
      id: 'primary-operator',
    },
    ...(action.scope.entityIds
      ? { entityIds: [...action.scope.entityIds] }
      : {}),
    correlationId: decision.id,
    payload: {
      actionId: action.id,
      decisionId: decision.id,
    },
  };
}

function materializeActionExpiredEvent(
  action: Action,
  decision: Decision,
  selectedAction: Action,
  scenarioTime: number,
  recordedAt: string,
): DomainEvent {
  return {
    id: `event.${action.id}.expired`,
    type: 'action.expired',
    version: 1,
    scenarioTime,
    recordedAt,
    producer: {
      type: 'core',
      id: 'decision-runtime',
    },
    ...(action.scope.entityIds
      ? { entityIds: [...action.scope.entityIds] }
      : {}),
    correlationId: decision.id,
    causationId: `event.${selectedAction.id}.selected`,
    payload: {
      actionId: action.id,
      decisionId: decision.id,
      selectedActionId: selectedAction.id,
      reason: 'alternative-not-selected',
    },
  };
}

function materializeDecisionRecordedEvent(
  action: Action,
  decision: Decision,
  scenarioTime: number,
  recordedAt: string,
): DomainEvent {
  return {
    id: `event.${decision.id}.recorded`,
    type: 'decision.recorded',
    version: 1,
    scenarioTime,
    recordedAt,
    producer: {
      type: 'operator',
      id: 'primary-operator',
    },
    ...(action.scope.entityIds
      ? { entityIds: [...action.scope.entityIds] }
      : {}),
    correlationId: decision.id,
    causationId: `event.${action.id}.selected`,
    payload: {
      decisionId: decision.id,
      selectedActionId: action.id,
    },
  };
}

export function recordDecisionSelection(
  state: ScenarioRuntimeState,
  decisionId: DecisionId,
  actionId: ActionId,
  recordedAt: string,
): ScenarioRuntimeState {
  if (!recordedAt.trim()) {
    throw new Error('Decision recording time must not be empty.');
  }

  const decision = state.decisions.find(
    (candidate) => candidate.id === decisionId,
  );

  if (!decision) {
    throw new Error(`Unknown Decision: ${decisionId}`);
  }

  if (decision.selectedActionId) {
    if (decision.selectedActionId === actionId) {
      return state;
    }

    throw new Error(
      `Decision ${decisionId} is already recorded with Action ${decision.selectedActionId}.`,
    );
  }

  if (state.status !== 'awaitingDecision') {
    throw new Error(
      `Decision ${decisionId} can only be recorded while runtime is awaiting a decision.`,
    );
  }

  if (!decision.actionIds.includes(actionId)) {
    throw new Error(
      `Action ${actionId} is not available for Decision ${decisionId}.`,
    );
  }

  const action = state.actions.find(
    (candidate) => candidate.id === actionId,
  );

  if (!action) {
    throw new Error(`Unknown Action: ${actionId}`);
  }

  if (action.lifecycle !== 'available') {
    throw new Error(
      `Action ${actionId} cannot be selected from lifecycle ${action.lifecycle}.`,
    );
  }

  const selectedAction: Action = {
    ...action,
    lifecycle: 'selected',
  };
  const recordedDecision: Decision = {
    ...decision,
    selectedActionId: action.id,
    decidedAt: state.now,
    expectedEffects: action.expectedEffects.map(cloneEffect),
  };
  const alternativeActions = state.actions.filter(
    (candidate) =>
      candidate.id !== selectedAction.id &&
      decision.actionIds.includes(candidate.id) &&
      candidate.lifecycle === 'available',
  );
  const actionSelectedEvent = materializeActionSelectedEvent(
    selectedAction,
    recordedDecision,
    state.now,
    recordedAt,
  );
  const actionExpiredEvents = alternativeActions.map((alternative) =>
    materializeActionExpiredEvent(
      alternative,
      recordedDecision,
      selectedAction,
      state.now,
      recordedAt,
    ),
  );
  const decisionRecordedEvent = materializeDecisionRecordedEvent(
    selectedAction,
    recordedDecision,
    state.now,
    recordedAt,
  );
  const newEvents = [
    actionSelectedEvent,
    ...actionExpiredEvents,
    decisionRecordedEvent,
  ];
  const existingEventIds = new Set(
    state.events.map((event) => event.id),
  );

  for (const event of newEvents) {
    if (existingEventIds.has(event.id)) {
      throw new Error(`Domain event already exists: ${event.id}`);
    }
  }

  const expiredActionIds = new Set(
    alternativeActions.map((alternative) => alternative.id),
  );

  return {
    ...state,
    status: 'running',
    actions: state.actions.map((candidate) => {
      if (candidate.id === selectedAction.id) {
        return selectedAction;
      }

      return expiredActionIds.has(candidate.id)
        ? { ...candidate, lifecycle: 'expired' as const }
        : candidate;
    }),
    decisions: state.decisions.map((candidate) =>
      candidate.id === recordedDecision.id ? recordedDecision : candidate,
    ),
    events: [
      ...state.events,
      ...newEvents,
    ],
  };
}
