import { describe, expect, it } from 'vitest';

import type { ActionId } from '../../core/contracts';
import { recordDecisionSelection } from '../../core/runtime-decision-selection';
import { advanceScenarioRuntime } from '../../core/runtime-step';
import {
  scenario01ActionIds,
  scenario01Decision2ActionIds,
  scenario01Decision2Ids,
  scenario01DecisionIds,
} from './decisions';
import {
  scenario01InitialState,
  scenario01RuntimeDefinition,
} from './scenario';

const RECORDED_AT = '2026-09-24T12:20:00.000Z';
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

function stateAfterDecision1(
  actionId: ActionId,
  elapsedMinutes: number,
) {
  const selectedState = recordDecisionSelection(
    awaitingDecision1State(),
    scenario01DecisionIds.informationPosture,
    actionId,
    RECORDED_AT,
  );

  return advanceScenarioRuntime(
    selectedState,
    elapsedMinutes,
    scenario01RuntimeDefinition,
    RECORDED_AT,
  );
}

const decision1Actions = [
  scenario01ActionIds.openCrossDomainIncident,
  scenario01ActionIds.continueSeparateMonitoring,
  scenario01ActionIds.recommendRegionalEscalation,
] as const;

describe('Scenario 01 Decision 2 gate', () => {
  it('does not open before the resource conflict has matured', () => {
    const state = stateAfterDecision1(
      scenario01ActionIds.continueSeparateMonitoring,
      D2_MATURITY_OFFSET_MINUTES - 1,
    );

    expect(
      state.decisions.some(
        (decision) =>
          decision.id === scenario01Decision2Ids.generatorRecommendation,
      ),
    ).toBe(false);
    expect(state.status).toBe('running');
  });

  for (const actionId of decision1Actions) {
    it(`opens the same D2 resource conflict after ${actionId}`, () => {
      const state = stateAfterDecision1(
        actionId,
        D2_MATURITY_OFFSET_MINUTES,
      );
      const decision = state.decisions.find(
        (candidate) =>
          candidate.id === scenario01Decision2Ids.generatorRecommendation,
      );
      const actions = state.actions.filter((action) =>
        decision?.actionIds.includes(action.id),
      );

      expect(state.status).toBe('awaitingDecision');
      expect(decision?.id).toBe(
        scenario01Decision2Ids.generatorRecommendation,
      );
      expect(decision?.selectedActionId).toBeUndefined();
      expect(decision?.actionIds).toEqual([
        scenario01Decision2ActionIds.recommendGeneratorForSuw,
        scenario01Decision2ActionIds.recommendGeneratorForR4,
        scenario01Decision2ActionIds.waitForGridRestoration,
      ]);
      expect(decision?.evidenceIds).toEqual(
        expect.arrayContaining([
          'observation.baseline.ag400.resource-state',
          'observation.scenario-01.r4.backup-power',
          'observation.scenario-01.r4.link-quality-degraded',
          'observation.scenario-01.suw.reduced-pumping',
          'observation.scenario-01.z17.restricted',
          'observation.scenario-01.z17.travel-time-revised',
        ]),
      );
      expect(decision?.unknowns).toEqual(
        expect.arrayContaining([
          'Grid-restoration timing for F-12 remains unconfirmed.',
          'Exact remaining R-4 backup endurance remains uncertain.',
        ]),
      );
      expect(actions).toHaveLength(3);
      expect(
        actions.every((action) => action.lifecycle === 'available'),
      ).toBe(true);
      expect(
        state.events.slice(-4).map((event) => event.type),
      ).toEqual([
        'action.available',
        'action.available',
        'action.available',
        'decision.opened',
      ]);
    });
  }

  it('exposes comparable benefits and displaced risks for all D2 options', () => {
    const state = stateAfterDecision1(
      scenario01ActionIds.openCrossDomainIncident,
      D2_MATURITY_OFFSET_MINUTES,
    );
    const decision = state.decisions.find(
      (candidate) =>
        candidate.id === scenario01Decision2Ids.generatorRecommendation,
    );
    const actions = state.actions.filter((action) =>
      decision?.actionIds.includes(action.id),
    );

    expect(actions.map((action) => action.title)).toEqual([
      'Recommend AG-400 for SUW Kępa',
      'Recommend AG-400 for R-4',
      'Wait briefly for firmer grid-restoration information',
    ]);
    expect(
      actions.every(
        (action) =>
          action.expectedEffects.length > 0 &&
          action.displacedRisks.length > 0,
      ),
    ).toBe(true);
    expect(actions.map((action) => action.authority)).toEqual([
      'operator',
      'operator',
      'operator',
    ]);
  });
});
