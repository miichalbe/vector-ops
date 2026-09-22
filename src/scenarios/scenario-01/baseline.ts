import type {
  Capability,
  Dependency,
  Entity,
  EntityId,
} from '../../core/contracts';

export const scenario01EntityIds = {
  gridSubstation: 'entity.gpz-brzeziny',
  waterStation: 'entity.suw-kepa',
  communicationsGateway: 'entity.r4',
  countyHospital: 'entity.hospital-nowy-brzeg',
  mobileGenerator: 'entity.ag-400',
  accessRoute: 'entity.route-z17',
} as const satisfies Record<string, EntityId>;

export const scenario01CapabilityIds = {
  powerDistribution: 'capability.gpz.power-distribution',
  waterTreatment: 'capability.suw.water-treatment',
  localWaterControl: 'capability.suw.local-control',
  remoteWaterControl: 'capability.suw.remote-control',
  primaryCommunications: 'capability.r4.primary-communications',
  fallbackCommunications: 'capability.r4.fallback-communications',
  criticalCare: 'capability.hospital.critical-care',
  mobilePower: 'capability.ag-400.mobile-power',
  technicalAccess: 'capability.z-17.technical-access',
} as const;

export const scenario01Entities: Entity[] = [
  {
    id: scenario01EntityIds.gridSubstation,
    kind: 'power-substation',
    category: 'asset',
    name: 'GPZ Brzeziny',
    lifecycle: 'active',
    capabilityIds: [scenario01CapabilityIds.powerDistribution],
    tags: ['power', 'synthetic'],
  },
  {
    id: scenario01EntityIds.waterStation,
    kind: 'water-treatment-station',
    category: 'asset',
    name: 'SUW Kępa',
    lifecycle: 'active',
    capabilityIds: [
      scenario01CapabilityIds.waterTreatment,
      scenario01CapabilityIds.localWaterControl,
      scenario01CapabilityIds.remoteWaterControl,
    ],
    tags: ['water', 'synthetic'],
  },
  {
    id: scenario01EntityIds.communicationsGateway,
    kind: 'regional-communications-gateway',
    category: 'system',
    name: 'Regional Communications Gateway R-4',
    lifecycle: 'active',
    capabilityIds: [
      scenario01CapabilityIds.primaryCommunications,
      scenario01CapabilityIds.fallbackCommunications,
    ],
    tags: ['communications', 'synthetic'],
  },
  {
    id: scenario01EntityIds.countyHospital,
    kind: 'county-hospital',
    category: 'organization',
    name: 'County Hospital Nowy Brzeg',
    lifecycle: 'active',
    capabilityIds: [scenario01CapabilityIds.criticalCare],
    tags: ['critical-service', 'health', 'synthetic'],
  },
  {
    id: scenario01EntityIds.mobileGenerator,
    kind: 'mobile-generator',
    category: 'resource',
    name: 'Mobile Generator AG-400',
    lifecycle: 'active',
    capabilityIds: [scenario01CapabilityIds.mobilePower],
    tags: ['response-resource', 'synthetic'],
  },
  {
    id: scenario01EntityIds.accessRoute,
    kind: 'technical-access-route',
    category: 'route',
    name: 'Technical Access Route Z-17',
    lifecycle: 'active',
    capabilityIds: [scenario01CapabilityIds.technicalAccess],
    tags: ['access', 'logistics', 'synthetic'],
  },
];

export const scenario01Capabilities: Capability[] = [
  {
    id: scenario01CapabilityIds.powerDistribution,
    entityId: scenario01EntityIds.gridSubstation,
    type: 'power-distribution',
    enabled: true,
  },
  {
    id: scenario01CapabilityIds.waterTreatment,
    entityId: scenario01EntityIds.waterStation,
    type: 'water-treatment',
    enabled: true,
  },
  {
    id: scenario01CapabilityIds.localWaterControl,
    entityId: scenario01EntityIds.waterStation,
    type: 'local-control',
    enabled: true,
  },
  {
    id: scenario01CapabilityIds.remoteWaterControl,
    entityId: scenario01EntityIds.waterStation,
    type: 'remote-control',
    enabled: true,
  },
  {
    id: scenario01CapabilityIds.primaryCommunications,
    entityId: scenario01EntityIds.communicationsGateway,
    type: 'primary-communications',
    enabled: true,
  },
  {
    id: scenario01CapabilityIds.fallbackCommunications,
    entityId: scenario01EntityIds.communicationsGateway,
    type: 'fallback-communications',
    enabled: true,
  },
  {
    id: scenario01CapabilityIds.criticalCare,
    entityId: scenario01EntityIds.countyHospital,
    type: 'critical-care',
    enabled: true,
  },
  {
    id: scenario01CapabilityIds.mobilePower,
    entityId: scenario01EntityIds.mobileGenerator,
    type: 'mobile-power',
    enabled: true,
  },
  {
    id: scenario01CapabilityIds.technicalAccess,
    entityId: scenario01EntityIds.accessRoute,
    type: 'technical-access',
    enabled: true,
  },
];

