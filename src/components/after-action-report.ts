import type {
  Dependency,
  Effect,
  Observation,
  ScenarioTime,
} from '../core/contracts';
import type { ScenarioRuntimeState } from '../core/runtime-state';
import {
  buildOperationalTimeline,
  type OperationalTimelineEntry,
} from './operational-timeline';

export interface AfterActionReportObservation {
  id: string;
  entityName: string;
  metric: string;
  value: string;
  receivedAt: ScenarioTime;
  confidence: string;
  classification: string;
}

export interface AfterActionReportDecision {
  id: string;
  decidedAt: ScenarioTime;
  selectedActionId: string;
  selectedActionTitle: string;
  actionLifecycle: string;
  evidence: AfterActionReportObservation[];
  unknowns: string[];
  expectedEffects: Effect[];
  observedEffects: Effect[];
}

export interface AfterActionReportEntityMetric {
  metric: string;
  label: string;
  initialValue: string;
  finalValue: string;
  initialAt: ScenarioTime;
  finalAt: ScenarioTime;
  changed: boolean;
}

export interface AfterActionReportEntityState {
  entityId: string;
  entityName: string;
  metrics: AfterActionReportEntityMetric[];
  hasMaterialChange: boolean;
}

export interface AfterActionReportDependency {
  id: string;
  description: string;
}

export interface AfterActionReportParameter {
  label: string;
  value: string;
}

export interface AfterActionReportHandover {
  preparedAt: ScenarioTime;
  currentMitigations: string[];
  unresolvedItems: string[];
  hospitalEssentialServices?: string;
}

export interface AfterActionReport {
  scenarioTitle: string;
  scenarioVersion: string;
  seed: string;
  openingVariant: string;
  dominantProfile: string;
  secondaryModifier: string;
  startedAt: ScenarioTime;
  completedAt: ScenarioTime;
  durationMinutes: number;
  chronology: OperationalTimelineEntry[];
  decisions: AfterActionReportDecision[];
  entityStates: AfterActionReportEntityState[];
  dependencies: AfterActionReportDependency[];
  parameters: AfterActionReportParameter[];
  handover?: AfterActionReportHandover;
}

const metricLabels: Record<string, string> = {
  'power.supplyState': 'Supply',
  'power.feederState': 'Feeder F-12',
  'power.loadPercentage': 'Load',
  'power.qualityEvent': 'Power quality',
  'power.restorationEstimate': 'Restoration estimate',
  'power.restorationStatus': 'Restoration status',
  'water.outputPressure': 'Output pressure',
  'water.reservoirLevel': 'Reservoir',
  'water.pumpState': 'Pumps',
  'water.controllerState': 'Controller',
  'water.telemetryFreshness': 'Telemetry freshness',
  'water.powerSupport': 'Power support',
  'water.serviceMarginTrend': 'Service margin',
  'communications.powerMode': 'Power mode',
  'communications.linkQuality': 'Link quality',
  'communications.packetLoss': 'Packet loss',
  'health.essentialServicesPosture': 'Essential services',
  'health.waterMargin': 'Water margin',
  'health.continuityRequest': 'Continuity request',
  'health.contingencyPreparation': 'Contingency preparation',
  'logistics.resourceState': 'Resource state',
  'logistics.assignment': 'Assignment',
  'logistics.estimatedArrival': 'Estimated arrival',
  'logistics.routeState': 'Route state',
  'logistics.estimatedTravelTime': 'Travel time',
};

