import {
  createInitialRuntimeState,
  type ScenarioInitialData,
  type ScenarioRunConfig,
} from '../../core/runtime-state';
import {
  scenario01Capabilities,
  scenario01Dependencies,
  scenario01Entities,
} from './baseline';
import {
  SCENARIO_01_START_TIME,
  scenario01BaselineObservations,
} from './baseline-observations';

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

export const scenario01DefaultRunConfig = {
  scenarioId: scenario01InitialData.id,
  scenarioVersion: scenario01InitialData.version,
  seed: '8F4C',
  openingVariant: 'power-first',
  dominantProfile: 'communications-fragile',
  secondaryModifier: 'access-constrained',
} satisfies ScenarioRunConfig;

export const scenario01InitialState = createInitialRuntimeState(
  scenario01InitialData,
  scenario01DefaultRunConfig,
);

export { scenario01TimeEvents } from './timeline';
