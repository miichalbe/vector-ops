import type {
  Dependency,
  EntityId,
  Observation,
  ObservationSource,
  ScenarioTime,
} from '../core/contracts';
import type { ScenarioRuntimeState } from '../core/runtime-state';
import type { EntityMetricSlot } from '../scenarios/scenario-01/entity-presentation';

export interface ResolvedEntityMetric {
  id: string;
  label: string;
  metric: string;
  value: string;
  observation?: Observation;
}

export interface EntityDataCondition {
  label: string;
  modifier: 'current' | 'delayed' | 'limited' | 'unknown';
}

export function formatScenarioTime(time: ScenarioTime): string {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function formatObservationSource(source: ObservationSource): string {
  return source.organisation ?? source.id ?? source.type;
}

function displayObject(value: Record<string, unknown>): string {
  return Object.entries(value)
    .map(([key, item]) => {
      const label = key
        .replace(/^pump/, 'Pump ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .toLowerCase();
      return `${label}: ${String(item)}`;
    })
    .join(' · ');
}

export function formatObservationValue(
  observation: Observation,
  valuePath?: string,
): string {
  let value: unknown = observation.value;
  let unit = observation.unit;

  if (valuePath) {
    if (typeof value !== 'object' || value === null) {
      return '—';
    }

    value = valuePath.split('.').reduce<unknown>((current, key) => {
      if (typeof current !== 'object' || current === null) {
        return undefined;
      }

      return (current as Record<string, unknown>)[key];
    }, value);
    unit = undefined;
  }

  if (value === undefined || value === null) {
    return '—';
  }

  if (typeof value === 'object') {
    return displayObject(value as Record<string, unknown>);
  }

  return `${String(value)}${unit ? ` ${unit}` : ''}`;
}

export function newestObservations(
  observations: readonly Observation[],
): Observation[] {
  return [...observations].sort((left, right) => {
    const timeDifference = right.receivedAt - left.receivedAt;

    return timeDifference !== 0
      ? timeDifference
      : left.id.localeCompare(right.id);
  });
}

export function latestObservationForMetric(
  observations: readonly Observation[],
  metric: string,
): Observation | undefined {
  return newestObservations(
    observations.filter((observation) => observation.metric === metric),
  )[0];
}

export function resolveEntityMetricSlots(
  observations: readonly Observation[],
  slots: readonly EntityMetricSlot[],
): ResolvedEntityMetric[] {
  return slots.map((slot) => {
    const observation = latestObservationForMetric(observations, slot.metric);
    const value = observation
      ? formatObservationValue(observation, slot.valuePath)
      : '—';

    return {
      id: slot.id,
      label: slot.label,
      metric: slot.metric,
      value,
      ...(observation && value !== '—' ? { observation } : {}),
    };
  });
}

export function getEntityDataCondition(
  observations: readonly Observation[],
): EntityDataCondition {
  const latest = newestObservations(observations)[0];

  if (!latest) {
    return { label: 'No data', modifier: 'unknown' };
  }

  if (latest.quality === 'poor' || latest.quality === 'unknown') {
    return { label: 'Limited data', modifier: 'limited' };
  }

  if (
    latest.quality === 'degraded' ||
    latest.observedAt < latest.receivedAt
  ) {
    return { label: 'Delayed data', modifier: 'delayed' };
  }

  return { label: 'Current data', modifier: 'current' };
}

function dependencyRefBelongsToEntity(
  state: ScenarioRuntimeState,
  ref: Dependency['subject'],
  entityId: EntityId,
): boolean {
  if (ref.type === 'entity') {
    return ref.id === entityId;
  }

  return state.capabilitiesById[ref.id]?.entityId === entityId;
}

export function getEntityDependencies(
  state: ScenarioRuntimeState,
  entityId: EntityId,
): Dependency[] {
  return state.dependencies.filter(
    (dependency) =>
      dependencyRefBelongsToEntity(state, dependency.subject, entityId) ||
      dependencyRefBelongsToEntity(state, dependency.object, entityId),
  );
}

export function getLatestEntityUpdate(
  observations: readonly Observation[],
): Observation | undefined {
  return newestObservations(observations)[0];
}
