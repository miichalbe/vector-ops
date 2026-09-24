import type {
  ActionId,
  Confidence,
  Observation,
  ScenarioTime,
} from '../../core/contracts';
import type { ScenarioTimeEventDefinition } from '../../core/runtime-events';
import type { ScenarioRuntimeState } from '../../core/runtime-state';
import { scenario01EntityIds } from './baseline';
import {
  scenario01Decision2ActionIds,
  scenario01Decision2Ids,
} from './decision-2-ids';
import {
  scenario01Decision3ActionIds,
  scenario01Decision3Ids,
} from './decision-3-ids';

export const scenario01Act4Offsets = {
  request: 1,
  targetedAcceptanceBase: 5,
  targetedActiveAfterAcceptance: 1,
  regionalAcceptanceBase: 4,
  regionalActiveAfterAcceptance: 3,
  confirmationRequest: 2,
  confirmationBase: 6,
  resolutionMinimum: 12,
  resolutionAfterMaterialEffect: 4,
  handoverAfterResolution: 2,
} as const;

export const scenario01Act4EventIds = {
  targetedRequested:
    'event.scenario-01.d3.targeted.notifications-requested',
  targetedAccepted:
    'event.scenario-01.d3.targeted.contingency-acknowledged',
  targetedActive:
    'event.scenario-01.d3.targeted.coordination-active',
  regionalRequested:
    'event.scenario-01.d3.regional.coordination-requested',
  regionalAccepted:
    'event.scenario-01.d3.regional.coordination-accepted',
  regionalActive:
    'event.scenario-01.d3.regional.coordination-active',
  confirmationRequested:
    'event.scenario-01.d3.operator.confirmation-requested',
  confirmationReceived:
    'event.scenario-01.d3.operator.confirmation-received',
  resolutionCheckpoint:
    'event.scenario-01.resolution.checkpoint',
  handover:
    'event.scenario-01.operational-handover',
} as const;

const highConfidence: Confidence = {
  level: 'high',
  reasons: [
    {
      type: 'source',
      effect: 'increase',
      description:
        'Current state received from the registered operational source.',
    },
  ],
};

const mediumReportConfidence: Confidence = {
  level: 'medium',
  reasons: [
    {
      type: 'source',
      effect: 'neutral',
      description:
        'Current operational report received through an independent human or operator channel.',
    },
  ],
};

function currentObservation(
  observation: Omit<Observation, 'quality' | 'confidence' | 'classification'>,
): Observation {
  return {
    ...observation,
    quality: 'good',
    confidence: highConfidence,
    classification: 'fact',
  };
}

function selectedDecision3Action(
  state: ScenarioRuntimeState,
): { actionId: ActionId; decidedAt: ScenarioTime } | undefined {
  const decision = state.decisions.find(
    (candidate) => candidate.id === scenario01Decision3Ids.coordinationPosture,
  );

  return decision?.selectedActionId && decision.decidedAt !== undefined
    ? {
        actionId: decision.selectedActionId,
        decidedAt: decision.decidedAt,
      }
    : undefined;
}

function selectedDecision2ActionId(
  state: ScenarioRuntimeState,
): ActionId | undefined {
  return state.decisions.find(
    (candidate) =>
      candidate.id === scenario01Decision2Ids.generatorRecommendation,
  )?.selectedActionId;
}

function reportDelay(state: ScenarioRuntimeState): number {
  return Math.min(2, state.run.parameters.information.reportDelayMinutes);
}

