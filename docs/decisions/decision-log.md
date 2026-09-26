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

### D17 — Astro and React presentation boundary
**Decision:** Use Astro as the application shell and static-build layer, with React as the client-side presentation and interaction layer for the operational workspace.

**Architecture boundary:** The deterministic scenario runtime, shared domain state, event processing, rules, Assessments, Projections, Actions, Decisions and audit history remain framework-independent TypeScript. React consumes runtime snapshots, presents them to the operator and dispatches explicit operator commands; it must not become the source of truth for simulated state or operational logic.

**UI-state boundary:** React may own presentation state such as the selected entity, open panel, active filter, expanded evidence path and focus state. Domain facts, scenario time, action lifecycle and decision records belong to the shared runtime.

**Reasoning:** VECTOR OPS requires a highly interactive, data-driven operational interface in which multiple components respond consistently to the same changing state. React provides a mature component and state model, strong TypeScript support and a widely understood implementation approach. Astro remains useful for the static application shell, straightforward deployment and possible public context or documentation surfaces around the operational application.

**Trade-offs:** The main operational workspace will likely run as one hydrated React application rather than many isolated islands. This makes Astro a relatively thin shell and introduces React runtime cost, component lifecycle rules and potential unnecessary re-rendering. Fast-changing values such as the scenario clock must therefore use focused subscriptions, and accessibility, keyboard behaviour and focus management remain explicit design responsibilities.

**Consequence:** Add the official Astro React integration. Keep reusable presentation components separate from the shared runtime and module logic. Do not introduce additional UI frameworks unless a concrete implementation need justifies the cost.

### D18 — Living UX requirements contract
**Decision:** Maintain a living [UX Requirements](../design/ux-requirements.md) document for accepted implementation-level interaction, layout, accessibility and trust-presentation requirements.

**Boundary:** The UX Requirements document supplements the Primary Operational View and records refinements discovered against working software. It does not replace domain, scenario or runtime contracts, and provisional implementation choices must be identified as provisional.

**Maintenance rule:** When an accepted UX decision changes operator behaviour, information hierarchy, interaction semantics, accessibility, layout stability or trust presentation, update the UX Requirements document in the same change or before the related work is considered complete. Small visual tuning that does not change behaviour or hierarchy does not require a new requirement.

**Reasoning:** Interaction decisions were already emerging through implementation and usability inspection of the working interface. Recording them only in code or conversation would make the rationale difficult to recover and would allow later changes to accidentally reverse accepted behaviour.

**Consequence:** Current requirements include stable entity-tile geometry, a persistent `View details` label, full-tile details selection, separate future action controls, stable Selected entity panel placement and height, a three-observation preview, native keyboard activation and explicit deferral of arrow-key grid navigation.

## 23 September 2026 — v0.3

### D19 — Decision Focus Mode and Action Review
**Decision:** Treat Action Review as a distinct **Decision Focus Mode** of the Operational Workspace. VS1 supports one blocking Decision at a time. The target product model must later support blocking and non-blocking Decisions, including the possibility of multiple simultaneously open Decisions, without assuming that several full review surfaces are displayed at once.

**Interaction:** A blocking Decision pauses runtime through `awaitingDecision`, visually suppresses and blocks the routine workspace, and presents one focused Action Review. The default review prioritises the decision question, a concise `Why now` explanation and directly comparable Action options. Full evidence, unknowns and assumptions remain inspectable through progressive disclosure.

**Action selection:** The complete Action card is selectable. Selection is separate from confirmation. The confirmation CTA remains short (`Confirm selection`) and authority wording must reflect the operator's actual mandate rather than imply direct control.

**Acknowledgement:** Recording a Decision produces a factual `Action recorded` receipt. The UI must not describe the operational outcome as successful merely because the Action was recorded.

**History and attention:** Reserve global History and Notifications entry points near scenario time. Operational History must eventually combine contemporaneous Decision context with later Action lifecycle and observed effects. Notifications may later surface open Decisions, deadlines, external responses and other attention items. Detailed History and Notifications behaviour are outside VS1.

**Reasoning:** The first working Decision 1 screen exposed two problems: too much reasoning detail competed with the actual choice, and the Action Review looked too similar to routine monitoring. A dedicated focus mode better matches the consequence of a blocking decision while progressive transparency keeps the reasoning inspectable without forcing all detail into the default view.

**Consequence:** The reusable interaction contract is maintained in [Action Review Pattern](../design/action-review-pattern.md) and [UX Requirements](../design/ux-requirements.md). Future Decision 2 and Decision 3 implementations should reuse this pattern rather than introduce separate decision-specific presentation logic.

## 26 September 2026 — v0.4

### D20 — Single roadmap and milestone-based continued development
**Decision:** Keep `ROADMAP.md` as the single canonical planning record for VECTOR OPS and continue post-alpha product development through the same milestone model used by the rest of the project. Do not maintain a separate Release Plan or a duplicated product-planning narrative.

**Documentation boundary:** The repository remains the canonical source of truth for project state, decisions, implementation and planning. `README.md` summarizes the current state and links to the roadmap. Public and in-product project communication may expose the current version and link to, or selectively present information derived from, the repository roadmap, but must remain subordinate to it.

**Milestone model:** Post-alpha work continues as M7 — Product Evolution Visibility, M8 — Authentication & Session Lifecycle and M9 — Seeded Scenario Variation Refinement rather than a separate `Priority 1 / 2 / 3` planning system. Earlier incomplete milestones may remain open when that truthfully represents project history; milestones do not need to behave as mutually blocking phases.

**Release-history boundary:** Do not introduce a separate changelog merely to duplicate milestone completion information. Git history, issues, the Decision Log and dated milestone status already preserve different levels of project history. A separate release-history artifact should only be introduced later if a concrete user or project need is demonstrated.

**Dates:** Record completion dates at meaningful milestone or release boundaries where useful. Do not date every roadmap checkbox; Git history remains the detailed implementation chronology.

**Reasoning:** The previous Release Plan repeated information already present in `ROADMAP.md` and introduced a second planning vocabulary after M6. Consolidating future work into milestones reduces documentation drift, preserves the repository as the working project artifact, and lets the repository itself serve both the project team and interested public users.

**Consequence:** Remove `RELEASE_PLAN.md` after preserving its unique requirements in the roadmap. M7 should solve discoverability of product evolution from the live application without creating another independently maintained planning surface.

