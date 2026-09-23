import type {
  DependencyId,
  EntityId,
  ObservationId,
  Projection,
} from './contracts';
import type { ScenarioRuntimeState } from './runtime-state';

export type ProjectionDraft = Omit<
  Projection,
  | 'id'
  | 'revision'
  | 'type'
  | 'ruleId'
  | 'createdAt'
  | 'recalculatedAt'
>;

export type ProjectionRuleContext = Readonly<
  Pick<
    ScenarioRuntimeState,
    | 'now'
    | 'run'
    | 'entitiesById'
    | 'observations'
    | 'dependencies'
    | 'assessments'
    | 'projections'
    | 'actions'
  >
>;

export interface ProjectionRuleResult {
  projectionId: string;
  draft: ProjectionDraft;
}

export interface ProjectionRule {
  id: string;
  evaluate(
    context: ProjectionRuleContext,
  ): readonly ProjectionRuleResult[];
}

function assertUniqueReferences(
  values: readonly string[],
  label: string,
  projectionId: string,
) {
  if (new Set(values).size !== values.length) {
    throw new Error(
      `Projection ${projectionId} contains duplicate ${label} references.`,
    );
  }
}

function assertHorizon(
  projectionId: string,
  draft: ProjectionDraft,
) {
  const { earliest, latest } = draft.horizon;

  for (const [label, value] of [
    ['earliest', earliest],
    ['latest', latest],
  ] as const) {
    if (
      value !== undefined &&
      (!Number.isInteger(value) || value < 0)
    ) {
      throw new Error(
        `Projection ${projectionId} ${label} horizon must be a non-negative integer scenario time.`,
      );
    }
  }

  if (
    earliest !== undefined &&
    latest !== undefined &&
    earliest > latest
  ) {
    throw new Error(
      `Projection ${projectionId} earliest horizon must not be after its latest horizon.`,
    );
  }
}

function assertDraftReferences(
  state: ScenarioRuntimeState,
  projectionId: string,
  draft: ProjectionDraft,
) {
  if (!draft.title.trim()) {
    throw new Error(`Projection ${projectionId} must define a title.`);
  }

  if (draft.evidenceIds.length === 0) {
    throw new Error(
      `Projection ${projectionId} must reference supporting evidence.`,
    );
  }

  assertUniqueReferences(draft.entityIds, 'entity', projectionId);
  assertUniqueReferences(draft.evidenceIds, 'evidence', projectionId);
  assertUniqueReferences(
    draft.dependencyIds,
    'dependency',
    projectionId,
  );
  assertHorizon(projectionId, draft);

  const observationIds = new Set(
    state.observations.map((observation) => observation.id),
  );
  const dependencyIds = new Set(
    state.dependencies.map((dependency) => dependency.id),
  );

  for (const entityId of draft.entityIds) {
    if (!state.entitiesById[entityId]) {
      throw new Error(
        `Projection ${projectionId} references unknown entity: ${entityId}`,
      );
    }
  }

  for (const evidenceId of draft.evidenceIds) {
    if (!observationIds.has(evidenceId)) {
      throw new Error(
        `Projection ${projectionId} references unknown evidence: ${evidenceId}`,
      );
    }
  }

  for (const dependencyId of draft.dependencyIds) {
    if (!dependencyIds.has(dependencyId)) {
      throw new Error(
        `Projection ${projectionId} references unknown dependency: ${dependencyId}`,
      );
    }
  }
}

function materialSignature(
  projection: Projection | ProjectionDraft,
): string {
  return JSON.stringify({
    title: projection.title,
    severity: projection.severity,
    attention: projection.attention,
    confidence: projection.confidence,
    entityIds: projection.entityIds,
    evidenceIds: projection.evidenceIds,
    dependencyIds: projection.dependencyIds,
    assumptions: projection.assumptions,
    horizon: projection.horizon,
    mainUncertainty: projection.mainUncertainty,
    status: projection.status,
  });
}

function latestRevision(
  projections: readonly Projection[],
  projectionId: string,
): Projection | undefined {
  return projections
    .filter((projection) => projection.id === projectionId)
    .reduce<Projection | undefined>(
      (latest, projection) =>
        !latest || projection.revision > latest.revision
          ? projection
          : latest,
      undefined,
    );
}

function materializeProjection(
  rule: ProjectionRule,
  result: ProjectionRuleResult,
  revision: number,
  createdAt: number,
  recalculatedAt: number,
): Projection {
  const { draft } = result;

  return {
    ...draft,
    id: result.projectionId,
    revision,
    type: 'projection',
    ruleId: rule.id,
    createdAt,
    recalculatedAt,
    confidence: {
      ...draft.confidence,
      ...(draft.confidence.reasons
        ? {
            reasons: draft.confidence.reasons.map((reason) => ({
              ...reason,
            })),
          }
        : {}),
    },
    entityIds: [...draft.entityIds] as EntityId[],
    evidenceIds: [...draft.evidenceIds] as ObservationId[],
    dependencyIds: [...draft.dependencyIds] as DependencyId[],
    assumptions: draft.assumptions.map((assumption) => ({
      ...assumption,
    })),
    horizon: { ...draft.horizon },
  };
}

export function evaluateProjectionRules(
  state: ScenarioRuntimeState,
  rules: readonly ProjectionRule[],
): ScenarioRuntimeState {
  const ruleIds = new Set<string>();
  const projectionIds = new Set<string>();
  const appendedProjections: Projection[] = [];
  const context: ProjectionRuleContext = {
    now: state.now,
    run: state.run,
    entitiesById: state.entitiesById,
    observations: state.observations,
    dependencies: state.dependencies,
    assessments: state.assessments,
    projections: state.projections,
    actions: state.actions,
  };

  for (const rule of rules) {
    if (!rule.id.trim()) {
      throw new Error('Projection rule id must not be empty.');
    }

    if (ruleIds.has(rule.id)) {
      throw new Error(`Duplicate projection rule id: ${rule.id}`);
    }

    ruleIds.add(rule.id);

    for (const result of rule.evaluate(context)) {
      if (!result.projectionId.trim()) {
        throw new Error(
          `Projection rule ${rule.id} returned an empty projection id.`,
        );
      }

      if (projectionIds.has(result.projectionId)) {
        throw new Error(
          `Duplicate projection id across rules: ${result.projectionId}`,
        );
      }

      projectionIds.add(result.projectionId);
      assertDraftReferences(
        state,
        result.projectionId,
        result.draft,
      );

      const current = latestRevision(
        state.projections,
        result.projectionId,
      );

      if (current && current.ruleId !== rule.id) {
        throw new Error(
          `Projection ${result.projectionId} is owned by rule ${current.ruleId}, not ${rule.id}.`,
        );
      }

      if (
        current &&
        materialSignature(current) ===
          materialSignature(result.draft)
      ) {
        continue;
      }

      appendedProjections.push(
        materializeProjection(
          rule,
          result,
          (current?.revision ?? 0) + 1,
          current?.createdAt ?? state.now,
          state.now,
        ),
      );
    }
  }

  if (appendedProjections.length === 0) {
    return state;
  }

  return {
    ...state,
    projections: [...state.projections, ...appendedProjections],
  };
}
