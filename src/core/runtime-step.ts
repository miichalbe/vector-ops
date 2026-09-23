import {
  evaluateAssessmentRules,
  type AssessmentRule,
} from './runtime-assessments';
import { advanceScenarioTime } from './runtime-clock';
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
  assessmentRules: readonly AssessmentRule[];
  projectionRules: readonly ProjectionRule[];
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
  const observedState = processDueScenarioTimeEvents(
    advancedState,
    definition.timeEvents,
    recordedAt,
  );
  const assessedState = evaluateAssessmentRules(
    observedState,
    definition.assessmentRules,
  );

  return evaluateProjectionRules(
    assessedState,
    definition.projectionRules,
  );
}
