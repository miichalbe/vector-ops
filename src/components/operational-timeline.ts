import type {
  DomainEvent,
  EntityId,
  Observation,
  ObservationSource,
  ScenarioTime,
} from '../core/contracts';
import type { ScenarioRuntimeState } from '../core/runtime-state';

export type OperationalTimelineEntryKind =
  | 'observation'
  | 'coordination'
  | 'assessment'
  | 'projection'
  | 'decision';

export interface OperationalTimelineEntry {
  id: string;
  scenarioTime: ScenarioTime;
  kind: OperationalTimelineEntryKind;
  label: string;
  title: string;
  summary: string;
  meta?: string;
  entityId?: EntityId;
}

const metricLabels: Record<string, string> = {
  'power.supplyState': 'Supply',
  'power.feederState': 'Feeder F-12',
  'power.loadPercentage': 'Load',
  'power.qualityEvent': 'Power quality',
  'water.outputPressure': 'Output pressure',
  'water.reservoirLevel': 'Reservoir',
  'water.pumpState': 'Pumps',
  'water.controllerState': 'Controller',
  'water.telemetryFreshness': 'Telemetry freshness',
  'communications.powerMode': 'Power mode',
  'communications.linkQuality': 'Link quality',
  'communications.packetLoss': 'Packet loss',
  'health.essentialServicesPosture': 'Essential services',
  'health.waterMargin': 'Water margin',
  'logistics.resourceState': 'Resource state',
  'logistics.routeState': 'Route state',
  'logistics.estimatedTravelTime': 'Travel time',
};

const kindSortRank: Record<OperationalTimelineEntryKind, number> = {
  decision: 5,
  assessment: 4,
  projection: 3,
  coordination: 2,
  observation: 1,
};

function formatValue(value: unknown, unit?: string): string {
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => {
        const label = key.replace(/^pump/, 'Pump ');
        return `${label}: ${String(item)}`;
      })
      .join(' · ');
  }

  return `${String(value)}${unit ? ` ${unit}` : ''}`;
}

function formatSource(source: ObservationSource): string {
  return source.organisation ?? source.id ?? source.type;
}

function formatScenarioTime(time: ScenarioTime): string {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function observationEntry(
  state: ScenarioRuntimeState,
  observation: Observation,
): OperationalTimelineEntry {
  const entity = state.entitiesById[observation.entityId];
  const delayed = observation.observedAt < observation.receivedAt;

  return {
    id: `timeline.${observation.id}`,
    scenarioTime: observation.receivedAt,
    kind: 'observation',
    label: 'Observation',
    title: entity?.name ?? observation.entityId,
    summary: `${metricLabels[observation.metric] ?? observation.metric}: ${formatValue(
      observation.value,
      observation.unit,
    )}`,
    meta: `${formatSource(observation.source)} · ${observation.confidence.level} confidence${
      delayed
        ? ` · observed ${formatScenarioTime(observation.observedAt)}`
        : ''
    }`,
    entityId: observation.entityId,
  };
}

function payloadRecord(event: DomainEvent): Record<string, unknown> | undefined {
  return typeof event.payload === 'object' && event.payload !== null
    ? (event.payload as Record<string, unknown>)
    : undefined;
}

function materialEventEntry(
  state: ScenarioRuntimeState,
  event: DomainEvent,
): OperationalTimelineEntry | undefined {
  switch (event.type) {
    case 'information.cross-domain-confirmed':
      return {
        id: `timeline.${event.id}`,
        scenarioTime: event.scenarioTime,
        kind: 'coordination',
        label: 'Confirmation',
        title: 'Cross-domain coordination',
        summary:
          'Synchronised confirmation received; shared cause and persistence remain unconfirmed.',
        meta: 'Coordinated operator channels',
      };

    case 'coordination.regional-recommendation.acknowledged':
      return {
        id: `timeline.${event.id}`,
        scenarioTime: event.scenarioTime,
        kind: 'coordination',
        label: 'Acknowledgement',
        title: 'Regional coordination',
        summary:
          'Regional escalation recommendation acknowledged; operational confirmation remains pending.',
        meta: 'Regional coordination chain',
      };

    case 'decision.recorded': {
      const payload = payloadRecord(event);
      const selectedActionId = payload?.selectedActionId;
      const action =
        typeof selectedActionId === 'string'
          ? state.actions.find((candidate) => candidate.id === selectedActionId)
          : undefined;

      return {
        id: `timeline.${event.id}`,
        scenarioTime: event.scenarioTime,
        kind: 'decision',
        label: 'Decision',
        title: 'Action recorded',
        summary: action?.title ?? 'Operator decision recorded',
        meta: 'WCZK duty officer',
      };
    }

    default:
      return undefined;
  }
}

function compareEntries(
  left: OperationalTimelineEntry,
  right: OperationalTimelineEntry,
): number {
  const timeDifference = right.scenarioTime - left.scenarioTime;

  if (timeDifference !== 0) {
    return timeDifference;
  }

  const kindDifference = kindSortRank[right.kind] - kindSortRank[left.kind];

  if (kindDifference !== 0) {
    return kindDifference;
  }

  return left.id.localeCompare(right.id);
}

export function buildOperationalTimeline(
  state: ScenarioRuntimeState,
): OperationalTimelineEntry[] {
  const observationEntries = state.observations.map((observation) =>
    observationEntry(state, observation),
  );
  const eventEntries = state.events
    .map((event) => materialEventEntry(state, event))
    .filter(
      (entry): entry is OperationalTimelineEntry => entry !== undefined,
    );
  const assessmentEntries: OperationalTimelineEntry[] = state.assessments.map(
    (assessment) => ({
      id: `timeline.${assessment.id}.revision-${assessment.revision}`,
      scenarioTime: assessment.recalculatedAt,
      kind: 'assessment',
      label: assessment.revision === 1 ? 'Assessment' : 'Assessment revised',
      title: 'Cross-domain Assessment',
      summary: assessment.title,
      meta: `${assessment.confidence.level} confidence · ${assessment.evidenceIds.length} supporting observations`,
    }),
  );
  const projectionEntries: OperationalTimelineEntry[] = state.projections.map(
    (projection) => ({
      id: `timeline.${projection.id}.revision-${projection.revision}`,
      scenarioTime: projection.recalculatedAt,
      kind: 'projection',
      label: projection.revision === 1 ? 'Projection' : 'Projection revised',
      title: 'Projected consequence',
      summary: projection.title,
      meta: `${projection.confidence.level} confidence · ${projection.status}`,
    }),
  );

  return [
    ...observationEntries,
    ...eventEntries,
    ...assessmentEntries,
    ...projectionEntries,
  ].sort(compareEntries);
}
