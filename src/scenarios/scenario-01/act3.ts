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
  scenario01ActionIds,
  scenario01DecisionIds,
} from './decision-1-ids';
import {
  scenario01Decision2ActionIds,
  scenario01Decision2Ids,
} from './decision-2-ids';

export const scenario01Act3Offsets = {
  request: 1,
  acceptanceBase: 4,
  preparingAfterAcceptance: 1,
  enRouteAfterAcceptance: 3,
  onSiteToConnecting: 2,
  connectingToOperational: 2,
  waitRestorationBase: 6,
  displacedRisk: 18,
  hospitalMinimum: 35,
  hospitalAfterMaterialEffect: 3,
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
        'Operational human report received through an independent channel.',
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

function latestObservation(
  state: ScenarioRuntimeState,
  entityId: string,
  metric: string,
): Observation | undefined {
  return state.observations
    .filter(
      (observation) =>
        observation.entityId === entityId && observation.metric === metric,
    )
    .reduce<Observation | undefined>(
      (latest, observation) =>
        !latest || observation.receivedAt > latest.receivedAt
          ? observation
          : latest,
      undefined,
    );
}

function selectedDecision2Action(
  state: ScenarioRuntimeState,
): { actionId: ActionId; decidedAt: ScenarioTime } | undefined {
  const decision = state.decisions.find(
    (candidate) => candidate.id === scenario01Decision2Ids.generatorRecommendation,
  );

  return decision?.selectedActionId && decision.decidedAt !== undefined
    ? {
        actionId: decision.selectedActionId,
        decidedAt: decision.decidedAt,
      }
    : undefined;
}

function externalAcceptanceDelay(state: ScenarioRuntimeState): number {
  const decision1 = state.decisions.find(
    (candidate) => candidate.id === scenario01DecisionIds.informationPosture,
  );
  const earlyRegionalAwareness =
    decision1?.selectedActionId ===
    scenario01ActionIds.recommendRegionalEscalation;
  const informationDelay = Math.min(
    2,
    Math.floor(state.run.parameters.information.reportDelayMinutes / 2),
  );

  return Math.max(
    2,
    scenario01Act3Offsets.acceptanceBase +
      informationDelay -
      (earlyRegionalAwareness ? 1 : 0),
  );
}

function routeTravelMinutes(state: ScenarioRuntimeState): number {
  const observation = latestObservation(
    state,
    scenario01EntityIds.accessRoute,
    'logistics.estimatedTravelTime',
  );

  return typeof observation?.value === 'number'
    ? Math.max(1, Math.round(observation.value))
    : 18;
}

function resourceStateObservation(
  id: string,
  relatedEventId: string,
  at: ScenarioTime,
  value: string,
): Observation {
  return currentObservation({
    id,
    entityId: scenario01EntityIds.mobileGenerator,
    metric: 'logistics.resourceState',
    value,
    observedAt: at,
    receivedAt: at,
    source: { type: 'system', id: 'wczk-resource-registry' },
    relatedEventId,
  });
}

function deploymentEvents(
  state: ScenarioRuntimeState,
  actionId: ActionId,
  decidedAt: ScenarioTime,
  target: 'suw' | 'r4',
): {
  events: ScenarioTimeEventDefinition[];
  operationalAt: ScenarioTime;
} {
  const targetEntityId =
    target === 'suw'
      ? scenario01EntityIds.waterStation
      : scenario01EntityIds.communicationsGateway;
  const targetName = target === 'suw' ? 'SUW Kępa' : 'R-4';
  const requestedAt = decidedAt + scenario01Act3Offsets.request;
  const acceptedAt = decidedAt + externalAcceptanceDelay(state);
  const preparingAt =
    acceptedAt + scenario01Act3Offsets.preparingAfterAcceptance;
  const enRouteAt =
    acceptedAt +
    scenario01Act3Offsets.enRouteAfterAcceptance +
    state.run.parameters.resources.generatorPreparationDelayMinutes;
  const travelMinutes = routeTravelMinutes(state);
  const onSiteAt = enRouteAt + travelMinutes;
  const connectingAt = onSiteAt + scenario01Act3Offsets.onSiteToConnecting;
  const operationalAt =
    connectingAt + scenario01Act3Offsets.connectingToOperational;
  const correlationId = scenario01Decision2Ids.generatorRecommendation;
  const decisionEventId = `event.${correlationId}.recorded`;

  const requestedEventId = `event.scenario-01.d2.${target}.generator-requested`;
  const acceptedEventId = `event.scenario-01.d2.${target}.generator-accepted`;
  const preparingEventId = `event.scenario-01.d2.${target}.generator-preparing`;
  const enRouteEventId = `event.scenario-01.d2.${target}.generator-en-route`;
  const onSiteEventId = `event.scenario-01.d2.${target}.generator-on-site`;
  const connectingEventId = `event.scenario-01.d2.${target}.generator-connecting`;
  const operationalEventId = `event.scenario-01.d2.${target}.generator-operational`;

  const events: ScenarioTimeEventDefinition[] = [
    {
      id: requestedEventId,
      trigger: { type: 'scenarioTime', at: requestedAt },
      event: {
        type: 'action.requested',
        producer: { type: 'operator', id: 'primary-operator' },
        entityIds: [scenario01EntityIds.mobileGenerator, targetEntityId],
        correlationId,
        causationId: decisionEventId,
        payload: { actionId, targetEntityId },
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
      id: acceptedEventId,
      trigger: { type: 'scenarioTime', at: acceptedAt },
      event: {
        type: 'action.accepted',
        producer: { type: 'external', id: 'mobile-power-operator' },
        entityIds: [scenario01EntityIds.mobileGenerator, targetEntityId],
        correlationId,
        causationId: requestedEventId,
        payload: { actionId, targetEntityId, targetName },
      },
      effects: [
        {
          type: 'updateActionLifecycle',
          actionId,
          lifecycle: 'accepted',
        },
        {
          type: 'appendObservation',
          observation: resourceStateObservation(
            `observation.scenario-01.ag400.${target}.reserved`,
            acceptedEventId,
            acceptedAt,
            'reserved',
          ),
        },
        {
          type: 'appendObservation',
          observation: currentObservation({
            id: `observation.scenario-01.ag400.${target}.assignment`,
            entityId: scenario01EntityIds.mobileGenerator,
            metric: 'logistics.assignment',
            value: targetName,
            observedAt: acceptedAt,
            receivedAt: acceptedAt,
            source: { type: 'system', id: 'wczk-resource-registry' },
            relatedEventId: acceptedEventId,
          }),
        },
      ],
    },
    {
      id: preparingEventId,
      trigger: { type: 'scenarioTime', at: preparingAt },
      event: {
        type: 'logistics.resource.preparing',
        producer: { type: 'external', id: 'mobile-power-operator' },
        entityIds: [scenario01EntityIds.mobileGenerator],
        correlationId,
        causationId: acceptedEventId,
        payload: { targetEntityId },
      },
      effects: [
        {
          type: 'appendObservation',
          observation: resourceStateObservation(
            `observation.scenario-01.ag400.${target}.preparing`,
            preparingEventId,
            preparingAt,
            'preparing',
          ),
        },
      ],
    },
    {
      id: enRouteEventId,
      trigger: { type: 'scenarioTime', at: enRouteAt },
      event: {
        type: 'logistics.resource.en-route',
        producer: { type: 'external', id: 'mobile-power-operator' },
        entityIds: [
          scenario01EntityIds.mobileGenerator,
          scenario01EntityIds.accessRoute,
          targetEntityId,
        ],
        correlationId,
        causationId: preparingEventId,
        payload: { targetEntityId, travelMinutes },
      },
      effects: [
        {
          type: 'appendObservation',
          observation: resourceStateObservation(
            `observation.scenario-01.ag400.${target}.en-route`,
            enRouteEventId,
            enRouteAt,
            'en-route',
          ),
        },
        {
          type: 'appendObservation',
          observation: currentObservation({
            id: `observation.scenario-01.ag400.${target}.travel-time`,
            entityId: scenario01EntityIds.mobileGenerator,
            metric: 'logistics.estimatedArrival',
            value: travelMinutes,
            unit: 'min',
            observedAt: enRouteAt,
            receivedAt: enRouteAt,
            source: { type: 'system', id: 'wczk-resource-registry' },
            relatedEventId: enRouteEventId,
          }),
        },
      ],
    },
    {
      id: onSiteEventId,
      trigger: { type: 'scenarioTime', at: onSiteAt },
      event: {
        type: 'logistics.resource.on-site',
        producer: { type: 'external', id: 'mobile-power-operator' },
        entityIds: [scenario01EntityIds.mobileGenerator, targetEntityId],
        correlationId,
        causationId: enRouteEventId,
        payload: { targetEntityId },
      },
      effects: [
        {
          type: 'appendObservation',
          observation: resourceStateObservation(
            `observation.scenario-01.ag400.${target}.on-site`,
            onSiteEventId,
            onSiteAt,
            'on-site',
          ),
        },
      ],
    },
    {
      id: connectingEventId,
      trigger: { type: 'scenarioTime', at: connectingAt },
      event: {
        type: 'logistics.resource.connecting',
        producer: { type: 'external', id: 'mobile-power-operator' },
        entityIds: [scenario01EntityIds.mobileGenerator, targetEntityId],
        correlationId,
        causationId: onSiteEventId,
        payload: { targetEntityId },
      },
      effects: [
        {
          type: 'appendObservation',
          observation: resourceStateObservation(
            `observation.scenario-01.ag400.${target}.connecting`,
            connectingEventId,
            connectingAt,
            'connecting',
          ),
        },
      ],
    },
    {
      id: operationalEventId,
      trigger: { type: 'scenarioTime', at: operationalAt },
      event: {
        type: 'action.completed',
        producer: { type: 'external', id: 'mobile-power-operator' },
        entityIds: [scenario01EntityIds.mobileGenerator, targetEntityId],
        correlationId,
        causationId: connectingEventId,
        payload: { actionId, targetEntityId, targetName },
      },
      effects: [
        {
          type: 'updateActionLifecycle',
          actionId,
          lifecycle: 'completed',
        },
        {
          type: 'appendObservation',
          observation: resourceStateObservation(
            `observation.scenario-01.ag400.${target}.operational`,
            operationalEventId,
            operationalAt,
            'operational',
          ),
        },
        ...(target === 'suw'
          ? [
              {
                type: 'appendObservation' as const,
                observation: currentObservation({
                  id: 'observation.scenario-01.suw.generator-support-active',
                  entityId: scenario01EntityIds.waterStation,
                  metric: 'water.powerSupport',
                  value: 'ag-400',
                  observedAt: operationalAt,
                  receivedAt: operationalAt,
                  source: { type: 'system' as const, id: 'suw-operator-channel' },
                  relatedEventId: operationalEventId,
                }),
              },
              {
                type: 'appendObservation' as const,
                observation: currentObservation({
                  id: 'observation.scenario-01.suw.service-margin-stabilising',
                  entityId: scenario01EntityIds.waterStation,
                  metric: 'water.serviceMarginTrend',
                  value: 'stabilising',
                  observedAt: operationalAt,
                  receivedAt: operationalAt,
                  source: { type: 'system' as const, id: 'suw-operator-channel' },
                  relatedEventId: operationalEventId,
                }),
              },
            ]
          : [
              {
                type: 'appendObservation' as const,
                observation: currentObservation({
                  id: 'observation.scenario-01.r4.generator-power',
                  entityId: scenario01EntityIds.communicationsGateway,
                  metric: 'communications.powerMode',
                  value: 'generator',
                  observedAt: operationalAt,
                  receivedAt: operationalAt,
                  source: { type: 'telemetry' as const, id: 'r4-telemetry' },
                  relatedEventId: operationalEventId,
                }),
              },
              {
                type: 'appendObservation' as const,
                observation: currentObservation({
                  id: 'observation.scenario-01.r4.link-stabilising',
                  entityId: scenario01EntityIds.communicationsGateway,
                  metric: 'communications.linkQuality',
                  value: 'stabilising',
                  observedAt: operationalAt,
                  receivedAt: operationalAt,
                  source: { type: 'telemetry' as const, id: 'r4-telemetry' },
                  relatedEventId: operationalEventId,
                }),
              },
              {
                type: 'appendObservation' as const,
                observation: {
                  ...currentObservation({
                    id: 'observation.scenario-01.suw.telemetry-improving',
                    entityId: scenario01EntityIds.waterStation,
                    metric: 'water.telemetryFreshness',
                    value: 'delayed',
                    observedAt: operationalAt - 1,
                    receivedAt: operationalAt,
                    source: { type: 'telemetry' as const, id: 'suw-telemetry-via-r4' },
                    relatedEventId: operationalEventId,
                  }),
                  quality: 'degraded' as const,
                },
              },
            ]),
      ],
    },
  ];

  return { events, operationalAt };
}

function displacedRiskEvent(
  actionId: ActionId,
  decidedAt: ScenarioTime,
): ScenarioTimeEventDefinition {
  const at = decidedAt + scenario01Act3Offsets.displacedRisk;

  if (actionId === scenario01Decision2ActionIds.recommendGeneratorForSuw) {
    const id = 'event.scenario-01.d2.suw.r4-risk-developing';

    return {
      id,
      trigger: { type: 'scenarioTime', at },
      event: {
        type: 'communications.degradation.continues',
        producer: { type: 'scenario', id: 'scenario-01' },
        entityIds: [scenario01EntityIds.communicationsGateway],
        correlationId: scenario01Decision2Ids.generatorRecommendation,
        payload: { linkQuality: 'poor' },
      },
      effects: [
        {
          type: 'appendObservation',
          observation: {
            id: 'observation.scenario-01.r4.link-quality-poor',
            entityId: scenario01EntityIds.communicationsGateway,
            metric: 'communications.linkQuality',
            value: 'poor',
            observedAt: at,
            receivedAt: at,
            source: { type: 'telemetry', id: 'r4-telemetry' },
            quality: 'poor',
            confidence: mediumReportConfidence,
            classification: 'fact',
            relatedEventId: id,
          },
        },
      ],
    };
  }

  const id =
    actionId === scenario01Decision2ActionIds.recommendGeneratorForR4
      ? 'event.scenario-01.d2.r4.water-margin-declining'
      : 'event.scenario-01.d2.wait.dual-margin-declining';

  return {
    id,
    trigger: { type: 'scenarioTime', at },
    event: {
      type: 'water.service-margin.declining',
      producer: { type: 'scenario', id: 'scenario-01' },
      entityIds: [scenario01EntityIds.waterStation],
      correlationId: scenario01Decision2Ids.generatorRecommendation,
      payload: {
        trend: 'declining',
        communicationsAlsoAtRisk:
          actionId === scenario01Decision2ActionIds.waitForGridRestoration,
      },
    },
    effects: [
      {
        type: 'appendObservation',
        observation: currentObservation({
          id:
            actionId === scenario01Decision2ActionIds.recommendGeneratorForR4
              ? 'observation.scenario-01.suw.service-margin-declining'
              : 'observation.scenario-01.suw.service-margin-declining-while-waiting',
          entityId: scenario01EntityIds.waterStation,
          metric: 'water.serviceMarginTrend',
          value: 'declining',
          observedAt: at,
          receivedAt: at,
          source: { type: 'system', id: 'suw-operator-channel' },
          relatedEventId: id,
        }),
      },
      ...(actionId === scenario01Decision2ActionIds.waitForGridRestoration
        ? [
            {
              type: 'appendObservation' as const,
              observation: {
                id: 'observation.scenario-01.r4.link-quality-poor-while-waiting',
                entityId: scenario01EntityIds.communicationsGateway,
                metric: 'communications.linkQuality',
                value: 'poor',
                observedAt: at,
                receivedAt: at,
                source: { type: 'telemetry' as const, id: 'r4-telemetry' },
                quality: 'poor' as const,
                confidence: mediumReportConfidence,
                classification: 'fact' as const,
                relatedEventId: id,
              },
            },
          ]
        : []),
    ],
  };
}

function waitRestorationEvent(
  state: ScenarioRuntimeState,
  actionId: ActionId,
  decidedAt: ScenarioTime,
): {
  event: ScenarioTimeEventDefinition;
  materialEffectAt: ScenarioTime;
} {
  const at =
    decidedAt +
    scenario01Act3Offsets.waitRestorationBase +
    state.run.parameters.access.inspectionDelayMinutes +
    state.run.parameters.information.reportDelayMinutes;
  const earliestMinutes =
    25 + state.run.parameters.access.inspectionDelayMinutes;
  const latestMinutes = earliestMinutes + 15;
  const id = 'event.scenario-01.d2.wait.restoration-update';

  return {
    materialEffectAt: at,
    event: {
      id,
      trigger: { type: 'scenarioTime', at },
      event: {
        type: 'power.restoration.update-received',
        producer: { type: 'external', id: 'gpz-operator-channel' },
        entityIds: [scenario01EntityIds.gridSubstation],
        correlationId: scenario01Decision2Ids.generatorRecommendation,
        causationId: `event.${scenario01Decision2Ids.generatorRecommendation}.recorded`,
        payload: {
          fieldInspection: 'underway',
          earliestMinutes,
          latestMinutes,
          provisional: true,
        },
      },
      effects: [
        {
          type: 'updateActionLifecycle',
          actionId,
          lifecycle: 'completed',
        },
        {
          type: 'appendObservation',
          observation: {
            id: 'observation.scenario-01.gpz.restoration-window',
            entityId: scenario01EntityIds.gridSubstation,
            metric: 'power.restorationEstimate',
            value: {
              earliestMinutes,
              latestMinutes,
              status: 'provisional',
            },
            observedAt: at - state.run.parameters.information.reportDelayMinutes,
            receivedAt: at,
            source: {
              type: 'external',
              id: 'gpz-operator-channel',
              organisation: 'Distribution System Operator',
            },
            quality: 'good',
            confidence: mediumReportConfidence,
            classification: 'report',
            relatedEventId: id,
          },
        },
      ],
    },
  };
}

function hospitalReportEvent(
  at: ScenarioTime,
): ScenarioTimeEventDefinition {
  const id = 'event.scenario-01.hospital.continuity-request';

  return {
    id,
    trigger: { type: 'scenarioTime', at },
    event: {
      type: 'critical-service.continuity-report',
      producer: { type: 'external', id: 'hospital-duty-report' },
      entityIds: [scenario01EntityIds.countyHospital],
      payload: {
        essentialServices: 'maintained',
        request: 'expected water and communications continuity',
      },
    },
    effects: [
      {
        type: 'appendObservation',
        observation: {
          id: 'observation.scenario-01.hospital.essential-services-maintained',
          entityId: scenario01EntityIds.countyHospital,
          metric: 'health.essentialServicesPosture',
          value: 'maintained',
          observedAt: at - 2,
          receivedAt: at,
          source: {
            type: 'human-report',
            id: 'hospital-duty-report',
            organisation: 'County Hospital Nowy Brzeg',
          },
          quality: 'good',
          confidence: mediumReportConfidence,
          classification: 'report',
          relatedEventId: id,
        },
      },
      {
        type: 'appendObservation',
        observation: {
          id: 'observation.scenario-01.hospital.continuity-request',
          entityId: scenario01EntityIds.countyHospital,
          metric: 'health.continuityRequest',
          value: 'water-and-communications',
          observedAt: at - 2,
          receivedAt: at,
          source: {
            type: 'human-report',
            id: 'hospital-duty-report',
            organisation: 'County Hospital Nowy Brzeg',
          },
          quality: 'good',
          confidence: mediumReportConfidence,
          classification: 'report',
          relatedEventId: id,
        },
      },
    ],
  };
}

export function createScenario01Act3TimeEvents(
  state: ScenarioRuntimeState,
): ScenarioTimeEventDefinition[] {
  const selected = selectedDecision2Action(state);

  if (!selected) {
    return [];
  }

  const events: ScenarioTimeEventDefinition[] = [];
  let materialEffectAt: ScenarioTime;

  if (
    selected.actionId ===
      scenario01Decision2ActionIds.recommendGeneratorForSuw ||
    selected.actionId ===
      scenario01Decision2ActionIds.recommendGeneratorForR4
  ) {
    const target =
      selected.actionId ===
      scenario01Decision2ActionIds.recommendGeneratorForSuw
        ? 'suw'
        : 'r4';
    const deployment = deploymentEvents(
      state,
      selected.actionId,
      selected.decidedAt,
      target,
    );

    events.push(...deployment.events);
    materialEffectAt = deployment.operationalAt;
  } else if (
    selected.actionId === scenario01Decision2ActionIds.waitForGridRestoration
  ) {
    const restoration = waitRestorationEvent(
      state,
      selected.actionId,
      selected.decidedAt,
    );

    events.push(restoration.event);
    materialEffectAt = restoration.materialEffectAt;
  } else {
    return [];
  }

  events.push(displacedRiskEvent(selected.actionId, selected.decidedAt));

  const hospitalAt = Math.max(
    selected.decidedAt + scenario01Act3Offsets.hospitalMinimum,
    materialEffectAt + scenario01Act3Offsets.hospitalAfterMaterialEffect,
  );

  events.push(hospitalReportEvent(hospitalAt));

  return events.sort((left, right) => {
    const timeDifference = left.trigger.at - right.trigger.at;

    return timeDifference !== 0
      ? timeDifference
      : left.id.localeCompare(right.id);
  });
}
