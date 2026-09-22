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