function targetedEvents(
  state: ScenarioRuntimeState,
  actionId: ActionId,
  decidedAt: ScenarioTime,
): {
  events: ScenarioTimeEventDefinition[];
  materialEffectAt: ScenarioTime;
} {
  const requestedAt = decidedAt + scenario01Act4Offsets.request;
  const acceptedAt =
    decidedAt +
    scenario01Act4Offsets.targetedAcceptanceBase +
    reportDelay(state);
  const activeAt =
    acceptedAt + scenario01Act4Offsets.targetedActiveAfterAcceptance;
  const correlationId = scenario01Decision3Ids.coordinationPosture;

  return {
    materialEffectAt: activeAt,
    events: [
      {
        id: scenario01Act4EventIds.targetedRequested,
        trigger: { type: 'scenarioTime', at: requestedAt },
        event: {
          type: 'action.requested',
          producer: { type: 'operator', id: 'primary-operator' },
          entityIds: [
            scenario01EntityIds.waterStation,
            scenario01EntityIds.communicationsGateway,
            scenario01EntityIds.countyHospital,
          ],
          correlationId,
          causationId: `event.${correlationId}.recorded`,
          payload: {
            actionId,
            posture: 'targeted-notification-contingency',
          },
        },
        effects: [
          {
            type: 'updateActionLifecycle',
            actionId,
            lifecycle: 'requested',
          },
        ],
      },
      {
        id: scenario01Act4EventIds.targetedAccepted,
        trigger: { type: 'scenarioTime', at: acceptedAt },
        event: {
          type: 'action.accepted',
          producer: {
            type: 'external',
            id: 'affected-organisations-coordination',
          },
          entityIds: [
            scenario01EntityIds.waterStation,
            scenario01EntityIds.communicationsGateway,
            scenario01EntityIds.countyHospital,
          ],
          correlationId,
          causationId: scenario01Act4EventIds.targetedRequested,
          payload: {
            actionId,
            acknowledgements: 'received',
          },
        },
        effects: [
          {
            type: 'updateActionLifecycle',
            actionId,
            lifecycle: 'accepted',
          },
          {
            type: 'appendObservation',
            observation: {
              id: 'observation.scenario-01.hospital.contingency-preparation-active',
              entityId: scenario01EntityIds.countyHospital,
              metric: 'health.contingencyPreparation',
              value: 'active',
              observedAt: acceptedAt - 1,
              receivedAt: acceptedAt,
              source: {
                type: 'human-report',
                id: 'hospital-duty-report',
                organisation: 'County Hospital Nowy Brzeg',
              },
              quality: 'good',
              confidence: mediumReportConfidence,
              classification: 'report',
              relatedEventId: scenario01Act4EventIds.targetedAccepted,
            },
          },
        ],
      },
      {
        id: scenario01Act4EventIds.targetedActive,
        trigger: { type: 'scenarioTime', at: activeAt },
        event: {
          type: 'coordination.targeted-posture.active',
          producer: { type: 'operator', id: 'primary-operator' },
          entityIds: [
            scenario01EntityIds.waterStation,
            scenario01EntityIds.communicationsGateway,
            scenario01EntityIds.countyHospital,
          ],
          correlationId,
          causationId: scenario01Act4EventIds.targetedAccepted,
          payload: {
            actionId,
            regionalCoordinationActive: false,
            localContingencyPreparation: true,
          },
        },
        effects: [
          {
            type: 'updateActionLifecycle',
            actionId,
            lifecycle: 'completed',
          },
        ],
      },
    ],
  };
}

