# VECTOR OPS

**Vector Operations System**

A modular operations coordination platform for distributed teams, autonomous assets and complex operational environments.

> **Project status:** M4 Working Prototype / vertical-slice implementation  
> **Version:** 0.1  
> **Started:** 21 September 2026  
> **Last updated:** 23 September 2026

## What is VECTOR OPS?

VECTOR OPS explores a simple but important problem: operational teams often use separate tools for situational awareness, mission planning, fleet status, logistics, communications and incident management.

The challenge is not only seeing more data. It is understanding **what requires attention, why it matters, what will become a problem next, and what action should be taken**.

VECTOR OPS is conceived as a modular system that combines a shared operational picture with tasking, assets, logistics, communications and decision support.

Its core hypothesis is that the strongest value comes from **cross-domain operational consequences** rather than from another dashboard full of disconnected alerts.

## Core idea

Instead of showing four separate warnings:

- UAV battery low
- communication quality falling
- charging point occupied
- sector coverage at risk

the system should express the operational consequence:

> **Sector Bravo coverage will be lost in 11 minutes.**

…and show the dependencies behind that conclusion together with operator-reviewable options.

## Design principles

- **Modular by design**
- **Shared operational model**
- **Decision-oriented**
- **Cross-domain reasoning**
- **Graceful degradation**
- **Explainable state**
- **Real demonstrator**
- **Feasible by default**
- **Narrow first release, durable foundation**

## Initial capability areas

- Common Operational Picture
- Mission / Task Planning
- Asset Management
- Logistics
- Communications
- Incident / Tasking
- Forecast / Decision Support

## Public demo direction

The first demonstrator will use a **non-weaponized synthetic cascading-infrastructure scenario** grounded in documented dependencies between power, telecommunications, water, access and constrained restoration resources.

The primary operator is a **Dyżurny operacyjny Wojewódzkiego Centrum Zarządzania Kryzysowego (WCZK)** — a real Polish 24-hour crisis-management role responsible for monitoring, analysis, information flow, procedure activation, escalation and documentation.

The public alpha is intentionally narrow: one operator, one operational area and three meaningful coordination or escalation moments. It is being implemented on an extensible modular foundation so later modules and scenarios can be added without rewriting the application core.

## Current implementation

The active vertical slice currently includes:

- Astro application shell with a React interaction layer
- Shared TypeScript domain contracts
- Scenario 01 entity, capability, dependency and baseline-observation registries
- Deterministic seeded run configuration
- Immutable scenario runtime state
- Primary operational view driven by runtime selectors
- Minimal simulation clock with explicit pause rules
- Deterministic scenario-time event processing with append-only event and Observation effects
- Automated runtime tests, project type checking and production build verification

The runtime now activates each due scenario-time event once in deterministic order, preserves an append-only event history and applies validated Observation effects. In the power-first opening, a short GPZ Brzeziny power-quality disturbance at 07:44 creates the first time-driven Observation.

## Documentation

- [Discovery Brief](docs/discovery/discovery-brief.md)
- [Information Architecture](docs/architecture/information-architecture.md)
- [Decision Log](docs/decisions/decision-log.md)
- [Adjacent Product Landscape](docs/research/adjacent-product-landscape.md)
- [Cross-Domain Decision Friction](docs/research/cross-domain-decision-friction.md)
- [Primary Operator — Polish Context](docs/research/primary-operator-polish-context.md)
- [Scenario Experience Contract](docs/scenario/scenario-experience-contract.md)
- [Primary Scenario Package](docs/scenario/primary-scenario-package.md)
- [Primary Operational View](docs/design/primary-operational-view.md)
- [Evidence Library](docs/research/evidence-library.md)

## Current implementation questions

- How should hidden physical state remain separate from operator-visible Observations?
- How should Assessment and Projection rules expose causal reasoning?
- How should the reusable Action Review work?
- What exact second-by-second flow produces the strongest credible first run?
- Which onboarding elements remain necessary after the base interface exists?

## Non-goals

The public demonstrator is **not** intended to include weapon control, target engagement, autonomous lethal decision-making, sensitive real-world operational data or production-grade military security infrastructure.

## Next step

Add the second and third opening Observations for Scenario 01, then begin Assessment and Projection rule evaluation over the accumulating evidence.

---

**VECTOR OPS** is an independent Polish project exploring how contemporary design, software development and AI-assisted tools can support operational resilience and safety.
