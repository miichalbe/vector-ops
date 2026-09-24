import type {
  Assessment,
  DependencyId,
  EntityId,
  ObservationId,
} from './contracts';
import type { ScenarioRuntimeState } from './runtime-state';

export type AssessmentDraft = Omit<
  Assessment,
  | 'id'
  | 'revision'
  | 'type'
  | 'ruleId'
  | 'createdAt'
  | 'recalculatedAt'
>;

export type AssessmentRuleContext = Readonly<
  Pick<
    ScenarioRuntimeState,
    | 'now'
    | 'run'
    | 'entitiesById'
    | 'observations'
    | 'dependencies'
    | 'actions'
    | 'assessments'
    | 'events'
  >
>;

export interface AssessmentRule {
  id: string;
  assessmentId: string;
  evaluate(context: AssessmentRuleContext): AssessmentDraft | null;
}

function assertUniqueReferences(
  values: readonly string[],
  label: string,
  assessmentId: string,
) {
  const uniqueValues = new Set(values);

  if (uniqueValues.size !== values.length) {
    throw new Error(
      `Assessment ${assessmentId} contains duplicate ${label} references.`,
    );
  }
}

function assertDraftReferences(
  state: ScenarioRuntimeState,
  assessmentId: string,
  draft: AssessmentDraft,
) {
  if (!draft.title.trim()) {
    throw new Error(`Assessment ${assessmentId} must define a title.`);
  }

  if (draft.evidenceIds.length === 0) {
    throw new Error(
      `Assessment ${assessmentId} must reference supporting evidence.`,
    );
  }

  assertUniqueReferences(draft.entityIds, 'entity', assessmentId);
  assertUniqueReferences(draft.evidenceIds, 'evidence', assessmentId);
  assertUniqueReferences(
    draft.dependencyIds,
    'dependency',
    assessmentId,
  );

  const observationIds = new Set(
    state.observations.map((observation) => observation.id),
  );
  const dependencyIds = new Set(
    state.dependencies.map((dependency) => dependency.id),
  );

  for (const entityId of draft.entityIds) {
    if (!state.entitiesById[entityId]) {
      throw new Error(
        `Assessment ${assessmentId} references unknown entity: ${entityId}`,
      );
    }
  }

  for (const evidenceId of draft.evidenceIds) {
    if (!observationIds.has(evidenceId)) {
      throw new Error(
        `Assessment ${assessmentId} references unknown evidence: ${evidenceId}`,
      );
    }
  }

  for (const dependencyId of draft.dependencyIds) {
    if (!dependencyIds.has(dependencyId)) {
      throw new Error(
        `Assessment ${assessmentId} references unknown dependency: ${dependencyId}`,
      );
    }
  }
}

function materialSignature(
  assessment: Assessment | AssessmentDraft,
): string {
  return JSON.stringify({
    title: assessment.title,
    severity: assessment.severity,
    attention: assessment.attention,
    confidence: assessment.confidence,
    entityIds: assessment.entityIds,
    evidenceIds: assessment.evidenceIds,
    dependencyIds: assessment.dependencyIds,
    assumptions: assessment.assumptions,
    status: assessment.status,
  });
}

function latestRevision(
  assessments: readonly Assessment[],
  assessmentId: string,
): Assessment | undefined {
  return assessments
    .filter((assessment) => assessment.id === assessmentId)
    .reduce<Assessment | undefined>(
      (latest, assessment) =>
        !latest || assessment.revision > latest.revision
          ? assessment
          : latest,
      undefined,
    );
}

function materializeAssessment(
  rule: AssessmentRule,
  draft: AssessmentDraft,
  revision: number,
  createdAt: number,
  recalculatedAt: number,
): Assessment {
  return {
    ...draft,
    id: rule.assessmentId,
    revision,
    type: 'assessment',
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
  };
}

export function evaluateAssessmentRules(
  state: ScenarioRuntimeState,
  rules: readonly AssessmentRule[],
): ScenarioRuntimeState {
  const ruleIds = new Set<string>();
  const assessmentIds = new Set<string>();
  const appendedAssessments: Assessment[] = [];
  const context: AssessmentRuleContext = {
    now: state.now,
    run: state.run,
    entitiesById: state.entitiesById,
    observations: state.observations,
    dependencies: state.dependencies,
    actions: state.actions,
    assessments: state.assessments,
    events: state.events,
  };

  for (const rule of rules) {
    if (!rule.id.trim()) {
      throw new Error('Assessment rule id must not be empty.');
    }

    if (!rule.assessmentId.trim()) {
      throw new Error(
        `Assessment rule ${rule.id} must define an assessment id.`,
      );
    }

    if (ruleIds.has(rule.id)) {
      throw new Error(`Duplicate assessment rule id: ${rule.id}`);
    }

    if (assessmentIds.has(rule.assessmentId)) {
      throw new Error(
        `Duplicate assessment id across rules: ${rule.assessmentId}`,
      );
    }

    ruleIds.add(rule.id);
    assessmentIds.add(rule.assessmentId);

    const draft = rule.evaluate(context);

    if (!draft) {
      continue;
    }

    assertDraftReferences(state, rule.assessmentId, draft);

    const current = latestRevision(
      state.assessments,
      rule.assessmentId,
    );

    if (current && current.ruleId !== rule.id) {
      throw new Error(
        `Assessment ${rule.assessmentId} is owned by rule ${current.ruleId}, not ${rule.id}.`,
      );
    }

    if (current && materialSignature(current) === materialSignature(draft)) {
      continue;
    }

    appendedAssessments.push(
      materializeAssessment(
        rule,
        draft,
        (current?.revision ?? 0) + 1,
        current?.createdAt ?? state.now,
        state.now,
      ),
    );
  }

  if (appendedAssessments.length === 0) {
    return state;
  }

  return {
    ...state,
    assessments: [...state.assessments, ...appendedAssessments],
  };
}
