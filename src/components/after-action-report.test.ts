import { describe, expect, it } from 'vitest';

import type { ActionId, DecisionId } from '../core/contracts';
import { recordDecisionSelection } from '../core/runtime-decision-selection';
import { advanceScenarioRuntime } from '../core/runtime-step';
import type { ScenarioRuntimeState } from '../core/runtime-state';
import {
  scenario01ActionIds,
  scenario01DecisionIds,
} from '../scenarios/scenario-01/decision-1-ids';
import {
  scenario01Decision2ActionIds,
  scenario01Decision2Ids,
} from '../scenarios/scenario-01/decision-2-ids';
import {
  scenario01Decision3ActionIds,
  scenario01Decision3Ids,
} from '../scenarios/scenario-01/decision-3-ids';
import {
  scenario01InitialState,
  scenario01RuntimeDefinition,
} from '../scenarios/scenario-01/scenario';
import { buildAfterActionReport } from './after-action-report';

const RECORDED_AT = '2026-09-24T21:00:00.000Z';
const MAX_STEPS = 180;

const selectedActions: Record<DecisionId, ActionId> = {
  [scenario01DecisionIds.informationPosture]:
    scenario01ActionIds.openCrossDomainIncident,
  [scenario01Decision2Ids.generatorRecommendation]:
    scenario01Decision2ActionIds.recommendGeneratorForR4,
  [scenario01Decision3Ids.coordinationPosture]:
    scenario01Decision3ActionIds.recommendVoivodeshipCoordination,
};

function completedRepresentativeRun(): ScenarioRuntimeState {
  let state = scenario01InitialState;

  for (let step = 0; step < MAX_STEPS; step += 1) {
    if (state.status === 'completed') {
      return state;
    }

    if (state.status === 'awaitingDecision') {
      const pending = state.decisions.find(
        (decision) => decision.selectedActionId === undefined,
      );

      if (!pending) {
        throw new Error('Runtime paused without a pending Decision.');
      }

      const actionId = selectedActions[pending.id];

      if (!actionId) {
        throw new Error(`No test Action configured for ${pending.id}.`);
      }

      state = recordDecisionSelection(
        state,
        pending.id,
        actionId,
        RECORDED_AT,
      );
      continue;
    }

    state = advanceScenarioRuntime(
      state,
      1,
      scenario01RuntimeDefinition,
      RECORDED_AT,
    );
  }

  throw new Error('Representative run did not complete.');
}

describe('After-Action Report reconstruction', () => {
  it('rejects an incomplete run', () => {
    expect(() => buildAfterActionReport(scenario01InitialState)).toThrow(
      'After-Action Report requires a completed scenario run.',
    );
  });

  it('reconstructs run metadata, Decisions, chronology and handover', () => {
    const completed = completedRepresentativeRun();
    const report = buildAfterActionReport(completed);

    expect(report).toMatchObject({
      scenarioVersion: '0.1.0',
      seed: '8F4C',
      openingVariant: completed.run.openingVariant,
      dominantProfile: completed.run.dominantProfile,
      secondaryModifier: completed.run.secondaryModifier,
      completedAt: completed.now,
      durationMinutes: completed.now - report.startedAt,
    });

    expect(report.decisions).toHaveLength(3);
    expect(report.decisions.map((decision) => decision.selectedActionId)).toEqual([
      scenario01ActionIds.openCrossDomainIncident,
      scenario01Decision2ActionIds.recommendGeneratorForR4,
      scenario01Decision3ActionIds.recommendVoivodeshipCoordination,
    ]);
    expect(
      report.decisions.every(
        (decision) =>
          decision.expectedEffects.length > 0 &&
          decision.observedEffects.length > 0 &&
          decision.actionLifecycle === 'completed',
      ),
    ).toBe(true);

    expect(report.chronology.length).toBeGreaterThan(10);
    expect(
      report.chronology.every(
        (entry, index) =>
          index === 0 ||
          (report.chronology[index - 1]?.scenarioTime ?? 0) <= entry.scenarioTime,
      ),
    ).toBe(true);
    expect(
      report.chronology.some((entry) => entry.label === 'Handover'),
    ).toBe(true);

    expect(report.handover).toBeDefined();
    expect(report.handover?.currentMitigations.length).toBeGreaterThan(0);
    expect(report.handover?.unresolvedItems.length).toBeGreaterThan(0);
    expect(report.handover?.hospitalEssentialServices).toBe('maintained');
  });

  it('exposes entity state changes and reasoning mechanics without scoring the operator', () => {
    const report = buildAfterActionReport(completedRepresentativeRun());
    const r4 = report.entityStates.find((entity) => entity.entityName === 'R-4');
    const generator = report.entityStates.find((entity) =>
      entity.metrics.some(
        (metric) =>
          metric.metric === 'logistics.resourceState' &&
          metric.finalValue === 'operational',
      ),
    );

    expect(r4?.hasMaterialChange).toBe(true);
    expect(generator?.hasMaterialChange).toBe(true);
    expect(report.dependencies.length).toBeGreaterThan(0);
    expect(report.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Access travel-time multiplier' }),
        expect.objectContaining({ label: 'Information report delay' }),
      ]),
    );

    const serialized = JSON.stringify(report).toLowerCase();
    expect(serialized).not.toContain('score');
    expect(serialized).not.toContain('grade');
    expect(serialized).not.toContain('success');
    expect(serialized).not.toContain('failure');
  });
});
