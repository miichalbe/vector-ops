# VECTOR OPS — Public Alpha Acceptance Checklist

**Date:** 25 September 2026  
**Branch:** `build/vertical-slice`  
**Milestone:** M5 — Public Demo preparation  
**Status:** Ready for final manual acceptance

## Purpose

This checklist is the final pre-deployment acceptance gate for the VECTOR OPS public alpha.

It is intentionally narrow. The goal is not to discover or add new product scope. The goal is to verify that the implemented Scenario 01 experience is coherent, usable and reproducible from first load through After-Action Report, replay and fresh run.

A failed item should result in a targeted fix and re-check. New feature ideas should be deferred unless they block comprehension, operation or public-demo credibility.

---

## 1. Automated gate

Before manual acceptance:

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

---

## 2. First-load / onboarding

Start from a hard refresh of the public-alpha build.

Acceptance:

- [ ] demo introduction appears before the scenario starts;
- [ ] Scenario 01 reference seed is visible;
- [ ] scenario time remains at `07:40` while the introduction is open;
- [ ] run status communicates that the scenario is not yet progressing;
- [ ] introduction explains the operator role and the purpose of VECTOR OPS;
- [ ] introduction explains Entity state, Live Activity, Assessment / Projection and Decision points at an appropriate level;
- [ ] synthetic / fictional / non-live disclosure is visible and unambiguous;
- [ ] clicking outside the initial introduction does not dismiss it;
- [ ] `Start scenario` closes the introduction and begins runtime progression;
- [ ] keyboard focus begins on a meaningful interactive control.

---

## 3. Persistent demo context

During a running scenario:

- [ ] `About this demo` is discoverable from the header;
- [ ] opening About does not reset or restart the run;
- [ ] About can be closed with `Return to scenario`;
- [ ] About can be closed with `Escape`;
- [ ] About can be closed by clicking the backdrop outside the panel;
- [ ] reopening About preserves the current scenario state and seed.

---

## 4. Operational workspace semantics

Acceptance:

- [ ] `Operational domains: 4` is understandable and does not imply runtime module-health monitoring;
- [ ] domain disclosure identifies Power, Water, Communications and Critical Services & Response;
- [ ] entity tiles preserve stable metric labels while values change;
- [ ] missing observations remain explicit rather than removing metric slots;
- [ ] entity attention badges read as `Normal`, `Review` or `Urgent` and are not confused with domain `Action` objects;
- [ ] `Urgent` communicates immediate operator attention rather than a clickable Action;
- [ ] selected entity detail exposes current state, data provenance, dependencies and recent activity;
- [ ] Live Activity reads as chronology of material changes rather than a duplicate entity-state view;
- [ ] Assessment reads as current interpretation;
- [ ] Projection reads as possible downstream consequence;
- [ ] evidence / dependencies / assumptions remain inspectable without dominating routine operation.

---

## 5. Timeline and selection behaviour

Acceptance:

- [ ] newest-first chronology remains readable during the complete run;
- [ ] entity-linked entries select the correct entity;
- [ ] Assessment-linked entries select the current Assessment family and navigate to its panel;
- [ ] Projection-linked entries select the current Projection family and navigate to its panel;
- [ ] timeline interaction does not break or reset scenario progression;
- [ ] selected-state highlight / feedback is visible and short-lived.

---

## 6. Decision Focus — D1 / D2 / D3

For each Decision:

- [ ] scenario progression pauses when operator input is required;
- [ ] the question is understandable before opening deeper reasoning;
- [ ] all three options are visible and distinguishable;
- [ ] option selection is separate from confirmation;
- [ ] evidence, unknowns and expected effects are available before confirmation;
- [ ] authority wording matches the WCZK duty-officer role;
- [ ] confirmation records exactly one selected Action;
- [ ] unselected alternatives expire rather than remain falsely available;
- [ ] a neutral factual action receipt appears after confirmation;
- [ ] runtime resumes immediately after confirmation;
- [ ] Live Activity records the Decision and relevant expected effects.

---

## 7. Scenario progression

Run one complete representative path from D1 through D3.

Acceptance:

