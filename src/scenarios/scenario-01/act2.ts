import type {
  Observation,
  ScenarioTime,
} from '../../core/contracts';
import type { ScenarioTimeEventDefinition } from '../../core/runtime-events';
import type { ScenarioRuntimeState } from '../../core/runtime-state';
import { scenario01EntityIds } from './baseline';
import { scenario01DecisionIds } from './decisions';
import { getDecision1DownstreamModifiers } from './decision-1-outcomes';

const SYNCHRONISED_CONFIRMATION_BASE_DELAY_MINUTES = 8;
const REGIONAL_ACKNOWLEDGEMENT_DELAY_MINUTES = 3;

export const scenario01Act2Offsets = {
  feederIsolation: 11,
  r4BackupPower: 16,
  routeRestriction: 21,
  reducedPumping: 23,
  visibilityDegradation: 25,
  decision2Maturity: 29,
} as const;

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function currentSystemObservation(
  observation: Omit<Observation, 'quality' | 'confidence' | 'classification'>,
): Observation {
  return {
    ...observation,
    quality: 'good',
    confidence: {
      level: 'high',
      reasons: [
        {
          type: 'source',
          effect: 'increase',
          description:
            'Current state received from the registered operational source.',
        },
      ],
    },
    classification: 'fact',
  };
}