export const scenario01Dependencies: Dependency[] = [
  {
    id: 'dependency.suw.powered-by.gpz',
    type: 'poweredBy',
    subject: { type: 'entity', id: scenario01EntityIds.waterStation },
    object: { type: 'entity', id: scenario01EntityIds.gridSubstation },
    required: true,
    description: 'SUW Kępa receives its normal electrical supply from GPZ Brzeziny.',
  },
  {
    id: 'dependency.r4.powered-by.gpz',
    type: 'poweredBy',
    subject: {
      type: 'entity',
      id: scenario01EntityIds.communicationsGateway,
    },
    object: { type: 'entity', id: scenario01EntityIds.gridSubstation },
    required: true,
    description: 'R-4 receives its normal electrical supply from GPZ Brzeziny.',
  },
  {
    id: 'dependency.suw.communicates-via.r4',
    type: 'communicatesVia',
    subject: { type: 'entity', id: scenario01EntityIds.waterStation },
    object: {
      type: 'entity',
      id: scenario01EntityIds.communicationsGateway,
    },
    required: false,
    description: 'R-4 carries automatic SUW telemetry and operational communication.',
  },
  {
    id: 'dependency.suw.monitored-via.r4',
    type: 'monitoredVia',
    subject: { type: 'entity', id: scenario01EntityIds.waterStation },
    object: {
      type: 'entity',
      id: scenario01EntityIds.communicationsGateway,
    },
    required: false,
    description: 'Remote monitoring of SUW Kępa is transported through R-4.',
  },
  {
    id: 'dependency.suw.controlled-via.r4',
    type: 'controlledVia',
    subject: {
      type: 'capability',
      id: scenario01CapabilityIds.remoteWaterControl,
    },
    object: {
      type: 'entity',
      id: scenario01EntityIds.communicationsGateway,
    },
    required: false,
    description: 'R-4 supports limited remote-control functions for SUW Kępa.',
  },
  {
    id: 'dependency.hospital.supplied-by.suw',
    type: 'suppliedBy',
    subject: { type: 'entity', id: scenario01EntityIds.countyHospital },
    object: { type: 'entity', id: scenario01EntityIds.waterStation },
    required: true,
    description: 'The county hospital receives water service from SUW Kępa.',
  },
  {
    id: 'dependency.hospital.communicates-via.r4',
    type: 'communicatesVia',
    subject: { type: 'entity', id: scenario01EntityIds.countyHospital },
    object: {
      type: 'entity',
      id: scenario01EntityIds.communicationsGateway,
    },
    required: false,
    description: 'The hospital uses R-4 while retaining separate fallback channels.',
  },
  {
    id: 'dependency.gpz.accessed-via.z17',
    type: 'accessedVia',
    subject: { type: 'entity', id: scenario01EntityIds.gridSubstation },
    object: { type: 'entity', id: scenario01EntityIds.accessRoute },
    required: true,
    description: 'Field access to GPZ Brzeziny depends on Route Z-17.',
  },
  {
    id: 'dependency.ag400.accessed-via.z17',
    type: 'accessedVia',
    subject: { type: 'entity', id: scenario01EntityIds.mobileGenerator },
    object: { type: 'entity', id: scenario01EntityIds.accessRoute },
    required: true,
    description: 'AG-400 deployment travel time depends on Route Z-17.',
  },
  {
    id: 'dependency.suw.supported-by.ag400',
    type: 'supportedBy',
    subject: { type: 'entity', id: scenario01EntityIds.waterStation },
    object: { type: 'entity', id: scenario01EntityIds.mobileGenerator },
    required: false,
    description: 'AG-400 is compatible with SUW Kępa after assignment.',
  },
  {
    id: 'dependency.r4.supported-by.ag400',
    type: 'supportedBy',
    subject: {
      type: 'entity',
      id: scenario01EntityIds.communicationsGateway,
    },
    object: { type: 'entity', id: scenario01EntityIds.mobileGenerator },
    required: false,
    description: 'AG-400 is compatible with R-4 after assignment.',
  },
];
