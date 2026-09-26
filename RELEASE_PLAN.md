# VECTOR OPS — Release Plan

**Status:** Active  
**Current public release:** 0.1 — Public Alpha  
**Production:** https://vector.michalbiernacki.com  
**Last updated:** 26 September 2026

This document is the canonical, user-facing plan for future VECTOR OPS releases.

It answers one question clearly:

> **What is planned next?**

The Release Plan is intentionally separate from the project roadmap. `ROADMAP.md` describes the broader product/design/build journey and portfolio milestones. This file communicates planned product evolution after the public alpha.

## Release-plan rules

1. **Every future user-visible product change should appear here before implementation begins.**
2. Planned items may move between releases as evidence, effort or feedback changes.
3. Release order communicates priority; it is not a promise of delivery dates.
4. Dates are only added when there is a real delivery commitment.
5. When a planned item ships, it moves from this plan into the changelog / What’s New history.
6. Internal refactors, test-only changes and maintenance work do not need to appear here unless they materially affect the public product.
7. New work should not bypass this plan simply because it is technically easy to implement.

---

## 0.1 — Public Alpha — SHIPPED

**Released:** 25 September 2026

The first public VECTOR OPS release established the complete Scenario 01 vertical slice.

Shipped capability includes:

- public onboarding and synthetic / non-live disclosure;
- one crisis-management operator role;
- one synthetic cascading-infrastructure scenario;
- current-state entity view and selected-entity inspection;
- Live Activity chronology;
- inspectable Assessment and Projection reasoning;
- three blocking operator Decisions with explicit Action review;
- expected versus observed effects;
- deterministic run seed and same-seed Replay;
- fresh-run generation;
- factual After-Action Report;
- production deployment at `vector.michalbiernacki.com`.

The 0.1 release is the validated baseline for future iteration.

---

## 0.2 — Release communication foundation — NEXT

**Intent:** Make product evolution visible and understandable before larger post-alpha features begin shipping.

Planned:

- [ ] Establish a lightweight release-versioning convention for public demo releases.
- [ ] Add a canonical changelog for shipped user-visible changes.
- [ ] Add an in-product `What’s New` surface.
- [ ] Expose a readable `Release plan` entry point from the product where appropriate.
- [ ] Clearly distinguish:
  - what is available now;
  - what changed in the latest release;
  - what is planned next.
- [ ] Avoid fixed dates unless a delivery date is genuinely committed.

### Release-plan visibility requirement

The items planned for 0.3 and 0.4 below must already be visible through the Release plan before those releases are implemented.

---

## 0.3 — Real login / logout and session lifecycle — PLANNED

**Intent:** Add a genuine authenticated product boundary while keeping the public demo accessible to anyone.

Planned:

- [ ] Add a real login screen before access to the operational workspace.
- [ ] Implement server-side credential verification rather than a client-only visual gate.
- [ ] Implement a real session lifecycle.
- [ ] Add explicit logout behaviour.
- [ ] Use intentionally public demo username/password values so every visitor can enter the simulation.
- [ ] Present those shared demo credentials clearly as access to the simulation, not as a meaningful security barrier.
- [ ] Keep session-signing material and real secrets outside the client bundle and repository.
- [ ] Select a deployment architecture compatible with the current Cloudflare Pages / OVH domain setup.
- [ ] Preserve the low-friction public-demo experience despite the authenticated boundary.

This release is intentionally listed in the Release plan before implementation begins.

---

## 0.4 — Seeded scenario variation refinement — PLANNED

**Intent:** Make run-to-run variation more deliberate, meaningful and explainable while preserving deterministic replay.

Planned:

- [ ] Revisit and clarify the three opening variants:
  - `power-first`;
  - `communications-first`;
  - `water-first`.
- [ ] Revisit and clarify the four condition profiles that emphasize different operational constraints.
- [ ] Audit which resolved parameters materially affect runtime behaviour.
- [ ] Remove, replace or implement parameters that are currently weak, redundant or effectively unused.
- [ ] Define the intended relationship between:
  - opening variant;
  - dominant profile;
  - secondary profile;
  - visible operator experience.
- [ ] Preserve deterministic same-seed Replay.
- [ ] Improve meaningful fresh-seed variation without multiplying Scenario 01 into duplicated narrative branches.
- [ ] Update automated regression, run metadata and AAR reconstruction if the configuration model changes.

This release is intentionally listed in the Release plan before implementation begins.

---

## Later / not yet assigned to a release

Items can be added here as soon as they become credible future product work, even before they are assigned to a specific release.

Current deferred areas from the public-alpha scope include:

- [ ] fuller Operational History / audit interaction;
- [ ] explicit runtime module-health registry;
- [ ] richer degraded-state interactions;
- [ ] broader alert / attention-queue design.

These are not commitments. They remain visible candidates until evidence and prioritization justify moving them into a numbered release.

---

## Release lifecycle

```text
idea / evidence
→ Release Plan
→ scoped release
→ implementation + validation
→ production deployment
→ Changelog / What’s New
```

The Release Plan communicates **what we intend to do next**.  
The Changelog / What’s New communicates **what actually shipped**.
