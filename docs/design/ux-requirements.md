# VECTOR OPS — UX Requirements

**Version:** 0.3  
**Date:** 23 September 2026  
**Status:** Living implementation contract  
**Related artifacts:** [Primary Operational View](primary-operational-view.md), [Primary Operator Flow](primary-operator-flow.md), [System Contract](../architecture/system-contract.md)

---

## 1. Purpose

This document records accepted UX requirements discovered and refined while implementing the working VECTOR OPS interface.

It supplements the structural direction in the Primary Operational View with implementation-level requirements that should remain visible as the interface evolves. It is not a high-fidelity visual specification and does not replace domain, scenario or runtime contracts.

The document exists to prevent accepted interaction decisions from being lost in source code, screenshots or conversation history.

## 2. Maintenance rule

This is a living document.

When an implementation discussion produces an accepted UX decision that changes operator behaviour, information hierarchy, interaction semantics, accessibility, layout stability or trust presentation:

1. update this document in the same change or before the related work is considered complete;
2. mark provisional solutions explicitly;
3. add a dated change-log entry;
4. add a Decision Log entry only when the decision is sufficiently architectural, cross-cutting or difficult to reverse.

Small visual tuning that does not change behaviour or hierarchy does not require a new requirement.

If implementation exposes a conflict between this document and another accepted contract, resolve and document the conflict rather than silently allowing the code to become the only source of truth.

---

## 3. UX principles

### UX-P01 — Operational clarity before decoration

The interface must prioritise current state, evidence, consequence and available response over visual novelty.

### UX-P02 — Stable spatial model

Information that the operator repeatedly compares should remain in a stable location. Changes in observation count or content length should not cause unrelated operational panels to jump vertically during routine inspection.

### UX-P03 — Inspectable reasoning

Operational claims must expose a path to evidence, source, time, confidence, dependencies, rules, assumptions and uncertainty where applicable.

### UX-P04 — State dimensions remain distinct

Operational severity, data freshness, source mode, module software state and action progress must not be collapsed into one ambiguous status.

### UX-P05 — Explicit affordances with efficient interaction

Important interactions should remain visibly discoverable while also supporting larger click targets and keyboard use.

### UX-P06 — Colour reinforces meaning

Colour may reinforce state, selection or attention, but text, structure and focus treatment must carry the meaning independently.

---

## 4. Primary workspace

### UX-L01 — Desktop-first split

The primary operational workspace uses an approximately 70/30 desktop split:

- left: monitored entity workspace;
- right: selected-entity context, Assessment and Projection.

The first implementation may collapse to one column at narrower viewport widths. Full mobile optimisation remains deferred.

### UX-L02 — Column alignment

The Selected entity panel must begin at the same vertical level as the first row of entity tiles.

Both columns may use aligned section headings above their first panel to preserve this relationship.

### UX-L03 — Right-column hierarchy

The current right-column order is:

1. Selected entity;
2. Assessment;
3. Projection.

Assessment must remain above Projection to preserve the reasoning sequence:

> current interpretation → future consequence

Selected entity is an inspection context placed before that intelligence sequence, not a replacement for Assessment.

### UX-L04 — Module and data-health summary

A compact system bar above the workspace should communicate at minimum:

- active module count or state;
- data-feed condition or observation summary;
- monitored entity count;
- scenario identity and time when runtime state supports them.

Module software state must not be described as infrastructure state.

### UX-L05 — Live scenario progression

**Provisional alpha requirement:** the opening advances automatically at one scenario minute per four real-time seconds.

- A visible native `Pause` / `Resume` control must remain keyboard accessible.
- The current opening automatically pauses when the first Projection appears so the operator can inspect the complete initial reasoning chain.
- Pausing affects progression only; it must not clear selection, evidence or derived claims.
- Final pacing remains subject to scenario validation and may change without altering the domain timeline.

---

## 5. Entity grid and tiles

### UX-E01 — One tile represents one entity

A tile represents a shared entity rather than a module. Multiple modules may contribute observations, state and actions to the same tile.

### UX-E02 — Stable tile geometry

Entity tiles in the initial grid should have equal height regardless of how many observations are displayed.

The grid should retain deliberate capacity for future entities rather than stretching the six initial tiles to fill all available space.

### UX-E03 — Observation preview

The current tile and Selected entity previews display up to three observations, ordered by most recently received first with stable ID ordering as the final tie-breaker.

