# VECTOR OPS — Roadmap

**Current phase:** Working Prototype / Public-demo preparation  
**Current milestone:** M4 — Working Prototype, with M3 interaction refinement continuing against working UI  
**Project status:** Active  
**Last updated:** 24 September 2026

This roadmap tracks the evolution of VECTOR OPS from early discovery to a public working demonstrator and portfolio case study.

The roadmap is intentionally outcome-based. Each milestone should leave behind a visible artifact or working capability.

## Near-term delivery target

**Testable vertical slice:** achieved for D1 → Act 2 → D2 flow on 24 September 2026  
**Public prototype / alpha:** complete the full documented Scenario 01 contract before deployment: D1 → D2 → D3 → final progression / handover → simple factual After-Action Report → full regression and manual validation → production deployment

The alpha remains a narrow end-to-end demonstration: one primary operator, one synthetic cascading-infrastructure scenario, one operational area, three bounded opening variants and three meaningful decision moments. It must remain structurally open to additional modules and scenarios after launch.

There is no separate D2-only preview release in the current plan. Public deployment follows completion and validation of the full alpha contract.

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
- [x] Establish cross-domain Live Activity timeline pattern
- [ ] Finalize alert / attention queue relationship
- [ ] Finalize asset detail interaction
- [x] Implement and refine reusable decision-review flow for D1/D2
- [ ] Design degraded-state interactions
- [ ] Resolve final Live Activity vs workspace placement / view model
- [ ] Create remaining low-fidelity wireframes only where running UI still leaves structural uncertainty
- [ ] Validate final primary scenario against public-demo pacing

Primary flow and runtime behaviour are specified in [Primary Operator Flow & Scenario Runtime Contract](docs/design/primary-operator-flow.md). Running UI remains the primary validation surface for unresolved interaction details.

---

## M4 — Working Prototype

**Goal:** Build a real browser-based system with state, events and causality.

### Outcomes
- Frontend application shell
- Shared state / entity registry
- Module registry
- Simulation clock
- Event processing
- Initial operational modules / capability inputs
- Working scenario simulation
- Cross-module consequence generation

### Planned work
- [x] Set up Astro / application shell
- [x] Define repository app structure
- [x] Implement shared entity registry
- [ ] Implement explicit module registry
- [x] Implement simulation clock
- [x] Implement deterministic scenario event processing
- [x] Implement primary operational picture
- [x] Implement synthetic scenario engine for opening through Act 2
- [x] Implement operational consequence logic for current vertical slice
- [x] Implement operator Decisions 1 and 2 through shared Action / Decision runtime
- [x] Add Live Activity chronology from runtime state
- [ ] Implement Decision 2 downstream external response and deployment progress
- [ ] Complete Decision 3 and final scenario progression / handover
- [ ] Add simple factual After-Action Report
- [ ] Complete Operational History / audit interaction beyond the minimum alpha AAR where needed

**Current implementation checkpoint:** The browser prototype now supports the stable baseline, seeded opening variation, live Observation progression, inspectable Assessment / Projection reasoning, blocking Decision Focus Mode, recorded Actions, D1-dependent information / coordination outcomes, shared Act 2 physical progression, material Assessment / Projection revisions, D2 resource conflict, cross-domain Live Activity, neutral decision acknowledgement and transient attention treatment for newly arrived timeline entries.

The current tested path is:

```text
baseline
→ bounded opening variation
→ observations
→ Assessment
→ Projection
→ Decision 1
→ D1-dependent information / coordination feedback
→ shared Act 2 physical cascade
→ revised Assessment / Projection
→ Decision 2
```

The runtime already contains three opening variants — `power-first`, `communications-first`, `water-first` — and four condition profiles. Run resolution is deterministic from seed, but the application currently boots the fixed documented seed `8F4C`. Public-demo preparation should replace that fixed bootstrap with a fresh-seed run factory / reset flow rather than introduce duplicated scenario branches.

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
→ D1 downstream consequences
→ Act 2 + D2
→ Live Activity / attention refinement
→ D2 downstream response / deployment
→ hospital / critical-service consequence
→ Decision 3
→ final stabilisation or controlled deterioration
→ operational handover
→ simple factual After-Action Report
→ fresh-seed run bootstrap + replay
→ pacing / high-impact interaction polish
→ full regression + manual scenario validation
→ deployment and production smoke test
```

---

## M5 — Public Demo

**Goal:** Turn the completed vertical slice into a coherent, credible public demonstration.

### Outcomes
- Complete three-Decision Scenario 01 run
- Simple factual After-Action Report
- Repeatable seeded public run across three bounded opening variants
- Full automated regression and manual end-to-end validation completed before deployment
- Polished-enough visual and interaction system
- Stable deployment
- Documentation links
- Public project page / portfolio integration

### Planned work
- [ ] Complete D2 downstream external response, deployment progress and resulting consequence revisions
- [ ] Add hospital / critical-service consequence and Decision 3
- [ ] Complete final stabilisation or controlled-deterioration sequence and operational handover
- [ ] Add simple factual After-Action Report with run configuration, key chronology, D1/D2/D3 selections, expected versus observed effects and unresolved items
- [ ] Replace fixed seed bootstrap with fresh deterministic run seed
- [ ] Add scenario reset / replay / New run with same-seed reproducibility
- [ ] Validate `power-first`, `communications-first` and `water-first` through the complete Scenario 01 path
- [ ] Run full automated regression, type checking and production build verification
- [ ] Run manual end-to-end tests across representative D1/D2/D3 paths, including keyboard/focus, Timeline, acknowledgements, AAR and replay
- [ ] Reassess scenario pacing with Live Activity visible
- [ ] Resolve only the high-impact layout questions exposed by full-run validation
- [ ] Add minimal public-demo onboarding and synthetic-data / non-live disclosure
- [ ] Optimize performance and production build
- [ ] Confirm OVH deployment path
- [ ] Configure `vector.michalbiernacki.com`
- [ ] Deploy static production build only after the full alpha acceptance path is green
- [ ] Smoke-test several fresh seeds in production
- [ ] Integrate with michalbiernacki.com
- [ ] Publish supporting project documentation / Discovery Brief PDF when ready

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