function formatValue(value: unknown, unit?: string): string {
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key.replace(/^pump/, 'Pump ')}: ${String(item)}`)
      .join(' · ');
  }

  return `${String(value)}${unit ? ` ${unit}` : ''}`;
}

function stableValue(value: unknown): string {
  return typeof value === 'object' && value !== null
    ? JSON.stringify(value)
    : String(value);
}

function compareObservations(left: Observation, right: Observation): number {
  const timeDifference = left.receivedAt - right.receivedAt;

  return timeDifference !== 0 ? timeDifference : left.id.localeCompare(right.id);
}

function reportObservation(
  state: ScenarioRuntimeState,
  observation: Observation,
): AfterActionReportObservation {
  return {
    id: observation.id,
    entityName:
      state.entitiesById[observation.entityId]?.name ?? observation.entityId,
    metric: metricLabels[observation.metric] ?? observation.metric,
    value: formatValue(observation.value, observation.unit),
    receivedAt: observation.receivedAt,
    confidence: observation.confidence.level,
    classification: observation.classification,
  };
}

function reportDecisions(
  state: ScenarioRuntimeState,
): AfterActionReportDecision[] {
  return state.decisions
    .filter(
      (decision) =>
        decision.selectedActionId !== undefined && decision.decidedAt !== undefined,
    )
    .map((decision) => {
      const selectedAction = state.actions.find(
        (action) => action.id === decision.selectedActionId,
      );

      if (!selectedAction || !decision.selectedActionId || decision.decidedAt === undefined) {
        throw new Error(`Completed Decision ${decision.id} has no selected Action.`);
      }

      return {
        id: decision.id,
        decidedAt: decision.decidedAt,
        selectedActionId: decision.selectedActionId,
        selectedActionTitle: selectedAction.title,
        actionLifecycle: selectedAction.lifecycle,
        evidence: decision.evidenceIds
          .map((evidenceId) =>
            state.observations.find((observation) => observation.id === evidenceId),
          )
          .filter(
            (observation): observation is Observation => observation !== undefined,
          )
          .map((observation) => reportObservation(state, observation)),
        unknowns: [...decision.unknowns],
        expectedEffects: decision.expectedEffects.map((effect) => ({
          ...effect,
          ...(effect.entityIds ? { entityIds: [...effect.entityIds] } : {}),
        })),
        observedEffects: decision.observedEffects.map((effect) => ({
          ...effect,
          ...(effect.entityIds ? { entityIds: [...effect.entityIds] } : {}),
        })),
      };
    })
    .sort((left, right) => left.decidedAt - right.decidedAt);
}

function reportEntityStates(
  state: ScenarioRuntimeState,
): AfterActionReportEntityState[] {
  return state.entityOrder.map((entityId) => {
    const entity = state.entitiesById[entityId];
    const byMetric = new Map<string, Observation[]>();

    for (const observation of state.observations) {
      if (observation.entityId !== entityId) {
        continue;
      }

      const existing = byMetric.get(observation.metric) ?? [];
      existing.push(observation);
      byMetric.set(observation.metric, existing);
    }

    const metrics = [...byMetric.entries()]
      .map(([metric, observations]) => {
        const ordered = [...observations].sort(compareObservations);
        const initial = ordered[0];
        const final = ordered.at(-1);

        if (!initial || !final) {
          return undefined;
        }

        return {
          metric,
          label: metricLabels[metric] ?? metric,
          initialValue: formatValue(initial.value, initial.unit),
          finalValue: formatValue(final.value, final.unit),
          initialAt: initial.receivedAt,
          finalAt: final.receivedAt,
          changed: stableValue(initial.value) !== stableValue(final.value),
        } satisfies AfterActionReportEntityMetric;
      })
      .filter(
        (metric): metric is AfterActionReportEntityMetric => metric !== undefined,
      )
      .sort((left, right) => left.label.localeCompare(right.label));

    return {
      entityId,
      entityName: entity?.name ?? entityId,
      metrics,
      hasMaterialChange: metrics.some((metric) => metric.changed),
    };
  });
}

function dependencyDescription(
  dependency: Dependency,
  state: ScenarioRuntimeState,
): string {
  if (dependency.description) {
    return dependency.description;
  }

  const label = (ref: Dependency['subject']): string => {
    if (ref.type === 'entity') {
      return state.entitiesById[ref.id]?.name ?? ref.id;
    }

    return state.capabilitiesById[ref.id]?.id ?? ref.id;
  };

  return `${label(dependency.subject)} → ${label(dependency.object)} (${dependency.type})`;
}

function reportDependencies(
  state: ScenarioRuntimeState,
): AfterActionReportDependency[] {
  const referencedIds = new Set(
    [...state.assessments, ...state.projections].flatMap(
      (claim) => claim.dependencyIds,
    ),
  );

  return state.dependencies
    .filter((dependency) => referencedIds.has(dependency.id))
    .map((dependency) => ({
      id: dependency.id,
      description: dependencyDescription(dependency, state),
    }));
}

function reportParameters(
  state: ScenarioRuntimeState,
): AfterActionReportParameter[] {
  const { parameters } = state.run;

  return [
    {
      label: 'Opening observation gaps',
      value: `${parameters.opening.secondObservationDelayMinutes} / ${parameters.opening.thirdObservationDelayMinutes} min`,
    },
    {
      label: 'Communications degradation multiplier',
      value: `${parameters.communications.linkDegradationMultiplier.toFixed(2)}×`,
    },
    {
      label: 'Access travel-time multiplier',
      value: `${parameters.access.travelTimeMultiplier.toFixed(2)}×`,
    },
    {
      label: 'Field-inspection delay',
      value: `${parameters.access.inspectionDelayMinutes} min`,
    },
    {
      label: 'Service-margin multiplier',
      value: `${parameters.resources.serviceMarginMultiplier.toFixed(2)}×`,
    },
    {
      label: 'Generator preparation delay',
      value: `${parameters.resources.generatorPreparationDelayMinutes} min`,
    },
    {
      label: 'Information report delay',
      value: `${parameters.information.reportDelayMinutes} min`,
    },
    {
      label: 'Confidence penalty',
      value: String(parameters.information.confidencePenalty),
    },
  ];
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function reportHandover(
  state: ScenarioRuntimeState,
): AfterActionReportHandover | undefined {
  const handover = state.events.find(
    (event) => event.type === 'operational.handover.prepared',
  );

  if (!handover || typeof handover.payload !== 'object' || handover.payload === null) {
    return undefined;
  }

  const payload = handover.payload as Record<string, unknown>;
  const hospitalEssentialServices = payload.hospitalEssentialServices;

  return {
    preparedAt: handover.scenarioTime,
    currentMitigations: stringArray(payload.currentMitigations),
    unresolvedItems: stringArray(payload.unresolvedItems),
    ...(typeof hospitalEssentialServices === 'string'
      ? { hospitalEssentialServices }
      : {}),
  };
}

function reportStartTime(state: ScenarioRuntimeState): ScenarioTime {
  return state.observations.reduce(
    (earliest, observation) => Math.min(earliest, observation.receivedAt),
    state.now,
  );
}

export function buildAfterActionReport(
  state: ScenarioRuntimeState,
): AfterActionReport {
  if (state.status !== 'completed') {
    throw new Error('After-Action Report requires a completed scenario run.');
  }

  const startedAt = reportStartTime(state);
  const chronology = buildOperationalTimeline(state)
    .filter((entry) => entry.scenarioTime > startedAt)
    .reverse();

  return {
    scenarioTitle: state.scenario.title,
    scenarioVersion: state.scenario.version,
    seed: state.run.seed,
    openingVariant: state.run.openingVariant,
    dominantProfile: state.run.dominantProfile,
    secondaryModifier: state.run.secondaryModifier,
    startedAt,
    completedAt: state.now,
    durationMinutes: state.now - startedAt,
    chronology,
    decisions: reportDecisions(state),
    entityStates: reportEntityStates(state),
    dependencies: reportDependencies(state),
    parameters: reportParameters(state),
    handover: reportHandover(state),
  };
}
