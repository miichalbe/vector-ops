# VECTOR OPS — Decision Log

This document records product decisions made during discovery so that future changes can be understood in context.

## 21 September 2026 — v0.1

### D1 — Product scope
**Decision:** Build a modular operations system rather than a single-purpose drone interface.

**Reasoning:** The strongest concept is not fleet control itself, but coordination across multiple operational domains.

### D2 — Relationship to tactical-awareness systems
**Decision:** Do not attempt to compete with TAK / ATAK on situational awareness alone.

**Reasoning:** Shared maps, positions and tactical awareness already exist in mature systems.

### D3 — Differentiator hypothesis
**Decision:** Use cross-domain operational consequences as the primary differentiation hypothesis.

**Reasoning:** The system should combine information from separate modules into consequences and operator decisions rather than expose more raw telemetry.

### D4 — Public demonstrator safety boundary
**Decision:** Keep the public demonstrator non-weaponized.

**Reasoning:** Complex operational coordination can be demonstrated without weapon control, target engagement or lethal autonomy.

### D5 — Design sequence
**Decision:** Define architecture and operational logic before high-fidelity interface design.

**Reasoning:** The project is intended to demonstrate systems thinking, not just visual execution.

### D6 — Demonstrator fidelity
**Decision:** Build real interactive software rather than a static portfolio prototype.

**Reasoning:** State changes, event propagation, dependencies and operator decisions are central to the concept.

### D7 — Documentation model
**Decision:** Keep documentation in version-controlled Markdown and derive public-facing artifacts from it.

**Reasoning:** Git history should preserve the reasoning trail, while the same source material can later support the project website and downloadable PDF.

## 22 September 2026 — v0.2

### D8 — Feasibility boundary
**Decision:** The public demonstrator must be buildable and operable with the project's available resources: a free GitHub account, the existing OVH-hosted `michalbiernacki.com` site and, where useful, a local Ubuntu environment on the Huidun H20.

**Reasoning:** The project is primarily a portfolio case study. Its credibility depends on reaching a working public result without requiring paid cloud services, proprietary operational data or infrastructure that cannot be maintained independently.

**Consequence:** The initial demonstrator should be a browser-based static application with deterministic local state and scenario data. No paid API, live external integration, always-on local server, runtime LLM, authentication system or database may be mandatory for the public experience.

### D9 — Extensible implementation architecture
**Decision:** Implement the first release as a modular frontend monolith with a shared typed domain model, central state, event contracts, module registry, data-driven scenarios and consequence rules separated from presentation components.

**Reasoning:** The first public slice will be deliberately narrow, but it must accept additional operational modules, scenarios and interactions in subsequent days and weeks without rewriting the application core.

**Consequence:** New modules should be addable through an explicit module contract and registration step. Full third-party plugin installation, dynamic loading, a plugin marketplace, microservices and separate repositories per module are outside the initial scope.

### D10 — Time-boxed public alpha
**Decision:** Target a testable vertical slice by 24 September 2026 and a public alpha by 25 September 2026.

**Reasoning:** A short delivery cycle creates a concrete portfolio artifact and enables early feedback. The release label must accurately communicate that the experience is an evolving demonstrator rather than a production system.

**Initial alpha boundary:**

- one primary operator,
- one synthetic cascading-infrastructure scenario,
- one operational area,
- three meaningful decision moments,
- inspectable dependencies and projected consequences,
- constrained-resource trade-offs,
- an audit trail,
- scenario reset and replay.

**Consequence:** Breadth, full responsiveness, broad usability validation, live integrations and the final portfolio case study may follow after the alpha. The time box must not justify disposable architecture or hard-coded UI-specific scenario logic.

### D11 — Primary operator
**Decision:** Use the **Dyżurny operacyjny Wojewódzkiego Centrum Zarządzania Kryzysowego (WCZK)** as the primary operator for the public alpha. Use **Duty Operations Officer — Voivodeship Crisis Management Centre** as the English portfolio label.

**Reasoning:** Polish law and current civil-service recruitment establish a real 24-hour role responsible for threat monitoring, analysis and forecasting, report evaluation, rapid information flow, procedure activation, cooperation with multiple public bodies and documentation. This provides credible cross-domain grounding without inventing a new occupation.

**Authority boundary:** The duty officer is not the independent commander of electricity, telecommunications, water or transport operators. Regional crisis-management authority belongs to the voivode, supported by the WZZK, while infrastructure operators retain operational control of their systems.

**Consequence:** VECTOR OPS should support assessment, information verification, procedure activation, recommendation, escalation and audit. Actions outside the user's mandate must be represented as requests, recommendations or approvals by the responsible authority—not as direct execution by the duty officer.

