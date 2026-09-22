export type EntityId = string;
export type ModuleId = string;
export type ObservationId = string;
export type DependencyId = string;
export type AssessmentId = string;
export type ProjectionId = string;
export type ActionId = string;
export type DecisionId = string;
export type EventId = string;

export type ScenarioTime = number;

export type EntityCategory =
  | 'asset'
  | 'system'
  | 'service'
  | 'resource'
  | 'team'
  | 'person'
  | 'task'
  | 'incident'
  | 'route'
  | 'place'
  | 'organization';

export type EntityLifecycle = 'active' | 'inactive' | 'retired';

export interface Entity {
  id: EntityId;
  kind: string;
  category: EntityCategory;
  name: string;
  lifecycle: EntityLifecycle;
  capabilityIds: string[];
  tags?: string[];
}

export interface Capability {
  id: string;
  entityId: EntityId;
  type: string;
  enabled: boolean;
}

export type ObservationSourceType =
  | 'telemetry'
  | 'human-report'
  | 'system'
  | 'scenario'
  | 'external';

export interface ObservationSource {
  type: ObservationSourceType;
  id?: string;
  organisation?: string;
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type ConfidenceEffect = 'increase' | 'decrease' | 'neutral';

export interface ConfidenceFactor {
  type: string;
  effect: ConfidenceEffect;
  description: string;
}

export interface Confidence {
  level: ConfidenceLevel;
  score?: number;
  reasons?: ConfidenceFactor[];
}

export type ObservationQuality = 'good' | 'degraded' | 'poor' | 'unknown';

export type ObservationClassification =
  | 'fact'
  | 'report'
  | 'assumption'
  | 'forecast';

export interface Observation<T = unknown> {
  id: ObservationId;
  entityId: EntityId;
  metric: string;
  value: T;
  unit?: string;

  observedAt: ScenarioTime;
  receivedAt: ScenarioTime;

  source: ObservationSource;
  quality: ObservationQuality;
  confidence: Confidence;
  classification: ObservationClassification;

  relatedEventId?: EventId;
}

export type Freshness =
  | 'current'
  | 'delayed'
  | 'stale'
  | 'unavailable'
  | 'unknown';

export type SourceMode = 'telemetry' | 'manual';

export type DependencyRef =
  | { type: 'entity'; id: EntityId }
  | { type: 'capability'; id: string };

export interface Dependency {
  id: DependencyId;
  type: string;
  subject: DependencyRef;
  object: DependencyRef;
  required?: boolean;
  description?: string;
}

export type AssumptionStatus =
  | 'unverified'
  | 'supported'
  | 'confirmed'
  | 'invalidated';

export interface Assumption {
  id: string;
  statement: string;
  status: AssumptionStatus;
}

export type Severity = 'normal' | 'warning' | 'critical' | 'unknown';
export type Attention = 'monitor' | 'review' | 'act';

export interface DerivedClaim {
  id: string;
  revision: number;
  title: string;

  severity: Severity;
  attention: Attention;
  confidence: Confidence;

  entityIds: EntityId[];
  evidenceIds: ObservationId[];
  dependencyIds: DependencyId[];
  assumptions: Assumption[];

  ruleId: string;

  createdAt: ScenarioTime;
  recalculatedAt: ScenarioTime;
}

export type AssessmentStatus =
  | 'active'
  | 'resolved'
  | 'superseded'
  | 'invalidated';

export interface Assessment extends DerivedClaim {
  type: 'assessment';
  status: AssessmentStatus;
}

export type ProjectionStatus =
  | 'projected'
  | 'developing'
  | 'observed'
  | 'avoided'
  | 'superseded';

export interface Projection extends DerivedClaim {
  type: 'projection';

  horizon: {
    earliest?: ScenarioTime;
    latest?: ScenarioTime;
  };

  mainUncertainty?: string;
  status: ProjectionStatus;
}

export interface Effect {
  type: string;
  entityIds?: EntityId[];
  description: string;
  expectedAt?: ScenarioTime;
}

export type ActionAuthority =
  | 'operator'
  | 'supervisor'
  | 'wzzk'
  | 'voivode'
  | 'external';

export type ActionLifecycle =
  | 'hidden'
  | 'available'
  | 'selected'
  | 'requested'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'expired'
  | 'cancelled';

export interface Action {
  id: ActionId;
  type: string;
  title: string;

  scope: {
    entityIds?: EntityId[];
    assessmentIds?: AssessmentId[];
    projectionIds?: ProjectionId[];
  };

  authority: ActionAuthority;
  lifecycle: ActionLifecycle;

  expectedEffects: Effect[];
  displacedRisks: Effect[];
  reversible: boolean;
}

export interface Decision {
  id: DecisionId;

  openedAt: ScenarioTime;
  deadline?: ScenarioTime;

  actionIds: ActionId[];
  evidenceIds: ObservationId[];
  unknowns: string[];
  assumptions: Assumption[];

  selectedActionId?: ActionId;
  rationale?: string;
  decidedAt?: ScenarioTime;

  expectedEffects: Effect[];
  observedEffects: Effect[];
}

export type EventProducerType =
  | 'core'
  | 'module'
  | 'scenario'
  | 'operator'
  | 'external';

export interface DomainEvent<T = unknown> {
  id: EventId;
  type: string;
  version: 1;

  scenarioTime: ScenarioTime;
  recordedAt: string;

  producer: {
    type: EventProducerType;
    id?: string;
  };

  entityIds?: EntityId[];

  correlationId?: string;
  causationId?: string;

  payload: T;
}
