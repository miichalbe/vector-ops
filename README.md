# VECTOR OPS

**Vector Operations System**

A modular operations coordination concept for distributed teams, autonomous assets and complex operational environments.

> **Project status:** Public alpha live  
> **Version:** 0.1  
> **Started:** 21 September 2026  
> **Last updated:** 25 September 2026  
> **Live demo:** https://vector.michalbiernacki.com

## What is VECTOR OPS?

VECTOR OPS explores a practical operations-design problem: teams often work across separate tools for situational awareness, logistics, communications, assets, incidents and coordination.

The challenge is not only seeing more data. It is understanding **what requires attention, why it matters, what may become a problem next, and what options the operator has**.

The project investigates a modular coordination model centred on cross-domain dependencies and operational consequences rather than another dashboard of disconnected alerts.

A core interaction hypothesis is:

```text
state
→ dependency
→ projected consequence
→ options
→ expected effects
→ operator decision
```

Important reasoning should be inspectable, while routine operation should remain low-noise.

## Public alpha

The current demonstrator uses a **non-weaponized synthetic cascading-infrastructure scenario** involving power, telecommunications, water, access constraints, critical services and constrained response resources.

The primary operator is a **Dyżurny operacyjny Wojewódzkiego Centrum Zarządzania Kryzysowego (WCZK)** — a Polish regional crisis-management duty role responsible for monitoring, analysis, information flow, escalation and documentation.

The alpha is intentionally narrow:

- one primary operator;
- one synthetic operational area;
- one complete Scenario 01 runtime;
- three bounded opening variants;
- four condition profiles;
- three meaningful operator Decision points;
- deterministic seeded replay;
- factual After-Action Report.

The scenario, locations and operational data are fictional and synthetic. The demonstrator is not connected to real infrastructure, emergency systems or live public-safety data and is not intended for operational use.

## Live experience

The public alpha is available at:

**https://vector.michalbiernacki.com**

The first run uses the documented reference seed `8F4C`. After completion, the operator can replay the same seed or generate a new seeded run.

The live experience includes:

- public-demo onboarding and synthetic / non-live disclosure;
- current-state entity tiles with stable metric slots;
- selected-entity detail with provenance, dependencies and recent activity;
- newest-first cross-domain **Live Activity** chronology;
- inspectable **Assessment** and **Projection** reasoning;
- attention states `Normal`, `Review` and `Urgent`;
- blocking **Decision Focus Mode** for D1, D2 and D3;
- explicit Action selection and confirmation;
- factual Action acknowledgement;
- downstream resource, communications, infrastructure and critical-service consequences;
- operational handover and completed runtime;
- factual After-Action Report with chronology, decisions, expected versus observed effects, state comparison, dependencies, parameters and unresolved items;
- `Replay same seed` and `New run` lifecycle.

## Scenario variation

Scenario 01 resolves its runtime configuration deterministically from the scenario version and visible seed.

Opening variants:

- `power-first`
- `communications-first`
- `water-first`

Dominant condition profiles:

- `communications-fragile`
- `access-constrained`
- `resource-constrained`
- `low-confidence-data`

The documented reference seed `8F4C` resolves to:

```text
opening: water-first
dominant profile: access-constrained
secondary profile: low-confidence-data
```

Variation is bounded. It changes the opening order and operational constraints without turning the prototype into a branching game with a hidden correct answer.

## Interaction model

The public alpha deliberately separates several information roles:

```text
Entity tile       → What is its state now?
Selected entity   → What do we currently know about it?
Live Activity     → What changed and when?
Assessment        → What does VECTOR OPS think the current situation means?
Projection        → What may happen next?
Decision Focus    → What options does the operator have now?
AAR               → What happened across the completed run?
```

This separation is one of the main interaction hypotheses being explored by the project.

## Technical implementation

The demonstrator is implemented with:

- Astro 7
- React 19
- TypeScript strict mode
- Vitest
- deterministic scenario configuration and runtime rules
- static production output
- Cloudflare Pages deployment

The production path is:

```text
GitHub
→ Cloudflare Pages
→ OVH-managed DNS CNAME
→ https://vector.michalbiernacki.com
```

The existing portfolio site remains isolated on its existing hosting.

## Validation

The public alpha passed layered validation rather than one exhaustive Cartesian test matrix.

Automated coverage includes:

- all 27 D1 × D2 × D3 Action combinations for reference seed `8F4C`;
- 12 complete fresh-seed runtime cases covering 3 opening variants × 4 dominant profiles;
- deterministic same-seed replay;
- runtime, Action lifecycle, event, Assessment, Projection, completion and AAR tests;
- Astro / TypeScript checking;
- production build verification.

Manual validation includes:

- complete reference-run acceptance;
- complete representative fresh-run acceptance;
- onboarding / About behaviour;
- keyboard / focus sanity checks;
- Timeline and entity-selection behaviour;
- D1 / D2 / D3 interactions;
- AAR, Replay and New run;
- production custom-domain smoke testing.

Production smoke validation on `vector.michalbiernacki.com` passed on 25 September 2026.

## Design principles

- **Research first** — distinguish evidence, inference, hypothesis and design decision.
- **Decision-oriented** — design around operator choices and consequences, not generic dashboards.
- **Cross-domain reasoning** — surface dependencies that matter operationally.
- **Progressive transparency** — keep routine use low-noise while deeper reasoning remains inspectable.
- **Explicit uncertainty** — expose confidence, stale data, assumptions and unknowns where relevant.
- **Modular by design** — shared entities, events and runtime contracts should support future modules without rewriting the application core.
- **Non-weaponized public prototype** — civilian crisis-management context only.
- **Narrow first release, durable foundation** — one credible vertical slice before platform breadth.

## Documentation

Core project documentation:

- [Discovery Brief](docs/discovery/discovery-brief.md)
- [Information Architecture](docs/architecture/information-architecture.md)
- [System Contract](docs/architecture/system-contract.md)
- [Decision Log](docs/decisions/decision-log.md)
- [Adjacent Product Landscape](docs/research/adjacent-product-landscape.md)
- [Cross-Domain Decision Friction](docs/research/cross-domain-decision-friction.md)
- [Primary Operator — Polish Context](docs/research/primary-operator-polish-context.md)
- [Scenario Experience Contract](docs/scenario/scenario-experience-contract.md)
- [Primary Scenario Package](docs/scenario/primary-scenario-package.md)
- [Primary Operator Flow & Scenario Runtime Contract](docs/design/primary-operator-flow.md)
- [Primary Operational View](docs/design/primary-operational-view.md)
- [Entity State Presentation](docs/design/entity-state-presentation.md)
- [Operational Timeline / Live Activity](docs/design/operational-timeline.md)
- [Action Review Pattern](docs/design/action-review-pattern.md)
- [After-Action Report Direction](docs/design/after-action-report-direction.md)
- [UX Requirements](docs/design/ux-requirements.md)
- [Evidence Library](docs/research/evidence-library.md)

Validation artifacts:

- [Scenario 01 Runtime and Interaction Audit — 24 September 2026](docs/validation/scenario-01-runtime-audit-2026-09-24.md)
- [Scenario 01 Fresh-Seed and Replay Validation — 25 September 2026](docs/validation/scenario-01-fresh-seed-replay-validation-2026-09-25.md)
- [Public Alpha Acceptance Checklist — 25 September 2026](docs/validation/public-alpha-acceptance-checklist-2026-09-25.md)
- [Public Alpha Deployment Validation — 25 September 2026](docs/validation/public-alpha-deployment-2026-09-25.md)

## Known boundaries

The public alpha intentionally does not attempt to provide:

- production-grade emergency-management capability;
- real operational integrations or live public-safety data;
- exhaustive scenario-space coverage;
- full Operational History beyond the current AAR;
- a complete runtime module-health registry;
- broad alert / attention-queue design;
- comprehensive degraded-state interaction patterns;
- multi-operator collaboration;
- weapon control, targeting, engagement or lethal-autonomy workflows.

These are not hidden omissions. They are explicit scope boundaries for a portfolio demonstrator.

## Next phase

M5 — Public Demo is complete.

The next phase is **M6 — Case Study & Launch**:

- package the design and systems-thinking narrative;
- select key decisions and trade-offs;
- create architecture visuals;
- capture polished screenshots and a short demo recording;
- integrate the demo with `michalbiernacki.com`;
- prepare launch communication;
- review the repository for eventual public visibility.

---

**VECTOR OPS** is an independent Polish portfolio project exploring how contemporary product design, software development and AI-assisted tools can support operational resilience and coordination.
