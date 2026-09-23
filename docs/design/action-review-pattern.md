# VECTOR OPS — Action Review Pattern

**Version:** 0.1  
**Date:** 23 September 2026  
**Status:** Accepted VS1 interaction direction with explicit post-VS1 extensions  
**Related artifacts:** [UX Requirements](ux-requirements.md), [Primary Operator Flow](primary-operator-flow.md), [System Contract](../architecture/system-contract.md)

---

## 1. Purpose

This document records the reusable interaction model for operator Decisions and Actions in VECTOR OPS.

The pattern exists to keep consequential operator choices connected to the state, dependencies, projected consequences, uncertainty and trade-offs that produced them.

The core reasoning sequence remains:

```text
state
→ dependency
→ projected consequence
→ options
→ expected effects
→ operator decision
→ observed downstream effects
```

Action Review is therefore not a generic confirmation dialog. It is the operator-facing decision mode for a bounded operational choice.

---

## 2. Decision types

The target product model must support two decision classes:

### Blocking Decision

A blocking Decision requires an operator choice before the affected runtime flow can continue.

Expected behaviour:

- the Decision becomes an explicit attention state;
- runtime progression relevant to the scenario is paused;
- the workspace enters Decision Focus Mode;
- the operator must record one available Action before normal progression resumes.

### Non-blocking Decision

A non-blocking Decision remains open while routine work may continue.

Potential future uses include:

- lower-urgency coordination choices;
- decisions with a later deadline;
- choices awaiting additional context while other work proceeds;
- parallel Decisions owned by different roles.

Non-blocking Decision interaction, prioritisation, deadlines and deferral are not implemented in VS1.

### VS1 boundary

VS1 supports **one blocking Decision at a time**.

The domain and future interaction model must not assume that the target system will always have only one open Decision. A later implementation may need:

- multiple simultaneously open Decisions;
- one currently focused Decision;
- pending-decision counts;
- priority / consequence ordering;
- deadlines;
- explicit deferral such as `review later`, `until new evidence`, or a scenario time;
- navigation between open Decisions without silently resolving them.

Do not add speculative runtime fields for these future states until a concrete implementation step requires them.

---

## 3. Decision Focus Mode

Action Review is a **mode of the Operational Workspace**, not a normal card and not a separate application destination.

When a VS1 blocking Decision opens:

1. runtime status becomes `awaitingDecision`;
2. scenario progression stops through runtime state;
3. the Operational Workspace remains visible for orientation;
4. routine workspace content is visually suppressed to approximately half prominence;
5. routine workspace interaction is blocked;
6. Action Review becomes the dominant focus surface.

The visual language should make the mode change immediately legible. It may use a stronger blue/cool treatment, mode strip, different contrast and tighter system-like typography while remaining recognisably VECTOR OPS.

The intent is similar to switching from routine monitoring into a dedicated decision console: the operator remains in the same operational situation, but the interface has changed purpose.

---

## 4. Default information hierarchy

The default Action Review surface prioritises the actual choice rather than exposing every reasoning artifact simultaneously.

Recommended hierarchy:

```text
Decision focus mode
Decision required
Decision question
Why now
Action options
Selected Action summary
Confirm selection
```

The default `Why now` summary should communicate enough context to justify attention without reproducing the complete Assessment / Projection detail, for example:

```text
3 correlated observations · 1 active Assessment · 1 Projection · medium confidence
```

Full evidence, unknowns and assumptions remain available through `Review reasoning` progressive disclosure.

Assumptions are primarily explainability material. They should not dominate the first-level decision surface unless their uncertainty is itself the main decision problem.

---

## 5. Action comparison

When three bounded options are available, desktop Action Review presents them side by side for direct comparison.

Each Action exposes at minimum:

- title;
- authority boundary;
- reversibility;
- expected effects;
- displaced risk / cost;
- affected entities.

The complete card is selectable. A visible native radio control remains part of the card so the selected state is explicit and keyboard behaviour remains predictable.

Selection and confirmation are separate operations:

```text
select Action
→ inspect selected state
→ Confirm selection
→ runtime Decision record
```

The confirmation CTA remains short and stable. Do not place the full Action title in the button.

The selected Action may be repeated in supporting text immediately before confirmation.

---

## 6. Authority presentation

