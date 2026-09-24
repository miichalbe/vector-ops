import { describe, expect, it } from 'vitest';

import type { ActionId } from '../core/contracts';
import { recordDecisionSelection } from '../core/runtime-decision-selection';
import { advanceScenarioRuntime } from '../core/runtime-step';
import {
  scenario01ActionIds,
  scenario01DecisionIds,
} from '../scenarios/scenario-01/decisions';
import {
  scenario01InitialState,
  scenario01RuntimeDefinition,
} from '../scenarios/scenario-01/scenario';
import { buildOperationalTimeline } from './operational-timeline';

const RECORDED_AT = '2026-09-24T13:10:00.000Z';

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

function stateAfterDecision1(actionId: ActionId, elapsedMinutes: number) {
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

describe('Operational Timeline view model', () => {
  it('combines baseline observations from all monitored entities in one stream', () => {
    const entries = buildOperationalTimeline(scenario01InitialState);
    const observationEntries = entries.filter(
      (entry) => entry.kind === 'observation',
    );

    expect(observationEntries).toHaveLength(
      scenario01InitialState.observations.length,
    );
    expect(
      new Set(observationEntries.map((entry) => entry.entityId)).size,
    ).toBe(scenario01InitialState.entityOrder.length);
    expect(
      entries.every(
        (entry, index) =>
          index === 0 ||
          entries[index - 1]!.scenarioTime >= entry.scenarioTime,
      ),
    ).toBe(true);
  });

  it('makes D1-A synchronised confirmation visible before the physical cascade', () => {
    const state = stateAfterDecision1(
      scenario01ActionIds.openCrossDomainIncident,
      4,
    );
    const entries = buildOperationalTimeline(state);

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'coordination',
          label: 'Confirmation',
          title: 'Cross-domain coordination',
          summary:
            'Synchronised confirmation received; shared cause and persistence remain unconfirmed.',
        }),
      ]),
    );
  });

  it('makes D1-C regional acknowledgement visible', () => {
    const state = stateAfterDecision1(
      scenario01ActionIds.recommendRegionalEscalation,
      3,
    );
    const entries = buildOperationalTimeline(state);

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'coordination',
          label: 'Acknowledgement',
          title: 'Regional coordination',
        }),
      ]),
    );
  });

  it('does not fabricate coordination confirmation for D1-B', () => {
    const state = stateAfterDecision1(
      scenario01ActionIds.continueSeparateMonitoring,
      4,
    );
    const entries = buildOperationalTimeline(state);

    expect(
      entries.some((entry) => entry.kind === 'coordination'),
    ).toBe(false);
    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'decision',
          title: 'Action recorded',
          summary: 'Continue separate monitoring',
        }),
      ]),
    );
  });

  it('surfaces the persistent feeder observation and revised Assessment', () => {
    const state = stateAfterDecision1(
      scenario01ActionIds.continueSeparateMonitoring,
      11,
    );
    const entries = buildOperationalTimeline(state);

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'observation',
          title: 'GPZ Brzeziny',
          summary: 'Feeder F-12: isolated',
        }),
        expect.objectContaining({
          kind: 'assessment',
          label: 'Assessment revised',
          summary:
            'Persistent F-12 disruption confirms continuing risk to dependent services',
        }),
      ]),
    );
  });
});
