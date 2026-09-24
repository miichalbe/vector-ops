# VECTOR OPS — UX Requirements

**Version:** 0.7  
**Date:** 24 September 2026  
**Status:** Living implementation contract  
**Related artifacts:** [Primary Operational View](primary-operational-view.md), [Operational Timeline / Live Activity](operational-timeline.md), [Primary Operator Flow](primary-operator-flow.md), [System Contract](../architecture/system-contract.md)

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

### UX-P07 — Progressive transparency

The default interface should expose enough reasoning to support a timely operational choice without forcing the operator to process every evidence and assumption detail.

Deeper evidence, unknowns, assumptions and rule context must remain inspectable on demand. More consequential or uncertain states may justify stronger disclosure, but routine operation should remain low-noise.

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
- A blocking Decision changes runtime status to `awaitingDecision`; runtime time progression stops because of runtime state rather than presentation-local auto-pause logic.
- Pausing affects progression only; it must not clear selection, evidence or derived claims.
- Final pacing remains subject to scenario validation and may change without altering the domain timeline.

### UX-L06 — Operational Timeline / Live activity

A full-width `Live activity` panel sits between the compact system/data-health bar and the main 70/30 workspace.

The panel answers:

> What just changed?

It provides one cross-domain newest-first chronology so the operator does not need to inspect every entity tile and mentally reconstruct recent activity.

The VS1 implementation:

- derives Timeline entries from runtime state rather than presentation-local scenario logic;
- includes Observations from all monitored entities;
- includes selected material coordination/information events that do not create their own Observation;
- includes material Assessment and Projection revisions;
- includes recorded operator Decision activity where useful for continuity;
- hides internal lifecycle noise that does not change operator understanding;
- uses `receivedAt` as the primary time for Observation entries;
- keeps the panel height bounded and exposes older entries through an internal scroll region;
- allows an entity-linked entry to update Selected entity context without changing scenario time or domain state;
- provides native keyboard interaction and visible focus for entity-linked entries.

The Timeline is a live-awareness surface, not a raw DomainEvent log and not a substitute for the future complete Operational History.

Decision 1 feedback must be observable through the Timeline:

- D1-A exposes synchronised confirmation when it arrives;
- D1-B does not fabricate equivalent confirmation and instead relies on organically arriving observations;
- D1-C exposes the regional-coordination acknowledgement when it arrives.

Scenario pacing should be reassessed against the running Timeline before Act 2 offsets are shortened globally.

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

Hovering the badge must reveal a concise tooltip explaining the current `Normal`, `Review` or `Action` state.

The tooltip must appear only from direct pointer hover over the badge. Hovering or focusing the entity tile or its `View details` control must not reveal it.

The badge must not introduce an additional tab stop. The tooltip must not intercept pointer input, delay or prevent first-click entity selection, or change scenario time or runtime state. Clicking the badge area remains part of the tile's entity-selection target.

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

### UX-S03 — Scrollable observation history

The Selected entity panel keeps a stable outer height while making every current observation for the selected entity available in a newest-first internal scroll region.

- The available viewport should show approximately three observations without moving Assessment or Projection.
- With one or two observations, unused space remains at the bottom of the panel.
- With more observations than fit the viewport, the panel communicates that earlier entries are available by scrolling.
- The observation region must support pointer-wheel and keyboard scrolling, expose visible focus when keyboard scrolling is available, and reset to the newest entry when entity selection changes.
- Observations remain available in runtime state and must not be discarded.

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

## 8. Decision Focus Mode and Action Review

### UX-D01 — Action Review is a workspace mode

Action Review is not treated as an ordinary intelligence panel or a separate navigation destination. A blocking Decision switches the Operational Workspace into **Decision Focus Mode**.

The operator remains in the same operational context, but the interface must visibly communicate that the system is now waiting for a consequential operator choice.

### UX-D02 — Blocking decisions in VS1

VS1 supports only blocking Decisions.

When a blocking Decision opens:

- runtime status becomes `awaitingDecision`;
- scenario time progression stops;
- the operator must record one available Action before the runtime resumes;
- the underlying Operational Workspace remains visible for orientation but is visually suppressed and non-interactive while Decision Focus Mode is active.

The target implementation may later support both blocking and non-blocking Decisions and multiple simultaneously open Decisions. That behaviour is explicitly deferred beyond VS1.

### UX-D03 — Visually distinct mode

Decision Focus Mode must look materially different from routine workspace operation, not merely like another bordered panel.

The first implementation uses a cooler, higher-contrast blue treatment, mode strip and stronger visual separation while preserving VECTOR OPS typography and information discipline.

The normal workspace remains visible beneath a dimmed overlay at approximately half prominence. The intent is to preserve orientation without competing with the current decision.

### UX-D04 — Decision information hierarchy

The default Action Review hierarchy is:

1. explicit `Decision required` state;
2. decision question;
3. concise `Why now` summary;
4. comparable Action options;
5. selected-option summary and confirmation.

Evidence, unknowns and assumptions must remain available but are secondary to the decision itself.

### UX-D05 — Progressive reasoning disclosure

The default `Why now` summary should communicate the minimum sufficient reasoning context, such as:

- number of correlated observations;
- active Assessment count;
- Projection count;
- current confidence level.

Full evidence, unknowns and assumptions are exposed through an explicit `Review reasoning` disclosure.

Assumptions are treated primarily as explainability material rather than mandatory first-level decision content.

### UX-D06 — Comparable Action cards

Available Actions should be shown as directly comparable cards when the option count and viewport support it.

Each Action card exposes at minimum:

- title;
- authority boundary;
- reversibility;
- expected effects;
- displaced risk or cost;
- affected entities.

No option is visually or verbally labelled as the recommended or correct choice unless a future rule explicitly produces such a recommendation and its reasoning is inspectable.

### UX-D07 — Full-card selection

The complete Action card is the selection target. A native radio control remains visible to preserve explicit state and predictable keyboard semantics.

Hover, keyboard focus and selected states must be visually distinct. Selection itself does not record the Decision; the operator must separately confirm it.

### UX-D08 — Short confirmation CTA

The confirmation button uses a short stable label such as `Confirm selection`.

Do not place the complete Action title inside the button because Action names may be long. The currently selected Action may instead be repeated in nearby supporting text before confirmation.

### UX-D09 — Authority wording

Action Review must describe the operator's actual authority rather than implying direct control that does not exist.

Where the operator can recommend but not execute a broader escalation, the UI should communicate recommendation authority explicitly. External acceptance/approval state remains a future lifecycle concern where applicable.

### UX-D10 — Focus containment

A blocking Decision must prevent accidental interaction with the suppressed workspace.

Keyboard interaction should remain within the Action Review while it is active. The current implementation uses native controls and a contained tab sequence. Final focus-return behaviour after confirmation remains subject to refinement against the running UI.

### UX-D11 — Action-recorded receipt

After confirmation, the interface must provide immediate acknowledgement that the Action was recorded before the operator fully returns to routine work.

The acknowledgement must use factual language such as `Action recorded`, not `Success`, because recording an Action does not mean the operational outcome succeeded.

The receipt may expose recorded expected effects and displaced risks through progressive disclosure.

### UX-D12 — Operational history entry point

The application header reserves a global `History` entry point near scenario time so previously recorded Decisions and Action lifecycle events can later be revisited without relying only on the final After-Action Report.

The detailed History interaction is not implemented in VS1. The eventual history should preserve the distinction between:

- decision context available at the time;
- selected Action;
- subsequent Action lifecycle events;
- expected effects;
- observed effects.

A neighbouring Notifications entry point is also reserved for future attention items such as open Decisions or Action responses. Placeholder controls must not pretend to perform unavailable functionality; they may communicate `Coming soon` on hover.

---

## 9. Keyboard and accessibility

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

## 10. Content and terminology

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

## 11. Deferred UX work

The following remain intentionally unresolved:

- final entity-detail surface beyond the three-observation preview;
- final contextual action and `Actions` menu behaviour;
- non-blocking Decision behaviour;
- multiple simultaneous open Decisions, prioritisation and deferral;
- final Operational History list/detail interaction;
- Notifications interaction and attention model;
- final external-response presentation inside Action Review / Action lifecycle;
- final focus-return behaviour after a blocking Decision;
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

## 12. Current acceptance checklist

The implemented baseline should satisfy all of the following:

- [x] Six Scenario 01 entity tiles are visible.
- [x] Tiles have consistent height.
- [x] `View details` is aligned to the bottom of each tile.
- [x] The `View details` label remains stable after selection.
- [x] The full tile acts as the primary details-selection target.
- [x] Selection has visible hover, selected and keyboard-focus treatment.
- [x] Entity status badges expose a read-only explanation only on direct badge hover, without adding tab stops or disrupting first-click tile selection.
- [x] Selected entity appears above Assessment and Projection.
- [x] Selected entity aligns vertically with the entity grid.
- [x] Selected entity has a stable provisional height.
- [x] Selected entity keeps approximately three observations visible and exposes all earlier observations through an internal scroll region.
- [x] Assessment and Projection do not move when selection changes.
- [x] `Tab`, `Enter` and `Space` support the primary details interaction.
- [x] Arrow-key navigation is explicitly deferred.
- [x] Scenario progression has a visible keyboard-accessible Pause / Resume control.
- [x] The first blocking Decision pauses runtime through `awaitingDecision` rather than local React auto-pause state.
- [x] Active derived claims expose keyboard-accessible evidence disclosure.
- [x] Operational severity is derived from active Assessment and Projection state rather than baseline UI copy.
- [x] Data condition is derived from Observation quality and delivery timing rather than represented as a static baseline label.
- [ ] Dependencies are inspectable from the entity context.
- [x] Assessment and Projection are generated from deterministic rules and expose their current runtime revisions.
- [x] Decision 1 Actions use shared runtime Action objects and one runtime Decision record.
- [x] Decision Focus Mode visually suppresses and blocks the routine workspace while a blocking Decision is open.
- [x] Action Review uses progressive reasoning disclosure and full-card Action selection.
- [x] Confirming a Decision produces an `Action recorded` receipt before routine work continues visually.
- [x] Header reserves History and Notifications entry points without pretending the future features are already available.
- [x] Complete current observation history is accessible from the Selected entity scroll region.
- [x] Live activity combines cross-domain observations into one newest-first Timeline.
- [x] Material D1 coordination feedback is exposed without fabricating equivalent feedback for D1-B.
- [x] Entity-linked Timeline entries update Selected entity context and remain keyboard accessible.
- [x] Timeline height is bounded and older activity remains available through internal scrolling.

---

## 13. Change log

| Date | Version | Change |
|---|---:|---|
| 24 September 2026 | 0.7 | Added Operational Timeline / Live activity as a full-width cross-domain chronology, defined material-entry filtering, entity-context interaction, D1 feedback visibility, and the distinction between live awareness and future complete Operational History. |
| 23 September 2026 | 0.6 | Defined Decision Focus Mode, VS1 blocking-Decision behaviour, progressive Action Review hierarchy, full-card Action selection, factual post-confirmation receipt, and future History / Notifications entry points. Documented non-blocking and multiple simultaneous Decisions as post-VS1 work. |
| 23 September 2026 | 0.5 | Replaced the three-observation truncation with a keyboard-accessible internal scroll region while preserving the Selected entity panel's stable height. |
| 23 September 2026 | 0.4 | Restricted entity-status tooltips to direct badge hover and protected first-click tile selection from tooltip interference. |
| 23 September 2026 | 0.3 | Added accessible hover and keyboard-focus explanations for read-only entity status badges. |
| 23 September 2026 | 0.2 | Added live opening progression, pause behaviour, newest-first observation previews, runtime-derived status and inline evidence review for Assessment and Projection. |
| 22 September 2026 | 0.1 | Created the living UX requirements contract from the first working operational view and accepted interaction refinements. |