### D12 — Scenario experience contract
**Decision:** Structure the public alpha as a replayable 5–7 minute operational simulation with a short product context layer, scenario briefing, three-act live run, three bounded decision moments and a reconstructable after-action report.

**Reasoning:** The demo must communicate the project to a first-time visitor, reveal its central value within the first minute, support deeper 8–10 minute exploration and remain credible for a real WCZK duty role.

**Randomisation:** Use seeded, bounded variation around a fixed narrative spine. Randomness may vary timing, data quality, access, resource availability and external responses, but must not remove required decisions, break causal logic or produce untestable runs.

**Outcome:** Every run must preserve the initial state, event and decision timeline, final state, evidence available at each decision, expected effects, observed effects, unresolved items and scenario seed.

**Consequence:** The scenario must be data-driven and reconstructable from its definition, run configuration and append-only event log. The same scenario version, seed and decisions must reproduce the same outcome.

### D13 — Primary scenario package
**Decision:** Use a synthetic cascading-infrastructure disruption in fictional Nowy Brzeg County, Mazowieckie Voivodeship. The scenario has no narrative title and the application UI is English.

**Operational spine:** Power-quality disturbances progress into a feeder interruption affecting a water station and regional communications gateway. Deteriorating communications reduce both coordination and visibility. One compatible mobile generator creates a cross-domain trade-off, followed by a bounded coordination/escalation decision.

**Reasoning:** The scenario grounds VECTOR OPS in a real Polish administrative context while keeping all infrastructure, values and topology fictional. It demonstrates cross-domain consequences without requiring cause attribution, sensitive data or unrealistic WCZK command authority.

**Consequence:** The accepted definition is maintained in [Primary Scenario Package](../scenario/primary-scenario-package.md). Issue #4 may close; the detailed second-by-second operator flow remains separate work under issue #12.

### D14 — MVP modules and shared information model
**Decision:** Use four operational modules for the public alpha: Power, Water, Communications, and Critical Services & Response, supported by the shared core.

**Model:** Separate physical, observed, assessed, projected and data states. Modules publish sourced observations through a common envelope and use typed semantic dependencies rather than adding scenario-specific fields to a universal asset.

**Reasoning:** This is the minimum set that demonstrates a power–communications–water–critical-service cascade while preserving a path to later UAV, vehicle, weather, field-team and logistics modules.

**Consequence:** Alpha uses a compile-time module registry inside a modular frontend monolith. Dynamic plugin loading is not required.

### D15 — Primary operational view and trust pattern
**Decision:** Use a desktop-first tile dashboard occupying approximately 70% of the workspace and a 30% intelligence column with Assessment above Projection.

**Details:** One tile represents one entity and may receive content from several modules. Both Assessment and Projection support multiple prioritised items. Operational severity is distinct from data freshness. Actions may be entered from an entity, Assessment or Projection but share one domain and audit record.

**Trust requirement:** Every verbal or derived claim must expose source observations or reports, timestamps, rules, dependencies, assumptions and uncertainty through a consistent evidence path.

**Outcome presentation:** End the session with factual state comparison and timeline rather than a user score, success/failure verdict or named outcome class.

**Consequence:** The accepted structure is maintained in [Primary Operational View](../design/primary-operational-view.md).

### D16 — M2 shared system contract
**Decision:** Adopt one lightweight shared implementation contract across issues #8–#11 rather than separate entity, module, event and consequence frameworks.

**Core model:** Use a small open `Entity`, optional `Capability`, append-only `Observation`, typed `Dependency`, separate `Assessment` and `Projection`, distinct `Action` and `Decision`, and one versioned `DomainEvent` envelope.

**Rules:** Assessments and Projections are produced by deterministic, side-effect-free TypeScript rules that expose evidence, dependencies, assumptions and uncertainty. Derived claims are revisioned rather than silently overwritten.

**Modules:** Operational modules are compile-time packages registered through a lightweight manifest and registration API. Modules contribute metrics, observations, rules, actions, event handlers and UI surfaces to shared entities but do not exclusively own entity instances.

**Prioritisation:** Use explicit deterministic ordering based on attention, severity, time-to-impact and recent material change. Do not introduce an opaque composite score for the alpha.

**Audit:** Material domain events form an append-only history that preserves what evidence was available when a decision was made.

**Reasoning:** This provides enough structure to support the 24 September vertical slice and later module/scenario extension without introducing a backend, runtime plugin framework, rules DSL, graph database or other premature platform infrastructure.

**Consequence:** The canonical implementation contract is maintained in [System Contract](../architecture/system-contract.md). Architecture should not be expanded conceptually unless a concrete implementation need appears.
