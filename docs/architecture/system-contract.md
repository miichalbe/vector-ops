# VECTOR OPS — System Contract

**Version:** 0.1  
**Date:** 22 September 2026  
**Milestone:** M2 — System Definition  
**Related issues:** #8, #9, #10, #11  
**Status:** Accepted implementation contract for public-alpha vertical slice

---

## 1. Purpose

This document defines the minimum shared implementation contract for VECTOR OPS.

It formalises the accepted M2 direction across:

- core entities and relationships,
- module registration and ownership boundaries,
- typed events and audit history,
- Assessments and Projections,
- Actions and Decisions,
- explainability, timestamps, freshness and confidence,
- extension points for future modules, entities and scenarios.

The contract is deliberately lightweight. It must be strong enough to preserve architectural integrity while remaining feasible for the testable vertical slice on 24 September 2026 and public alpha on 25 September 2026.

It does not define a production-grade crisis-management platform architecture.

---

## 2. Architectural boundary

The public alpha is a browser-based modular frontend monolith.

Required:

- TypeScript shared contracts,
- deterministic in-browser state,
- compile-time module registration,
- data-driven scenarios,
- typed observations, dependencies and events,
- deterministic rule evaluation,
- append-only audit history,
- scenario reset, replay and persistence where practical.

Not required:

- backend or database,
- paid APIs,
- runtime LLM,
- dynamic third-party plugin loading,
- plugin marketplace,
- graph database,
- rules DSL,
- microservices,
- separate repositories per module.

The architecture should remain extensible without implementing infrastructure that the alpha does not need.

---

## 3. Core runtime flow

```text
Scenario / adapter
      ↓
Domain Event
      ↓
Module / core handling
      ↓
Observation + shared state
      ↓
Dependencies
      ↓
Deterministic rules
   ↙         ↘
Assessment   Projection
      ↘     ↙
       Actions
          ↓
       Decision
          ↓
      Domain Event
          ↓
      cycle repeats
```

The reasoning path must remain inspectable:

> source state → observation → dependency → assessment → projection → action → decision → observed outcome

---

## 4. Shared identifiers and time

```ts
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
```

`ScenarioTime` is simulation time and must remain distinct from wall-clock time.

Where both are relevant:

- `scenarioTime` records when something happened in the simulated operational world;
- `recordedAt` records when the application persisted or recorded the item in real wall-clock time.

---

## 5. Entity model

### 5.1 Entity

`Entity` is intentionally small and stable. It represents a physical or logical operational object without embedding domain-specific telemetry into the core schema.

```ts
export interface Entity {
  id: EntityId;
  kind: string;
  category:
    | "asset"
    | "system"
    | "service"
    | "resource"
    | "team"
    | "person"
    | "task"
    | "incident"
    | "route"
    | "place"
    | "organization";
  name: string;
  lifecycle: "active" | "inactive" | "retired";
  capabilityIds: string[];
  tags?: string[];
}
```

Examples of open, namespaced `kind` values:

- `power.substation`,
- `water.station`,
- `communications.gateway`,
- `health.hospital`,
- `logistics.mobile-generator`,
- `access.route`,
- future `weather.station`,
- future `uav.multirotor`,
- future `response.field-team`.

The shared core does not require a closed hierarchy of entity subclasses.

### 5.2 Capability

A Capability represents a service or ability provided by an entity.

```ts
export interface Capability {
  id: string;
  entityId: EntityId;
  type: string;
  enabled: boolean;
}
```

Examples:

- `power.supply`,
- `water.pumping`,
- `communications.transport`,
- `communications.remote-control`,
- `logistics.mobile-power`.

The alpha may use entity-level relationships where capability-level detail does not add meaningful value. Capability exists as an extension point, not as mandatory ceremony.

### 5.3 Ownership rule

Operational modules do not exclusively own entity instances.

One Entity may receive:

- observations from several modules,
- actions from several modules,
- dependencies across several domains,
- several UI contributions.

Scenario and Shared Core own runtime entity identity and lifecycle.

---

## 6. Observation contract

An Observation is sourced information received by VECTOR OPS. It is not the same as physical truth, system interpretation or future projection.

