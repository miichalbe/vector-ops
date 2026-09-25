import {
  evaluateAssessmentRules,
  type AssessmentRule,
} from './runtime-assessments';
import { advanceScenarioTime } from './runtime-clock';
import {
  evaluateCompletionRules,
  type CompletionRuleDefinition,
} from './runtime-completion';
import {
  evaluateDecisionGates,
  type DecisionGateDefinition,
} from './runtime-decisions';
import {
  processDueScenarioTimeEvents,
  type ScenarioTimeEventDefinition,
} from './runtime-events';
import {
  evaluateProjectionRules,
  type ProjectionRule,
} from './runtime-projections';
import type { ScenarioRuntimeState } from './runtime-state';

export interface ScenarioRuntimeDefinition {
  timeEvents: readonly ScenarioTimeEventDefinition[];
  dynamicTimeEvents?: (
    state: ScenarioRuntimeState,
  ) => readonly ScenarioTimeEventDefinition[];
  assessmentRules: readonly AssessmentRule[];
  projectionRules: readonly ProjectionRule[];
  decisionGates: readonly DecisionGateDefinition[];
  completionRules?: readonly CompletionRuleDefinition[];
}

export function advanceScenarioRuntime(
  state: ScenarioRuntimeState,
  elapsedMinutes: number,
  definition: ScenarioRuntimeDefinition,
  recordedAt: string,
): ScenarioRuntimeState {
  const advancedState = advanceScenarioTime(
    state,
    elapsedMinutes,
  );
  const dynamicTimeEvents =
    definition.dynamicTimeEvents?.(advancedState) ?? [];
  const observedState = processDueScenarioTimeEvents(
    advancedState,
    [...definition.timeEvents, ...dynamicTimeEvents],
    recordedAt,
  );
  const assessedState = evaluateAssessmentRules(
    observedState,
    definition.assessmentRules,
  );
  const projectedState = evaluateProjectionRules(
    assessedState,
    definition.projectionRules,
  );
  const decisionState = evaluateDecisionGates(
    projectedState,
    definition.decisionGates,
    recordedAt,
  );

  return evaluateCompletionRules(
    decisionState,
    definition.completionRules ?? [],
    recordedAt,
  );
}
