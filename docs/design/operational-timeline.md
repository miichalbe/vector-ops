# VECTOR OPS — Operational Timeline / Live Activity

**Version:** 0.3  
**Date:** 24 September 2026  
**Status:** Accepted interaction contract for VS1 implementation  
**Related artifacts:** [Primary Operational View](primary-operational-view.md), [UX Requirements](ux-requirements.md), [Primary Operator Flow](primary-operator-flow.md)

---

## 1. Purpose

The Operational Timeline gives the duty operator one cross-domain place to answer:

> **What just changed?**

It reduces the need to click individual entity tiles and mentally reconstruct chronology from separate observation histories.

The Timeline complements rather than replaces the other primary workspace surfaces:

- entity tiles answer **What is the current state of each monitored entity?**;
- Assessment answers **What does VECTOR OPS believe is happening now?**;
- Projection answers **What may happen next?**;
- Operational Timeline answers **What changed, in what order, and where?**

The first implementation is a live operational-awareness surface, not a complete audit/history browser.

---

## 2. Placement

For VS1 the Timeline is a full-width panel between the compact system/data-health bar and the main 70/30 workspace.

It must not displace the established relationship between:

- entity grid on the left;
- Selected entity, Assessment and Projection on the right.

The panel should expose approximately four to six recent entries while preserving access to earlier entries through an internal scroll region.

---

## 3. Information model

The Timeline is derived from runtime state. It must not introduce scenario rules, duplicate domain state or maintain a separate narrative truth in React local state.

The first implementation may surface four classes of material activity:

1. **Observations** — newly received operational facts or reports from any monitored entity;
2. **coordination / information events** — material events without their own Observation, such as synchronised confirmation or regional acknowledgement;
3. **derived-intelligence revisions** — material new revisions of Assessment or Projection;
4. **operator decision records** — recorded Action / Decision activity where useful for continuity.

Not every DomainEvent belongs in the Timeline. Internal lifecycle noise should remain hidden unless it changes operator understanding or action context.

The Timeline is therefore a curated operational activity stream, not a raw event log.

---

## 4. Ordering and time

Entries are ordered newest first.

Each entry exposes scenario time. For Observations the primary Timeline time is `receivedAt`, because the operator cannot act on information before it is received.

Where observed time differs materially from received time, the detail may expose both values so delay remains inspectable.

Stable ordering is required for entries that share the same scenario time.

---

## 5. Entry anatomy

Each visible entry should contain enough information for rapid scanning:

- scenario time;
- activity type;
- entity or source label where applicable;
- concise factual description;
- data/confidence cue where it materially changes interpretation.

Examples:

> **08:05 · R-4 · Observation**  
> Switched to backup power

> **07:53 · Cross-domain coordination · Confirmation**  
> Synchronised confirmation received; shared cause and persistence remain unconfirmed

> **08:14 · Assessment · Revised**  
> Persistent F-12 disruption confirms continuing risk to dependent services

Recorded Decision entries should preserve enough context to remain useful after the transient confirmation toast disappears:

- the selected Action title;
- at most two concise expected effects.

The Timeline should not repeat complete displaced risk/cost or all Action Review reasoning. Those details belong to the Decision context, future Operational History and the After-Action Report.

Copy must remain restrained and must not convert uncertain state into confirmed causality.

---

## 6. Interaction

An entry associated with a monitored entity should allow the operator to move inspection context to that entity.

An Assessment or Projection entry should allow the operator to move inspection context to the corresponding claim family.

For VS1:

- selecting an entity-linked Timeline entry updates the Selected entity context;
- selecting an Assessment or Projection Timeline entry selects that claim family in the corresponding inspection panel;
- selecting an older claim revision does **not** rewind runtime state or show a historical snapshot; the panel shows the latest current revision of that claim family;
- the Timeline therefore remains a `what changed?` surface while the claim panel remains a `what is the current interpreted/projected state?` surface;
- when several active Assessments or Projections exist, the corresponding panel exposes the active count and allows switching between current claim families;
- absent an explicit operator selection, the default visible claim follows the canonical prioritisation contract: attention (`act` → `review` → `monitor`), then severity, then for Projections shorter time-to-impact, then most recent material recalculation and stable ID as final tie-breaker;
- an explicit operator selection remains selected until the operator chooses another family or the referenced family no longer exists;
- the Timeline action must not alter scenario time or domain state;
- keyboard activation and visible focus are required for interactive entries;
- non-interactive system entries must not appear clickable;
- a newly inserted material entry receives a brief neutral visual highlight to attract attention to fresh information.

The transient highlight communicates **newness only**. It must not imply Warning, Critical, success or failure state. It should fade after a short interval, should not pulse continuously, and should not change ordering or operator focus.

Historical snapshots remain a future Operational History responsibility rather than Live Activity behaviour.

---

## 7. Relationship to Operational History

Live Activity and Operational History are related but not identical.

**Live Activity** optimises for present-tense awareness:

- newest first;
- compact;
- focused on material changes;
- embedded in the current workspace.

**Operational History** will optimise for reconstruction and audit:

- complete chronological navigation;
- historical knowledge state;
- Decision context and selected Action;
- expected effects and later observed effects;
- external Action lifecycle responses;
- eventual After-Action Report support.

The first Timeline implementation should reuse runtime records that can later support History, but must not pretend that the full History interaction already exists.

---

## 8. Decision 1 feedback requirement

The Timeline is required to make the downstream information posture chosen in Decision 1 visible.

Specifically:

- D1-A must expose the synchronised-confirmation event when it occurs;
- D1-B must not fabricate equivalent confirmation; the operator instead sees organically arriving observations;
- D1-C must expose the regional-coordination acknowledgement when it occurs.

This allows the three D1 choices to feel different through information timing and coordination state without creating separate physical scenario narratives.

---

## 9. Pacing validation

Scenario pacing must be reassessed after the Timeline is implemented.

Do not shorten all Act 2 offsets pre-emptively. The current perceived delay after D1 may partly result from material runtime events being invisible in the present UI.

Validation sequence:

1. implement Timeline with current scenario offsets unchanged;
2. run D1-A, D1-B and D1-C manually;
3. assess time-to-first-visible-feedback and overall rhythm;
4. shorten only the silent intervals that remain operationally or demonstratively too long.

Manual full-run validation on 24 September 2026 found the current `4 s = 1 scenario minute` pacing acceptable overall, with intentionally faster and quieter periods. Keep that rate for the current alpha; future pacing changes should be made through an explicit simulation-rate parameter rather than scattered timing edits.

---

## 10. Acceptance criteria

- one cross-domain Timeline is visible without selecting an entity;
- entries are newest-first and use scenario time;
- observations from different entities appear in the same chronological stream;
- D1-A synchronised confirmation is visible;
- D1-C regional acknowledgement is visible;
- D1-B does not receive fabricated confirmation;
- recorded Decision entries retain the selected Action and at most two concise expected effects;
- newly inserted entries receive a short neutral new-information highlight;
- the highlight does not encode severity or persist after the attention interval;
- entity-linked entries can update Selected entity context;
- Assessment/Projection entries can select the corresponding current claim family;
- multiple active Assessments/Projections remain discoverable and switchable in their inspection panels;
- default claim selection follows the canonical attention → severity → Projection time-to-impact → recency → stable-ID ordering rather than array insertion order;
- interactive entries support keyboard activation and visible focus;
- the panel has bounded height with internal scrolling;
- the Timeline is derived from runtime state rather than presentation-local scenario logic;
- the Timeline is clearly distinct from future complete Operational History.
