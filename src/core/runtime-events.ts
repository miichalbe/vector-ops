import type {
  ActionLifecycle,
  DecisionId,
  DomainEvent,
  Effect,
  EntityId,
  Observation,
  ScenarioTime,
} from './contracts';
import { canAdvanceScenarioTime } from './runtime-clock';
import type {
  OpeningVariantId,
  ScenarioPhase,
  ScenarioRuntimeState,
} from './runtime-state';

export interface AppendObservationEffect {
  type: 'appendObservation';
  observation: Observation;
}

export interface UpdateActionLifecycleEffect {
  type: 'updateActionLifecycle';
  actionId: string;
  lifecycle: ActionLifecycle;
}

export interface AppendDecisionObservedEffect {
  type: 'appendDecisionObservedEffect';
  decisionId: DecisionId;
  effect: Effect;
}

export interface UpdateScenarioPhaseEffect {
  type: 'updateScenarioPhase';
  phase: ScenarioPhase;
}

export type ScenarioEventEffect =
  | AppendObservationEffect
  | UpdateActionLifecycleEffect
  | AppendDecisionObservedEffect
  | UpdateScenarioPhaseEffect;

export interface ScenarioTimeEventDefinition<T = unknown> {
  id: string;
  openingVariants?: readonly OpeningVariantId[];
  trigger: {
    type: 'scenarioTime';
    at: ScenarioTime;
  };
  event: {
    type: string;
    producer: DomainEvent<T>['producer'];
    entityIds?: readonly EntityId[];
    correlationId?: string;
    causationId?: string;
    payload: T;
  };
  effects?: readonly ScenarioEventEffect[];
}

function assertValidDefinitions(
  state: ScenarioRuntimeState,
  definitions: readonly ScenarioTimeEventDefinition[],
) {
  const eventIds = new Set<string>();
  const processedEventIds = new Set(
    state.events.map((event) => event.id),
  );
  const observationIds = new Set(
    state.observations.map((observation) => observation.id),
  );

  for (const definition of definitions) {
    if (!definition.id.trim()) {
      throw new Error('Scenario event id must not be empty.');
    }

    if (eventIds.has(definition.id)) {
      throw new Error(`Duplicate scenario event id: ${definition.id}`);
    }

    if (
      !Number.isInteger(definition.trigger.at) ||
      definition.trigger.at < 0
    ) {
      throw new Error(
        `Scenario event ${definition.id} must use a non-negative integer scenario time.`,
      );
    }

    if (!definition.event.type.trim()) {
      throw new Error(
        `Scenario event ${definition.id} must define a domain event type.`,
      );
    }

    eventIds.add(definition.id);

    if (processedEventIds.has(definition.id)) {
      continue;
    }

    for (const effect of definition.effects ?? []) {
      if (effect.type === 'updateActionLifecycle') {
        if (!state.actions.some((action) => action.id === effect.actionId)) {
          throw new Error(
            `Scenario event ${definition.id} references unknown action: ${effect.actionId}`,
          );
        }

        continue;
      }

      if (effect.type === 'appendDecisionObservedEffect') {
        const decision = state.decisions.find(
          (candidate) => candidate.id === effect.decisionId,
        );

        if (!decision?.selectedActionId) {
          throw new Error(
            `Scenario event ${definition.id} references an unrecorded Decision: ${effect.decisionId}`,
          );
        }

        if (!effect.effect.description.trim()) {
          throw new Error(
            `Scenario event ${definition.id} must describe its observed Decision effect.`,
          );
        }

        for (const entityId of effect.effect.entityIds ?? []) {
          if (!state.entitiesById[entityId]) {
            throw new Error(
              `Observed Decision effect for ${effect.decisionId} references unknown entity: ${entityId}`,
            );
          }
        }

        continue;
      }

      if (effect.type === 'updateScenarioPhase') {
        continue;
      }

      const { observation } = effect;

      if (observationIds.has(observation.id)) {
        throw new Error(
          `Duplicate observation id: ${observation.id}`,
        );
      }

      if (!state.entitiesById[observation.entityId]) {
        throw new Error(
          `Observation ${observation.id} references unknown entity: ${observation.entityId}`,
        );
      }

      if (observation.relatedEventId !== definition.id) {
        throw new Error(
          `Observation ${observation.id} must reference its scenario event: ${definition.id}`,
        );
      }

      if (observation.receivedAt !== definition.trigger.at) {
        throw new Error(
          `Observation ${observation.id} must be received at its scenario event time.`,
        );
      }

      if (observation.observedAt > observation.receivedAt) {
        throw new Error(
          `Observation ${observation.id} cannot be observed after it is received.`,
        );
      }

      observationIds.add(observation.id);
    }
  }
}

function materializeDomainEvent(
  definition: ScenarioTimeEventDefinition,
  recordedAt: string,
): DomainEvent {
  return {
    id: definition.id,
    type: definition.event.type,
    version: 1,
    scenarioTime: definition.trigger.at,
    recordedAt,
    producer: { ...definition.event.producer },
    ...(definition.event.entityIds
      ? { entityIds: [...definition.event.entityIds] }
      : {}),
    ...(definition.event.correlationId
      ? { correlationId: definition.event.correlationId }
      : {}),
    ...(definition.event.causationId
      ? { causationId: definition.event.causationId }
      : {}),
    payload: definition.event.payload,
  };
}

function materializeObservation(observation: Observation): Observation {
  return {
    ...observation,
    source: { ...observation.source },
    confidence: {
      ...observation.confidence,
      ...(observation.confidence.reasons
        ? {
            reasons: observation.confidence.reasons.map((reason) => ({
              ...reason,
            })),
          }
        : {}),
    },
  };
}