function regionalEvents(
  state: ScenarioRuntimeState,
  actionId: ActionId,
  decidedAt: ScenarioTime,
): {
  events: ScenarioTimeEventDefinition[];
  materialEffectAt: ScenarioTime;
} {
  const requestedAt = decidedAt + scenario01Act4Offsets.request;
  const acceptedAt =
    decidedAt +
    scenario01Act4Offsets.regionalAcceptanceBase +
    reportDelay(state);
  const activeAt =
    acceptedAt + scenario01Act4Offsets.regionalActiveAfterAcceptance;
  const correlationId = scenario01Decision3Ids.coordinationPosture;

  return {
    materialEffectAt: activeAt,
    events: [
      {
        id: scenario01Act4EventIds.regionalRequested,
        trigger: { type: 'scenarioTime', at: requestedAt },
        event: {
          type: 'action.requested',
          producer: { type: 'operator', id: 'primary-operator' },
          entityIds: [
            scenario01EntityIds.gridSubstation,
            scenario01EntityIds.waterStation,
            scenario01EntityIds.communicationsGateway,
            scenario01EntityIds.countyHospital,
          ],
          correlationId,
          causationId: `event.${correlationId}.recorded`,
          payload: {
            actionId,
            recommendation: 'voivodeship-level-coordination',
          },
        },
        effects: [
          {
            type: 'updateActionLifecycle',
            actionId,
            lifecycle: 'requested',
          },
        ],
      },
      {
        id: scenario01Act4EventIds.regionalAccepted,
        trigger: { type: 'scenarioTime', at: acceptedAt },
        event: {
          type: 'action.accepted',
          producer: {
            type: 'external',
            id: 'voivodeship-coordination-authority',
          },
          entityIds: [
            scenario01EntityIds.gridSubstation,
            scenario01EntityIds.waterStation,
            scenario01EntityIds.communicationsGateway,
            scenario01EntityIds.countyHospital,
          ],
          correlationId,
          causationId: scenario01Act4EventIds.regionalRequested,
          payload: {
            actionId,
            recommendationAccepted: true,
          },
        },
        effects: [
          {
            type: 'updateActionLifecycle',
            actionId,
            lifecycle: 'accepted',
          },
        ],
      },
      {
        id: scenario01Act4EventIds.regionalActive,
        trigger: { type: 'scenarioTime', at: activeAt },
        event: {
          type: 'coordination.voivodeship-package.active',
          producer: {
            type: 'external',
            id: 'voivodeship-coordination-authority',
          },
          entityIds: [
            scenario01EntityIds.gridSubstation,
            scenario01EntityIds.waterStation,
            scenario01EntityIds.communicationsGateway,
            scenario01EntityIds.countyHospital,
          ],
          correlationId,
          causationId: scenario01Act4EventIds.regionalAccepted,
          payload: {
            actionId,
            regionalAwareness: 'active',
            responseCapacity: 'broader',
            coordinationLoad: 'increased',
          },
        },
        effects: [
          {
            type: 'updateActionLifecycle',
            actionId,
            lifecycle: 'completed',
          },
        ],
      },
    ],
  };
}

function confirmationEvents(
  state: ScenarioRuntimeState,
  actionId: ActionId,
  decidedAt: ScenarioTime,
): {
  events: ScenarioTimeEventDefinition[];
  materialEffectAt: ScenarioTime;
} {
  const requestedAt =
    decidedAt + scenario01Act4Offsets.confirmationRequest;
  const receivedAt =
    decidedAt +
    scenario01Act4Offsets.confirmationBase +
    reportDelay(state);
  const correlationId = scenario01Decision3Ids.coordinationPosture;
  const restorationWindowKnown = state.observations.some(
    (observation) =>
      observation.id === 'observation.scenario-01.gpz.restoration-window',
  );
  const restorationStatus = restorationWindowKnown
    ? 'provisional-window-reconfirmed'
    : 'field-work-continuing-no-firm-eta';

  return {
    materialEffectAt: receivedAt,
    events: [
      {
        id: scenario01Act4EventIds.confirmationRequested,
        trigger: { type: 'scenarioTime', at: requestedAt },
        event: {
          type: 'action.requested',
          producer: { type: 'operator', id: 'primary-operator' },
          entityIds: [scenario01EntityIds.gridSubstation],
          correlationId,
          causationId: `event.${correlationId}.recorded`,
          payload: {
            actionId,
            request: 'additional-operational-confirmation',
          },
        },
        effects: [
          {
            type: 'updateActionLifecycle',
            actionId,
            lifecycle: 'requested',
          },
        ],
      },
      {
        id: scenario01Act4EventIds.confirmationReceived,
        trigger: { type: 'scenarioTime', at: receivedAt },
        event: {
          type: 'information.additional-confirmation.received',
          producer: { type: 'external', id: 'gpz-operator-channel' },
          entityIds: [scenario01EntityIds.gridSubstation],
          correlationId,
          causationId: scenario01Act4EventIds.confirmationRequested,
          payload: {
            actionId,
            feederState: 'isolated',
            fieldInspection: 'continuing',
            restorationStatus,
          },
        },
        effects: [
          {
            type: 'updateActionLifecycle',
            actionId,
            lifecycle: 'accepted',
          },
          {
            type: 'updateActionLifecycle',
            actionId,
            lifecycle: 'completed',
          },
          {
            type: 'appendObservation',
            observation: {
              id: 'observation.scenario-01.gpz.additional-restoration-confirmation',
              entityId: scenario01EntityIds.gridSubstation,
              metric: 'power.restorationStatus',
              value: restorationStatus,
              observedAt: receivedAt - reportDelay(state),
              receivedAt,
              source: {
                type: 'external',
                id: 'gpz-operator-channel',
                organisation: 'Distribution System Operator',
              },
              quality: 'good',
              confidence: mediumReportConfidence,
              classification: 'report',
              relatedEventId: scenario01Act4EventIds.confirmationReceived,
            },
          },
        ],
      },
    ],
  };
}

