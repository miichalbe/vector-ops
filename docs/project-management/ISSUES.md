# Suggested Initial GitHub Issues

Below are ready-to-copy issue titles and descriptions.

---

## 1. Map adjacent product landscape
**Milestone:** M1 — Discovery Complete

Review relevant categories and representative products:
- TAK / ATAK ecosystem
- UAV ground-control systems
- fleet-management systems
- logistics platforms
- emergency-management tools
- C2-adjacent operational software

**Output:** landscape document with categories, strengths, overlaps and visible gaps.

---

## 2. Identify cross-domain decision friction
**Milestone:** M1 — Discovery Complete

Document cases where current tools expose separate data but force the operator to manually infer the operational consequence.

**Output:** 3–5 concrete friction patterns.

---

## 3. Define primary operator persona
**Milestone:** M1 — Discovery Complete

Select one primary operator for the MVP.

Define:
- responsibilities
- decisions
- information needs
- environment
- time pressure
- common failure modes

**Output:** concise persona / operational role definition.

---

## 4. Define primary demonstration scenario
**Milestone:** M1 — Discovery Complete

Select one narrow, non-weaponized operational scenario that can demonstrate the core VECTOR OPS hypothesis.

Candidate direction:
- search and rescue
- distributed emergency response

**Output:** scenario from start state → disruption → consequence → operator decision → outcome.

---

## 5. Select MVP modules
**Milestone:** M1 — Discovery Complete

Choose the minimum module set required to demonstrate cross-domain value.

Target: 3–4 operational modules plus shared core.

**Output:** module list with responsibilities and rationale.

---

## 6. Refine value proposition
**Milestone:** M1 — Discovery Complete

Update the current positioning after market / adjacent-product review.

Current hypothesis:
> VECTOR OPS turns cross-domain operational state into explainable consequences and operator-reviewable decisions.

**Output:** final v0.2 value proposition.

---

## 7. Update Discovery Brief to v0.2
**Milestone:** M1 — Discovery Complete

Incorporate findings from the first discovery pass:
- market landscape
- chosen operator
- chosen scenario
- MVP scope
- refined differentiator
- revised risks

**Output:** `docs/discovery/discovery-brief.md` v0.2.

---

## 8. Refine core entity model
**Milestone:** M2 — System Definition

Validate and refine:
- Asset
- Team / Person
- Task
- Resource
- Incident
- Zone / Route
- Event
- Decision

**Output:** agreed domain model with relationships.

---

## 9. Define module contract
**Milestone:** M2 — System Definition

Specify how modules:
- register entities
- read shared state
- emit events
- subscribe to events
- expose UI
- contribute rules
- fail independently

**Output:** technical / conceptual module contract.

---

## 10. Define event taxonomy
**Milestone:** M2 — System Definition

Create the initial set of typed events used across modules.

Examples:
- asset.status.changed
- comms.link.degraded
- task.assignment.changed
- resource.threshold.reached
- incident.created

**Output:** event catalogue and naming convention.

---

## 11. Define operational consequence model
**Milestone:** M2 — System Definition

Describe how multiple events / states become one operator-facing consequence.

Include:
- inputs
- dependencies
- severity
- confidence
- time horizon
- explainability
- possible actions

**Output:** consequence schema and examples.

---

## 12. Create primary operator flow
**Milestone:** M3 — Interaction Design

Map the selected scenario from the operator perspective.

**Output:** end-to-end flow including normal state, disruption, consequence review, decision and resolution.

---

## 13. Design Common Operational Picture IA
**Milestone:** M3 — Interaction Design

Define what belongs on the primary operational view and what should remain secondary.

**Output:** information hierarchy and low-fidelity structure.

---

## 14. Design decision-review pattern
**Milestone:** M3 — Interaction Design

Create the interaction model for:
- consequence
- evidence / dependencies
- options
- expected effects
- approve / reject / defer
- audit trail

**Output:** reusable decision pattern.

---

## 15. Set up application shell
**Milestone:** M4 — Working Prototype

Create the initial frontend structure for the demonstrator.

**Output:** runnable application shell ready for modules and simulation logic.

---

## Suggested labels

Create these labels early:

- `discovery`
- `research`
- `architecture`
- `product`
- `ux`
- `frontend`
- `simulation`
- `documentation`
- `decision`
- `blocked`
- `good first task`