function cloneEffect(effect: Effect): Effect {
  return {
    ...effect,
    ...(effect.entityIds ? { entityIds: [...effect.entityIds] } : {}),
  };
}

function compareDefinitions(
  left: ScenarioTimeEventDefinition,
  right: ScenarioTimeEventDefinition,
): number {
  const timeDifference = left.trigger.at - right.trigger.at;

  if (timeDifference !== 0) {
    return timeDifference;
  }

  if (left.id === right.id) {
    return 0;
  }

  return left.id < right.id ? -1 : 1;
}

function canTransitionActionLifecycle(
  from: ActionLifecycle,
  to: ActionLifecycle,
): boolean {
  if (from === to) {
    return true;
  }

  const allowedTransitions: Partial<
    Record<ActionLifecycle, readonly ActionLifecycle[]>
  > = {
    selected: ['requested', 'completed', 'cancelled'],
    requested: ['accepted', 'rejected', 'cancelled'],
    accepted: ['completed', 'cancelled'],
  };

  return allowedTransitions[from]?.includes(to) ?? false;
}

function applyActionLifecycleEffects(
  state: ScenarioRuntimeState,
  definitions: readonly ScenarioTimeEventDefinition[],
): ScenarioRuntimeState['actions'] {
  let actions = [...state.actions];

  for (const definition of definitions) {
    for (const effect of definition.effects ?? []) {
      if (effect.type !== 'updateActionLifecycle') {
        continue;
      }

      const actionIndex = actions.findIndex(
        (action) => action.id === effect.actionId,
      );
      const action = actions[actionIndex];

      if (!action) {
        throw new Error(
          `Scenario event ${definition.id} references unknown action: ${effect.actionId}`,
        );
      }

      if (!canTransitionActionLifecycle(action.lifecycle, effect.lifecycle)) {
        throw new Error(
          `Invalid action lifecycle transition for ${action.id}: ${action.lifecycle} -> ${effect.lifecycle}`,
        );
      }

      actions = actions.map((candidate, index) =>
        index === actionIndex
          ? { ...candidate, lifecycle: effect.lifecycle }
          : candidate,
      );
    }
  }

  return actions;
}

function applyDecisionObservedEffects(
  state: ScenarioRuntimeState,
  definitions: readonly ScenarioTimeEventDefinition[],
): ScenarioRuntimeState['decisions'] {
  let decisions = [...state.decisions];

  for (const definition of definitions) {
    for (const effect of definition.effects ?? []) {
      if (effect.type !== 'appendDecisionObservedEffect') {
        continue;
      }

      const decisionIndex = decisions.findIndex(
        (decision) => decision.id === effect.decisionId,
      );
      const decision = decisions[decisionIndex];

      if (!decision?.selectedActionId) {
        throw new Error(
          `Scenario event ${definition.id} references an unrecorded Decision: ${effect.decisionId}`,
        );
      }

      decisions = decisions.map((candidate, index) =>
        index === decisionIndex
          ? {
              ...candidate,
              observedEffects: [
                ...candidate.observedEffects,
                cloneEffect(effect.effect),
              ],
            }
          : candidate,
      );
    }
  }

  return decisions;
}

const phaseOrder: readonly ScenarioPhase[] = [
  'baseline',
  'detection',
  'dependency',
  'escalation',
  'resolution',
];

function applyScenarioPhaseEffects(
  state: ScenarioRuntimeState,
  definitions: readonly ScenarioTimeEventDefinition[],
): ScenarioPhase {
  let phase = state.phase;

  for (const definition of definitions) {
    for (const effect of definition.effects ?? []) {
      if (effect.type !== 'updateScenarioPhase' || effect.phase === phase) {
        continue;
      }

      const currentIndex = phaseOrder.indexOf(phase);
      const nextIndex = phaseOrder.indexOf(effect.phase);

      if (nextIndex !== currentIndex + 1) {
        throw new Error(
          `Invalid scenario phase transition in ${definition.id}: ${phase} -> ${effect.phase}`,
        );
      }

      phase = effect.phase;
    }
  }

  return phase;
}

export function processDueScenarioTimeEvents(
  state: ScenarioRuntimeState,
  definitions: readonly ScenarioTimeEventDefinition[],
  recordedAt: string,
): ScenarioRuntimeState {
  if (!recordedAt.trim()) {
    throw new Error('Event recording time must not be empty.');
  }

  assertValidDefinitions(state, definitions);

  if (!canAdvanceScenarioTime(state)) {
    return state;
  }

  const processedEventIds = new Set(
    state.events.map((event) => event.id),
  );
  const dueDefinitions = definitions
    .filter(
      (definition) =>
        definition.trigger.at <= state.now &&
        !processedEventIds.has(definition.id) &&
        (
          definition.openingVariants === undefined ||
          definition.openingVariants.includes(
            state.run.openingVariant,
          )
        ),
    )
    .sort(compareDefinitions);

  if (dueDefinitions.length === 0) {
    return state;
  }

  const newObservations = dueDefinitions.flatMap((definition) =>
    (definition.effects ?? [])
      .filter(
        (effect): effect is AppendObservationEffect =>
          effect.type === 'appendObservation',
      )
      .map((effect) => materializeObservation(effect.observation)),
  );
  const actions = applyActionLifecycleEffects(state, dueDefinitions);
  const decisions = applyDecisionObservedEffects(state, dueDefinitions);
  const phase = applyScenarioPhaseEffects(state, dueDefinitions);

  return {
    ...state,
    phase,
    events: [
      ...state.events,
      ...dueDefinitions.map((definition) =>
        materializeDomainEvent(definition, recordedAt),
      ),
    ],
    observations: [
      ...state.observations,
      ...newObservations,
    ],
    actions,
    decisions,
  };
}