function createSharedAct2Events(
  state: ScenarioRuntimeState,
  decidedAt: ScenarioTime,
): ScenarioTimeEventDefinition[] {
  const feederIsolationAt =
    decidedAt + scenario01Act2Offsets.feederIsolation;
  const r4BackupAt =
    decidedAt + scenario01Act2Offsets.r4BackupPower;
  const routeRestrictionAt =
    decidedAt + scenario01Act2Offsets.routeRestriction;
  const reducedPumpingAt =
    decidedAt + scenario01Act2Offsets.reducedPumping;
  const visibilityDegradationAt =
    decidedAt + scenario01Act2Offsets.visibilityDegradation;
  const restrictedTravelTimeMinutes = roundToOneDecimal(
    18 * state.run.parameters.access.travelTimeMultiplier,
  );
  const reducedPressureBar = roundToOneDecimal(
    3.6 * state.run.parameters.resources.serviceMarginMultiplier,
  );
  const visibilityDelay = Math.max(
    1,
    state.run.parameters.information.reportDelayMinutes,
  );

  return [
    {
      id: 'event.scenario-01.gpz.f12-isolated',
      trigger: { type: 'scenarioTime', at: feederIsolationAt },
      event: {
        type: 'power.feeder.isolated',
        producer: { type: 'scenario', id: 'scenario-01' },
        entityIds: [scenario01EntityIds.gridSubstation],
        payload: {
          feederId: 'F-12',
          state: 'isolated',
          restorationEstimateKnown: false,
        },
      },
      effects: [
        {
          type: 'appendObservation',
          observation: currentSystemObservation({
            id: 'observation.scenario-01.gpz.f12-isolated',
            entityId: scenario01EntityIds.gridSubstation,
            metric: 'power.feederState',
            value: 'isolated',
            observedAt: feederIsolationAt,
            receivedAt: feederIsolationAt,
            source: { type: 'system', id: 'gpz-operator-channel' },
            relatedEventId: 'event.scenario-01.gpz.f12-isolated',
          }),
        },
      ],
    },
    {
      id: 'event.scenario-01.r4.backup-power',
      trigger: { type: 'scenarioTime', at: r4BackupAt },
      event: {
        type: 'communications.power.backup',
        producer: { type: 'scenario', id: 'scenario-01' },
        entityIds: [scenario01EntityIds.communicationsGateway],
        causationId: 'event.scenario-01.gpz.f12-isolated',
        payload: {
          powerMode: 'backup',
          backupMargin: 'finite',
        },
      },
      effects: [
        {
          type: 'appendObservation',
          observation: currentSystemObservation({
            id: 'observation.scenario-01.r4.backup-power',
            entityId: scenario01EntityIds.communicationsGateway,
            metric: 'communications.powerMode',
            value: 'backup',
            observedAt: r4BackupAt,
            receivedAt: r4BackupAt,
            source: { type: 'telemetry', id: 'r4-telemetry' },
            relatedEventId: 'event.scenario-01.r4.backup-power',
          }),
        },
      ],
    },
    {
      id: 'event.scenario-01.z17.restricted',
      trigger: { type: 'scenarioTime', at: routeRestrictionAt },
      event: {
        type: 'logistics.route.restricted',
        producer: { type: 'scenario', id: 'scenario-01' },
        entityIds: [scenario01EntityIds.accessRoute],
        payload: {
          routeState: 'restricted',
          estimatedTravelTimeMinutes: restrictedTravelTimeMinutes,
        },
      },
      effects: [
        {
          type: 'appendObservation',
          observation: currentSystemObservation({
            id: 'observation.scenario-01.z17.restricted',
            entityId: scenario01EntityIds.accessRoute,
            metric: 'logistics.routeState',
            value: 'restricted',
            observedAt: routeRestrictionAt,
            receivedAt: routeRestrictionAt,
            source: {
              type: 'external',
              id: 'road-authority-feed',
              organisation: 'Nowy Brzeg Road Authority',
            },
            relatedEventId: 'event.scenario-01.z17.restricted',
          }),
        },
        {
          type: 'appendObservation',
          observation: currentSystemObservation({
            id: 'observation.scenario-01.z17.travel-time-revised',
            entityId: scenario01EntityIds.accessRoute,
            metric: 'logistics.estimatedTravelTime',
            value: restrictedTravelTimeMinutes,
            unit: 'min',
            observedAt: routeRestrictionAt,
            receivedAt: routeRestrictionAt,
            source: {
              type: 'external',
              id: 'road-authority-feed',
              organisation: 'Nowy Brzeg Road Authority',
            },
            relatedEventId: 'event.scenario-01.z17.restricted',
          }),
        },
      ],
    },
    {
      id: 'event.scenario-01.suw.reduced-pumping',
      trigger: { type: 'scenarioTime', at: reducedPumpingAt },
      event: {
        type: 'water.pumping.reduced',
        producer: { type: 'scenario', id: 'scenario-01' },
        entityIds: [scenario01EntityIds.waterStation],
        causationId: 'event.scenario-01.gpz.f12-isolated',
        payload: {
          operatingMode: 'reduced',
          outputPressureBar: reducedPressureBar,
        },
      },
      effects: [
        {
          type: 'appendObservation',
          observation: currentSystemObservation({
            id: 'observation.scenario-01.suw.reduced-pumping',
            entityId: scenario01EntityIds.waterStation,
            metric: 'water.pumpState',
            value: {
              pump1: 'running',
              pump2: 'stopped',
              pump3: 'standby',
            },
            observedAt: reducedPumpingAt,
            receivedAt: reducedPumpingAt,
            source: { type: 'telemetry', id: 'suw-telemetry-via-r4' },
            relatedEventId: 'event.scenario-01.suw.reduced-pumping',
          }),
        },
        {
          type: 'appendObservation',
          observation: currentSystemObservation({
            id: 'observation.scenario-01.suw.reduced-pressure',
            entityId: scenario01EntityIds.waterStation,
            metric: 'water.outputPressure',
            value: reducedPressureBar,
            unit: 'bar',
            observedAt: reducedPumpingAt,
            receivedAt: reducedPumpingAt,
            source: { type: 'telemetry', id: 'suw-telemetry-via-r4' },
            relatedEventId: 'event.scenario-01.suw.reduced-pumping',
          }),
        },
      ],
    },
    {
      id: 'event.scenario-01.suw.visibility-degraded',
      trigger: { type: 'scenarioTime', at: visibilityDegradationAt },
      event: {
        type: 'communications.visibility.degraded',
        producer: { type: 'scenario', id: 'scenario-01' },
        entityIds: [
          scenario01EntityIds.communicationsGateway,
          scenario01EntityIds.waterStation,
        ],
        causationId: 'event.scenario-01.r4.backup-power',
        payload: {
          r4LinkQuality: 'degraded',
          suwTelemetryFreshness: 'stale',
        },
      },
      effects: [
        {
          type: 'appendObservation',
          observation: {
            id: 'observation.scenario-01.r4.link-quality-degraded',
            entityId: scenario01EntityIds.communicationsGateway,
            metric: 'communications.linkQuality',
            value: 'degraded',
            observedAt: visibilityDegradationAt,
            receivedAt: visibilityDegradationAt,
            source: { type: 'telemetry', id: 'r4-telemetry' },
            quality: 'degraded',
            confidence: {
              level: 'medium',
              reasons: [
                {
                  type: 'trend',
                  effect: 'decrease',
                  description:
                    'R-4 link quality continues to degrade while operating on finite backup power.',
                },
              ],
            },
            classification: 'fact',
            relatedEventId: 'event.scenario-01.suw.visibility-degraded',
          },
        },
        {
          type: 'appendObservation',
          observation: {
            id: 'observation.scenario-01.suw.telemetry-stale',
            entityId: scenario01EntityIds.waterStation,
            metric: 'water.telemetryFreshness',
            value: 'stale',
            observedAt: visibilityDegradationAt - visibilityDelay,
            receivedAt: visibilityDegradationAt,
            source: { type: 'telemetry', id: 'suw-telemetry-via-r4' },
            quality: 'degraded',
            confidence: {
              level: 'medium',
              reasons: [
                {
                  type: 'source',
                  effect: 'decrease',
                  description:
                    'SUW telemetry is arriving through a degraded R-4 communications path.',
                },
              ],
            },
            classification: 'fact',
            relatedEventId: 'event.scenario-01.suw.visibility-degraded',
          },
        },
      ],
    },
  ];
}

