import { resolveScenarioRunConfig } from '../../core/run-config';
import type { ScenarioRuntimeDefinition } from '../../core/runtime-step';
import {
  createInitialRuntimeState,
  type ScenarioInitialData,
  type ScenarioRunConfig,
  type ScenarioRuntimeState,
} from '../../core/runtime-state';
import { scenario01AssessmentRules } from './assessments';
import {
  scenario01Capabilities,
  scenario01Dependencies,
  scenario01Entities,
} from './baseline';
import {
  SCENARIO_01_START_TIME,
  scenario01BaselineObservations,
} from './baseline-observations';
import {
  scenario01DecisionGates as scenario01BaseDecisionGates,
} from './decisions';
import { scenario01Decision3Gate } from './decision-3';
import { createScenario01Act2TimeEvents } from './act2';
import { createScenario01Act3TimeEvents } from './act3';
import { createScenario01Act4TimeEvents } from './act4';
import { scenario01CompletionRule } from './completion';
import {
  decorateScenario01DynamicEvents,
  decorateScenario01OpeningEvents,
} from './runtime-accounting';
import {
  scenario01ProjectionRules as scenario01BaseProjectionRules,
} from './projections';
import { createScenario01TimeEvents } from './timeline';
import { scenario01WaterServiceProjectionRule } from './water-service-projection';

export const scenario01InitialData = {
  id: 'scenario-01',
  version: '0.1.0',
  title: 'Scenario 01 — Infrastructure disruption, Mazowieckie Voivodeship',
  initialTime: SCENARIO_01_START_TIME,
  entities: scenario01Entities,
  capabilities: scenario01Capabilities,
  dependencies: scenario01Dependencies,
  observations: scenario01BaselineObservations,
} satisfies ScenarioInitialData;

export const SCENARIO_01_DEFAULT_SEED = '8F4C';

export const scenario01ProjectionRules = [
  ...scenario01BaseProjectionRules,
  scenario01WaterServiceProjectionRule,
] as const;

export const scenario01DecisionGates = [
  ...scenario01BaseDecisionGates,
  scenario01Decision3Gate,
] as const;

export interface Scenario01Run {
  runConfig: ScenarioRunConfig;
  initialState: ScenarioRuntimeState;
  runtimeDefinition: ScenarioRuntimeDefinition;
}

export function createScenario01Run(seed: string): Scenario01Run {
  const runConfig = resolveScenarioRunConfig({
    scenarioId: scenario01InitialData.id,
    scenarioVersion: scenario01InitialData.version,
    seed,
  });
  const initialState = createInitialRuntimeState(
    scenario01InitialData,
    runConfig,
  );
  const runtimeDefinition = {
    timeEvents: decorateScenario01OpeningEvents(
      createScenario01TimeEvents(runConfig),
    ),
    dynamicTimeEvents(state) {
      return decorateScenario01DynamicEvents(state, [
        ...createScenario01Act2TimeEvents(state),
        ...createScenario01Act3TimeEvents(state),
        ...createScenario01Act4TimeEvents(state),
      ]);
    },
    assessmentRules: scenario01AssessmentRules,
    projectionRules: scenario01ProjectionRules,
    decisionGates: scenario01DecisionGates,
    completionRules: [scenario01CompletionRule],
  } satisfies ScenarioRuntimeDefinition;

  return {
    runConfig,
    initialState,
    runtimeDefinition,
  };
}

const scenario01DefaultRun = createScenario01Run(
  SCENARIO_01_DEFAULT_SEED,
);

export const scenario01DefaultRunConfig = scenario01DefaultRun.runConfig;
export const scenario01InitialState = scenario01DefaultRun.initialState;
export const scenario01RuntimeDefinition =
  scenario01DefaultRun.runtimeDefinition;
export const scenario01TimeEvents = scenario01RuntimeDefinition.timeEvents;

export { scenario01AssessmentRules };
