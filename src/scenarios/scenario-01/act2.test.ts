import { describe, expect, it } from 'vitest';

import type { ActionId, Decision } from '../../core/contracts';
import { advanceScenarioTime } from '../../core/runtime-clock';
import { processDueScenarioTimeEvents } from '../../core/runtime-events';
import { scenario01ActionIds, scenario01DecisionIds } from './decisions';
import { scenario01InitialState } from './scenario';
import {
  createScenario01Act2TimeEvents,
  scenario01Act2Offsets,
} from './act2';

const RECORDED_AT = '2026-09-24T11:20:00.000Z';
const DECIDED_AT = 7 * 60 + 53;

function stateAfterDecision(actionId: ActionId) {
  const decision: Decision = {
    id: scenario01DecisionIds.informationPosture,
    openedAt: DECIDED_AT - 2,
    actionIds: Object.values(scenario01ActionIds),
    evidenceIds: [],
    unknowns: [],
    assumptions: [],
    selectedActionId: actionId,
    decidedAt: DECIDED_AT,
    expectedEffects: [],
    observedEffects: [],
  };

  return {
    ...scenario01InitialState,
    now: DECIDED_AT,
    status: 'running' as const,
    decisions: [decision],
  };
}

const sharedAct2EventIds = [
  'event.scenario-01.gpz.f12-isolated',
  'event.scenario-01.r4.backup-power',
  'event.scenario-01.z17.restricted',
  'event.scenario-01.suw.reduced-pumping',
  'event.scenario-01.suw.visibility-degraded',
];

describe('Scenario 01 Act 2 timeline', () => {
  it('keeps the same physical Act 2 spine for all Decision 1 choices', () => {
    for (const actionId of Object.values(scenario01ActionIds)) {
      const definitions = createScenario01Act2TimeEvents(
        stateAfterDecision(actionId),
      );
      const sharedDefinitions = definitions.filter((definition) =>
        sharedAct2EventIds.includes(definition.id),
      );

      expect(sharedDefinitions.map((definition) => definition.id)).toEqual(
        sharedAct2EventIds,
      );
      expect(
        sharedDefinitions.map((definition) => definition.trigger.at),
      ).toEqual([
        DECIDED_AT + scenario01Act2Offsets.feederIsolation,
        DECIDED_AT + scenario01Act2Offsets.r4BackupPower,
        DECIDED_AT + scenario01Act2Offsets.routeRestriction,
        DECIDED_AT + scenario01Act2Offsets.reducedPumping,
        DECIDED_AT + scenario01Act2Offsets.visibilityDegradation,
      ]);
    }
  });

  it('adds early synchronised confirmation only for D1-A', () => {
    const definitions = createScenario01Act2TimeEvents(
      stateAfterDecision(scenario01ActionIds.openCrossDomainIncident),
    );
    const confirmation = definitions.find(
      (definition) =>
        definition.id ===
        'event.scenario-01.d1.synchronised-confirmation',
    );

    expect(confirmation?.trigger.at).toBe(DECIDED_AT + 4);
    expect(confirmation?.event.payload).toMatchObject({
      confidenceSupport: 'moderate',
      coordinationLoad: 'increased',
      sharedCauseConfirmed: false,
      persistenceConfirmed: false,
    });
  });

  it('adds no synthetic confirmation or regional acknowledgement for D1-B', () => {
    const definitions = createScenario01Act2TimeEvents(
      stateAfterDecision(scenario01ActionIds.continueSeparateMonitoring),
    );

    expect(definitions.map((definition) => definition.id)).toEqual(
      sharedAct2EventIds,
    );
  });

  it('adds early regional acknowledgement without confidence support for D1-C', () => {
    const definitions = createScenario01Act2TimeEvents(
      stateAfterDecision(scenario01ActionIds.recommendRegionalEscalation),
    );
    const acknowledgement = definitions.find(
      (definition) =>
        definition.id ===
        'event.scenario-01.d1.regional-escalation-acknowledged',
    );

    expect(acknowledgement?.trigger.at).toBe(DECIDED_AT + 3);
    expect(acknowledgement?.event.payload).toMatchObject({
      regionalAwareness: 'early',
      coordinationLoad: 'increased',
      operationalConfirmationPending: true,
    });
  });

  it('materializes the shared physical observations from the recorded decision time', () => {
    const state = stateAfterDecision(
      scenario01ActionIds.continueSeparateMonitoring,
    );
    const definitions = createScenario01Act2TimeEvents(state);
    const advancedState = advanceScenarioTime(
      state,
      scenario01Act2Offsets.visibilityDegradation,
    );
    const processedState = processDueScenarioTimeEvents(
      advancedState,
      definitions,
      RECORDED_AT,
    );
    const act2Observations = processedState.observations.slice(
      scenario01InitialState.observations.length,
    );

    expect(processedState.events.map((event) => event.id)).toEqual(
      sharedAct2EventIds,
    );
    expect(
      act2Observations.find(
        (observation) => observation.id === 'observation.scenario-01.gpz.f12-isolated',
      )?.value,
    ).toBe('isolated');
    expect(
      act2Observations.find(
        (observation) => observation.id === 'observation.scenario-01.r4.backup-power',
      )?.value,
    ).toBe('backup');
    expect(
      act2Observations.find(
        (observation) => observation.id === 'observation.scenario-01.z17.travel-time-revised',
      )?.value,
    ).toBe(23.4);
    expect(
      act2Observations.find(
        (observation) => observation.id === 'observation.scenario-01.suw.telemetry-stale',
      )?.quality,
    ).toBe('degraded');
  });
});
