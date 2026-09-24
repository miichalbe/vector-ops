import { describe, expect, it } from 'vitest';

import type { DomainEvent } from '../core/contracts';
import { scenario01InitialState } from '../scenarios/scenario-01/scenario';
import { buildOperationalTimeline } from './operational-timeline';

const RECORDED_AT = '2026-09-24T17:30:00.000Z';

function event(
  id: string,
  type: string,
  scenarioTime: number,
): DomainEvent {
  return {
    id,
    type,
    version: 1,
    scenarioTime,
    recordedAt: RECORDED_AT,
    producer: { type: 'scenario', id: 'scenario-01' },
    payload: {},
  };
}

describe('Operational Timeline final-phase entries', () => {
  it('surfaces material D3 responses and operational handover without exposing low-level action events', () => {
    const state = {
      ...scenario01InitialState,
      now: scenario01InitialState.now + 90,
      events: [
        event(
          'event.test.targeted',
          'coordination.targeted-posture.active',
          scenario01InitialState.now + 80,
        ),
        event(
          'event.test.regional',
          'coordination.voivodeship-package.active',
          scenario01InitialState.now + 81,
        ),
        event(
          'event.test.confirmation',
          'information.additional-confirmation.received',
          scenario01InitialState.now + 82,
        ),
        event(
          'event.test.requested',
          'action.requested',
          scenario01InitialState.now + 83,
        ),
        event(
          'event.test.handover',
          'operational.handover.prepared',
          scenario01InitialState.now + 84,
        ),
      ],
    };
    const entries = buildOperationalTimeline(state);

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Coordination',
          title: 'Targeted contingency posture',
        }),
        expect.objectContaining({
          label: 'Coordination',
          title: 'Voivodeship-level coordination',
        }),
        expect.objectContaining({
          label: 'Confirmation',
          title: 'Additional operator confirmation',
        }),
        expect.objectContaining({
          label: 'Handover',
          title: 'Operational phase complete',
          summary:
            'Current mitigations and unresolved dependencies are prepared for handover.',
        }),
      ]),
    );
    expect(
      entries.some((entry) => entry.id === 'timeline.event.test.requested'),
    ).toBe(false);
  });
});
