# VECTOR OPS — Roadmap

**Current phase:** Discovery  
**Current milestone:** M1 — Discovery Complete  
**Project status:** Active  
**Last updated:** 22 September 2026

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
- [ ] Define primary operator
- [ ] Define primary scenario
- [ ] Select MVP modules
- [ ] Update Discovery Brief

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

### Planned work
- [ ] Refine core entity model
- [ ] Define module contracts
- [ ] Define module registration contract
- [ ] Define event types
- [ ] Define shared state model
- [ ] Define dependency model
- [ ] Define operational consequence model
- [ ] Define audit-trail requirements
- [ ] Define scenario state machine
- [ ] Define data-driven scenario format

---

## M3 — Interaction Design

**Goal:** Translate system behavior into clear operator interactions.

### Outcomes
- Primary operator flow
- Information hierarchy
- Key screen architecture
- Alert / consequence patterns
- Decision-review interaction
- Low-fidelity prototype

### Planned work
- [ ] Map end-to-end operator flow
- [ ] Define information hierarchy
- [ ] Design Common Operational Picture structure
- [ ] Design alert / attention queue
- [ ] Design asset detail interaction
- [ ] Design decision-review flow
- [ ] Design degraded-state interactions
- [ ] Create low-fidelity wireframes
- [ ] Validate against primary scenario

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
- [ ] Set up Astro / application shell
- [ ] Define repository app structure
- [ ] Implement shared entity registry
- [ ] Implement module registry
- [ ] Implement simulation clock
- [ ] Implement event bus
- [ ] Implement map / operational picture
- [ ] Implement first 3–4 MVP modules
- [ ] Implement synthetic scenario engine
- [ ] Implement operational consequence logic
- [ ] Implement operator decisions
- [ ] Add audit trail

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