function resolutionCheckpointEvent(
  at: ScenarioTime,
): ScenarioTimeEventDefinition {
  return {
    id: scenario01Act4EventIds.resolutionCheckpoint,
    trigger: { type: 'scenarioTime', at },
    event: {
      type: 'scenario.resolution.checkpoint',
      producer: { type: 'scenario', id: 'scenario-01' },
      entityIds: [
        scenario01EntityIds.gridSubstation,
        scenario01EntityIds.countyHospital,
      ],
      payload: {
        feederRestored: false,
        hospitalEssentialServices: 'maintained',
      },
    },
    effects: [
      {
        type: 'appendObservation',
        observation: currentObservation({
          id: 'observation.scenario-01.gpz.final-feeder-state',
          entityId: scenario01EntityIds.gridSubstation,
          metric: 'power.feederState',
          value: 'isolated',
          observedAt: at,
          receivedAt: at,
          source: { type: 'system', id: 'gpz-operator-channel' },
          relatedEventId: scenario01Act4EventIds.resolutionCheckpoint,
        }),
      },
      {
        type: 'appendObservation',
        observation: {
          id: 'observation.scenario-01.hospital.final-essential-services',
          entityId: scenario01EntityIds.countyHospital,
          metric: 'health.essentialServicesPosture',
          value: 'maintained',
          observedAt: at - 1,
          receivedAt: at,
          source: {
            type: 'human-report',
            id: 'hospital-duty-report',
            organisation: 'County Hospital Nowy Brzeg',
          },
          quality: 'good',
          confidence: mediumReportConfidence,
          classification: 'report',
          relatedEventId: scenario01Act4EventIds.resolutionCheckpoint,
        },
      },
    ],
  };
}

