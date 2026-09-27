# VECTOR OPS — Roadmap

**Current phase:** Public alpha live / case study published / continuous product development  
**Current product-development milestone:** M7 — Product Evolution Visibility
**Project status:** Active  
**Last updated:** 27 September 2026

This roadmap tracks the evolution of VECTOR OPS from early discovery to a public working demonstrator and portfolio case study.

The roadmap is intentionally outcome-based. Each milestone should leave behind a visible artifact or working capability.

## Near-term delivery target

**Public prototype / alpha:** complete and live at `https://vector.michalbiernacki.com`.  
**Portfolio case study:** published on `michalbiernacki.com` on 26 September 2026.  
**Next target:** continue product development against this single roadmap. M6 — Case Study & Launch is complete; the scheduled LinkedIn launch communication will publish on 28 September 2026. The live product remains the primary demonstration surface.

**Latest validation artifacts:**  
- [Scenario 01 Runtime and Interaction Audit — 24 September 2026](docs/validation/scenario-01-runtime-audit-2026-09-24.md)  
- [Scenario 01 Fresh-Seed and Replay Validation — 25 September 2026](docs/validation/scenario-01-fresh-seed-replay-validation-2026-09-25.md)  
- [Public Alpha Acceptance Checklist — 25 September 2026](docs/validation/public-alpha-acceptance-checklist-2026-09-25.md)  
- [Public Alpha Deployment Validation — 25 September 2026](docs/validation/public-alpha-deployment-2026-09-25.md)

The alpha remains a deliberately narrow end-to-end demonstration: one primary operator, one synthetic cascading-infrastructure scenario, one operational area, three bounded opening variants and three meaningful decision moments. It remains structurally open to additional modules and scenarios after launch.

The public alpha is deployed and smoke-tested, the portfolio case study is published, the repository is public, and broader launch communication is scheduled. M6 — Case Study & Launch is complete. VECTOR OPS remains an actively developed working system; unfinished earlier roadmap items remain visible unless they are explicitly completed, superseded or intentionally deferred.

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

The primary operational view explicitly separates:

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

**Current implementation checkpoint:** The browser prototype supports the stable baseline, seeded opening variation, live Observation progression, stable current-state entity tiles, inspectable entity detail, Assessment / Projection reasoning, blocking Decision Focus Mode for the guided simulation, recorded Actions, D1-dependent information / coordination outcomes, Act 2 physical progression, D2 resource conflict and downstream AG-400 / restoration branches, hospital continuity consequence, D3 coordination posture, final stabilisation / controlled deterioration, operational handover, factual After-Action Report, same-seed replay and fresh-run generation.

The tested runtime spine is:

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
- same-seed deterministic replay is covered automatically and manually;
- representative fresh-seed interaction and presentation are manually validated.

See [Scenario 01 Runtime and Interaction Audit](docs/validation/scenario-01-runtime-audit-2026-09-24.md) and [Scenario 01 Fresh-Seed and Replay Validation](docs/validation/scenario-01-fresh-seed-replay-validation-2026-09-25.md).

### Implementation sequence

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
→ deployment
→ production smoke test
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
- Public custom domain
- Production smoke validation

### Planned work
- [x] Complete D2 downstream external response, deployment progress and resulting consequence revisions
- [x] Add hospital / critical-service consequence and Decision 3
- [x] Complete final stabilisation or controlled-deterioration sequence and operational handover
- [x] Add simple factual After-Action Report with run configuration, key chronology, D1/D2/D3 selections, expected versus observed effects and unresolved items
- [x] Replace fixed-only bootstrap architecture with deterministic run factory and fresh run seeds
- [x] Add scenario replay / New run lifecycle with same-seed reproducibility
- [x] Validate `power-first`, `communications-first` and `water-first` automatically through complete Scenario 01 runs
- [x] Run full automated regression, type checking and production build verification after AAR / replay / fresh-seed integration
- [x] Run final manual end-to-end tests across the reference and representative fresh-seed D1/D2/D3 paths, including keyboard/focus, Timeline, acknowledgements, AAR, Replay and New run
- [x] Reassess current scenario pacing with Live Activity visible for the fixed-seed full run
- [x] Complete focused runtime / interaction audit before AAR implementation
- [x] Resolve the high-impact entity-state / inspection layout issue exposed by full-run validation
- [x] Add minimal public-demo onboarding and synthetic-data / non-live disclosure
- [x] Confirm production deployment path: GitHub → Cloudflare Pages, with OVH-managed DNS
- [x] Configure `vector.michalbiernacki.com`
- [x] Deploy the accepted static production build
- [x] Smoke-test the reference run and a representative fresh-seed run in production

**Status:** Complete on 25 September 2026.

**Production:** `https://vector.michalbiernacki.com` is live over HTTPS through Cloudflare Pages. DNS for the portfolio domain remains at OVH, with `vector` delegated by CNAME to the Pages project. Production smoke validation passed after deployment. See [Public Alpha Deployment Validation](docs/validation/public-alpha-deployment-2026-09-25.md).

Items intentionally deferred beyond M5 include full Operational History, explicit runtime module-health registry, richer degraded-state interactions and broader alert / attention-queue design. Their absence did not block public-alpha acceptance.

---

## M6 — Case Study & Launch

**Goal:** Package the project as evidence of systems thinking, product design and implementation.

### Outcomes
- Portfolio case study
- Process narrative
- Architecture diagrams
- Product screenshots and direct access to the live system
- Portfolio integration
- LinkedIn launch material
- Repository prepared for public visibility

