import type { ActionId } from '../../core/contracts';
import { scenario01ActionIds } from './decisions';

export type Decision1ConfirmationBehaviour =
  | 'synchronised'
  | 'organic';

export type Decision1ConfidenceSupport = 'none' | 'moderate';
export type Decision1RegionalAwareness = 'normal' | 'early';
export type Decision1CoordinationLoad = 'normal' | 'increased';

export interface Decision1DownstreamModifiers {
  confirmationBehaviour: Decision1ConfirmationBehaviour;
  confirmationDelayDeltaMinutes: number;
  confidenceSupport: Decision1ConfidenceSupport;
  regionalAwareness: Decision1RegionalAwareness;
  coordinationLoad: Decision1CoordinationLoad;
}

type Decision1ActionId =
  (typeof scenario01ActionIds)[keyof typeof scenario01ActionIds];

const downstreamModifiersByAction = {
  [scenario01ActionIds.openCrossDomainIncident]: {
    confirmationBehaviour: 'synchronised',
    confirmationDelayDeltaMinutes: -4,
    confidenceSupport: 'moderate',
    regionalAwareness: 'normal',
    coordinationLoad: 'increased',
  },
  [scenario01ActionIds.continueSeparateMonitoring]: {
    confirmationBehaviour: 'organic',
    confirmationDelayDeltaMinutes: 4,
    confidenceSupport: 'none',
    regionalAwareness: 'normal',
    coordinationLoad: 'normal',
  },
  [scenario01ActionIds.recommendRegionalEscalation]: {
    confirmationBehaviour: 'organic',
    confirmationDelayDeltaMinutes: 0,
    confidenceSupport: 'none',
    regionalAwareness: 'early',
    coordinationLoad: 'increased',
  },
} as const satisfies Record<
  Decision1ActionId,
  Decision1DownstreamModifiers
>;

export function getDecision1DownstreamModifiers(
  actionId: ActionId,
): Decision1DownstreamModifiers {
  const modifiers = downstreamModifiersByAction[
    actionId as Decision1ActionId
  ];

  if (!modifiers) {
    throw new Error(
      `Action ${actionId} does not define a Decision 1 downstream outcome.`,
    );
  }

  return { ...modifiers };
}
