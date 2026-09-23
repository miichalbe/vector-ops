# VECTOR OPS — Roadmap

**Current phase:** Working Prototype / Interaction Refinement  
**Current milestone:** M4 — Working Prototype, with M3 interaction refinement continuing against working UI  
**Project status:** Active  
**Last updated:** 23 September 2026

This roadmap tracks the evolution of VECTOR OPS from early discovery to a public working demonstrator and portfolio case study.

The roadmap is intentionally outcome-based. Each milestone should leave behind a visible artifact or working capability.

## Near-term delivery target

**Testable vertical slice:** 24 September 2026  
**Public alpha:** 25 September 2026

The alpha is a narrow end-to-end demonstration: one primary operator, one synthetic cascading-infrastructure scenario, one operational area and three meaningful decision moments. It must remain structurally open to additional modules and scenarios after launch.

The time box changes delivery breadth, not the architectural principles. Shared entities, state, events, module registration, scenario data and consequence rules must not be hard-coded into individual UI components.

---

## M1 — Discovery Complete

**Goal:** Turn the broad concept into one evidence-based, testable product direction.

### Outcomes
- Adjacent product landscape mapped
- Primary operator persona selected
- Primary operational scenario selected
- Core problem and value proposition refined
- MVP module set defined
- Key risks and assumptions documented
- Discovery brief updated to v0.2

### Planned work
- [x] Map adjacent products and categories
- [x] Review TAK / ATAK ecosystem
- [x] Review UAV ground-control systems
- [x] Review fleet and logistics tools
- [x] Review emergency-management / C2-adjacent tools
- [x] Identify cross-domain decision friction
- [x] Define primary operator
- [x] Define primary scenario
- [x] Select MVP modules
- [x] Update Discovery Brief

---

## M2 — System Definition

**Goal:** Define how VECTOR OPS works before designing the interface.

### Outcomes
- Domain model finalized
- Module boundaries defined
- Module communication contract defined
- Event taxonomy created
- Decision / consequence logic defined
- Scenario state model documented

**Canonical implementation contract:** [System Contract](docs/architecture/system-contract.md)  
**Scenario/runtime handoff:** [Primary Operator Flow & Scenario Runtime Contract](docs/design/primary-operator-flow.md)

### Planned work
- [x] Refine core entity model
- [x] Define module contracts
- [x] Define module registration contract
- [x] Define event types
- [x] Define shared state model
- [x] Define dependency model
- [x] Define operational consequence model
- [x] Define audit-trail requirements
- [x] Define scenario state machine
- [x] Define data-driven scenario format

**Status:** Complete for vertical-slice implementation. Future contract changes should be driven by concrete implementation needs.

---

## M3 — Interaction Design

**Goal:** Translate system behavior into clear operator interactions.

M3 no longer blocks implementation. Remaining interaction work is intentionally refined against the working interface rather than completed entirely as speculative documentation.

### Outcomes
- Primary operator flow
- Information hierarchy
- Key screen architecture
- Alert / consequence patterns
- Decision-review interaction
- Low-fidelity prototype

### Planned work
- [x] Map end-to-end operator flow
- [x] Define information hierarchy
- [x] Design Common Operational Picture structure
- [ ] Design alert / attention queue
- [ ] Design asset detail interaction
- [ ] Design decision-review flow
- [ ] Design degraded-state interactions
- [ ] Create low-fidelity wireframes
- [ ] Validate against primary scenario

Primary flow and runtime behaviour are specified in [Primary Operator Flow & Scenario Runtime Contract](docs/design/primary-operator-flow.md). The reusable Action Review pattern remains tracked separately and should be refined while implementing the actual component.

---

## M4 — Working Prototype

**Goal:** Build a real browser-based system with state, events and causality.

### Outcomes
- Frontend application shell
- Shared state / entity registry
- Module registry
- Simulation clock
- Event bus
- Initial operational modules
- Working scenario simulation
- Cross-module consequence generation

### Planned work
- [x] Set up Astro / application shell
- [x] Define repository app structure
- [x] Implement shared entity registry
- [ ] Implement module registry
- [x] Implement simulation clock
- [ ] Implement event bus
- [ ] Implement map / operational picture
- [ ] Implement first 3–4 MVP modules
- [ ] Implement synthetic scenario engine
- [ ] Implement operational consequence logic
- [ ] Implement operator decisions
- [ ] Add audit trail

**Current implementation checkpoint:** The application shell, shared contracts and entity registry, Scenario 01 baseline data, deterministic seed-based resolution across three opening variants and four condition profiles, bounded dominant/secondary profile parameters, runtime state, primary operational view, tested simulation clock, deterministic scenario-time event processing, complete three-observation opening sequences, the first explainable cross-domain Assessment and the first bounded communications-continuity Projection are in place. Assessment and Projection evaluation is deterministic, idempotent and preserves material revisions. The next implementation step is composing event and rule evaluation into one runtime step and exposing the derived claims through the operational view.

### First implementation sequence

```text
application shell
→ shared types/state
→ seeded scenario configuration
→ simulation clock/runtime
→ event processing
→ observations + dependency registry
→ Assessment/Projection rules
→ primary operational view
→ Decision / Action Review
→ audit timeline
→ After-Action Report
→ profile/seed validation and polish
```

---

## M5 — Public Demo

**Goal:** Turn the prototype into a coherent, credible public demonstration.

### Outcomes
- Complete demo scenario
- Polished visual system
- Stable deployment
- Documentation links
- Public project page
- Downloadable discovery PDF

### Planned work
- [ ] Refine visual language
- [ ] Polish interaction states
- [ ] Add scenario reset / replay
- [ ] Add onboarding / demo guidance
- [ ] Optimize performance
- [ ] Confirm OVH deployment path
- [ ] Deploy live demo
- [ ] Integrate with michalbiernacki.com
- [ ] Publish Discovery Brief PDF
- [ ] Add GitHub / website cross-links

---

## M6 — Case Study & Launch

**Goal:** Package the project as evidence of systems thinking, product design and implementation.

### Outcomes
- Portfolio case study
- Process narrative
- Architecture diagrams
- Demo screenshots / recordings
- LinkedIn launch material
- Public repository

### Planned work
- [ ] Write final case-study narrative
- [ ] Select key decisions and trade-offs
- [ ] Create final architecture visuals
- [ ] Capture polished screenshots
- [ ] Prepare short demo clip / GIF
- [ ] Prepare LinkedIn launch post
- [ ] Review repository for public release
- [ ] Add license if appropriate
- [ ] Switch repository visibility to Public
- [ ] Publish launch

---

## Roadmap principles

1. **Discovery before screens.**
2. **One primary scenario before broad platform scope.**
3. **Architecture before polish.**
4. **Real system behavior before presentation polish.**
5. **Every milestone leaves a visible artifact.**
6. **Decisions and changes remain documented in Git history.**
7. **Time-box scope, not architectural integrity.**
8. **New modules and scenarios must not require rewriting the application core.**
9. **Do not expand the architecture conceptually without a concrete implementation need.**
10. **Once the implementation contract is sufficient, resolve remaining interaction detail against working software.**