Action Review must not imply authority the WCZK duty officer does not possess.

Examples:

- an operator-owned information-coordination step may show `Operator`;
- an escalation recommendation should communicate `Operator · recommendation only` rather than implying the operator can directly activate regional authority;
- later Action lifecycle UI may separately expose external acceptance, rejection or approval.

The Action title and authority presentation must remain consistent with the accepted primary-operator boundary.

---

## 7. Confirmation receipt

Recording a Decision must produce immediate operator acknowledgement before the interaction disappears without trace.

Use factual language:

```text
Action recorded
```

Do not use `Success`, `Successful action` or equivalent outcome language. Recording the choice does not prove the operational result succeeded.

The receipt should show:

- selected Action;
- decision time;
- confirmation that the contemporaneous context was preserved;
- optional expandable expected effects and displaced risk / cost.

The receipt is presentation state. The runtime Decision and Action lifecycle remain the source of truth.

---

## 8. Operational History

Previously recorded decisions must remain accessible during the operational session rather than appearing only in the final After-Action Report.

The product should expose a global header entry point labelled conceptually as **History / Operational History**.

The history must eventually support reconstruction of:

- what was known at decision time;
- evidence available at that time;
- unknowns and assumptions;
- options that were available;
- selected Action;
- expected effects;
- later Action lifecycle events;
- observed effects.

This is broader than either `Decision history` or `Action history`, because the operator needs both the decision context and the later operational lifecycle.

### Open interaction question

The detailed History interaction remains intentionally unresolved. Two levels are expected:

```text
History entry point
→ chronological lightweight list
→ selected historical Decision / Action context
```

The exact list, drawer, panel or detail treatment should be validated against the working UI before implementation.

---

## 9. Notifications

The header also reserves a neighbouring Notifications entry point.

A target implementation may use Notifications for attention items such as:

- newly opened Decisions;
- multiple waiting Decisions;
- deadlines;
- external Action acceptance / rejection;
- important new evidence affecting an open Decision;
- Action lifecycle changes requiring operator attention.

Notifications are not implemented in VS1. The current UI may expose a disabled placeholder with `Coming soon` to communicate planned capability without implying functionality exists.

---

## 10. Multiple open Decisions — target behaviour

The target system may have more than one Decision open at the same time.

The future interaction should distinguish:

- **open Decisions** from the **currently focused Decision**;
- blocking from non-blocking Decisions;
- requiring-attention count from the complete history;
- deferral from resolution.

A future header or Notifications surface may expose counts such as:

```text
2 decisions requiring attention
```

Do not display several full Action Review surfaces simultaneously. One Decision should own the primary focus surface while the remaining Decisions stay discoverable through an attention queue or equivalent navigation.

Deferring a Decision must be an explicit operational act when introduced. Closing a panel must not silently mean `defer`.

---

## 11. VS1 implementation contract

VS1 currently implements:

- one blocking Decision at a time;
- runtime-owned `awaitingDecision` pause;
- visually distinct Decision Focus Mode;
- suppressed and non-interactive routine workspace beneath the focus layer;
- progressive `Why now` / `Review reasoning` disclosure;
- three comparable full-card Action options;
- explicit selection followed by `Confirm selection`;
- runtime Decision / Action recording;
- factual `Action recorded` receipt;
- reserved History and Notifications header entry points.

VS1 intentionally does **not** implement:

- non-blocking Decisions;
- simultaneous open-Decision navigation;
- Decision deferral;
- History list/detail behaviour;
- Notification delivery or counts;
- external approval workflow inside Action Review;
- full Action lifecycle visualisation;
- final Action Review animation / motion language.

---

## 12. Validation questions for later iterations

When refining the pattern, test:

- Does the operator immediately understand that normal runtime progression has paused?
- Can the operator identify the decision question before reading detailed reasoning?
- Are the three options genuinely comparable without opening extra panels?
- Is uncertainty available without overwhelming the default view?
- Is operator versus external authority legible?
- Can keyboard users remain within the blocking decision flow predictably?
- Does the Action-recorded receipt provide enough confidence without implying operational success?
- Can a prior Decision later be reconstructed from History without hindsight replacing what was known at the time?
- When multiple Decisions are eventually supported, can the operator distinguish `open`, `focused`, `deferred` and `recorded` without losing context?
