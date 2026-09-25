# VECTOR OPS — Public Alpha Acceptance Checklist

**Date:** 25 September 2026  
**Branch:** `build/vertical-slice`  
**Milestone:** M5 — Public Demo preparation  
**Status:** Manual acceptance PASS; final post-onboarding automated gate pending

## Purpose

This checklist is the final pre-deployment acceptance gate for the VECTOR OPS public alpha.

It is intentionally narrow. The goal is not to discover or add new product scope. The goal is to verify that the implemented Scenario 01 experience is coherent, usable and reproducible from first load through After-Action Report, replay and fresh run.

A failed item should result in a targeted fix and re-check. New feature ideas should be deferred unless they block comprehension, operation or public-demo credibility.

---

## 1. Automated gate

Before deployment, run the final gate against the current post-onboarding commit set:

```bash
npm test
npm run check
npm run build
```

Acceptance:

- [ ] all automated tests pass;
- [ ] Astro / TypeScript check reports no errors;
- [ ] production build completes successfully;
- [ ] working tree contains no unintended local changes.

**Status:** pending final rerun after the onboarding / About interaction changes.

---

## 2. First-load / onboarding

Start from a hard refresh of the public-alpha build.

Acceptance:

- [x] demo introduction appears before the scenario starts;
- [x] Scenario 01 reference seed is visible;
- [x] scenario time remains at `07:40` while the introduction is open;
- [x] run status communicates that the scenario is not yet progressing;
- [x] introduction explains the operator role and the purpose of VECTOR OPS;
- [x] introduction explains Entity state, Live Activity, Assessment / Projection and Decision points at an appropriate level;
- [x] synthetic / fictional / non-live disclosure is visible and unambiguous;
- [x] clicking outside the initial introduction does not dismiss it;
- [x] `Start scenario` closes the introduction and begins runtime progression;
- [x] keyboard focus begins on a meaningful interactive control.

---

## 3. Persistent demo context

During a running scenario:

- [x] `About this demo` is discoverable from the header;
- [x] opening About does not reset or restart the run;
- [x] About can be closed with `Return to scenario`;
- [x] About can be closed with `Escape`;
- [x] About can be closed by clicking the backdrop outside the panel;
- [x] reopening About preserves the current scenario state and seed.

---

## 4. Operational workspace semantics

Acceptance:

- [x] `Operational domains: 4` is understandable and does not imply runtime module-health monitoring;
- [x] domain disclosure identifies Power, Water, Communications and Critical Services & Response;
- [x] entity tiles preserve stable metric labels while values change;
- [x] missing observations remain explicit rather than removing metric slots;
- [x] entity attention badges read as `Normal`, `Review` or `Urgent` and are not confused with domain `Action` objects;
- [x] `Urgent` communicates immediate operator attention rather than a clickable Action;
- [x] selected entity detail exposes current state, data provenance, dependencies and recent activity;
- [x] Live Activity reads as chronology of material changes rather than a duplicate entity-state view;
- [x] Assessment reads as current interpretation;
- [x] Projection reads as possible downstream consequence;
- [x] evidence / dependencies / assumptions remain inspectable without dominating routine operation.

---

## 5. Timeline and selection behaviour

Acceptance:

- [x] newest-first chronology remains readable during the complete run;
- [x] entity-linked entries select the correct entity;
- [x] Assessment-linked entries select the current Assessment family and navigate to its panel;
- [x] Projection-linked entries select the current Projection family and navigate to its panel;
- [x] timeline interaction does not break or reset scenario progression;
- [x] selected-state highlight / feedback is visible and short-lived.

---

## 6. Decision Focus — D1 / D2 / D3

For each Decision:

- [x] scenario progression pauses when operator input is required;
- [x] the question is understandable before opening deeper reasoning;
- [x] all three options are visible and distinguishable;
- [x] option selection is separate from confirmation;
- [x] evidence, unknowns and expected effects are available before confirmation;
- [x] authority wording matches the WCZK duty-officer role;
- [x] confirmation records exactly one selected Action;
- [x] unselected alternatives expire rather than remain falsely available;
- [x] a neutral factual action receipt appears after confirmation;
- [x] runtime resumes immediately after confirmation;
- [x] Live Activity records the Decision and relevant expected effects.

---

## 7. Scenario progression

A complete reference run and a complete fresh-seed run were manually exercised on 25 September 2026.

Acceptance:

