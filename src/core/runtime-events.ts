import type {
  DomainEvent,
  EntityId,
  ScenarioTime,
} from './contracts';
import { canAdvanceScenarioTime } from './runtime-clock';
import type { ScenarioRuntimeState } from './runtime-state';

export interface ScenarioTimeEventDefinition<T = unknown> {
  id: string;
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
}

function assertValidDefinitions(
  definitions: readonly ScenarioTimeEventDefinition[],
) {
  const ids = new Set<string>();

  for (const definition of definitions) {
    if (!definition.id.trim()) {
      throw new Error('Scenario event id must not be empty.');
    }

    if (ids.has(definition.id)) {
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

    ids.add(definition.id);
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

export function processDueScenarioTimeEvents(
  state: ScenarioRuntimeState,
  definitions: readonly ScenarioTimeEventDefinition[],
  recordedAt: string,
): ScenarioRuntimeState {
  if (!recordedAt.trim()) {
    throw new Error('Event recording time must not be empty.');
  }

  assertValidDefinitions(definitions);

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
        !processedEventIds.has(definition.id),
    )
    .sort(compareDefinitions);

  if (dueDefinitions.length === 0) {
    return state;
  }

  return {
    ...state,
    events: [
      ...state.events,
      ...dueDefinitions.map((definition) =>
        materializeDomainEvent(definition, recordedAt),
      ),
    ],
  };
}
