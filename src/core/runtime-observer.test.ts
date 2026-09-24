import { describe, expect, it, vi } from 'vitest';

import {
  getRuntimeSnapshot,
  publishRuntimeSnapshot,
  subscribeRuntimeSnapshot,
} from './runtime-observer';
import { scenario01InitialState } from '../scenarios/scenario-01/scenario';

describe('runtime presentation observer', () => {
  it('publishes immutable runtime snapshots to subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeRuntimeSnapshot(listener);

    publishRuntimeSnapshot(scenario01InitialState);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(getRuntimeSnapshot()).toBe(scenario01InitialState);

    unsubscribe();
    publishRuntimeSnapshot({
      ...scenario01InitialState,
      now: scenario01InitialState.now + 1,
    });

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
