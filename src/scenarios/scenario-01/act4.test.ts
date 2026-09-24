import { describe, expect, it } from 'vitest';

import type { ActionId } from '../../core/contracts';
import { recordDecisionSelection } from '../../core/runtime-decision-selection';
import { advanceScenarioRuntime } from '../../core/runtime-step';
import { createScenario01Act3TimeEvents } from './act3';
import {
  createScenario01Act4TimeEvents,
  scenario01Act4EventIds,
} from './act4';
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

const RECORDED_AT = '2026-09-24T17:20:00.000Z';
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

function awaitingDecision3State(d2ActionId: ActionId) {
  const selected = selectedDecision2State(d2ActionId);
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

function selectedDecision3State(
  d2ActionId: ActionId,
  d3ActionId: ActionId,
) {
  return recordDecisionSelection(
    awaitingDecision3State(d2ActionId),
    scenario01Decision3Ids.coordinationPosture,
    d3ActionId,
    RECORDED_AT,
  );
}

function handoverAtFor(state: ReturnType<typeof selectedDecision3State>) {
  const handover = createScenario01Act4TimeEvents(state).find(
    (definition) => definition.id === scenario01Act4EventIds.handover,
  );

  if (!handover) {
    throw new Error('Expected Scenario 01 operational handover event.');
  }

  return handover.trigger.at;
}

function completedState(
  d2ActionId: ActionId,
  d3ActionId: ActionId,
) {
  const selected = selectedDecision3State(d2ActionId, d3ActionId);
  const handoverAt = handoverAtFor(selected);

  return advanceScenarioRuntime(
    selected,
    handoverAt - selected.now,
    scenario01RuntimeDefinition,
    RECORDED_AT,
  );
}

const d3Actions = [
  scenario01Decision3ActionIds.targetedContingency,
  scenario01Decision3ActionIds.recommendVoivodeshipCoordination,
  scenario01Decision3ActionIds.continueOperatorCoordination,
] as const;

describe('Scenario 01 Act 4 and completion', () => {
  it('models targeted notifications and local contingency preparation for D3-A', () => {
    const state = selectedDecision3State(
      scenario01Decision2ActionIds.recommendGeneratorForR4,
      scenario01Decision3ActionIds.targetedContingency,
    );
    const definitions = createScenario01Act4TimeEvents(state);
    const ids = definitions.map((definition) => definition.id);

    expect(ids).toEqual(
      expect.arrayContaining([
        scenario01Act4EventIds.targetedRequested,
        scenario01Act4EventIds.targetedAccepted,
        scenario01Act4EventIds.targetedActive,
        scenario01Act4EventIds.resolutionCheckpoint,
        scenario01Act4EventIds.handover,
      ]),
    );
    expect(ids).not.toContain(scenario01Act4EventIds.regionalActive);
    expect(ids).not.toContain(
      scenario01Act4EventIds.confirmationReceived,
    );
  });

  it('models an explicit external request, acceptance and active regional package for D3-B', () => {
    const state = selectedDecision3State(
      scenario01Decision2ActionIds.recommendGeneratorForSuw,
      scenario01Decision3ActionIds.recommendVoivodeshipCoordination,
    );
    const definitions = createScenario01Act4TimeEvents(state);
    const requested = definitions.find(
      (definition) =>
        definition.id === scenario01Act4EventIds.regionalRequested,
    );
    const accepted = definitions.find(
      (definition) =>
        definition.id === scenario01Act4EventIds.regionalAccepted,
    );
    const active = definitions.find(
      (definition) =>
        definition.id === scenario01Act4EventIds.regionalActive,
    );

    expect(requested?.event.type).toBe('action.requested');
    expect(accepted?.event.type).toBe('action.accepted');
    expect(active?.event.type).toBe(
      'coordination.voivodeship-package.active',
    );
    expect(active?.event.payload).toMatchObject({
      regionalAwareness: 'active',
      responseCapacity: 'broader',
      coordinationLoad: 'increased',
    });
  });

  it('gives D3-C real confirmation value without opening a fourth decision', () => {
    const state = completedState(
      scenario01Decision2ActionIds.waitForGridRestoration,
      scenario01Decision3ActionIds.continueOperatorCoordination,
    );
    const confirmation = state.observations.find(
      (observation) =>
        observation.id ===
        'observation.scenario-01.gpz.additional-restoration-confirmation',
    );

    expect(confirmation).toBeDefined();
    expect(confirmation?.value).toBe(
      'provisional-window-reconfirmed',
    );
    expect(state.decisions).toHaveLength(3);
    expect(
      state.decisions.some((decision) =>
        decision.id.includes('decision-4'),
      ),
    ).toBe(false);
  });

  for (const actionId of d3Actions) {
    it(`does not complete immediately after ${actionId} and completes only at handover`, () => {
      const selected = selectedDecision3State(
        scenario01Decision2ActionIds.recommendGeneratorForR4,
        actionId,
      );
      const handoverAt = handoverAtFor(selected);
      const beforeHandover = advanceScenarioRuntime(
        selected,
        handoverAt - selected.now - 1,
        scenario01RuntimeDefinition,
        RECORDED_AT,
      );
      const completed = advanceScenarioRuntime(
        beforeHandover,
        1,
        scenario01RuntimeDefinition,
        RECORDED_AT,
      );

      expect(selected.status).toBe('running');
      expect(beforeHandover.status).toBe('running');
      expect(
        beforeHandover.events.some(
          (event) => event.id === scenario01Act4EventIds.handover,
        ),
      ).toBe(false);
      expect(completed.status).toBe('completed');
      expect(completed.phase).toBe('resolution');
      expect(completed.events.at(-1)?.type).toBe('scenario.completed');
    });
  }

  it('preserves the D2 service trade-off through completion', () => {
    const suwProtected = completedState(
      scenario01Decision2ActionIds.recommendGeneratorForSuw,
      scenario01Decision3ActionIds.targetedContingency,
    );
    const r4Protected = completedState(
      scenario01Decision2ActionIds.recommendGeneratorForR4,
      scenario01Decision3ActionIds.targetedContingency,
    );

    expect(
      suwProtected.observations.some(
        (observation) =>
          observation.id ===
          'observation.scenario-01.suw.generator-support-active',
      ),
    ).toBe(true);
    expect(
      suwProtected.observations.some(
        (observation) =>
          observation.id ===
          'observation.scenario-01.r4.link-quality-poor',
      ),
    ).toBe(true);
    expect(
      r4Protected.observations.some(
        (observation) =>
          observation.id === 'observation.scenario-01.r4.generator-power',
      ),
    ).toBe(true);
    expect(
      r4Protected.observations.some(
        (observation) =>
          observation.id ===
          'observation.scenario-01.suw.service-margin-declining',
      ),
    ).toBe(true);
  });

  it('stores factual unresolved items and current mitigations in the handover event', () => {
    const state = completedState(
      scenario01Decision2ActionIds.waitForGridRestoration,
      scenario01Decision3ActionIds.continueOperatorCoordination,
    );
    const handover = state.events.find(
      (event) => event.id === scenario01Act4EventIds.handover,
    );
    const payload = handover?.payload as
      | {
          currentMitigations?: string[];
          unresolvedItems?: string[];
        }
      | undefined;

    expect(payload?.currentMitigations).toEqual(
      expect.arrayContaining([
        expect.stringContaining('AG-400 remains unassigned'),
        expect.stringContaining('additional restoration confirmation'),
      ]),
    );
    expect(payload?.unresolvedItems).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Feeder F-12 remains isolated'),
        expect.stringContaining('grid-restoration window remains provisional'),
      ]),
    );
  });

  it('stops scenario time after completion', () => {
    const completed = completedState(
      scenario01Decision2ActionIds.recommendGeneratorForR4,
      scenario01Decision3ActionIds.recommendVoivodeshipCoordination,
    );
    const repeated = advanceScenarioRuntime(
      completed,
      10,
      scenario01RuntimeDefinition,
      RECORDED_AT,
    );

    expect(repeated).toBe(completed);
    expect(repeated.now).toBe(completed.now);
  });
});
