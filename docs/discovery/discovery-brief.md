# VECTOR OPS — Discovery Brief

**Version:** 0.1  
**Date:** 21 September 2026  
**Status:** Discovery

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

## 3. Primary users

Potential user groups include operations coordinators, mission planners, field and command operators, search-and-rescue teams, emergency-response teams, infrastructure operators, public-safety organizations and defence-adjacent users.

The public demonstrator will remain non-weaponized and suitable for open presentation.

## 4. Core value proposition

VECTOR OPS should answer not only:

> What is happening and where?

but also:

> What will become a problem if nothing changes?

and:

> Which dependencies create that problem, and what action can the operator take?

## 5. Product principles

### Modular by design
Capabilities are added as modules/plugins rather than by rewriting the core.

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

## 8. Initial demonstration hypothesis

The first scenario may use a **search-and-rescue / distributed-response mission**.

Example: multiple teams and UAVs cover an area while battery levels change, communications quality deteriorates, task priorities evolve and assets become unavailable.

Instead of presenting four independent warnings, VECTOR OPS should create one operational consequence:

> **Sector Bravo coverage will be lost in 11 minutes.**

It can then present an explainable operator-reviewable option, such as reallocating UAV-12, together with expected delay and remaining reserve.

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
- Unsafe or sensitive implications in public presentation.

## 11. Open discovery questions

- Which exact operational scenario should define MVP success?
- Who is the primary operator persona?
- What decisions are they responsible for?
- What existing products solve adjacent parts of the workflow?
- Where does operator friction remain?
- Which 3–4 modules are necessary for a credible MVP?
- What is the minimum credible consequence / forecast engine?
- What interactions create the strongest “wow” moment without becoming theatrical?
- What should persist on a server versus remain simulated in-browser?
- What security and privacy constraints should shape the public demo?

## 12. Discovery exit criteria

Discovery can be considered complete enough to begin interaction design when:

- the adjacent product landscape has been reviewed,
- one primary operational scenario has been selected,
- the primary operator and decision responsibilities are defined,
- MVP modules and non-goals are agreed,
- the information architecture and shared entity model are accepted,
- the demonstration story is defined from start state through decision to outcome,
- the technical deployment approach for the public demo is confirmed.

## 13. Next discovery pass

The next iteration should not begin with screen design. It should map the adjacent product landscape, identify cross-domain decision friction, select one primary scenario and operator, reduce the MVP to the minimum module set, and only then proceed to flows, wireframes and prototyping.

**Working principle:** show the reasoning trail, not only the final interface.