This is a presentation limit, not a domain-data limit. The runtime must retain all observations.

This provisional alpha rule ensures that newly received scenario evidence becomes visible without increasing tile height. A later priority model may also consider operational relevance, severity or pinned observations.

### UX-E04 — Details control placement

The visible `View details` control must remain aligned to the bottom edge of every entity tile.

Its label must remain `View details` before and after selection. Selection state must not be communicated by changing the control to phrases such as `Viewing details`.

### UX-E05 — Full-tile selection target

The entire non-action surface of an entity tile should select that entity and expose its details.

The visible `View details` control remains the explicit affordance and semantic primary control. Its interactive target may extend across the tile.

### UX-E06 — Selected state

The selected entity tile must be visibly distinguishable through more than colour alone where practical. The current treatment uses a stronger border, highlight and persistent selected state.

Selection must update the Selected entity panel without changing scenario time or domain state.

### UX-E07 — Future tile actions remain separate

Future entity actions, such as requesting a status update, inspecting dependencies, contacting an operator or recommending resource assignment, must remain separate controls.

The full-tile details target must not swallow, duplicate or unexpectedly trigger those actions.

Avoid exposing several equally prominent action buttons on every tile. Prefer one contextual primary action where necessary, an `Actions` menu and the persistent `View details` affordance.

### UX-E08 — Entity-status explanation

The entity status badge is a read-only indicator of operational attention derived from active Assessment and Projection state. It is not an action and must not appear clickable.

Hovering the badge or moving keyboard focus to the tile's existing `View details` control must reveal a concise tooltip explaining the current `Normal`, `Review` or `Action` state. The same explanation must be associated programmatically with the tile's primary details control for assistive technology.

The badge must not introduce an additional tab stop. The tooltip relies on the tile's existing visible keyboard-focus treatment and must not change entity selection, scenario time or runtime state.

---

## 6. Selected entity panel

### UX-S01 — Clear relationship to selection

The panel must clearly communicate that it contains details for the highlighted entity tile.

The relationship is currently reinforced by:

- placement above Assessment and Projection;
- alignment with the entity grid;
- a shared blue selection accent;
- the label `Selected entity`;
- explanatory copy identifying it as details for the highlighted tile.

### UX-S02 — Stable outer height

**Provisional alpha requirement:** the Selected entity panel uses a fixed outer height of `430px` on the current desktop layout.

This prevents Assessment and Projection from moving vertically when the operator switches between entities with different observation counts.

The exact final height and long-content behaviour must be reassessed after the full entity-detail and action model is implemented.

### UX-S03 — Observation limit

The current Selected entity preview displays a maximum of three observations.

- With one or two observations, unused space remains at the bottom of the panel.
- With more than three observations, the panel communicates `Showing 3 of N current observations`.
- Additional observations remain available in runtime state and must not be discarded.
- A future complete details surface must provide access to the full observation set.

### UX-S04 — Stable downstream panels

Switching the selected entity must not move Assessment or Projection solely because the selected entity has a different number of observations.

### UX-S05 — Selection announcement

Changes to the selected-entity content should be exposed to assistive technology without moving keyboard focus unexpectedly. The current implementation uses a polite live region.

---

## 7. Assessment and Projection

### UX-I01 — Separate meanings

Assessment answers:

> What does VECTOR OPS believe is happening now?

Projection answers:

> What may happen if the current state continues?

The interface must not merge these into one alert stream.

### UX-I02 — Empty baseline state

At the stable scenario baseline:

- Assessment may state that no material cross-domain issue is detected;
- Projection may state that no active projections exist.

The copy must not imply that all uncertainty is zero.

### UX-I03 — Capacity

The primary scenario supports:

- up to two simultaneously exposed active Assessments;
- up to three simultaneously exposed active Projections.

These are presentation limits, not domain-model limits.

### UX-I04 — Evidence access

Every material Assessment and Projection must expose a consistent evidence path. The final interaction may use a panel, drawer or another details surface, but provenance must not exist only in explanatory UI copy.

### UX-I05 — Latest active revision

The primary panels display the latest active revision of each Assessment or Projection family.

Earlier revisions remain in runtime state for audit reconstruction and must not appear as simultaneous duplicate active claims.

### UX-I06 — Inline evidence disclosure

**Provisional alpha requirement:** active Assessment and Projection panels expose a native `Review evidence` disclosure containing:

