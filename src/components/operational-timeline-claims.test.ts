import { describe, expect, it } from 'vitest';

import { advanceScenarioRuntime } from '../core/runtime-step';
import {
  scenario01InitialState,
  scenario01RuntimeDefinition,
} from '../scenarios/scenario-01/scenario';
import { buildOperationalTimeline } from './operational-timeline';

const RECORDED_AT = '2026-09-24T19:45:00.000Z';

describe('Operational Timeline claim targets', () => {
  it('links Assessment and Projection entries to their claim families', () => {
    const finalOpeningTime =
      scenario01RuntimeDefinition.timeEvents.at(-1)?.trigger.at;

    if (finalOpeningTime === undefined) {
      throw new Error('Expected Scenario 01 opening events.');
    }

    const state = advanceScenarioRuntime(
      scenario01InitialState,
      finalOpeningTime - scenario01InitialState.now,
      scenario01RuntimeDefinition,
      RECORDED_AT,
    );
    const entries = buildOperationalTimeline(state);
    const assessmentEntry = entries.find(
      (entry) => entry.kind === 'assessment',
    );
    const projectionEntry = entries.find(
      (entry) => entry.kind === 'projection',
    );

    expect(assessmentEntry?.claimId).toBe(state.assessments.at(-1)?.id);
    expect(projectionEntry?.claimId).toBe(state.projections.at(-1)?.id);
  });
});
