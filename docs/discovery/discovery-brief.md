# VECTOR OPS — Discovery Brief

**Version:** 0.2  
**Date:** 21 September 2026  
**Last updated:** 22 September 2026  
**Status:** M1 discovery direction accepted; M2 system definition active

## 1. Problem

Operational teams working with people, vehicles, autonomous assets, communications and logistics often use separate tools for situational awareness, mission/task planning, fleet status and resource management.

The central design problem is not lack of data. The operator needs to understand:

- what requires attention,
- how events in one domain affect another,
- what is likely to happen next,
- what decision is required,
- what the consequences of that decision will be.

## 2. Proposed product

VECTOR OPS is a **modular Operations Coordination System** for distributed teams and autonomous assets.

The system combines a shared operational picture, planning and tasking, asset status, logistics, communications, incident handling, forecast and decision support.

Its primary value is **cross-domain orchestration**: modules exchange state and events so the system can expose operational consequences instead of presenting disconnected alerts.

## 3. Primary user

The primary operator for the public alpha is the **Dyżurny operacyjny Wojewódzkiego Centrum Zarządzania Kryzysowego (WCZK)** — presented in English as **Duty Operations Officer — Voivodeship Crisis Management Centre**.

This real Polish civil-service role maintains a 24-hour operational picture, monitors and analyses threats, evaluates reports, forecasts development, supports information flow, activates authorised procedures, escalates recommendations and documents actions.

The operator does not independently command infrastructure operators. Actions outside the role's authority must be represented as requests, recommendations, escalations or approvals by the responsible organisation or authority.

Potential later user groups include powiat crisis-management duty staff, RCB duty staff, critical-infrastructure protection coordinators, emergency-response organisations and infrastructure operators.

The public demonstrator will remain non-weaponized and suitable for open presentation.

## 4. Core value proposition

> **VECTOR OPS turns cross-domain operational observations into explainable assessments, time-dependent projections and operator-reviewable actions.**

It should answer:

- What is happening and where?
- Which observations and dependencies support that assessment?
- What may become a problem if nothing changes?
- How current and reliable is the information?
- Which action is available within the operator's authority?

The differentiator is not a larger dashboard. It is a traceable reasoning path from source evidence to operational consequence and bounded action.

## 5. Product principles

### Modular by design
Capabilities are added as modules/plugins rather than by rewriting the core. The first release may use a modular frontend monolith, but shared entities, event contracts, scenario data and consequence rules must remain separate from presentation components so additional modules can be added without replacing the application shell.

### Shared operational model
All modules operate on common entities, events, tasks, locations, time and permissions.

### Decision-oriented
The UI prioritizes operational consequences, required attention and decisions over raw telemetry.

### Cross-domain reasoning
The system becomes valuable when information from different domains is combined into one interpretation.

### Graceful degradation
The product remains understandable when data, communications or assets become unavailable.

### Explainable state
Every alert, consequence or recommendation should expose the dependencies that produced it.

### Demo as real software
The demonstrator should contain real state, events, interactions and causality — not only static prototype screens.

### Feasible by default
The public demonstrator should be deployable as a browser-based static application using the existing GitHub and OVH resources. Paid services, live operational integrations, an always-on local server, runtime AI and a custom backend must not be required for the core experience.

### Narrow first release, durable foundation
The first public alpha should be a deliberately narrow vertical slice. Its scope may be limited to one operator, one scenario and a small number of decisions, but its architecture must support additional modules, scenarios and interactions in later iterations.

## 6. Initial capability areas

- Common Operational Picture
- Mission / Task Planning
- Asset Management
- Logistics
- Communications
- Incident / Tasking
- Forecast / Decision Support

## 7. Explicit non-goals

The demonstrator will not attempt to provide weapon control, target engagement, autonomous lethal decision-making, sensitive real-world operational data, production-grade military security or support for every possible operational domain in the first release.

## 8. Selected public-alpha scenario and modules

The selected scenario is a synthetic cascading-infrastructure disruption in fictional Nowy Brzeg County, Mazowieckie Voivodeship.

Six initial entities represent power distribution, water supply, regional communications, a county hospital, one constrained mobile generator and a technical access route.

The WCZK duty officer receives fragmented observations, reviews cross-domain Assessments and Projections, and makes three bounded choices:

1. information/correlation posture,
2. constrained-resource recommendation,
3. coordination/escalation posture.

The root cause remains unconfirmed. The scenario uses English UI, seeded bounded variation and a factual after-action report without scoring.

MVP operational modules:

- Power,
- Water,
- Communications,
- Critical Services & Response.

The implementation remains a browser-based modular frontend monolith with shared entities, typed observations and dependencies, data-driven scenarios and no required backend.

See [Primary Scenario Package](../scenario/primary-scenario-package.md).

## 9. Discovery assumptions

- **A1:** Operators benefit more from prioritized consequences than from additional raw telemetry.
- **A2:** Cross-module dependencies are a stronger differentiator than any single module feature.
- **A3:** A browser-based demonstrator can communicate the idea credibly if state and causality are real.
- **A4:** A non-weaponized scenario is sufficient to demonstrate relevance to defence-adjacent and public-safety contexts.

## 10. Risks to validate

- Substantial overlap with existing C2, TAK ecosystem, GCS, logistics or emergency-management products.
- Excessive breadth unless one narrow operational scenario drives the MVP.
- Opaque or gimmicky predictive decision support.
- Over-engineered plugin architecture for a portfolio demonstrator.
- A rushed public alpha that hard-codes scenario logic into UI components and prevents later extension.
- Unsafe or sensitive implications in public presentation.

## 11. Questions carried into system definition

Discovery has resolved the operator, scenario, value proposition, MVP module set and deployment boundary.

Questions now owned by M2 and M3:

- What is the final typed schema for entities, capabilities, observations, dependencies, Assessments, Projections and Actions?
- Which event catalogue and rule format provides enough extension without over-engineering?
- How should Action Review expose authority, evidence, alternatives and expected effects?
- Which exact interaction and pacing choices survive prototype testing?
- Which contextual onboarding is necessary after the base interface exists?

## 12. Discovery exit criteria

Discovery can be considered complete enough to begin interaction design when:

- the adjacent product landscape has been reviewed,
- one primary operational scenario has been selected,
- the primary operator and decision responsibilities are defined,
- MVP modules and non-goals are agreed,
- the information architecture and shared entity model are accepted,
- the demonstration story is defined from start state through decision to outcome,
- the technical deployment approach for the public demo is confirmed.

## 13. Next phase

Proceed to M2 System Definition and M3 Interaction Design in a tightly coupled vertical slice:

- finalise the shared domain and dependency model,
- define module and event contracts,
- formalise Assessment, Projection and Action schemas,
- map the second-by-second operator flow,
- implement the accepted primary operational view,
- validate pacing and explainability against the selected scenario.

**Working principle:** show the reasoning trail, not only the final interface.
