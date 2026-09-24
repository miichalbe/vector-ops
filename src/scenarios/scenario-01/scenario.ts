import { resolveScenarioRunConfig } from '../../core/run-config';
import type { ScenarioRuntimeDefinition } from '../../core/runtime-step';
import {
  createInitialRuntimeState,
  type ScenarioInitialData,
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

export const scenario01DefaultRunConfig = resolveScenarioRunConfig({
  scenarioId: scenario01InitialData.id,
  scenarioVersion: scenario01InitialData.version,
  seed: SCENARIO_01_DEFAULT_SEED,
});

export const scenario01InitialState = createInitialRuntimeState(
  scenario01InitialData,
  scenario01DefaultRunConfig,
);

export const scenario01TimeEvents = createScenario01TimeEvents(
  scenario01DefaultRunConfig,
);

export const scenario01ProjectionRules = [
  ...scenario01BaseProjectionRules,
  scenario01WaterServiceProjectionRule,
] as const;

export const scenario01DecisionGates = [
  ...scenario01BaseDecisionGates,
  scenario01Decision3Gate,
] as const;

export const scenario01RuntimeDefinition = {
  timeEvents: scenario01TimeEvents,
  dynamicTimeEvents(state) {
    return [
      ...createScenario01Act2TimeEvents(state),
      ...createScenario01Act3TimeEvents(state),
    ];
  },
  assessmentRules: scenario01AssessmentRules,
  projectionRules: scenario01ProjectionRules,
  decisionGates: scenario01DecisionGates,
} satisfies ScenarioRuntimeDefinition;

export { scenario01AssessmentRules };
