import type { EntityId } from '../../core/contracts';
import { scenario01EntityIds } from './baseline';

export interface EntityMetricSlot {
  id: string;
  label: string;
  metric: string;
  valuePath?: string;
}

export interface EntityPresentationSchema {
  tile: readonly EntityMetricSlot[];
  detail: readonly EntityMetricSlot[];
}

const schemas: Record<string, EntityPresentationSchema> = {
  [scenario01EntityIds.gridSubstation]: {
    tile: [
      { id: 'supply', label: 'Supply', metric: 'power.supplyState' },
      { id: 'feeder', label: 'Feeder F-12', metric: 'power.feederState' },
      { id: 'load', label: 'Load', metric: 'power.loadPercentage' },
    ],
    detail: [
      { id: 'supply', label: 'Supply', metric: 'power.supplyState' },
      { id: 'feeder', label: 'Feeder F-12', metric: 'power.feederState' },
      { id: 'load', label: 'Load', metric: 'power.loadPercentage' },
      {
        id: 'restoration',
        label: 'Restoration estimate',
        metric: 'power.restorationEstimate',
      },
      {
        id: 'power-quality',
        label: 'Latest power quality event',
        metric: 'power.qualityEvent',
      },
    ],
  },
  [scenario01EntityIds.waterStation]: {
    tile: [
      {
        id: 'pressure',
        label: 'Output pressure',
        metric: 'water.outputPressure',
      },
      {
        id: 'reservoir',
        label: 'Reservoir',
        metric: 'water.reservoirLevel',
      },
      {
        id: 'pump-1',
        label: 'Pump 1',
        metric: 'water.pumpState',
        valuePath: 'pump1',
      },
      {
        id: 'pump-2',
        label: 'Pump 2',
        metric: 'water.pumpState',
        valuePath: 'pump2',
      },
      {
        id: 'telemetry',
        label: 'Telemetry',
        metric: 'water.telemetryFreshness',
      },
    ],
    detail: [
      {
        id: 'pressure',
        label: 'Output pressure',
        metric: 'water.outputPressure',
      },
      {
        id: 'reservoir',
        label: 'Reservoir',
        metric: 'water.reservoirLevel',
      },
      {
        id: 'pump-1',
        label: 'Pump 1',
        metric: 'water.pumpState',
        valuePath: 'pump1',
      },
      {
        id: 'pump-2',
        label: 'Pump 2',
        metric: 'water.pumpState',
        valuePath: 'pump2',
      },
      {
        id: 'pump-3',
        label: 'Pump 3',
        metric: 'water.pumpState',
        valuePath: 'pump3',
      },
      {
        id: 'controller',
        label: 'Controller',
        metric: 'water.controllerState',
        valuePath: 'state',
      },
      {
        id: 'telemetry',
        label: 'Telemetry',
        metric: 'water.telemetryFreshness',
      },
      {
        id: 'power-support',
        label: 'Power support',
        metric: 'water.powerSupport',
      },
      {
        id: 'service-margin',
        label: 'Service margin',
        metric: 'water.serviceMarginTrend',
      },
    ],
  },
  [scenario01EntityIds.communicationsGateway]: {
    tile: [
      {
        id: 'power-mode',
        label: 'Power mode',
        metric: 'communications.powerMode',
      },
      {
        id: 'link-quality',
        label: 'Link quality',
        metric: 'communications.linkQuality',
      },
      {
        id: 'packet-loss',
        label: 'Packet loss',
        metric: 'communications.packetLoss',
      },
    ],
    detail: [
      {
        id: 'power-mode',
        label: 'Power mode',
        metric: 'communications.powerMode',
      },
      {
        id: 'link-quality',
        label: 'Link quality',
        metric: 'communications.linkQuality',
      },
      {
        id: 'packet-loss',
        label: 'Packet loss',
        metric: 'communications.packetLoss',
      },
    ],
  },
  [scenario01EntityIds.countyHospital]: {
    tile: [
      {
        id: 'essential-services',
        label: 'Essential services',
        metric: 'health.essentialServicesPosture',
      },
      {
        id: 'water-margin',
        label: 'Water margin',
        metric: 'health.waterMargin',
      },
      {
        id: 'continuity-request',
        label: 'Continuity request',
        metric: 'health.continuityRequest',
      },
      {
        id: 'contingency',
        label: 'Contingency prep',
        metric: 'health.contingencyPreparation',
      },
    ],
    detail: [
      {
        id: 'essential-services',
        label: 'Essential services',
        metric: 'health.essentialServicesPosture',
      },
      {
        id: 'water-margin',
        label: 'Water margin',
        metric: 'health.waterMargin',
      },
      {
        id: 'continuity-request',
        label: 'Continuity request',
        metric: 'health.continuityRequest',
      },
      {
        id: 'contingency',
        label: 'Contingency preparation',
        metric: 'health.contingencyPreparation',
      },
    ],
  },
  [scenario01EntityIds.mobileGenerator]: {
    tile: [
      {
        id: 'resource-state',
        label: 'Resource state',
        metric: 'logistics.resourceState',
      },
      {
        id: 'assignment',
        label: 'Assignment',
        metric: 'logistics.assignment',
      },
      {
        id: 'travel-time',
        label: 'Travel time',
        metric: 'logistics.estimatedArrival',
      },
    ],
    detail: [
      {
        id: 'resource-state',
        label: 'Resource state',
        metric: 'logistics.resourceState',
      },
      {
        id: 'assignment',
        label: 'Assignment',
        metric: 'logistics.assignment',
      },
      {
        id: 'travel-time',
        label: 'Travel time',
        metric: 'logistics.estimatedArrival',
      },
    ],
  },
  [scenario01EntityIds.accessRoute]: {
    tile: [
      {
        id: 'route-state',
        label: 'Route state',
        metric: 'logistics.routeState',
      },
      {
        id: 'travel-time',
        label: 'Travel time',
        metric: 'logistics.estimatedTravelTime',
      },
    ],
    detail: [
      {
        id: 'route-state',
        label: 'Route state',
        metric: 'logistics.routeState',
      },
      {
        id: 'travel-time',
        label: 'Travel time',
        metric: 'logistics.estimatedTravelTime',
      },
    ],
  },
};

export function getScenario01EntityPresentation(
  entityId: EntityId,
): EntityPresentationSchema {
  const schema = schemas[entityId];

  if (!schema) {
    throw new Error(`No Scenario 01 entity presentation schema for ${entityId}.`);
  }

  return schema;
}