- [ ] opening observations form a coherent causal sequence;
- [ ] cross-domain consequences are understandable without knowing the implementation;
- [ ] data delay / confidence changes are distinguishable from physical state changes;
- [ ] D1 alters information / coordination progression as expected;
- [ ] D2 produces a visible constrained-resource consequence path;
- [ ] AG-400 lifecycle, when selected, progresses coherently;
- [ ] hospital / critical-service consequence appears at the expected stage;
- [ ] D3 alters coordination posture without presenting a hidden correct answer;
- [ ] final state reaches an operational handover and completed runtime;
- [ ] no obvious future information appears before it should be operator-visible.

---

## 8. After-Action Report

Acceptance:

- [ ] AAR appears on runtime completion;
- [ ] scenario version, seed and resolved run configuration are visible;
- [ ] all three Decisions are represented;
- [ ] expected effects remain distinct from later observed effects;
- [ ] chronology is oldest-first and materially reconstructs the run;
- [ ] initial-versus-final known state does not backfill information that was unknown at baseline;
- [ ] dependencies and resolved run parameters are available as reasoning context;
- [ ] handover separates current mitigations from unresolved items;
- [ ] AAR contains no score, grade, winner or retrospective claim that an operator choice was correct or incorrect.

---

## 9. Replay and New run

From the completed AAR:

### Replay same seed

- [ ] `Replay same seed` dismisses the AAR;
- [ ] scenario time returns to `07:40`;
- [ ] operational state returns to baseline;
- [ ] seed remains unchanged;
- [ ] opening configuration is reproduced from the same seed;
- [ ] onboarding does not reappear.

### New run

- [ ] `New run` dismisses the AAR;
- [ ] scenario time returns to `07:40`;
- [ ] operational state returns to baseline;
- [ ] a different seed is generated;
- [ ] the new run is created through the same Scenario 01 runtime rather than a separate branch;
- [ ] onboarding does not reappear.

---

## 10. Representative fresh-run validation

Run at least two fresh seeds far enough to observe their opening behaviour; complete at least one fresh-seed run end-to-end.

Acceptance:

- [ ] fresh seeds produce valid Scenario 01 configurations;
- [ ] opening variation is observable where the resolved variant differs;
- [ ] different opening order does not break Assessment / Projection timing;
- [ ] all Decision points remain reachable;
- [ ] at least one fresh run reaches AAR without runtime or presentation failure;
- [ ] fresh-run AAR records its actual seed and configuration.

Note: automated coverage already exercises all three opening variants across all four dominant condition profiles. Manual fresh-run validation is a presentation and interaction check, not a replacement for the automated matrix.

---

## 11. Keyboard / focus / modal behaviour

Acceptance:

- [ ] primary controls can be reached with keyboard navigation;
- [ ] Decision Focus interaction is operable without a mouse;
- [ ] initial introduction cannot be accidentally dismissed with backdrop click;
- [ ] later About view supports Escape and backdrop dismissal;
- [ ] no blocking overlay leaves clearly actionable underlying controls reachable in a confusing way;
- [ ] visible focus treatment remains legible against the dark UI.

Any focus-trap limitation that remains must be documented explicitly before public launch if it cannot be corrected within the alpha scope.

---

## 12. Visual / responsive sanity check

Check at desktop width and at least one narrower browser width.

Acceptance:

- [ ] main 70/30 workspace remains readable;
- [ ] entity grid does not produce broken card heights or clipped values;
- [ ] selected entity panel scrolls without breaking surrounding layout;
- [ ] Decision Focus options remain usable;
- [ ] introduction / About remains readable without horizontal overflow;
- [ ] AAR remains readable without clipped content;
- [ ] no new visual issue materially harms comprehension.

---

## 13. Release gate

The public alpha is ready for deployment when:

```text
automated gate = PASS
+ manual acceptance = PASS
+ no unresolved comprehension / interaction blocker
```

Items intentionally deferred beyond public alpha — such as full Operational History, explicit runtime module registry, richer degraded-state interactions and broader alert / attention-queue design — do not block release unless final acceptance shows that their absence makes the current experience misleading or unusable.

After this checklist passes:

1. confirm static OVH deployment path;
2. configure `vector.michalbiernacki.com`;
3. deploy the production build;
4. repeat a reduced production smoke test with the reference run and several fresh seeds;
5. record the deployment / smoke-test result as the final M5 validation artifact.
