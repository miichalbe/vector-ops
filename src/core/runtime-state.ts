import type {
  Action,
  Assessment,
  Capability,
  Decision,
  Dependency,
  DependencyRef,
  DomainEvent,
  Entity,
  EntityId,
  Observation,
  Projection,
  ScenarioTime,
} from './contracts';

export type ScenarioRunStatus =
  | 'briefing'
  | 'running'
  | 'awaitingDecision'
  | 'resolving'
  | 'completed';

export type ScenarioPhase =
  | 'baseline'
  | 'detection'
  | 'dependency'
  | 'escalation'
  | 'resolution';

export type OpeningVariantId =
  | 'power-first'
  | 'communications-first'
  | 'water-first';

export type ConditionProfileId =
  | 'communications-fragile'
  | 'access-constrained'
  | 'resource-constrained'
  | 'low-confidence-data';

export interface ScenarioRunConfig {
  scenarioId: string;
  scenarioVersion: string;
  seed: string;
  openingVariant: OpeningVariantId;
  dominantProfile: ConditionProfileId;
  secondaryModifier: ConditionProfileId;
}

export interface ScenarioInitialData {
  id: string;
  version: string;
  title: string;
  initialTime: ScenarioTime;
  entities: readonly Entity[];
  capabilities: readonly Capability[];
  dependencies: readonly Dependency[];
  observations: readonly Observation[];
}

export interface ScenarioMetadata {
  id: string;
  version: string;
  title: string;
}

export interface ScenarioRuntimeState {
  scenario: ScenarioMetadata;
  run: ScenarioRunConfig;
  now: ScenarioTime;
  status: ScenarioRunStatus;
  phase: ScenarioPhase;

  entityOrder: readonly EntityId[];
  entitiesById: Readonly<Record<EntityId, Entity>>;
  capabilitiesById: Readonly<Record<string, Capability>>;

  dependencies: readonly Dependency[];
  observations: readonly Observation[];
  assessments: readonly Assessment[];
  projections: readonly Projection[];
  actions: readonly Action[];
  decisions: readonly Decision[];
  events: readonly DomainEvent[];
}

function createIndex<T extends { id: string }>(
  items: readonly T[],
  label: string,
): Record<string, T> {
  const index: Record<string, T> = {};

  for (const item of items) {
    if (index[item.id]) {
      throw new Error(`Duplicate ${label} id: ${item.id}`);
    }

    index[item.id] = item;
  }

  return index;
}

function assertUniqueIds<T extends { id: string }>(
  items: readonly T[],
  label: string,
) {
  createIndex(items, label);
}

function assertDependencyRef(
  ref: DependencyRef,
  dependencyId: string,
  entitiesById: Readonly<Record<EntityId, Entity>>,
  capabilitiesById: Readonly<Record<string, Capability>>,
) {
  const exists =
    ref.type === 'entity'
      ? Boolean(entitiesById[ref.id])
      : Boolean(capabilitiesById[ref.id]);

  if (!exists) {
    throw new Error(
      `Dependency ${dependencyId} references unknown ${ref.type}: ${ref.id}`,
    );
  }
}

export function createInitialRuntimeState(
  data: ScenarioInitialData,
  run: ScenarioRunConfig,
): ScenarioRuntimeState {
  if (run.scenarioId !== data.id) {
    throw new Error(
      `Run config scenario id ${run.scenarioId} does not match ${data.id}.`,
    );
  }

  if (run.scenarioVersion !== data.version) {
    throw new Error(
      `Run config scenario version ${run.scenarioVersion} does not match ${data.version}.`,
    );
  }

  if (!run.seed.trim()) {
    throw new Error('Run config seed must not be empty.');
  }

  if (run.dominantProfile === run.secondaryModifier) {
    throw new Error(
      'Run config dominant profile and secondary modifier must be different.',
    );
  }

  const entitiesById = createIndex(data.entities, 'entity');
  const capabilitiesById = createIndex(data.capabilities, 'capability');

  assertUniqueIds(data.dependencies, 'dependency');
  assertUniqueIds(data.observations, 'observation');

  for (const capability of data.capabilities) {
    if (!entitiesById[capability.entityId]) {
      throw new Error(
        `Capability ${capability.id} references unknown entity: ${capability.entityId}`,
      );
    }
  }

  for (const dependency of data.dependencies) {
    assertDependencyRef(
      dependency.subject,
      dependency.id,
      entitiesById,
      capabilitiesById,
    );
    assertDependencyRef(
      dependency.object,
      dependency.id,
      entitiesById,
      capabilitiesById,
    );
  }

  for (const observation of data.observations) {
    if (!entitiesById[observation.entityId]) {
      throw new Error(
        `Observation ${observation.id} references unknown entity: ${observation.entityId}`,
      );
    }
  }

  return {
    scenario: {
      id: data.id,
      version: data.version,
      title: data.title,
    },
    run: { ...run },
    now: data.initialTime,
    status: 'running',
    phase: 'baseline',

    entityOrder: data.entities.map((entity) => entity.id),
    entitiesById,
    capabilitiesById,

    dependencies: [...data.dependencies],
    observations: [...data.observations],
    assessments: [],
    projections: [],
    actions: [],
    decisions: [],
    events: [],
  };
}

export function getEntities(state: ScenarioRuntimeState): Entity[] {
  return state.entityOrder.map((entityId) => state.entitiesById[entityId]);
}

export function getEntity(
  state: ScenarioRuntimeState,
  entityId: EntityId,
): Entity | undefined {
  return state.entitiesById[entityId];
}

export function getEntityObservations(
  state: ScenarioRuntimeState,
  entityId: EntityId,
): Observation[] {
  return state.observations.filter(
    (observation) => observation.entityId === entityId,
  );
}

export function getEntityCapabilities(
  state: ScenarioRuntimeState,
  entityId: EntityId,
): Capability[] {
  return Object.values(state.capabilitiesById).filter(
    (capability) => capability.entityId === entityId,
  );
}