export function createScenario01Act2TimeEvents(
  state: ScenarioRuntimeState,
): ScenarioTimeEventDefinition[] {
  const decision = state.decisions.find(
    (candidate) => candidate.id === scenario01DecisionIds.informationPosture,
  );

  if (!decision?.selectedActionId || decision.decidedAt === undefined) {
    return [];
  }

  const modifiers = getDecision1DownstreamModifiers(
    decision.selectedActionId,
  );
  const events = createSharedAct2Events(state, decision.decidedAt);
  const decisionRecordedEventId = `event.${decision.id}.recorded`;

  if (modifiers.confirmationBehaviour === 'synchronised') {
    const confirmationDelay = Math.max(
      1,
      SYNCHRONISED_CONFIRMATION_BASE_DELAY_MINUTES +
        modifiers.confirmationDelayDeltaMinutes,
    );

    events.push({
      id: 'event.scenario-01.d1.synchronised-confirmation',
      trigger: {
        type: 'scenarioTime',
        at: decision.decidedAt + confirmationDelay,
      },
      event: {
        type: 'information.cross-domain-confirmed',
        producer: { type: 'external', id: 'coordinated-operator-channels' },
        entityIds: [
          scenario01EntityIds.gridSubstation,
          scenario01EntityIds.waterStation,
          scenario01EntityIds.communicationsGateway,
        ],
        correlationId: decision.id,
        causationId: decisionRecordedEventId,
        payload: {
          confidenceSupport: modifiers.confidenceSupport,
          coordinationLoad: modifiers.coordinationLoad,
          sharedCauseConfirmed: false,
          persistenceConfirmed: false,
        },
      },
    });
  }

  if (modifiers.regionalAwareness === 'early') {
    events.push({
      id: 'event.scenario-01.d1.regional-escalation-acknowledged',
      trigger: {
        type: 'scenarioTime',
        at:
          decision.decidedAt +
          REGIONAL_ACKNOWLEDGEMENT_DELAY_MINUTES,
      },
      event: {
        type: 'coordination.regional-recommendation.acknowledged',
        producer: { type: 'external', id: 'regional-coordination-chain' },
        entityIds: [
          scenario01EntityIds.gridSubstation,
          scenario01EntityIds.waterStation,
          scenario01EntityIds.communicationsGateway,
        ],
        correlationId: decision.id,
        causationId: decisionRecordedEventId,
        payload: {
          regionalAwareness: 'early',
          coordinationLoad: modifiers.coordinationLoad,
          operationalConfirmationPending: true,
        },
      },
    });
  }

  return events.sort((left, right) => {
    const timeDifference = left.trigger.at - right.trigger.at;

    return timeDifference !== 0
      ? timeDifference
      : left.id.localeCompare(right.id);
  });
}