```ts
export interface ObservationSource {
  type: "telemetry" | "human-report" | "system" | "scenario" | "external";
  id?: string;
  organisation?: string;
}

export interface Confidence {
  level: "low" | "medium" | "high";
  score?: number;
  reasons?: ConfidenceFactor[];
}

export interface ConfidenceFactor {
  type: string;
  effect: "increase" | "decrease" | "neutral";
  description: string;
}

export interface Observation<T = unknown> {
  id: ObservationId;
  entityId: EntityId;
  metric: string;
  value: T;
  unit?: string;

  observedAt: ScenarioTime;
  receivedAt: ScenarioTime;

  source: ObservationSource;
  quality: "good" | "degraded" | "poor" | "unknown";
  confidence: Confidence;
  classification: "fact" | "report" | "assumption" | "forecast";

  relatedEventId?: EventId;
}
```

Observations are append-only records. New information creates a new Observation rather than rewriting the historical one.

### 6.1 Freshness

Freshness is derived from:

```text
current scenario time - observedAt + metric freshness policy
```

```ts
export type Freshness =
  | "current"
  | "delayed"
  | "stale"
  | "unavailable"
  | "unknown";

export type SourceMode = "telemetry" | "manual";
```

Manual reporting and data age are distinct concepts. A manual report may be current; a telemetry feed may be stale.

Metric definitions specify thresholds and freshness policy outside the Entity schema.

---

## 7. State separation

For every relevant operational object, preserve the conceptual separation between:

1. **physical state** — simulated underlying condition;
2. **observed state** — received measurements or reports;
3. **assessed state** — current evidence-based interpretation;
4. **projected state** — possible future consequence;
5. **data state** — freshness, source quality and confidence.

Loss of visibility is not proof of physical failure.

Physical simulated truth belongs to the scenario engine and must not be exposed as operator knowledge unless an Observation makes it available.

---

## 8. Dependency contract

Dependencies are typed edges between entities or capabilities.

```ts
export type DependencyRef =
  | { type: "entity"; id: EntityId }
  | { type: "capability"; id: string };

export interface Dependency {
  id: DependencyId;
  type: string;
  subject: DependencyRef;
  object: DependencyRef;
  required?: boolean;
  description?: string;
}
```

Initial vocabulary:

- `poweredBy`,
- `communicatesVia`,
- `monitoredVia`,
- `controlledVia`,
- `suppliedBy`,
- `accessedVia`,
- `supportedBy`,
- `providesServiceTo`.

The vocabulary is extensible. New semantic relationships may be registered without changing the graph structure.

No graph database is required for the alpha. An indexed in-memory collection is sufficient.

---

## 9. Assessment and Projection

Assessment and Projection are intentionally separate domain objects.

- **Assessment:** what VECTOR OPS believes is happening now.
- **Projection:** what may happen later if relevant conditions continue.

### 9.1 Shared derived-claim contract

```ts
export interface Assumption {
  id: string;
  statement: string;
  status: "unverified" | "supported" | "confirmed" | "invalidated";
}

export interface DerivedClaim {
  id: string;
  revision: number;
  title: string;

  severity: "normal" | "warning" | "critical" | "unknown";
  attention: "monitor" | "review" | "act";
  confidence: Confidence;

  entityIds: EntityId[];
  evidenceIds: ObservationId[];
  dependencyIds: DependencyId[];
  assumptions: Assumption[];

  ruleId: string;

  createdAt: ScenarioTime;
  recalculatedAt: ScenarioTime;
}
```

### 9.2 Assessment

```ts
export interface Assessment extends DerivedClaim {
  type: "assessment";
  status: "active" | "resolved" | "superseded" | "invalidated";
}
```

### 9.3 Projection

```ts
export interface Projection extends DerivedClaim {
  type: "projection";

  horizon: {
    earliest?: ScenarioTime;
    latest?: ScenarioTime;
  };

  mainUncertainty?: string;

  status:
    | "projected"
    | "developing"
    | "observed"
    | "avoided"
    | "superseded";
}
```

Time ranges should be preferred over false precision when input uncertainty does not support a single time-to-impact value.

---

## 10. Derived-claim lifecycle and revision rules

Assessment and Projection results must never be silently rewritten.

A rule evaluation may:

- create a new claim,
- leave the current revision unchanged,
- create a new revision when the result changes materially,
- resolve or invalidate an Assessment,
- mark a Projection developing, observed, avoided or superseded.

