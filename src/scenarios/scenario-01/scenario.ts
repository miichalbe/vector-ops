import {
  createInitialRuntimeState,
  type ScenarioInitialData,
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

export const scenario01InitialState = createInitialRuntimeState(
  scenario01InitialData,
);
