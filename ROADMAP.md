# VECTOR OPS — Roadmap

**Current phase:** Working Prototype / Public-demo preparation  
**Current milestone:** M5 — Public Demo preparation, with targeted M3/M4 refinement continuing against working UI  
**Project status:** Active  
**Last updated:** 25 September 2026

This roadmap tracks the evolution of VECTOR OPS from early discovery to a public working demonstrator and portfolio case study.

The roadmap is intentionally outcome-based. Each milestone should leave behind a visible artifact or working capability.

## Near-term delivery target

**Testable vertical slice:** achieved for the complete Scenario 01 runtime — D1 → D2 → D3 → final progression → handover → completion → factual AAR — with deterministic seeded replay and bounded fresh-run variation.  
**Public prototype / alpha:** complete representative fresh-run manual validation → minimal public-demo onboarding / synthetic-data disclosure → production deployment and smoke testing.

**Latest validation artifacts:**  
- [Scenario 01 Runtime and Interaction Audit — 24 September 2026](docs/validation/scenario-01-runtime-audit-2026-09-24.md)  
- [Scenario 01 Fresh-Seed and Replay Validation — 25 September 2026](docs/validation/scenario-01-fresh-seed-replay-validation-2026-09-25.md)

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
- [x] Finalize current entity detail interaction for the primary scenario
- [x] Implement and refine reusable decision-review flow for D1/D2/D3
- [ ] Design degraded-state interactions beyond current data-quality treatments
- [x] Resolve Live Activity vs workspace placement / view model for the public alpha
- [ ] Create remaining low-fidelity wireframes only where running UI still leaves structural uncertainty
- [x] Validate current primary scenario against public-demo pacing for the fixed-seed full run

Primary flow and runtime behaviour are specified in [Primary Operator Flow & Scenario Runtime Contract](docs/design/primary-operator-flow.md). Running UI remains the primary validation surface for unresolved interaction details.

The primary operational view now explicitly separates:

```text
Entity tile       → current state
Selected entity   → current detail, provenance and dependencies
Live Activity     → what changed and when
Assessment        → current interpretation
Projection        → possible downstream consequence
```

This refinement is documented in [Entity State Presentation](docs/design/entity-state-presentation.md).

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
- [x] Implement synthetic scenario engine through the full three-Decision runtime
- [x] Implement operational consequence logic for the current vertical slice
- [x] Implement operator Decisions 1, 2 and 3 through shared Action / Decision runtime
- [x] Add Live Activity chronology from runtime state
- [x] Implement Decision 2 downstream external response and deployment progress
- [x] Add hospital / critical-service consequence
- [x] Complete Decision 3 downstream progression, resolution checkpoint and operational handover
- [x] Add deterministic runtime audit across all 27 D1 × D2 × D3 Action combinations for the documented reference run
- [x] Add simple factual After-Action Report
- [x] Add deterministic Scenario 01 run factory and same-seed replay lifecycle
- [x] Add fresh-seed end-to-end regression across all opening variants and dominant condition profiles
- [ ] Complete Operational History / audit interaction beyond the minimum alpha AAR where needed

**Current implementation checkpoint:** The browser prototype now supports the stable baseline, seeded opening variation, live Observation progression, stable current-state entity tiles, inspectable entity detail, Assessment / Projection reasoning, blocking Decision Focus Mode for the guided simulation, recorded Actions, D1-dependent information / coordination outcomes, Act 2 physical progression, D2 resource conflict and downstream AG-400 / restoration branches, hospital continuity consequence, D3 coordination posture, final stabilisation / controlled deterioration, operational handover, factual After-Action Report, same-seed replay and fresh-run generation.

The current tested runtime spine is:

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
→ external response / deployment or restoration-information branch
→ hospital / critical-service consequence
→ Decision 3
→ final coordination response
→ resolution checkpoint
→ operational handover
→ completed runtime
→ factual After-Action Report
→ Replay same seed OR New run
```

The runtime contains three opening variants — `power-first`, `communications-first`, `water-first` — and four condition profiles. Run resolution is deterministic from seed. The application retains `8F4C` as the documented reference run on initial load, while completed runs can be replayed from the same seed or restarted through a newly generated seed using the same Scenario 01 run factory.

Validation is deliberately layered rather than exhaustively Cartesian:

- all 27 D1 × D2 × D3 Action combinations are audited on the documented `8F4C` reference run;
- a 12-case matrix covers 3 opening variants × 4 dominant profiles end-to-end through completion;
- same-seed deterministic replay is covered automatically and the `8F4C` replay lifecycle has been manually confirmed.

See [Scenario 01 Runtime and Interaction Audit](docs/validation/scenario-01-runtime-audit-2026-09-24.md) and [Scenario 01 Fresh-Seed and Replay Validation](docs/validation/scenario-01-fresh-seed-replay-validation-2026-09-25.md).

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
→ runtime / interaction audit
→ simple factual After-Action Report
→ fresh-seed run bootstrap + replay
→ entity-state / inspection refinement
→ fresh-seed opening-variant regression
→ representative manual fresh-run validation
→ public-demo onboarding / disclosure
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
- [x] Complete D2 downstream external response, deployment progress and resulting consequence revisions
- [x] Add hospital / critical-service consequence and Decision 3
- [x] Complete final stabilisation or controlled-deterioration sequence and operational handover
- [x] Add simple factual After-Action Report with run configuration, key chronology, D1/D2/D3 selections, expected versus observed effects and unresolved items
- [x] Replace fixed-only bootstrap architecture with deterministic run factory and fresh run seeds
- [x] Add scenario replay / New run lifecycle with same-seed reproducibility
- [x] Validate `power-first`, `communications-first` and `water-first` automatically through complete Scenario 01 runs
- [x] Run full automated regression, type checking and production build verification after AAR / replay / fresh-seed integration
- [ ] Run final manual end-to-end tests across representative fresh-seed D1/D2/D3 paths, including keyboard/focus, Timeline, acknowledgements, AAR, Replay and New run
- [x] Reassess current scenario pacing with Live Activity visible for the fixed-seed full run
- [x] Complete focused runtime / interaction audit before AAR implementation
- [x] Resolve the high-impact entity-state / inspection layout issue exposed by full-run validation
- [ ] Add minimal public-demo onboarding and synthetic-data / non-live disclosure
- [ ] Optimize performance and production build where measurement indicates a need
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
