# VECTOR OPS — Information Architecture

**Version:** 0.3  
**Date:** 21 September 2026  
**Last updated:** 22 September 2026

## 1. Architecture goal

The architecture is defined before visual design in order to separate stable product foundations from replaceable modules, support future capabilities, keep modules loosely coupled and make dependencies visible.

For the public alpha, VECTOR OPS will use a modular frontend monolith: one deployable browser application with explicit internal module boundaries. This preserves extension points without introducing a premature distributed or third-party plugin architecture.

## 2. System layers

### Operator Experience
- Common Operational Picture / map
- alert and attention queue
- task board
- asset details
- timeline
- decision review
- audit trail

### Shared Core
- Entity Registry
- Event Bus
- Tasking
- Permissions
- Time / Simulation Clock
- Audit Trail
- Module Registry

### Operational Modules

Public-alpha modules:

- Power
- Water
- Communications
- Critical Services & Response

Future modules may include Access / Transport, Field Teams, UAVs, Vehicles, Weather, Logistics and other operational domains. The alpha modules do not define a closed platform taxonomy.

### Decision Layer
- rule evaluation
- dependency analysis
- Assessment generation and prioritisation
- Projection / forecast logic
- operational consequence generation
- action availability and decision-option generation

### Data / Simulation Adapters
- data-driven synthetic scenario engine
- scenario definitions and initial state
- imported static data
- future external APIs
- future real-time feeds

## 3. Conceptual flow

```text
DATA / SIMULATION
      ↓
SHARED CORE + ENTITY REGISTRY
      ↓ emits / receives
EVENT BUS ⇄ MODULES
      ↓
DEPENDENCY + FORECAST LAYER
      ↓
OPERATIONAL CONSEQUENCE / DECISION
      ↓
OPERATOR UI + AUDIT TRAIL
```

## 4. Core entity model

### Asset
Any managed operational object: UAV, vehicle, sensor, communication node or other equipment.

### Team / Person
Human operational unit with location, availability, task and state.

### Task
Work to be completed with priority, owner, location, constraints, dependencies and state.

### Resource
Consumable or constrained capacity such as battery, fuel, transport capacity or supplies.

### Incident
An event that changes the operational situation or creates a decision requirement.

### Zone / Route
Geospatial sectors, routes, coverage areas and restricted areas.

### Event
A time-stamped change in state emitted by the core or any module.

### Decision
An operator-reviewed action containing alternatives, rationale, expected effects, final choice and audit trail.

## 5. Module communication model

Modules should avoid direct dependencies whenever possible.

Instead, they communicate through shared entities, typed events, common time, shared tasking and permissions.

### Minimum module contract

Every module should be able to:

1. expose stable metadata and register through the Module Registry,
2. register one or more entity types or extend existing entities,
3. read relevant shared state,
4. emit typed events,
5. subscribe to events without knowing the emitting module,
6. expose one or more UI surfaces,
7. contribute alert, dependency or decision rules,
8. fail independently without corrupting the shared operational picture.

Adding a module should not require changes to the application shell or existing module internals beyond explicit shared-contract evolution.

## 6. Scenario contract

Scenario content must remain separate from presentation components.

A scenario definition should be able to provide:

- metadata and version,
- initial entities and state,
- dependency relationships,
- timed and conditional events,
- decision points and available actions,
- rule inputs and projected consequences,
- synthetic assumptions, confidence and data age,
- completion and replay conditions.

This allows a future scenario to reuse the same shell, modules and consequence engine without copying the application.

## 7. Public-alpha implementation boundary

The initial implementation should:

- run as a browser-based static application,
- use TypeScript contracts for shared entities, events and module manifests,
- keep scenario data and consequence rules outside UI components,
- use deterministic local state and a simulation clock,
- deploy through the existing GitHub and OVH resources,
- require no paid API, database, authentication service, runtime LLM or always-on Huidun H20 server.

The first release does not require dynamic third-party code loading, a plugin marketplace, microservices or separate repositories for modules.

A practical architecture test is whether a new module such as Weather or Field Teams can be added through a module directory, manifest registration, event subscriptions, rules and UI surface without rewriting the core.

## 8. Example cross-domain consequence

**Power module:** substation P-03 is offline  
**Telecommunications module:** relay T-07 has 18 minutes of backup power  
**Water module:** pumping station W-02 depends on relay T-07 for remote control  
**Access module:** the shortest generator route is blocked

Instead of four separate warnings, VECTOR OPS creates:

> **Remote control of pumping station W-02 will be lost in 18 minutes, increasing the risk of service interruption for the North district.**

It may then present:

> Assign the available mobile generator to relay T-07.

with inspectable effects such as communications continuity preserved, water-control risk delayed and another restoration site remaining without backup power.

## 9. Why this architecture matters

VECTOR OPS should not be defined by a fixed collection of dashboards.

Its identity is the combination of a shared operational model, independent modules, explicit dependencies, explainable consequences and operator-controlled decisions.

A future module should be able to use existing teams, assets, routes, communications, logistics and tasks without requiring redesign of the entire platform.


## 10. Accepted domain refinements

The shared model distinguishes:

- **Entity** — physical or logical operational object;
- **Capability** — service or ability provided by an entity;
- **Observation** — sourced measurement or human report;
- **Dependency** — typed relationship between entities or capabilities;
- **Event** — time-stamped state change;
- **Assessment** — current evidence-based operational interpretation;
- **Projection / Consequence** — possible future operational effect;
- **Action** — an available request, recommendation, notification or escalation;
- **Decision** — operator selection with evidence, alternatives and audit record.

Every entity may receive observations and UI contributions from several modules. Modules do not own exclusive dashboards.

### State separation

For each relevant entity, the system separates:

1. physical simulated state,
2. observed state,
3. assessed state,
4. projected state,
5. data state and confidence.

Loss of telemetry is a loss of visibility, not proof of physical failure.

### Observation envelope

All modules publish observations through a stable envelope containing:

- entity ID,
- namespaced metric key,
- value and unit,
- observed and received timestamps,
- source,
- quality,
- confidence,
- related event.

Modules register metric definitions and presentation metadata. Future metric keys can be added without changing the core entity schema.

### Typed dependencies

The initial dependency vocabulary includes:

- `poweredBy`,
- `communicatesVia`,
- `monitoredVia`,
- `controlledVia`,
- `suppliedBy`,
- `accessedVia`,
- `supportedBy`,
- `providesServiceTo`.

This distinguishes loss of physical service, monitoring, control, access and supporting capacity.

### Explainability rule

Every status, Assessment, Projection and recommendation must be traceable to source observations, reports, rules, dependencies and assumptions.

See:

- [Primary Scenario Package](../scenario/primary-scenario-package.md)
- [Primary Operational View](../design/primary-operational-view.md)