A material change includes changes to:

- operator-facing claim,
- severity,
- attention level,
- confidence level,
- time horizon,
- evidence set,
- relevant dependency chain,
- assumption status,
- applicability of a related Action.

Every revision must identify the event, observation or assumption change that caused reevaluation.

Earlier revisions remain reconstructable through the audit trail.

---

## 11. Confidence rule

Confidence must not imply mathematical precision that the underlying evidence does not support.

The alpha uses:

- `low`,
- `medium`,
- `high`.

An optional numeric score is allowed only where a module has a meaningful quantitative basis for it.

Where possible, confidence should expose human-readable factors, for example:

```text
+ two independent observations agree
+ telemetry is current
- restoration estimate remains unconfirmed
```

Confidence affects explanation and uncertainty handling but does not automatically suppress a potentially high-impact claim.

---

## 12. Deterministic rule contract

The alpha uses ordinary TypeScript rules. No rules DSL or generic rules engine is required.

```ts
export interface RuleContext {
  now: ScenarioTime;
  entities: EntityReader;
  observations: ObservationReader;
  dependencies: DependencyReader;
  actions: ActionReader;
}

export interface AssessmentRule {
  id: string;
  evaluate(ctx: RuleContext): AssessmentDraft | null;
}

export interface ProjectionRule {
  id: string;
  evaluate(ctx: RuleContext): ProjectionDraft[];
}
```

Rules must be:

- deterministic,
- side-effect free during evaluation,
- testable in isolation,
- readable without UI context,
- explicit about supporting evidence,
- explicit about dependencies and assumptions.

For the alpha, active rules may be reevaluated after each material Domain Event and when relevant simulation-time thresholds are crossed.

Dependency-based incremental invalidation is not required.

---

## 13. Prioritisation contract

Do not use an opaque composite score for alpha prioritisation.

Active items are ordered deterministically by:

1. attention: `act` → `review` → `monitor`;
2. severity: `critical` → `warning` → `normal` / `unknown`;
3. for Projections, shorter time-to-impact first;
4. most recently materially changed;
5. stable ID as final tie-breaker.

Confidence is displayed prominently but does not independently determine ordering.

A low-confidence critical Projection may require urgent verification rather than being hidden.

Scenario 01 presentation limits remain:

- maximum two active Assessments exposed simultaneously,
- maximum three active Projections exposed simultaneously,
- one Assessment designated Primary in the current presentation.

These are UI/scenario constraints, not limits of the domain model.

---

## 14. Action contract

Action represents an available operational step. It is distinct from the Decision record that captures what the operator selected.

```ts
export interface Effect {
  type: string;
  entityIds?: EntityId[];
  description: string;
  expectedAt?: ScenarioTime;
}

export interface Action {
  id: ActionId;
  type: string;
  title: string;

  scope: {
    entityIds?: EntityId[];
    assessmentIds?: AssessmentId[];
    projectionIds?: ProjectionId[];
  };

  authority:
    | "operator"
    | "supervisor"
    | "wzzk"
    | "voivode"
    | "external";

  lifecycle:
    | "hidden"
    | "available"
    | "selected"
    | "requested"
    | "accepted"
    | "rejected"
    | "completed"
    | "expired"
    | "cancelled";

  expectedEffects: Effect[];
  displacedRisks: Effect[];
  reversible: boolean;
}
```

The same Action may be reached from an Entity, Assessment or Projection. All entry points reference the same domain object and lifecycle.

Actions outside the WCZK duty officer's authority must remain requests, recommendations, escalations or externally approved actions.

---

## 15. Decision contract

Decision records the operator choice in the context that existed at decision time.

```ts
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
```

The Decision record must preserve evidence available at the moment of choice so the After-Action Report can distinguish contemporaneous knowledge from hindsight.

---

## 16. Event envelope

All material runtime events use one envelope.

```ts
export interface DomainEvent<T = unknown> {
  id: EventId;
  type: string;
  version: 1;

  scenarioTime: ScenarioTime;
  recordedAt: string;

  producer: {
    type: "core" | "module" | "scenario" | "operator" | "external";
    id?: string;
  };

  entityIds?: EntityId[];

  correlationId?: string;
  causationId?: string;

  payload: T;
}
```

### 16.1 Naming convention