- supporting observations and received times;
- registered dependencies;
- assumptions and their status;
- the generating rule identifier.

The disclosure must support keyboard activation and visible focus. Expanding it may intentionally move content below the panel; this is a deliberate inspection action and is distinct from unwanted movement caused by routine entity selection.

---

## 8. Keyboard and accessibility

### UX-A01 — Native primary-control behaviour

The primary entity-details interaction must support:

- `Tab` to reach the control;
- `Enter` to activate it;
- `Space` to activate it;
- a clearly visible focus indicator covering the effective full-tile target.

### UX-A02 — No colour-only state

Selection, severity, freshness, unavailability and action progress must not rely on colour alone.

### UX-A03 — Arrow-key navigation deferred

Arrow-key navigation between entity tiles is not required at the current stage.

The present native button behaviour is acceptable and predictable. A composite grid with roving `tabindex` may be considered after tile-level actions and focus behaviour are stable.

This feature is deferred because premature implementation may need to be reworked when tiles contain multiple independent controls.

### UX-A04 — Future composite controls

If arrow-key navigation is introduced later, it must use a coherent composite-widget model rather than isolated key handlers. Focus order, selection behaviour, action controls and responsive column changes must be tested together.

---

## 9. Content and terminology

### UX-C01 — Application language

All user-facing application copy is English.

### UX-C02 — Operational wording

Copy should be factual, restrained and explicit about uncertainty. Avoid sensational language, unsupported causal claims and false precision.

### UX-C03 — Action authority

Actions outside the Duty Operations Officer's authority must be worded as requests, recommendations, notifications or escalations rather than direct infrastructure commands.

### UX-C04 — No gamified outcome

The operational experience and After-Action Report must not use:

- scores;
- stars;
- success/failure verdicts;
- celebratory or punitive language;
- named outcome classes implying a single hidden correct path.

---

## 10. Deferred UX work

The following remain intentionally unresolved:

- final entity-detail surface beyond the three-observation preview;
- final contextual action and `Actions` menu behaviour;
- reusable Action Review layout;
- arrow-key navigation within the entity grid;
- full responsive and mobile behaviour;
- user-controlled workspace resizing;
- final typography and icon system;
- high-fidelity visual styling;
- animation and transition language;
- detailed contextual onboarding;
- degraded-state and unavailable-data interaction details.

Deferred work should be resolved against running scenario behaviour rather than through speculative completeness.

---

## 11. Current acceptance checklist

The implemented baseline should satisfy all of the following:

- [x] Six Scenario 01 entity tiles are visible.
- [x] Tiles have consistent height.
- [x] `View details` is aligned to the bottom of each tile.
- [x] The `View details` label remains stable after selection.
- [x] The full tile acts as the primary details-selection target.
- [x] Selection has visible hover, selected and keyboard-focus treatment.
- [x] Entity status badges expose a read-only explanation on pointer hover and existing tile-control focus without adding tab stops.
- [x] Selected entity appears above Assessment and Projection.
- [x] Selected entity aligns vertically with the entity grid.
- [x] Selected entity has a stable provisional height.
- [x] Selected entity previews no more than three observations.
- [x] Assessment and Projection do not move when selection changes.
- [x] `Tab`, `Enter` and `Space` support the primary details interaction.
- [x] Arrow-key navigation is explicitly deferred.
- [x] Scenario progression has a visible keyboard-accessible Pause / Resume control.
- [x] The opening pauses when the first complete Assessment → Projection chain is available.
- [x] Active derived claims expose keyboard-accessible evidence disclosure.
- [x] Operational severity is derived from active Assessment and Projection state rather than baseline UI copy.
- [x] Data condition is derived from Observation quality and delivery timing rather than represented as a static baseline label.
- [ ] Dependencies are inspectable from the entity context.
- [x] Assessment and Projection are generated from deterministic rules and expose their current runtime revisions.
- [ ] Contextual actions use shared Action objects.
- [ ] Complete observation history is available from a full details surface.

---

## 12. Change log

| Date | Version | Change |
|---|---:|---|
| 23 September 2026 | 0.3 | Added accessible hover and keyboard-focus explanations for read-only entity status badges. |
| 23 September 2026 | 0.2 | Added live opening progression, pause behaviour, newest-first observation previews, runtime-derived status and inline evidence review for Assessment and Projection. |
| 22 September 2026 | 0.1 | Created the living UX requirements contract from the first working operational view and accepted interaction refinements. |
