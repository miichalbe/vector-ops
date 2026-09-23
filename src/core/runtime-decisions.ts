import type {
  Action,
  ActionId,
  Assumption,
  Decision,
  DecisionId,
  DomainEvent,
  ObservationId,
  ScenarioTime,
} from './contracts';
import type { ScenarioRuntimeState } from './runtime-state';

export type ActionDraft = Omit<Action, 'lifecycle'>;

export interface DecisionDraft {
  deadline?: ScenarioTime;
  evidenceIds: ObservationId[];
  unknowns: string[];
  assumptions: Assumption[];
}

export type DecisionGateContext = Readonly<
  Pick<
    ScenarioRuntimeState,
    | 'now'
    | 'run'
    | 'entitiesById'
    | 'dependencies'
    | 'observations'
    | 'assessments'
    | 'projections'
    | 'actions'
    | 'decisions'
  >
>;

export interface DecisionGateDefinition {
  id: DecisionId;
  question: string;
  actions: readonly ActionDraft[];
  evaluate(context: DecisionGateContext): DecisionDraft | null;
}

function assertUniqueReferences(
  values: readonly string[],
  label: string,
  ownerId: string,
) {
  if (new Set(values).size !== values.length) {
    throw new Error(`${ownerId} contains duplicate ${label} references.`);
  }
}

function assertActionDraft(
  state: ScenarioRuntimeState,
  action: ActionDraft,
) {
  if (!action.id.trim()) {
    throw new Error('Decision Action id must not be empty.');
  }

  if (!action.title.trim()) {
    throw new Error(`Action ${action.id} must define a title.`);
  }

  const entityIds = action.scope.entityIds ?? [];
  const assessmentIds = action.scope.assessmentIds ?? [];
  const projectionIds = action.scope.projectionIds ?? [];

  assertUniqueReferences(entityIds, 'entity', action.id);
  assertUniqueReferences(assessmentIds, 'Assessment', action.id);
  assertUniqueReferences(projectionIds, 'Projection', action.id);

  for (const entityId of entityIds) {
    if (!state.entitiesById[entityId]) {
      throw new Error(
        `Action ${action.id} references unknown entity: ${entityId}`,
      );
    }
  }

  const knownAssessmentIds = new Set(
    state.assessments.map((assessment) => assessment.id),
  );
  const knownProjectionIds = new Set(
    state.projections.map((projection) => projection.id),
  );

  for (const assessmentId of assessmentIds) {
    if (!knownAssessmentIds.has(assessmentId)) {
      throw new Error(
        `Action ${action.id} references unknown Assessment: ${assessmentId}`,
      );
    }
  }

  for (const projectionId of projectionIds) {
    if (!knownProjectionIds.has(projectionId)) {
      throw new Error(
        `Action ${action.id} references unknown Projection: ${projectionId}`,
      );
    }
  }
}

function materializeAction(action: ActionDraft): Action {
  return {
    ...action,
    lifecycle: 'available',
    scope: {
      ...(action.scope.entityIds
        ? { entityIds: [...action.scope.entityIds] }
        : {}),
      ...(action.scope.assessmentIds
        ? { assessmentIds: [...action.scope.assessmentIds] }
        : {}),
      ...(action.scope.projectionIds
        ? { projectionIds: [...action.scope.projectionIds] }
        : {}),
    },
    expectedEffects: action.expectedEffects.map((effect) => ({
      ...effect,
      ...(effect.entityIds ? { entityIds: [...effect.entityIds] } : {}),
    })),
    displacedRisks: action.displacedRisks.map((effect) => ({
      ...effect,
      ...(effect.entityIds ? { entityIds: [...effect.entityIds] } : {}),
    })),
  };
}

function materializeDecision(
  definition: DecisionGateDefinition,
  draft: DecisionDraft,
  actions: readonly Action[],
  now: ScenarioTime,
): Decision {
  return {
    id: definition.id,
    openedAt: now,
    ...(draft.deadline !== undefined
      ? { deadline: draft.deadline }
      : {}),
    actionIds: actions.map((action) => action.id),
    evidenceIds: [...draft.evidenceIds],
    unknowns: [...draft.unknowns],
    assumptions: draft.assumptions.map((assumption) => ({
      ...assumption,
    })),
    expectedEffects: [],
    observedEffects: [],
  };
}

