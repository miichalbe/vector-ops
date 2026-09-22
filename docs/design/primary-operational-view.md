# VECTOR OPS — Primary Operational View

**Version:** 0.2  
**Date:** 22 September 2026  
**Related issue:** #13  
**Status:** Information hierarchy and structural direction accepted for implementation

---

## 1. Purpose

This document defines the low-fidelity information architecture for the primary VECTOR OPS operational screen. It is a structural contract, not a high-fidelity visual design.

The view must communicate:

- current entity state,
- cross-domain interpretation,
- time-dependent consequences,
- source evidence and uncertainty,
- available operator actions,
- active modules and data health.

All application UI copy is English.

The end-to-end run behaviour, opening variation, decision timing and scenario runtime are defined in [Primary Operator Flow & Scenario Runtime Contract](primary-operator-flow.md).

---

## 2. Desktop structure

The alpha is desktop-first.

| Left workspace — approximately 70% | Right intelligence column — approximately 30% |
|---|---|
| Entity tile dashboard | Assessment panel |
| Six initial entity tiles | Projection panel |
| Deliberate space for future entities | Contextual actions and evidence access |

The right-column order is:

1. **Assessment** — what VECTOR OPS believes is happening now;
2. **Projection** — what may happen if the current state continues.

This preserves the reasoning sequence:

> current interpretation → future consequence → available action

Use a fixed 70/30 split for the first implementation. A visible structural divider may anticipate resizing, but manual resizing is optional for alpha and must not displace core work.

---

## 3. Entity tile grid

One tile represents one entity, not one module.

Initial tiles:

- GPZ Brzeziny,
- SUW Kępa,
- Regional Communications Gateway R-4,
- County Hospital Nowy Brzeg,
- Mobile Generator AG-400,
- Technical Access Route Z-17.

Modules contribute observations, state and actions to the same entity tile. A SUW tile may therefore contain Water, Power, Communications and Tasking information.

Use a stable grid rather than stretching six tiles to occupy all available space. Deliberate remaining capacity should suggest that additional entities can be registered later without implying that an alpha user can already add them.

A subtle count such as `6 entities currently monitored` may clarify the current scope.

---

## 4. Tile anatomy

Required elements:

- entity name,
- aggregate operational severity,
- separate data freshness/quality indication,
- up to four or five key values,
- relevant trend,
- last-update access,
- primary contextual action when applicable,
- access to details, dependencies and all available actions.

Example:

> **SUW Kępa**  
> Warning  
> Output pressure: **3.5 bar ↓**  
> Reservoir: **62% ↓**  
> Pumps: **1 of 3 active**  
> Power: **Limited supply**  
> Telemetry: **Updated 42 sec ago**  
> View details · Actions

Detailed observations remain available in an entity detail view; not every metric belongs on the tile surface.

---

## 5. Severity and data condition

Operational severity and data condition are separate dimensions.

### Operational severity

- Normal,
- Warning,
- Critical.

### Data condition

- Current,
- Delayed,
- Stale,
- Unavailable,
- Manual,
- Unknown.

Aggregate severity follows the highest active operational severity. Normal may be shown only when all required inputs are sufficiently current. Missing data must never be treated as Normal.

A tile may validly display:

> **Critical** · Data delayed by 8 min

or:

> **Status unknown** · Last confirmed normal state 14 min ago

Use colour as reinforcement only:

- green — Normal,
- amber — Warning,
- red — Critical,
- grey — Unknown/Unavailable,
- blue — action in progress or neutral system activity.

Do not colour the complete tile surface. Prefer a status strip, border, icon and text. Never rely on colour alone.

---

## 6. Assessment panel

Assessment answers:

> **What does VECTOR OPS believe is happening now?**

It is a prioritised list of operational claims, not a raw alert feed.

Each item contains:

- title,
- Primary/Secondary priority,
- current severity,
- confidence,
- affected entities,
- evidence count,
- last recalculation time,
- access to evidence and applicable actions.

The first scenario exposes at most two active Assessments simultaneously. One may be Primary.

Create a separate Assessment only when the claim:

- is operationally distinct,
- combines or interprets observations,
- may require a separate response,
- has its own evidence chain.

A local warning that only contributes to a wider situation remains supporting evidence rather than becoming another card.

---

## 7. Projection panel

Projection answers:

> **What may happen if the current state continues?**

Each item contains:

- consequence statement,
- related Assessment,
- affected entities/service,
- time horizon or time-to-impact range,
- confidence,
- main uncertainty,
- last recalculation time,
- evidence/dependency access,
- applicable preventive or mitigating actions.

The first scenario exposes at most three active Projections simultaneously.

One Assessment may produce multiple Projections. Selecting an Assessment highlights related tiles and Projections. The default view shows all active Projections sorted by urgency and operational impact.

---

## 8. Actions

The same Action object may have several UI entry points.

### Tile actions

Object-scoped examples:

- Request status update,
- Inspect dependencies,
- Contact operator,
- Recommend resource assignment,
- Create task.

### Assessment actions

Current-situation examples:

- Open cross-domain incident,
- Request coordinated confirmation,
- Escalate assessment.

### Projection actions

Preventive examples:

- Review response options,
- Protect critical recipient,
- Recommend resource deployment.

Avoid several exposed buttons on every tile. Show one primary contextual action when necessary plus an Actions menu and View details.

Every entry point opens the same reusable Action Review and records the same action lifecycle and audit data.

The vertical slice may begin with the mandatory decision gates defined in the Primary Operator Flow. The exact reusable Action Review visual treatment remains an implementation-time refinement under issue #14.

---

## 9. Module and data-health bar

A compact system bar above the workspace communicates modularity without confusing module health with infrastructure health.

Example:

> **Modules: 4 active** · **Data feeds: 5 current, 1 delayed** · **Scenario 01** · **07:51**

The expanded state distinguishes:

| Module | Software state | Data health |
|---|---|---|
| Power | Active | Current |
| Water | Active | Delayed |
| Communications | Active | Current |
| Critical Services & Response | Active | Manual updates |

Software states:

- Active,
- Loading,
- Error,
- Disabled.

Data states:

- Current,
- Delayed,
- Stale,
- Unavailable,
- Manual.

Do not use phrases such as `Communications module degraded` when the intended meaning is degraded infrastructure or delayed source data.

---

## 10. Evidence and trust pattern

Design principle:

> **Every claim in VECTOR OPS must be traceable to its source observations, reports, rules and assumptions.**

Every status, Assessment, Projection and recommendation exposes a consistent **Why? / Review evidence** path.

The evidence surface contains:

1. **Claim** — what VECTOR OPS communicates.
2. **Evidence** — measurements and human reports.
3. **Logic** — dependencies, thresholds and rules.
4. **Uncertainty** — stale data, assumptions, conflicts and missing information.

For quantitative evidence show where applicable:

- exact value and unit,
- warning/critical threshold,
- trend,
- observed time,
- received time,
- source,
- quality,
- confidence,
- rule evaluation time.

For human reports show:

- reported state,
- reporting organisation or role,
- received time,
- last confirmation,
- confidence,
- conflicts or missing corroboration.

Not every claim has a numeric sensor value, but every claim must have inspectable provenance.

---

## 11. Interaction states

Selecting an entity tile:

- opens or updates its detail context,
- highlights its dependencies,
- highlights related Assessments and Projections.

Selecting an Assessment:

- highlights affected tiles,
- highlights related Projections,
- exposes evidence and available responses.

Selecting a Projection:

- highlights the causal chain,
- exposes assumptions and time horizon,
- exposes related preventive or mitigating actions.

The UI must preserve scenario time, selection and audit context while the user inspects evidence.

---

## 12. Deferred work

Not resolved by this document:

- high-fidelity visual styling,
- exact tile dimensions,
- typography and icon system,
- responsive mobile behaviour,
- detailed onboarding callouts,
- final Action Review layout,
- animation and transition design.

Contextual onboarding is designed after the primary interface exists.

---

## 13. Acceptance criteria

- six initial entities fit without using the full potential grid capacity,
- an entity can receive content from several modules,
- severity and data condition are both visible,
- Unknown/Unavailable cannot appear as Normal,
- at least two Assessments and three Projections are supported,
- Assessment and Projection remain prioritised interpretations rather than alert feeds,
- every derived claim exposes evidence, rules and uncertainty,
- actions share one domain object regardless of entry point,
- module software state is distinct from infrastructure and data state,
- layout works with a fixed 70/30 split,
- no scenario rule exists only inside a visual component.