```text
<namespace>.<subject>.<occurrence>
```

Event schema version belongs in the envelope rather than the event name.

### 16.2 Initial catalogue

Core/data:

- `observation.received`,
- `entity.lifecycle.changed`,
- `dependency.changed`.

Scenario/domain examples:

- `power.feeder.tripped`,
- `power.supply.restored`,
- `communications.backup.started`,
- `communications.link.degraded`,
- `access.route.restricted`,
- `report.confirmation.received`.

Assessment:

- `assessment.created`,
- `assessment.revised`,
- `assessment.resolved`,
- `assessment.invalidated`.

Projection:

- `projection.created`,
- `projection.revised`,
- `projection.developing`,
- `projection.observed`,
- `projection.avoided`,
- `projection.superseded`.

Action:

- `action.available`,
- `action.selected`,
- `action.requested`,
- `action.accepted`,
- `action.rejected`,
- `action.completed`,
- `action.expired`,
- `action.cancelled`.

Decision:

- `decision.opened`,
- `decision.recorded`.

Scenario:

- `scenario.started`,
- `scenario.paused`,
- `scenario.resumed`,
- `scenario.completed`,
- `scenario.ended`.

### 16.3 Event discipline

An Observation is information. A Domain Event is a material occurrence or lifecycle/state transition.

Do not emit high-frequency domain events for every minor metric change. Raw or frequent measurements remain Observations unless they represent a meaningful state transition.

---

## 17. Audit trail

The runtime audit history is append-only.

All material Domain Events are recorded in order.

Audit-worthy events include:

- observations received,
- relevant simulated state changes,
- Assessment and Projection revisions,
- Action lifecycle transitions,
- external responses,
- Decisions,
- Projection supersession or resolution,
- scenario state changes.

Routine UI interactions such as opening a detail panel or hovering a chart do not belong in the operational audit trail.

The audit record must support reconstruction of:

- what was known,
- what was inferred,
- which rule and dependencies supported the inference,
- what action was available,
- what the operator selected,
- what happened afterwards.

---

## 18. Module contract

A module is a compile-time package registered into the modular frontend monolith.

```ts
export interface MetricDefinition {
  key: string;
  label: string;
  unit?: string;
  format?: string;
  freshnessPolicy?: {
    delayedAfter: number;
    staleAfter: number;
  };
}

export interface ModuleManifest {
  id: ModuleId;
  name: string;
  version: string;

  entityKinds?: string[];
  metricDefinitions?: MetricDefinition[];
  dependencyTypes?: string[];
}

export interface VectorModule {
  manifest: ModuleManifest;
  register(ctx: ModuleRegistrationContext): void;
}
```

The alpha registry may be as simple as:

```ts
const modules = [
  powerModule,
  waterModule,
  communicationsModule,
  criticalServicesModule,
];

createVectorOps({ modules, scenario: scenario01 });
```

### 18.1 A module may contribute

- entity-kind metadata,
- metric definitions,
- observation adapters/handlers,
- dependency-type metadata,
- Assessment and Projection rules,
- Action definitions,
- event subscriptions,
- UI contributions.

### 18.2 A module must not

- own exclusive access to an Entity instance,
- store the only copy of scenario logic inside a UI component,
- mutate another module's internal state directly,
- bypass the shared audit/event contract for material state changes,
- infer physical failure solely from loss of visibility.

### 18.3 Ownership boundaries

| Object | Runtime owner |
|---|---|
| Entity instances | Scenario / Shared Core |
| Dependency instances | Scenario / Shared Core |
| Observation definitions | Module |
| Observation records | Produced by source/module, stored by Core |
| Metric definitions | Module |
| Rules | Module / Decision Layer |
| Assessment / Projection runtime state | Decision Layer / Core |
| Action definitions | Module / Scenario |
| Action runtime lifecycle | Shared Core |
| Decision | Shared Core |
| Event log | Shared Core |
| UI contribution | Module |
| Physical simulated truth | Scenario Engine |

---

## 19. Module failure behaviour

Module software state is separate from infrastructure state and data state.

Minimum module software lifecycle:

```text
Loading → Active → Error / Disabled
```

If a module fails:

