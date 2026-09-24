import type { ScenarioRuntimeState } from './runtime-state';

type RuntimeSnapshotListener = () => void;

let currentSnapshot: ScenarioRuntimeState | undefined;
const listeners = new Set<RuntimeSnapshotListener>();

export function publishRuntimeSnapshot(state: ScenarioRuntimeState): void {
  currentSnapshot = state;

  for (const listener of listeners) {
    listener();
  }
}

export function getRuntimeSnapshot(): ScenarioRuntimeState | undefined {
  return currentSnapshot;
}

export function subscribeRuntimeSnapshot(
  listener: RuntimeSnapshotListener,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