function handoverPayload(
  d2ActionId: ActionId | undefined,
  d3ActionId: ActionId,
) {
  const unresolvedItems = [
    'Feeder F-12 remains isolated; field restoration work is unresolved.',
    'Route Z-17 remains restricted and should be revalidated before further field movement.',
  ];
  const currentMitigations: string[] = [];

  switch (d2ActionId) {
    case scenario01Decision2ActionIds.recommendGeneratorForSuw:
      currentMitigations.push(
        'AG-400 is supporting SUW Kępa and water-service margin is stabilising.',
      );
      unresolvedItems.push(
        'R-4 primary communications remain degraded; fallback/manual coordination remains relevant.',
      );
      break;

    case scenario01Decision2ActionIds.recommendGeneratorForR4:
      currentMitigations.push(
        'AG-400 is supporting R-4 and communications / remote visibility are stabilising.',
      );
      unresolvedItems.push(
        'SUW Kępa remains on reduced pumping and water-service margin requires continued monitoring.',
      );
      break;

    case scenario01Decision2ActionIds.waitForGridRestoration:
      currentMitigations.push(
        'AG-400 remains unassigned while provisional grid-restoration information is retained.',
      );
      unresolvedItems.push(
        'Both communications and water-service margins require continued monitoring.',
        'The grid-restoration window remains provisional.',
      );
      break;
  }

  switch (d3ActionId) {
    case scenario01Decision3ActionIds.targetedContingency:
      currentMitigations.push(
        'Targeted notifications are acknowledged and local contingency preparation is active.',
      );
      unresolvedItems.push(
        'Broader voivodeship-level coordination is not active.',
      );
      break;

    case scenario01Decision3ActionIds.recommendVoivodeshipCoordination:
      currentMitigations.push(
        'Voivodeship-level coordination package is active with wider organisational awareness.',
      );
      unresolvedItems.push(
        'Increased coordination load remains while physical restoration is unresolved.',
      );
      break;

    case scenario01Decision3ActionIds.continueOperatorCoordination:
      currentMitigations.push(
        'Operator-level coordination continues with additional restoration confirmation received.',
      );
      unresolvedItems.push(
        'Broader coordination remains deferred and should be reconsidered if service margins worsen.',
      );
      break;
  }

  return {
    currentMitigations,
    unresolvedItems,
  };
}

function handoverEvent(
  state: ScenarioRuntimeState,
  at: ScenarioTime,
  d3ActionId: ActionId,
): ScenarioTimeEventDefinition {
  const d2ActionId = selectedDecision2ActionId(state);
  const payload = handoverPayload(d2ActionId, d3ActionId);

  return {
    id: scenario01Act4EventIds.handover,
    trigger: { type: 'scenarioTime', at },
    event: {
      type: 'operational.handover.prepared',
      producer: { type: 'operator', id: 'primary-operator' },
      entityIds: [
        scenario01EntityIds.gridSubstation,
        scenario01EntityIds.waterStation,
        scenario01EntityIds.communicationsGateway,
        scenario01EntityIds.countyHospital,
        scenario01EntityIds.mobileGenerator,
        scenario01EntityIds.accessRoute,
      ],
      correlationId: scenario01Decision3Ids.coordinationPosture,
      payload: {
        ...payload,
        decision2ActionId: d2ActionId,
        decision3ActionId: d3ActionId,
        hospitalEssentialServices: 'maintained',
      },
    },
  };
}

export function createScenario01Act4TimeEvents(
  state: ScenarioRuntimeState,
): ScenarioTimeEventDefinition[] {
  const selected = selectedDecision3Action(state);

  if (!selected) {
    return [];
  }

  let branch: {
    events: ScenarioTimeEventDefinition[];
    materialEffectAt: ScenarioTime;
  };

  switch (selected.actionId) {
    case scenario01Decision3ActionIds.targetedContingency:
      branch = targetedEvents(
        state,
        selected.actionId,
        selected.decidedAt,
      );
      break;

    case scenario01Decision3ActionIds.recommendVoivodeshipCoordination:
      branch = regionalEvents(
        state,
        selected.actionId,
        selected.decidedAt,
      );
      break;

    case scenario01Decision3ActionIds.continueOperatorCoordination:
      branch = confirmationEvents(
        state,
        selected.actionId,
        selected.decidedAt,
      );
      break;

    default:
      return [];
  }

  const resolutionAt = Math.max(
    selected.decidedAt + scenario01Act4Offsets.resolutionMinimum,
    branch.materialEffectAt +
      scenario01Act4Offsets.resolutionAfterMaterialEffect,
  );
  const handoverAt =
    resolutionAt + scenario01Act4Offsets.handoverAfterResolution;

  return [
    ...branch.events,
    resolutionCheckpointEvent(resolutionAt),
    handoverEvent(state, handoverAt, selected.actionId),
  ].sort((left, right) => {
    const timeDifference = left.trigger.at - right.trigger.at;

    return timeDifference !== 0
      ? timeDifference
      : left.id.localeCompare(right.id);
  });
}