- the application shell remains operational,
- existing entities remain registered,
- existing observations remain in history,
- observations naturally become delayed/stale when updates stop,
- affected Assessments and Projections may lose confidence or expose missing evidence,
- the simulated infrastructure does not automatically fail,
- the failure is visible in module/data-health presentation and audit where material.

A failing module must not corrupt unrelated shared state.

---

## 20. Explainability contract

Every derived operational claim must provide an inspectable path to:

1. **Claim** — what VECTOR OPS communicates;
2. **Evidence** — observations and reports;
3. **Logic** — rule and relevant thresholds;
4. **Dependencies** — relationships that make the evidence operationally significant;
5. **Assumptions** — unverified premises;
6. **Uncertainty** — stale, missing, conflicting or low-confidence information;
7. **Revision reason** — what changed when the claim changed.

Explainability metadata belongs in domain objects and rule outputs. It must not exist only as explanatory copy authored in UI components.

---

## 21. Extensibility test

The contract is sufficiently open if a future module such as Weather, Field Teams or UAVs can be added by:

1. defining a module manifest,
2. registering metric/entity-kind metadata where necessary,
3. producing Observations,
4. using existing or registering new dependency types,
5. contributing deterministic rules and Actions,
6. optionally contributing UI surfaces,

without changing the semantics of Entity, Observation, Assessment, Projection, Action, Decision or DomainEvent.

Extension does not mean every future requirement is already solved. Shared-contract evolution remains allowed when a genuine implementation need appears.

---

## 22. Explicit non-goals for M2 contract

Do not add without an implementation-driven reason:

- deep class hierarchies,
- universal domain ontology,
- runtime plugin installation,
- distributed event infrastructure,
- schema registry service,
- generic rules language,
- graph persistence layer,
- probabilistic reasoning framework,
- universal confidence formula,
- production IAM/security model,
- multi-user distributed synchronisation.

Working rule:

> **Do not expand the architecture conceptually unless implementation creates a concrete need.**

---

## 23. Minimum alpha implementation test

The contract is considered implemented enough for the first vertical slice when:

- six Scenario 01 entities are loaded from scenario data,
- all entity-specific values are represented as observations/derived state rather than core Entity fields,
- typed dependencies are inspectable,
- four modules register through the shared registry,
- a material scenario event produces observations and rule reevaluation,
- at least one Assessment combines evidence across domains,
- at least one Projection exposes time horizon, evidence, dependency chain and uncertainty,
- a Projection revision remains reconstructable,
- the same Action can be reached through more than one contextual entry point without duplicating its runtime record,
- a Decision preserves evidence available at decision time,
- material lifecycle changes appear in the append-only audit history,
- same scenario version + seed + decisions reproduce the same run,
- a module/data failure does not imply a fictional infrastructure failure,
- no scenario rule exists only inside a visual component.

---

## 24. Relationship to other artifacts

This contract formalises implementation details implied by:

- [Discovery Brief](../discovery/discovery-brief.md),
- [Information Architecture](information-architecture.md),
- [Scenario Experience Contract](../scenario/scenario-experience-contract.md),
- [Primary Scenario Package](../scenario/primary-scenario-package.md),
- [Primary Operational View](../design/primary-operational-view.md),
- [Decision Log](../decisions/decision-log.md).

Scenario content remains in the scenario package. Interaction layout remains in design artifacts. This document is the source of truth for the shared M2 implementation contract.

---

## 25. Decision summary

The accepted M2 contract is intentionally conservative:

1. Entity is a small open object, not a domain class hierarchy.
2. Capability is an optional explicit extension point.
3. Observation is append-only; freshness is derived.
4. Physical, observed, assessed, projected and data states remain distinct.
5. Dependencies are typed graph edges between entities or capabilities.
6. Assessment represents current interpretation; Projection represents future consequence.
7. Derived claims are revisioned rather than silently overwritten.
8. Confidence is explainable and coarse by default rather than falsely precise.
9. Rules are deterministic TypeScript functions for alpha.
10. Prioritisation is explicit and deterministic rather than an opaque score.
11. Action and Decision are separate domain concepts.
12. Events share one versioned envelope and a small typed catalogue.
13. Modules are compile-time packages registered through one lightweight contract.
14. Modules contribute to shared entities but do not exclusively own them.
15. Audit history is append-only and preserves knowledge available at decision time.
16. Future modules should extend the system without rewriting the shared core.