### Planned work
- [x] Write final case-study narrative
- [x] Select key decisions and trade-offs
- [x] Create final architecture visuals
- [x] Capture polished screenshots
- [x] Integrate VECTOR OPS with `michalbiernacki.com`
- [x] Publish the portfolio case study and VECTOR OPS update on `michalbiernacki.com`
- [x] Prepare LinkedIn launch post
- [x] Review repository for public release
- [x] Define repository licensing posture: no open-source license; original VECTOR OPS materials remain all rights reserved under the repository copyright notice
- [x] Switch repository visibility to Public
- [x] Schedule broader LinkedIn launch communication

**Status:** Complete on 27 September 2026. The portfolio/case-study portion was completed and deployed on 26 September 2026. The repository was reviewed and made public on 27 September 2026 with an explicit all-rights-reserved copyright boundary and no open-source license. The broader LinkedIn launch communication was prepared and scheduled for 28 September 2026. No additional demo clip / GIF is planned: the live product is the demonstration surface, supported by the case study, public repository and product screenshots.

---

## M7 — Product Evolution Visibility

**Goal:** Make the continued evolution of VECTOR OPS visible from the live product while keeping this repository roadmap as the canonical project record.

### Outcomes
- Lightweight public product-version convention
- Current version visible from the live product
- Direct, readable access from the product to the canonical repository roadmap
- Clear distinction between current capability, completed milestones and planned milestones without duplicating roadmap content in the application

### Planned work
- [ ] Define lightweight product versioning for public demo releases.
- [ ] Define how the current version is exposed in the live product.
- [ ] Add an in-product entry point to this canonical roadmap.
- [ ] Define a minimal returning-user pattern for discovering meaningful product changes without creating a parallel changelog or release-plan content store.
- [ ] Review existing product-context surfaces (including About / header utilities) and choose the lowest-noise placement.
- [ ] Replace roadmap-adjacent `Coming soon` language where it implies a delivery promise with wording consistent with milestone status.
- [ ] Validate that release/evolution communication remains outside the operational information hierarchy and does not add dashboard noise.

**Planning rule:** `ROADMAP.md` remains the single canonical source for delivered, current and planned product work. Product UI and public project surfaces may link to or selectively present information derived from this roadmap, but must not create a separately maintained planning narrative.

**Status:** Current product-development milestone.

---

## M8 — Authentication & Session Lifecycle

**Goal:** Add a genuine authenticated product boundary while preserving low-friction public access to the simulation.

### Outcomes
- Real login screen before the operational workspace
- Server-side credential verification
- Authenticated session lifecycle
- Explicit logout
- Public demo access that is clearly presented as simulation access rather than a meaningful security barrier
- Deployment architecture compatible with the existing production setup

### Planned work
- [ ] Add a real login screen before access to the operational workspace.
- [ ] Implement server-side credential verification rather than a client-only visual gate.
- [ ] Implement a real authenticated session lifecycle.
- [ ] Add explicit logout behaviour.
- [ ] Use intentionally public demo username/password values so every visitor can enter the simulation.
- [ ] Present shared demo credentials clearly as access to the simulation, not as a meaningful security control.
- [ ] Keep session-signing material and real secrets outside the client bundle and repository.
- [ ] Evaluate Cloudflare-side server functionality and an OVH-compatible server-side option before selecting the mechanism.
- [ ] Preserve the low-friction public-demo experience despite the authenticated boundary.
- [ ] Update this roadmap and README when the capability is production-validated.

**Status:** Planned after M7.

---

## M9 — Seeded Scenario Variation Refinement

**Goal:** Make run-to-run variation more deliberate, meaningful and explainable while preserving deterministic replay.

### Outcomes
- Clearer relationship between opening variant and condition profiles
- Runtime parameters with demonstrable operational effects
- Meaningful fresh-seed variation without duplicated narrative branches
- Preserved same-seed reproducibility
- Updated validation and AAR/run metadata where required

### Planned work
- [ ] Revisit and clarify the three opening variants: `power-first`, `communications-first` and `water-first`.
- [ ] Revisit and clarify the four condition profiles that emphasize different operational constraints.
- [ ] Audit which resolved profile parameters materially affect runtime behaviour.
- [ ] Remove, replace or implement parameters that are currently weak, redundant or effectively unused.
- [ ] Define the intended relationship between opening variant, dominant profile, secondary profile and visible operator experience.
- [ ] Preserve deterministic same-seed Replay.
- [ ] Improve meaningful fresh-seed variation without multiplying Scenario 01 into duplicated narrative branches.
- [ ] Update automated regression, run metadata and AAR reconstruction if the configuration model changes.
- [ ] Update this roadmap and README when the refinement is production-validated.

**Status:** Planned after M8.

---

### Continuing deferred work

Earlier unfinished roadmap items remain visible in their original milestones for traceability. Current deferred areas from the public-alpha scope include fuller Operational History / audit interaction, explicit runtime module-health registry, richer degraded-state interactions and broader alert / attention-queue design. They are not separate roadmap items unless evidence and scope justify promoting them into a future milestone.

The current product-development sequence is:

```text
M7 — Product Evolution Visibility
→ M8 — Authentication & Session Lifecycle
→ M9 — Seeded Scenario Variation Refinement
```

This order communicates current intent, not fixed delivery dates. Change the sequence in this roadmap if evidence, implementation constraints or feedback justify a different priority.

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
11. **Keep one roadmap.** `ROADMAP.md` is the canonical record of delivered, current and planned product work. README and public/in-product project communication must remain consistent with it; do not create parallel planning narratives.
12. **Keep unfinished work visible.** An open item may remain in an earlier milestone when that accurately reflects project history and current status; close, supersede or defer it explicitly rather than rewriting history.
