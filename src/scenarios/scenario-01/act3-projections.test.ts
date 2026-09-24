import { describe, expect, it } from 'vitest';

import type { ActionId } from '../../core/contracts';
import { recordDecisionSelection } from '../../core/runtime-decision-selection';
import { advanceScenarioRuntime } from '../../core/runtime-step';
import { createScenario01Act3TimeEvents } from './act3';
import {
  scenario01ActionIds,
  scenario01DecisionIds,
} from './decision-1-ids';
import {
  scenario01Decision2ActionIds,
  scenario01Decision2Ids,
} from './decision-2-ids';
import { scenario01ProjectionIds } from './projections';
import {
  scenario01InitialState,
  scenario01RuntimeDefinition,
} from './scenario';

const RECORDED_AT = '2026-09-24T16:35:00.000Z';
const D2_MATURITY_OFFSET_MINUTES = 29;

function awaitingDecision1State() {
  const finalOpeningTime =
    scenario01RuntimeDefinition.timeEvents.at(-1)?.trigger.at;

  if (finalOpeningTime === undefined) {
    throw new Error('Expected Scenario 01 opening events.');
  }

  return advanceScenarioRuntime(
    scenario01InitialState,
    finalOpeningTime - scenario01InitialState.now,
    scenario01RuntimeDefinition,
    RECORDED_AT,
  );
}

function awaitingDecision2State() {
  const afterDecision1 = recordDecisionSelection(
    awaitingDecision1State(),
    scenario01DecisionIds.informationPosture,
    scenario01ActionIds.continueSeparateMonitoring,
    RECORDED_AT,
  );

  return advanceScenarioRuntime(
    afterDecision1,
    D2_MATURITY_OFFSET_MINUTES,
    scenario01RuntimeDefinition,
    RECORDED_AT,
  );
}

function selectedDecision2State(actionId: ActionId) {
  return recordDecisionSelection(
    awaitingDecision2State(),
    scenario01Decision2Ids.generatorRecommendation,
    actionId,
    RECORDED_AT,
  );
}

function stateAtHospital(actionId: ActionId) {
  const selected = selectedDecision2State(actionId);
  const hospital = createScenario01Act3TimeEvents(selected).find(
    (definition) =>
      definition.id === 'event.scenario-01.hospital.continuity-request',
  );

  if (!hospital) {
    throw new Error('Expected the shared hospital report event.');
  }

  return advanceScenarioRuntime(
    selected,
    hospital.trigger.at - selected.now,
    scenario01RuntimeDefinition,
    RECORDED_AT,
  );
}

function latestProjection(
  state: ReturnType<typeof stateAtHospital>,
  projectionId: string,
) {
  return state.projections
    .filter((projection) => projection.id === projectionId)
    .at(-1);
}

describe('Scenario 01 post-D2 Projection revisions', () => {
  it('raises P-01 and P-02 attention when AG-400 protects SUW while R-4 deteriorates', () => {
    const state = stateAtHospital(
      scenario01Decision2ActionIds.recommendGeneratorForSuw,
    );
    const communications = latestProjection(
      state,
      scenario01ProjectionIds.communicationsContinuity,
    );
    const visibility = latestProjection(
      state,
      scenario01ProjectionIds.suwVisibility,
    );

    expect(communications).toMatchObject({
      title:
        'R-4 communications continuity risk has increased as link quality falls to poor',
      status: 'developing',
      attention: 'act',
    });
    expect(communications?.evidenceIds).toContain(
      'observation.scenario-01.r4.link-quality-poor',
    );
    expect(visibility).toMatchObject({
      title:
        'Remote SUW monitoring visibility is increasingly at risk as R-4 link quality falls to poor',
      status: 'developing',
      attention: 'act',
    });
    expect(visibility?.evidenceIds).toContain(
      'observation.scenario-01.r4.link-quality-poor',
    );
  });

  it('marks P-01 and P-02 avoided after AG-400 stabilises R-4 and visibility begins to recover', () => {
    const state = stateAtHospital(
      scenario01Decision2ActionIds.recommendGeneratorForR4,
    );
    const communications = latestProjection(
      state,
      scenario01ProjectionIds.communicationsContinuity,
    );
    const visibility = latestProjection(
      state,
      scenario01ProjectionIds.suwVisibility,
    );

    expect(communications).toMatchObject({
      title:
        'R-4 communications continuity risk is reducing after AG-400 support',
      severity: 'normal',
      status: 'avoided',
      attention: 'monitor',
    });
    expect(communications?.evidenceIds).toEqual(
      expect.arrayContaining([
        'observation.scenario-01.r4.generator-power',
        'observation.scenario-01.r4.link-stabilising',
      ]),
    );
    expect(visibility).toMatchObject({
      title:
        'Remote SUW visibility is recovering after R-4 generator support',
      severity: 'normal',
      status: 'avoided',
      attention: 'monitor',
    });
    expect(visibility?.evidenceIds).toEqual(
      expect.arrayContaining([
        'observation.scenario-01.r4.link-stabilising',
        'observation.scenario-01.suw.telemetry-improving',
      ]),
    );
  });

  it('keeps both communications Projections developing while waiting consumes margin', () => {
    const state = stateAtHospital(
      scenario01Decision2ActionIds.waitForGridRestoration,
    );
    const communications = latestProjection(
      state,
      scenario01ProjectionIds.communicationsContinuity,
    );
    const visibility = latestProjection(
      state,
      scenario01ProjectionIds.suwVisibility,
    );

    expect(communications).toMatchObject({
      title:
        'R-4 communications continuity risk has increased as link quality falls to poor',
      status: 'developing',
      attention: 'act',
    });
    expect(communications?.evidenceIds).toContain(
      'observation.scenario-01.r4.link-quality-poor-while-waiting',
    );
    expect(visibility).toMatchObject({
      title:
        'Remote SUW monitoring visibility is increasingly at risk as R-4 link quality falls to poor',
      status: 'developing',
      attention: 'act',
    });
    expect(visibility?.evidenceIds).toContain(
      'observation.scenario-01.r4.link-quality-poor-while-waiting',
    );
  });
});
