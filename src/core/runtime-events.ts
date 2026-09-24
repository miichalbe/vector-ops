import type {
  ActionLifecycle,
  DomainEvent,
  EntityId,
  Observation,
  ScenarioTime,
} from './contracts';
import { canAdvanceScenarioTime } from './runtime-clock';
import type {
  OpeningVariantId,
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

export type ScenarioEventEffect =
  | AppendObservationEffect
  | UpdateActionLifecycleEffect;

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

  return {
    ...state,
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
  };
}
