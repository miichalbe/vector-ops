# VECTOR OPS — Roadmap

**Current phase:** Public alpha live / case-study preparation  
**Current milestone:** M6 — Case Study & Launch  
**Project status:** Active  
**Last updated:** 26 September 2026

This roadmap tracks the evolution of VECTOR OPS from early discovery to a public working demonstrator and portfolio case study.

The roadmap is intentionally outcome-based. Each milestone should leave behind a visible artifact or working capability.

## Near-term delivery target

**Public prototype / alpha:** complete and live at `https://vector.michalbiernacki.com`.  
**Next target:** package the validated public alpha into a coherent portfolio case study, integrate it with `michalbiernacki.com`, prepare launch assets and review the repository for eventual public visibility.

**Latest validation artifacts:**  
- [Scenario 01 Runtime and Interaction Audit — 24 September 2026](docs/validation/scenario-01-runtime-audit-2026-09-24.md)  
- [Scenario 01 Fresh-Seed and Replay Validation — 25 September 2026](docs/validation/scenario-01-fresh-seed-replay-validation-2026-09-25.md)  
- [Public Alpha Acceptance Checklist — 25 September 2026](docs/validation/public-alpha-acceptance-checklist-2026-09-25.md)  
- [Public Alpha Deployment Validation — 25 September 2026](docs/validation/public-alpha-deployment-2026-09-25.md)

The alpha remains a deliberately narrow end-to-end demonstration: one primary operator, one synthetic cascading-infrastructure scenario, one operational area, three bounded opening variants and three meaningful decision moments. It remains structurally open to additional modules and scenarios after launch.

The public alpha is now deployed and smoke-tested. Further product expansion is deferred unless later case-study review or external feedback exposes a comprehension or credibility problem in the released experience.

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
- Demo screenshots / recordings
- Portfolio integration
- LinkedIn launch material
- Repository prepared for public visibility

### Planned work
- [ ] Write final case-study narrative
- [ ] Select key decisions and trade-offs
- [ ] Create final architecture visuals
- [ ] Capture polished screenshots
- [ ] Prepare short demo clip / GIF
- [ ] Integrate VECTOR OPS with `michalbiernacki.com`
- [ ] Prepare LinkedIn launch post
- [ ] Review repository for public release
- [ ] Add license if appropriate
- [ ] Switch repository visibility to Public when ready
- [ ] Publish launch

---

## Post-alpha product iteration backlog

These items are intentionally **not part of M6 launch scope**. They describe product work for later iterations after the public alpha and case-study launch. The sequence below is the agreed implementation order, not a commitment to specific release dates.

### Priority 1 — Changelog / What's New / Release plan

**Goal:** Establish the release-communication layer before the first substantial post-alpha product iteration, so returning users can understand what changed and what is planned next.

Planned capability:

- [ ] Define lightweight product versioning for public demo releases.
- [ ] Add an in-product `What's new` / changelog surface.
- [ ] Publish concise release notes for meaningful changes rather than every implementation commit.
- [ ] Add a public-facing release plan covering the next intended product improvements without promising fixed delivery dates.
- [ ] Include real login / logout and authenticated session behaviour explicitly in the release plan as the next planned product capability.
- [ ] Keep release-plan communication clearly separated from commitments or fixed delivery dates.

**Why first:** the public alpha is already live. Before changing the product further, VECTOR OPS should establish a simple, credible way to communicate versions, completed changes and intended next steps. The release plan then becomes the visible contract for subsequent iterations rather than a retrospective list added later.

### Priority 2 — Real authentication and session lifecycle

**Goal:** Replace the open demo entry with a real login / logout mechanism while preserving frictionless public access to the simulation.

This capability must first appear in the Release plan created in Priority 1, then be implemented as the next product iteration.

Planned capability:

- [ ] Implement a real authentication flow with server-side credential verification and session lifecycle rather than a client-only visual gate.
- [ ] Add explicit login and logout states to the application shell.
- [ ] Use intentionally public demo credentials so any visitor can enter the simulation while still experiencing a realistic authenticated product boundary.
- [ ] Ensure the implementation is deployable within the project's available production architecture; evaluate Cloudflare-side server functionality and an OVH-compatible server-side option before choosing the mechanism.
- [ ] Do not present shared public demo credentials as a security control; the purpose is product realism and authenticated-session behaviour.
- [ ] Keep secrets and session-signing material out of the client bundle and repository.
- [ ] Record the delivered authentication capability in What's New / changelog and update the Release plan after release.

**Why second:** login / logout is a concrete, visible post-alpha product capability and gives the demonstrator a more realistic system boundary. Publishing it in the Release plan first also validates that the release-communication mechanism is useful before broader iteration work begins.

### Priority 3 — Refine seeded scenario variation

**Goal:** Make run variation more deliberate, understandable and traceable without turning Scenario 01 into duplicated narrative branches.

Planned refinement:

- [ ] Revisit and clarify the randomization model behind the three opening variants: `power-first`, `communications-first` and `water-first`.
- [ ] Revisit and clarify the four condition profiles that emphasize different operational constraints.
- [ ] Audit which resolved profile parameters materially affect runtime behaviour and remove or implement parameters that are currently weak, redundant or effectively unused.
- [ ] Define the intended relationship between opening variant, dominant profile, secondary profile and visible operator experience.
- [ ] Preserve deterministic same-seed replay while improving meaningful run-to-run variation.
- [ ] Update validation coverage and AAR/run metadata if the configuration model changes.
- [ ] Publish the resulting user-visible changes through the changelog / What's New mechanism established in Priority 1.

**Why third:** seeded variation is a deeper refinement of the scenario model. Doing it after the release-communication and authentication iterations lets the project first establish a visible release cadence, then use that same mechanism to explain a more substantial change to scenario behaviour.

### Sequencing principle

```text
release communication + Release plan
→ real authenticated product boundary
→ seeded scenario variation refinement
```

The Release plan should stay current as each item moves from planned → delivered. The order may change only if external feedback reveals a stronger user, product or portfolio need.

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