function materializeActionAvailableEvent(
  action: Action,
  decision: Decision,
  recordedAt: string,
): DomainEvent {
  return {
    id: `event.${action.id}.available`,
    type: 'action.available',
    version: 1,
    scenarioTime: decision.openedAt,
    recordedAt,
    producer: {
      type: 'core',
      id: 'decision-runtime',
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

function materializeDecisionOpenedEvent(
  decision: Decision,
  recordedAt: string,
): DomainEvent {
  return {
    id: `event.${decision.id}.opened`,
    type: 'decision.opened',
    version: 1,
    scenarioTime: decision.openedAt,
    recordedAt,
    producer: {
      type: 'core',
      id: 'decision-runtime',
    },
    correlationId: decision.id,
    payload: {
      decisionId: decision.id,
      actionIds: [...decision.actionIds],
    },
  };
}

export function evaluateDecisionGates(
  state: ScenarioRuntimeState,
  definitions: readonly DecisionGateDefinition[],
  recordedAt: string,
): ScenarioRuntimeState {
  if (state.status !== 'running') {
    return state;
  }

  if (!recordedAt.trim()) {
    throw new Error('Decision event recording time must not be empty.');
  }

  const definitionIds = new Set<DecisionId>();
  const actionDefinitionIds = new Set<ActionId>();

  for (const definition of definitions) {
    if (!definition.id.trim()) {
      throw new Error('Decision gate id must not be empty.');
    }

    if (!definition.question.trim()) {
      throw new Error(
        `Decision gate ${definition.id} must define a question.`,
      );
    }

    if (definitionIds.has(definition.id)) {
      throw new Error(`Duplicate decision gate id: ${definition.id}`);
    }

    definitionIds.add(definition.id);

    if (definition.actions.length === 0) {
      throw new Error(
        `Decision gate ${definition.id} must define at least one Action.`,
      );
    }

    for (const action of definition.actions) {
      if (actionDefinitionIds.has(action.id)) {
        throw new Error(
          `Duplicate Action id across decision gates: ${action.id}`,
        );
      }

      actionDefinitionIds.add(action.id);
    }
  }

  const existingDecisionIds = new Set(
    state.decisions.map((decision) => decision.id),
  );
  const existingActionIds = new Set(
    state.actions.map((action) => action.id),
  );
  const existingEventIds = new Set(
    state.events.map((event) => event.id),
  );
  const observationIds = new Set(
    state.observations.map((observation) => observation.id),
  );
  const context: DecisionGateContext = {
    now: state.now,
    run: state.run,
    entitiesById: state.entitiesById,
    dependencies: state.dependencies,
    observations: state.observations,
    assessments: state.assessments,
    projections: state.projections,
    actions: state.actions,
    decisions: state.decisions,
  };

  for (const definition of definitions) {
    if (existingDecisionIds.has(definition.id)) {
      continue;
    }

    const draft = definition.evaluate(context);

    if (!draft) {
      continue;
    }

    assertUniqueReferences(
      draft.evidenceIds,
      'evidence',
      definition.id,
    );

    for (const evidenceId of draft.evidenceIds) {
      if (!observationIds.has(evidenceId)) {
        throw new Error(
          `Decision ${definition.id} references unknown evidence: ${evidenceId}`,
        );
      }
    }

    const actions = definition.actions.map((action) => {
      assertActionDraft(state, action);

      if (existingActionIds.has(action.id)) {
        throw new Error(`Action already exists in runtime state: ${action.id}`);
      }

      return materializeAction(action);
    });
    const decision = materializeDecision(
      definition,
      draft,
      actions,
      state.now,
    );
    const events = [
      ...actions.map((action) =>
        materializeActionAvailableEvent(
          action,
          decision,
          recordedAt,
        ),
      ),
      materializeDecisionOpenedEvent(decision, recordedAt),
    ];

    for (const event of events) {
      if (existingEventIds.has(event.id)) {
        throw new Error(`Domain event already exists: ${event.id}`);
      }
    }

    return {
      ...state,
      status: 'awaitingDecision',
      actions: [...state.actions, ...actions],
      decisions: [...state.decisions, decision],
      events: [...state.events, ...events],
    };
  }

  return state;
}
