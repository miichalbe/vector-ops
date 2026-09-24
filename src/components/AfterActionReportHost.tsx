import { useSyncExternalStore } from 'react';

import AfterActionReport from './AfterActionReport';
import {
  getRuntimeSnapshot,
  subscribeRuntimeSnapshot,
} from '../core/runtime-observer';

export default function AfterActionReportHost() {
  const runtimeState = useSyncExternalStore(
    subscribeRuntimeSnapshot,
    getRuntimeSnapshot,
    () => undefined,
  );

  return runtimeState?.status === 'completed' ? (
    <AfterActionReport runtimeState={runtimeState} />
  ) : null;
}
