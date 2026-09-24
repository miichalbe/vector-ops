import { describe, expect, it } from 'vitest';

import type { ActionId, DecisionId } from '../../core/contracts';
import { recordDecisionSelection } from '../../core/runtime-decision-selection';
import { advanceScenarioRuntime } from '../../core/runtime-step';
import type { ScenarioRuntimeState } from '../../core/runtime-state';
import {
  activeAssessmentFamilies,
  activeProjectionFamilies,
} from '../../components/claim-selection';
import {
  scenario01ActionIds,
  scenario01DecisionIds,
} from './decision-1-ids';
import {
  scenario01Decision2ActionIds,
  scenario01Decision2Ids,
} from './decision-2-ids';
import {
  scenario01Decision3ActionIds,
  scenario01Decision3Ids,
} from './decision-3-ids';
import {
  scenario01InitialState,
  scenario01RuntimeDefinition,
} from './scenario';

const RECORDED_AT = '2026-09-24T20:00:00.000Z';
const MAX_RUNTIME_STEPS = 180;

interface AuditPath {
  name: string;
  d1: ActionId;
  d2: ActionId;
  d3: ActionId;
}

const d1Actions = [
  scenario01ActionIds.openCrossDomainIncident,
  scenario01ActionIds.continueSeparateMonitoring,
  scenario01ActionIds.recommendRegionalEscalation,
] as const;
const d2Actions = [
  scenario01Decision2ActionIds.recommendGeneratorForSuw,
  scenario01Decision2ActionIds.recommendGeneratorForR4,
  scenario01Decision2ActionIds.waitForGridRestoration,
] as const;
const d3Actions = [
  scenario01Decision3ActionIds.targetedContingency,
  scenario01Decision3ActionIds.recommendVoivodeshipCoordination,
  scenario01Decision3ActionIds.continueOperatorCoordination,
] as const;

const paths: AuditPath[] = d1Actions.flatMap((d1, d1Index) =>
  d2Actions.flatMap((d2, d2Index) =>
    d3Actions.map((d3, d3Index) => ({
      name: `D1-${d1Index + 1} / D2-${d2Index + 1} / D3-${d3Index + 1}`,
      d1,
      d2,
      d3,
    })),
  ),
);

function actionForDecision(path: AuditPath, decisionId: DecisionId): ActionId {
  switch (decisionId) {
    case scenario01DecisionIds.informationPosture:
      return path.d1;
    case scenario01Decision2Ids.generatorRecommendation:
      return path.d2;
    case scenario01Decision3Ids.coordinationPosture:
      return path.d3;
    default:
      throw new Error(`Unexpected Decision in audit path: ${decisionId}`);
  }
}

function assertUniqueIds(state: ScenarioRuntimeState) {
  expect(new Set(state.events.map((event) => event.id)).size).toBe(
    state.events.length,
  );
  expect(new Set(state.observations.map((observation) => observation.id)).size).toBe(
    state.observations.length,
  );
}

function assertClaimEvidenceIsContemporaneous(state: ScenarioRuntimeState) {
  for (const claim of [...state.assessments, ...state.projections]) {
    for (const evidenceId of claim.evidenceIds) {
      const evidence = state.observations.find(
        (observation) => observation.id === evidenceId,
      );

      expect(evidence, `${claim.id} references missing evidence ${evidenceId}`).toBeDefined();
      expect(
        evidence?.receivedAt,
        `${claim.id} revision ${claim.revision} uses future evidence ${evidenceId}`,
      ).toBeLessThanOrEqual(claim.recalculatedAt);
    }
  }
}

function auditPath(path: AuditPath): ScenarioRuntimeState {
  let state = scenario01InitialState;
  let previousNow = state.now;
  const decidedOrder: DecisionId[] = [];

  for (let step = 0; step < MAX_RUNTIME_STEPS; step += 1) {
    if (state.status === 'completed') {
      break;
    }

    if (state.status === 'awaitingDecision') {
      const pending = state.decisions.find(
        (decision) => decision.selectedActionId === undefined,
      );

      expect(pending, `${path.name} paused without a pending Decision`).toBeDefined();

      if (!pending) {
        break;
      }

      for (const evidenceId of pending.evidenceIds) {
        const evidence = state.observations.find(
          (observation) => observation.id === evidenceId,
        );

        expect(
          evidence,
          `${pending.id} references unavailable Decision evidence ${evidenceId}`,
        ).toBeDefined();
        expect(evidence?.receivedAt).toBeLessThanOrEqual(state.now);
      }

      expect(pending.openedAt).toBeLessThanOrEqual(state.now);
      decidedOrder.push(pending.id);
      state = recordDecisionSelection(
        state,
        pending.id,
        actionForDecision(path, pending.id),
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

    expect(state.now).toBeGreaterThanOrEqual(previousNow);
    previousNow = state.now;
    expect(activeAssessmentFamilies(state.assessments).length).toBeLessThanOrEqual(2);
    expect(activeProjectionFamilies(state.projections).length).toBeLessThanOrEqual(3);
    assertUniqueIds(state);
    assertClaimEvidenceIsContemporaneous(state);
  }

  expect(state.status, `${path.name} did not reach completion`).toBe('completed');
  expect(decidedOrder).toEqual([
    scenario01DecisionIds.informationPosture,
    scenario01Decision2Ids.generatorRecommendation,
    scenario01Decision3Ids.coordinationPosture,
  ]);
  expect(state.decisions).toHaveLength(3);
  expect(state.decisions.every((decision) => decision.selectedActionId)).toBe(true);
  expect(
    state.events.some((event) => event.type === 'operational.handover.prepared'),
  ).toBe(true);
  expect(state.events.some((event) => event.type === 'scenario.completed')).toBe(true);

  const completedAt = state.now;
  const afterCompletion = advanceScenarioRuntime(
    state,
    10,
    scenario01RuntimeDefinition,
    RECORDED_AT,
  );
  expect(afterCompletion.now).toBe(completedAt);
  expect(afterCompletion.status).toBe('completed');

  return state;
}

describe('Scenario 01 deterministic minute-by-minute runtime audit', () => {
  it.each(paths)('$name completes coherently without hindsight evidence', (path) => {
    const state = auditPath(path);

    expect(state.now).toBeLessThanOrEqual(9 * 60 + 30);
  });
});
