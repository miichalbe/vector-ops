# VECTOR OPS

**Vector Operations System**

A modular operations coordination platform for distributed teams, autonomous assets and complex operational environments.

> **Project status:** M4 Working Prototype / vertical-slice implementation  
> **Version:** 0.1  
> **Started:** 21 September 2026  
> **Last updated:** 24 September 2026

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

The first demonstrator uses a **non-weaponized synthetic cascading-infrastructure scenario** grounded in documented dependencies between power, telecommunications, water, access and constrained restoration resources.

The primary operator is a **Dyżurny operacyjny Wojewódzkiego Centrum Zarządzania Kryzysowego (WCZK)** — a real Polish 24-hour crisis-management role responsible for monitoring, analysis, information flow, procedure activation, escalation and documentation.

The public alpha remains intentionally narrow: one operator, one operational area and one synthetic scenario with three bounded opening variants and three meaningful coordination or escalation moments. Opening variation and condition profiles are resolved from a visible run seed rather than implemented as duplicated narrative branches.

A new public run should generate a fresh seed, resolve one of the existing opening variants — `power-first`, `communications-first` or `water-first` — and retain enough run metadata for deterministic replay and later After-Action reconstruction.

## Current implementation

The active vertical slice currently includes:

- Astro application shell with a React interaction layer
- Shared TypeScript domain contracts
- Scenario 01 entity, capability, dependency and baseline-observation registries
- Deterministic seeded run resolution across three opening variants and four condition profiles
- Bounded dominant/secondary profile parameters resolved before runtime
- Immutable scenario runtime state
- Primary operational view driven by runtime selectors
- Simulation clock with explicit manual pause and blocking-decision pause rules
- Deterministic scenario-time event processing with append-only event and Observation effects
- Deterministic Assessment rule evaluation with inspectable evidence, dependencies and append-only material revisions
- Time-dependent Projection evaluation with bounded horizons, explicit uncertainty and profile-sensitive timing
- Decision Focus Mode with reusable Action Review for blocking Decisions
- Decision 1 downstream consequences that alter information timing, confidence support, regional awareness and coordination load without branching the physical scenario
- Scenario 01 Act 2 physical cascade and revised Assessment / Projection behaviour
- Decision 2 resource-conflict gate using the same reusable decision-review pattern
- Cross-domain Live Activity timeline combining material observations, coordination events, derived-intelligence revisions and recorded operator Decisions
- Compact neutral decision acknowledgement toast and transient new-entry attention treatment
- Automated runtime tests, project type checking and production build verification

The runtime resolves the opening variant, dominant profile, different secondary modifier and bounded run parameters from the scenario version and seed. Every opening produces three ordered, causally linked Observations without leaking data from the other variants. Profile strength changes communication degradation, access delays, resource margins and information quality; the secondary modifier is deliberately weaker than the dominant profile. The documented seed `8F4C` resolves to `water-first`, `access-constrained` and `low-confidence-data`.

After the third opening Observation, Scenario 01 evaluates the first cross-domain rule outside the UI. It creates an inspectable `A-01` Assessment only when the required evidence is present, then creates the first time-dependent Projection. The first blocking Decision asks the operator to choose an information posture. The selected Action is recorded in runtime state and changes later information / coordination conditions without creating a separate physical storyline.

Act 2 then progresses through a persistent F-12 disruption, communications backup operation, access restriction, reduced pumping and worsening information visibility. The earlier Assessment and Projection are revised rather than silently overwritten. Once the shared AG-400 resource conflict is mature, Decision 2 opens through the same generic Decision / Action Review runtime and interface.

The Live Activity timeline provides one newest-first cross-domain chronology so the operator can see what changed without opening each entity individually. It remains distinct from the future complete Operational History, which will support historical decision context, action lifecycle, expected versus observed effects and After-Action reconstruction.

## Public-prototype readiness

The next public-demo work is no longer basic scenario mechanics. The remaining work is to turn the current vertical slice into a coherent repeatable public experience:

1. create a run bootstrap / reset flow that generates a fresh seed instead of always using `8F4C`;
2. validate all three opening variants against the current D1 → Act 2 → D2 flow;
3. complete the third decision and final scenario progression if the release is to match the full public-alpha contract;
4. add completion / replay and After-Action handling appropriate to the selected release scope;
5. add minimal public-demo framing / synthetic-data disclosure;
6. confirm static OVH deployment and publish the build at `vector.michalbiernacki.com`;
7. run production smoke tests across multiple seeds before sharing the link.

## Documentation

- [Discovery Brief](docs/discovery/discovery-brief.md)
- [Information Architecture](docs/architecture/information-architecture.md)
- [Decision Log](docs/decisions/decision-log.md)
- [Adjacent Product Landscape](docs/research/adjacent-product-landscape.md)
- [Cross-Domain Decision Friction](docs/research/cross-domain-decision-friction.md)
- [Primary Operator — Polish Context](docs/research/primary-operator-polish-context.md)
- [Scenario Experience Contract](docs/scenario/scenario-experience-contract.md)
- [Primary Scenario Package](docs/scenario/primary-scenario-package.md)
- [Primary Operator Flow & Scenario Runtime Contract](docs/design/primary-operator-flow.md)
- [Primary Operational View](docs/design/primary-operational-view.md)
- [Operational Timeline / Live Activity](docs/design/operational-timeline.md)
- [UX Requirements](docs/design/ux-requirements.md)
- [Evidence Library](docs/research/evidence-library.md)

## Current implementation questions

- What is the strongest final placement / view relationship between Live Activity and the entity / Assessment / Projection workspace?
- Which current scenario intervals still feel unnecessarily quiet after Live Activity is visible?
- What minimum completion experience is required for the first public deployment: D2-bounded demonstrator or full D3 + After-Action flow?
- How should a public `New run` / replay flow expose the seed without revealing hidden opening/profile configuration during the live run?
- Which onboarding elements remain necessary once the public demo is reachable without project context?

## Non-goals

The public demonstrator is **not** intended to include weapon control, target engagement, autonomous lethal decision-making, sensitive real-world operational data or production-grade military security infrastructure.

## Next step

Prepare the public-run bootstrap around fresh deterministic seeds, validate all three opening variants against the current vertical slice and then complete only the additional scenario / deployment scope required by the chosen public-release definition.

---

**VECTOR OPS** is an independent Polish project exploring how contemporary design, software development and AI-assisted tools can support operational resilience and safety.
