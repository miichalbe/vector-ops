# VECTOR OPS — Scenario 01 Runtime and Interaction Audit

**Date:** 24 September 2026  
**Branch:** `build/vertical-slice`  
**Scenario:** Scenario 01 — Infrastructure disruption, Mazowieckie Voivodeship  
**Scope:** end-to-end runtime coherence, Decision accounting, derived-claim inspection, Live Activity interaction, pacing and completion  
**Status:** Passed after fixes described below

---

## 1. Purpose

This audit records a focused validation pass performed after Scenario 01 reached an end-to-end runtime from baseline through Decision 3, downstream response, handover and completion.

The goal was not only to confirm that the scenario executes without errors. The review explicitly looked for semantic inconsistencies that could remain invisible during a normal UI walkthrough but later undermine Operational History or the After-Action Report.

The review combined:

- automated regression tests;
- a deterministic minute-by-minute runtime audit;
- source-level review of event and claim sequencing;
- a full manual operator walkthrough;
- a focused UI smoke test of Assessment / Projection inspection and Live Activity linking.

This was an AI-assisted review performed against the repository source of truth, followed by local developer verification.

---

## 2. Validation baseline

The tested public-alpha runtime uses:

- deterministic seed `8F4C` for the current default run;
- `4 real seconds = 1 scenario minute`;
- three primary Decision moments;
- append-only Observations and Domain Events;
- Assessment and Projection revision history;
- explicit Action lifecycle state;
- operational handover followed by runtime completion.

The manually reviewed representative path was:

`D1-A → D2-B → D3-B`

or:

1. open cross-domain incident and request synchronised confirmation;
2. recommend AG-400 for R-4;
3. recommend voivodeship-level coordination.

For the default seed, source-level timing review places the representative run approximately at:

- 07:44 — first material anomaly;
- 07:49 — Decision 1;
- 07:53 — synchronised confirmation;
- 08:00 — F-12 isolation;
- 08:18 — Decision 2;
- 08:23 — AG-400 acceptance;
- 08:26 — AG-400 en route;
- 08:36 — water-service margin declining;
- 08:53 — AG-400 operational at R-4;
- 08:56 — hospital continuity report and Decision 3;
- 09:05 — voivodeship coordination package active;
- 09:09 — resolution checkpoint;
- 09:11 — handover and completion.

This is approximately 91 scenario minutes, or about 6 minutes of running wall-clock time at the current simulation rate, excluding time spent reading decisions.

---

## 3. Automated runtime audit

A dedicated deterministic audit test was added at:

`src/scenarios/scenario-01/runtime-audit.test.ts`

The audit executes the scenario minute by minute across all 27 combinations of:

- 3 Decision 1 actions;
- 3 Decision 2 actions;
- 3 Decision 3 actions.

For every path it verifies that:

- the runtime reaches all three Decisions in order;
- Decision evidence exists when the Decision opens;
- derived claims do not reference evidence received in the future;
- event IDs remain unique;
- Observation IDs remain unique;
- Scenario 01 does not exceed its presentation limits for active Assessments or Projections;
- the path reaches operational handover;
- the path reaches `scenario.completed`;
- runtime time stops after completion.

After the fixes recorded in this audit, local verification passed:

- 26 test files;
- 185 tests;
- `astro check`: 0 errors, 0 warnings, 0 hints;
- static production build: successful.

---

## 4. Findings and corrective changes

### 4.1 Live Activity and claim-panel selection were not fully aligned

**Finding**  
The visible Projection panel could remain on one Projection family while the newest `Projection revised` entry on Live Activity referred to another family. The previous UI effectively depended on collection order rather than explicit claim priority and operator selection.

**Correction**

- Assessment and Projection Live Activity entries now identify their claim family;
- activating a claim entry selects the corresponding current claim family in its inspection panel;
- selecting an older revision does not rewind runtime state;
- claim panels now support multiple current families;
- default selection follows the canonical prioritisation contract:
  - attention;
  - severity;
  - for Projections, shorter time-to-impact;
  - recency;
  - stable ID as final tie-breaker.

**Result**  
The Timeline remains a `what changed?` surface while the claim panel remains a `what is the current state of this claim?` surface.

---

### 4.2 Unselected Decision Actions remained available

**Finding**  
After a Decision was recorded, the selected Action changed lifecycle but the two unselected alternatives remained `available` in runtime state.

This was mostly invisible in the live UI, but it would have created a false historical record: Operational History or AAR could incorrectly imply that the rejected alternatives remained executable after the Decision closed.

**Correction**

- unselected alternatives now transition to `expired` when the Decision is recorded;
- each transition emits an append-only `action.expired` Domain Event.

**Result**  
The Action lifecycle now accurately represents the closed decision context.

---

### 4.3 `Decision.observedEffects` was not being populated

**Finding**  
Decision records preserved expected effects but their `observedEffects` arrays remained empty even after downstream consequences occurred.

This did not break the live simulation, but it would have made a factual `expected vs observed` AAR unreliable or forced the report layer to reconstruct relationships heuristically.

**Correction**

Scenario event bookkeeping now records relevant observed Decision effects from existing runtime events without creating a second narrative source of truth.

Examples include:

- synchronised confirmation after D1-A;
- persistence confirmation at F-12;
- AG-400 operational effects after D2-A / D2-B;
- displaced risks after D2;
- provisional restoration information after D2-C;
- targeted contingency, broader coordination or additional confirmation after D3.

**Result**  
Decision records now contain both expected and subsequently observed effects suitable for later AAR reconstruction.

---

### 4.4 Decision 1 Action lifecycle did not close

**Finding**  
D1 Actions could remain indefinitely in `selected` even after their intended downstream information / coordination outcome had occurred.

**Correction**

D1 lifecycle is now completed by the relevant downstream event:

- synchronised confirmation for D1-A;
- persistent feeder evidence for separate monitoring in D1-B;
- regional acknowledgement for D1-C.

**Result**  
Decision 1 now has an auditable Action lifecycle consistent with Decisions 2 and 3.

---

### 4.5 Closing D1 lifecycle initially caused an Assessment regression

**Finding**  
The first lifecycle correction exposed an existing coupling in A-01: confidence support for D1-A was inferred from the Action still being in lifecycle `selected`.

Once D1-A correctly moved to `completed`, the later F-12 Assessment revision lost the synchronised-confirmation confidence contribution.

The regression was caught by the existing Assessment tests:

- D1-A confidence incorrectly remained `medium` instead of `high`;
- the `coordinated-confirmation` confidence reason disappeared.

**Correction**

A-01 now derives coordinated-confirmation support from the actual historical `information.cross-domain-confirmed` event rather than from the current lifecycle state of the D1 Action.

**Result**  
The Assessment is now based on evidence that actually occurred in the operational history, which is more robust and better aligned with the system contract.

---

### 4.6 Scenario phase was not meaningfully progressing

**Finding**  
The runtime phase field could remain effectively at `baseline` until completion despite the scenario advancing through distinct operational stages.

**Correction**

Scenario 01 now records meaningful phase progression:

`baseline → detection → dependency → escalation → resolution`

**Result**  
Phase is now usable runtime state rather than decorative metadata and can support future AAR and History grouping.

---

### 4.7 `material entries` was technically accurate but poor operator-facing copy

**Finding**  
Live Activity displayed a header such as `17 material entries · newest first`.

`Material` was intended in the audit / event-design sense: the Timeline intentionally excludes low-level lifecycle noise and surfaces only operationally meaningful changes. However, that distinction is an implementation and information-architecture rule, not terminology the operator needs to decode.

**Correction**

The UI copy was simplified to:

`17 entries · newest first`

The concept of materiality remains documented in the Timeline contract.

---

## 5. Manual operator validation

### 5.1 Pacing

The current pacing was judged acceptable in a full run.

Observed character:

- some intentionally dense periods;
- some quieter intervals;
- no strong need to shorten the scenario globally.

Decision:

- keep `4 seconds = 1 scenario minute` for the current alpha;
- if pacing is changed later, expose it as an explicit simulation-rate parameter rather than changing individual event timings ad hoc.

---

### 5.2 Multiple Projection handling

Manual smoke validation confirmed that multiple Projection families can be discovered and switched in the Projection panel and that Live Activity links to the corresponding current Projection family.

No layout instability or unexpected interaction behaviour was observed.

---

### 5.3 Multiple Assessment handling

Scenario 01 currently defines only one Assessment family: A-01, `cross-domain-disruption`.

The scenario produces multiple **revisions** of A-01, which appear as separate `Assessment` / `Assessment revised` entries in Live Activity, but these are not multiple parallel Assessment families.

Therefore:

- generic multi-Assessment selection behaviour is covered by component/unit tests;
- Timeline → Assessment linking is implemented;
- a real manual switch between two simultaneously current Assessment families cannot be exercised in Scenario 01 as currently authored.

This is recorded as a coverage limitation, not as a defect.

---

### 5.4 Layout and interaction stability

Manual smoke validation found:

- no unexpected layout shifts;
- Projection switching usable;
- Live Activity / Projection interaction understandable;
- no obvious visual regression following the claim-selection changes.

---

## 6. Remaining risks and deferred validation

The following items are intentionally not treated as failures of this audit:

1. **Fresh-seed coverage** — the public alpha still needs final validation of all intended seed-driven parameters before the AAR describes them as influential mechanics.
2. **Multiple live Assessment families** — the generic interaction exists but Scenario 01 does not currently produce two parallel Assessment families for manual end-to-end validation.
3. **AAR presentation** — this audit improves the runtime data required by AAR, but the AAR UI itself remains a later implementation step.
4. **Full Operational History** — Live Activity is still a curated current-awareness surface, not a historical replay browser.
5. **Production operational validation** — this remains a synthetic portfolio demonstrator, not a validated crisis-management system.

---

## 7. Audit conclusion

The audit did more than confirm that the scenario completes. It exposed several semantic inconsistencies that were not obvious during the normal live walkthrough but would have weakened auditability and the future After-Action Report.

After correction, Scenario 01 has a stronger trace between:

`evidence → claim revision → Decision → Action lifecycle → observed consequence → phase progression → handover → completion`

The current runtime and live operational workspace are suitable to proceed to the next public-alpha layer, with the documented limitations above retained as explicit follow-up items.