- [x] opening observations form a coherent causal sequence;
- [x] cross-domain consequences are understandable without knowing the implementation;
- [x] data delay / confidence changes are distinguishable from physical state changes;
- [x] D1 alters information / coordination progression as expected;
- [x] D2 produces a visible constrained-resource consequence path;
- [x] AG-400 lifecycle, when selected, progresses coherently;
- [x] hospital / critical-service consequence appears at the expected stage;
- [x] D3 alters coordination posture without presenting a hidden correct answer;
- [x] final state reaches an operational handover and completed runtime;
- [x] no obvious future information appears before it should be operator-visible.

---

## 8. After-Action Report

Acceptance:

- [x] AAR appears on runtime completion;
- [x] scenario version, seed and resolved run configuration are visible;
- [x] all three Decisions are represented;
- [x] expected effects remain distinct from later observed effects;
- [x] chronology is oldest-first and materially reconstructs the run;
- [x] initial-versus-final known state does not backfill information that was unknown at baseline;
- [x] dependencies and resolved run parameters are available as reasoning context;
- [x] handover separates current mitigations from unresolved items;
- [x] AAR contains no score, grade, winner or retrospective claim that an operator choice was correct or incorrect.

---

## 9. Replay and New run

From the completed AAR:

### Replay same seed

- [x] `Replay same seed` dismisses the AAR;
- [x] scenario time returns to `07:40`;
- [x] operational state returns to baseline;
- [x] seed remains unchanged;
- [x] opening configuration is reproduced from the same seed;
- [x] onboarding does not reappear.

### New run

- [x] `New run` dismisses the AAR;
- [x] scenario time returns to `07:40`;
- [x] operational state returns to baseline;
- [x] a different seed is generated;
- [x] the new run is created through the same Scenario 01 runtime rather than a separate branch;
- [x] onboarding does not reappear.

---

## 10. Representative fresh-run validation

Acceptance:

- [x] fresh seeds produce valid Scenario 01 configurations;
- [x] opening variation is observable where the resolved variant differs;
- [x] different opening order does not break Assessment / Projection timing;
- [x] all Decision points remain reachable;
- [x] at least one fresh run reaches AAR without runtime or presentation failure;
- [x] fresh-run AAR records its actual seed and configuration.

Automated coverage already exercises all three opening variants across all four dominant condition profiles. Manual fresh-run validation remains a presentation and interaction check rather than a replacement for the automated matrix.

---

## 11. Keyboard / focus / modal behaviour

Acceptance:

- [x] primary controls can be reached with keyboard navigation;
- [x] Decision Focus interaction is operable without a mouse;
- [x] initial introduction cannot be accidentally dismissed with backdrop click;
- [x] later About view supports Escape and backdrop dismissal;
- [x] no blocking overlay leaves clearly actionable underlying controls reachable in a confusing way during the accepted test paths;
- [x] visible focus treatment remains legible against the dark UI.

---

## 12. Visual / responsive sanity check

Acceptance:

- [x] main 70/30 workspace remains readable;
- [x] entity grid does not produce broken card heights or clipped values;
- [x] selected entity panel scrolls without breaking surrounding layout;
- [x] Decision Focus options remain usable;
- [x] introduction / About remains readable without horizontal overflow;
- [x] AAR remains readable without clipped content;
- [x] no new visual issue materially harms comprehension.

---

## 13. Release gate

Manual public-alpha acceptance completed successfully on 25 September 2026 with:

- one complete reference run;
- one complete fresh-seed run;
- onboarding / About behaviour;
- Decision Focus D1 / D2 / D3;
- Timeline and entity selection;
- AAR;
- Replay same seed;
- New run;
- keyboard / focus and visual sanity checks.

The public alpha becomes deployment-ready after the current commit set also passes the final automated gate:

```text
manual acceptance = PASS
+ final automated gate = PASS
+ no unresolved comprehension / interaction blocker
```

Items intentionally deferred beyond public alpha — such as full Operational History, explicit runtime module registry, richer degraded-state interactions and broader alert / attention-queue design — do not block release unless deployment smoke testing exposes a concrete problem.

After the final automated gate passes:

1. confirm static OVH deployment path;
2. configure `vector.michalbiernacki.com`;
3. deploy the production build;
4. repeat a reduced production smoke test with the reference run and several fresh seeds;
5. record the deployment / smoke-test result as the final M5 validation artifact.
