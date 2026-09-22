# VECTOR OPS — Primary Scenario Package

**Version:** 0.2  
**Date:** 22 September 2026  
**Related issues:** #4, #5, #12  
**Status:** Accepted for implementation

---

## 1. Purpose

This document defines the concrete scenario package for the first VECTOR OPS public alpha. It instantiates the rules in the [Scenario Experience Contract](scenario-experience-contract.md) without hard-coding scenario logic into the interface.

The scenario has no narrative or marketing title. In the product it is identified neutrally as:

> **Scenario 01 — Infrastructure disruption, Mazowieckie Voivodeship**

All user-facing application copy is English.

The detailed second-by-second flow and runtime/data contract are maintained in [Primary Operator Flow & Scenario Runtime Contract](../design/primary-operator-flow.md).

---

## 2. Safety and realism boundary

The administrative context is real: Mazowieckie Voivodeship and the role of a WCZK duty operations officer.

The operational area is synthetic:

- fictional Nowy Brzeg County,
- fictional settlements and infrastructure assets,
- synthetic topology, technical values, procedures and resource locations,
- no reproduction of sensitive real-world infrastructure,
- no claim that the scenario reconstructs a real incident.

The root cause remains unconfirmed. The user responds to observable service effects and uncertainty rather than attributing the incident to weather, technical failure, human error, sabotage or hostile action.

The duty officer may assess, request confirmation, notify, recommend, escalate and document. Infrastructure operators retain operational control of their systems.

---

## 3. Product introduction

Recommended entry copy:

> **VECTOR OPS is an independent Polish project exploring how cross-domain operational information can be transformed into understandable consequences and actionable decisions.**
>
> **The project is an attempt to use contemporary design, software development and AI-assisted tools to build the foundations of a system that could contribute to the resilience and safety of modern Poland.**
>
> The current scenario is synthetic. It does not represent an existing government system or reproduce real critical infrastructure.

Avoid the words *demo*, *demonstrator* and *portfolio* in public-facing product copy.

Detailed interface onboarding is deliberately deferred until the primary interface exists. The alpha plan retains a requirement for short contextual onboarding based on the implemented interaction model.

---

## 4. Session frame

- **Operator:** Duty Operations Officer — Voivodeship Crisis Management Centre
- **Area:** fictional Nowy Brzeg County, Mazowieckie Voivodeship
- **Start:** Tuesday, 07:40 local time
- **Season:** late autumn
- **Backdrop:** wind and precipitation below the level that explains the complete event
- **Initial posture:** routine monitoring; no active regional emergency
- **Real session duration:** intended 5–7 minutes
- **Represented operational time:** approximately 80–90 minutes
- **Clock:** accelerated, with pause or strong slowdown at decision points
- **Run identity:** scenario version plus deterministic seed

---

## 5. Operational modules

The minimum operational module set is:

1. **Power** — supply state, feeder/protection state, power-quality events and operator restoration information.
2. **Water** — pressure, reservoir level, pumps, local control, service margin and water-service continuity.
3. **Communications** — power mode, backup endurance, link quality, endpoint reachability and telemetry transport.
4. **Critical Services & Response** — hospital continuity, routes, constrained resources, reports, coordination tasks and external responses.

Shared core capabilities provide the entity registry, dependency graph, incidents, tasks, permissions, simulation clock, event log, decision records and audit trail.

This is a modular frontend monolith for alpha. Dynamic third-party plugin loading is not required.

---

## 6. Scenario entities

### 6.1 GPZ Brzeziny

Synthetic distribution substation serving the affected area.

**Source observations**

- supply state,
- Feeder F-12 state,
- load percentage,
- power-quality events,
- protection/reclosing state,
- last operator update,
- restoration estimate or unknown status.

**Local safeguards**

- protective trip,
- one automatic reclose attempt,
- isolation of a persistent fault,
- manual field inspection.

The first disturbance may clear automatically. A later event locks the feeder out and requires operator action. GPZ status reaches VECTOR OPS through an operator channel independent of R-4.

### 6.2 SUW Kępa

Synthetic water treatment and pumping station.

**Source observations**

- output pressure,
- reservoir level,
- Pump 1/2/3 state,
- active power source,
- local/remote control mode,
- telemetry status and last update.

**Derived information**

- reservoir and pressure trend,
- service margin range,
- ability to maintain minimum service,
- dependent critical recipients.

**Local safeguards**

- local PLC,
- two duty pumps and one standby pump,
- control-system UPS that does not power the full pumping load,
- buffer reservoir,
- manual local control,
- prepared AG-400 connection.

R-4 carries automatic telemetry, alarms and limited remote-control communication. Loss of R-4 does not stop local pumping. It removes remote control and causes observations to progress through Current, Delayed, Stale and Unavailable. Periodic manual reports remain possible.

### 6.3 Regional Communications Gateway R-4

Synthetic regional communications gateway, not a single mobile tower.

It supports:

- critical-service telemetry,
- private operator communications,
- selected field-team data,
- local mobile-data aggregation,
- a reduced-bandwidth fallback path.

**Source observations**

- grid/battery/generator power mode,
- estimated battery runtime,
- primary backhaul state,
- fallback channel state,
- packet loss and latency,
- connected endpoints,
- affected service area.

Degradation is progressive: rising latency, reduced telemetry frequency, loss of non-priority data, loss of SUW remote control, delayed field reports and finally loss of the primary channel.

### 6.4 County Hospital Nowy Brzeg

Synthetic county hospital and critical service recipient.

**Available information**

- essential-service posture,
- grid or generator power,
- generator endurance estimate,
- water-supply state,
- estimated water margin,
- primary and fallback communications,
- last confirmed report.

Most hospital information is received through periodic human reports rather than direct building telemetry.

**Local safeguards**

- generator for critical circuits,
- limited fuel and water buffers,
- demand-reduction procedure,
- landline and radio fallback.

### 6.5 Mobile Generator AG-400

The only compatible high-capacity mobile generator available during the session.

**State model**

Available → Reserved → Preparing → En route → On site → Connecting → Operational, with Unavailable as an exceptional state.

**Information**

- location,
- assignment,
- preparation and travel estimate,
- fuel/endurance,
- compatibility.

Compatibility with both SUW Kępa and R-4 is known before the decision.

### 6.6 Technical Access Route Z-17

A logical access-route entity rather than a copy of a real road.

**Information**

- Open / Restricted / Blocked,
- reported obstruction,
- normal and current travel estimate,
- alternative route,
- source,
- last confirmation,
- confidence.

R-4 degradation may make field positions stale, but police and road-authority reports remain available through separate channels.

---

## 7. Dependency model

Required semantic relationships:

- SUW Kępa **poweredBy** GPZ Brzeziny,
- R-4 **poweredBy** GPZ Brzeziny,
- SUW Kępa **communicatesVia** R-4,
- SUW Kępa **monitoredVia** R-4,
- SUW Kępa **controlledVia** R-4 for limited remote functions,
- County Hospital **suppliedBy** SUW Kępa,
- County Hospital **communicatesVia** R-4 with fallback,
- GPZ Brzeziny **accessedVia** Route Z-17,
- AG-400 deployment **accessedVia** Route Z-17,
- AG-400 **supports** either SUW Kępa or R-4 after assignment.

The model must distinguish loss of physical service, monitoring, control, access and supporting capacity.

---

## 8. Information model

For every relevant entity keep separate:

1. **Physical state** — the simulated real condition.
2. **Observed state** — readings and reports received by VECTOR OPS.
3. **Assessed state** — the system's current evidence-based interpretation.
4. **Projected state** — time-dependent consequences if conditions continue.
5. **Data state** — source, freshness, quality and confidence.

Loss of visibility must never be presented as proof of physical failure.

A common observation envelope includes:

- ID,
- entity ID,
- namespaced metric key,
- value and unit,
- observed time,
- received time,
- source,
- quality,
- confidence,
- related scenario event.

Example metric keys:

- `power.feederState`,
- `water.outputPressure`,
- `communications.backupRuntime`,
- `health.waterMargin`,
- `logistics.estimatedArrival`.

Modules register definitions, units, formatting and scenario thresholds. The core is not limited to the metrics used by this scenario.

---

## 9. Narrative spine

### Act 1 — Detection and correlation

Within the first 10–20 seconds, one of three opening variants introduces the first apparently local anomaly:

- **power-first** — GPZ Brzeziny reports a short power-quality disturbance,
- **communications-first** — R-4 reports rising packet loss or latency,
- **water-first** — SUW Kępa reports a controller restart / falling pressure trend.

Within the next 10–20 seconds, the other two opening observations arrive in a bounded profile/seed-dependent order. Individually they remain plausible local issues.

VECTOR OPS detects temporal and dependency correlation and creates an Assessment with inspectable evidence. The opening variant may change the initial Assessment emphasis without changing the underlying fixed three-act spine.

**Decision 1: information posture**

- open a cross-domain incident and request synchronised confirmation,
- continue separate monitoring,
- recommend early regional escalation with stated uncertainty.

### Act 2 — Dependency and constrained resource

Feeder F-12 later trips and remains isolated. SUW operates with reduced pumping capacity. R-4 moves to backup power. Route Z-17 becomes restricted and delays field access.

One AG-400 generator is available.

**Decision 2: resource recommendation**

- recommend AG-400 for SUW Kępa,
- recommend AG-400 for R-4,
- wait briefly for a firmer grid-restoration estimate.

The correct trade-off depends on visible run conditions, not a hidden winning answer.

### Act 3 — Escalation and communication

The accumulated state may produce:

- falling water-service margin,
- increasingly stale SUW data,
- delayed field-team updates,
- a hospital request for assurance,
- uncertainty about restoration time,
- pressure to decide whether broader coordination is justified.

**Decision 3: coordination posture**

- targeted notification and contingency preparation,
- recommendation for voivodeship-level coordination,
- continued operator coordination while seeking confirmation.

Actions outside the duty officer's authority remain requests, recommendations or escalations.

---

## 10. Randomisation

Every run has a deterministic seed and selects two independent variation axes:

1. one **opening variant** controlling how the operator first discovers the situation;
2. one **dominant condition profile** plus one weaker, different **secondary modifier** controlling which operational constraint is strongest across the run.

Opening variants:

- **power-first**,
- **communications-first**,
- **water-first**.

Condition profiles:

- **communications-fragile** — lower communications margin, faster degradation and earlier visibility loss;
- **access-constrained** — stronger Z-17 restrictions and longer inspection/deployment travel times;
- **resource-constrained** — tighter SUW/resource margins and sharper displaced-risk trade-offs;
- **low-confidence-data** — slower confirmation, lower-confidence reports and earlier stale/manual data conditions.

The seed also resolves bounded values for timing, endurance, data delay, route delay, external response and other explicitly modelled ranges.

Opening variant and condition profiles are configuration inputs to one scenario definition. They must not be implemented as duplicated hand-authored scenario branches.

Randomisation may change relative decision value but may not remove required decisions, conceal decisive information, break causality or change legal authority.

The public live UI may show the run seed but does not reveal the selected opening/profile configuration before or during the run. The After-Action Report may expose it.

---

## 11. Assessment and Projection

Both panels support multiple simultaneous items.

For the first scenario:

- maximum two active Assessments exposed at once,
- maximum three active Projections exposed at once,
- one Assessment marked Primary,
- lower-priority items grouped rather than presented as an alert stream.

A separate Assessment is created only for an operationally distinct claim with its own evidence and possible response.

Example simultaneous Assessments:

- cross-domain service disruption,
- degrading operational visibility.

One Assessment may produce zero, one or several Projections. Selecting an Assessment highlights related entities and Projections.

---

## 12. Actions and availability

Alpha uses three phased, predefined decision moments and predefined options.

Actions are nevertheless modelled independently from screens with lifecycle states such as:

Hidden → Available → Selected → Requested → Accepted/Rejected → Completed.

Future versions may expose actions continuously when permissions and state preconditions are met.

Actions can be entered from:

- an entity tile for object-scoped action,
- an Assessment for current-situation response,
- a Projection for preventive or mitigating action.

Every entry point opens the same reusable action/decision record.

---

## 13. Completion and report

The session ends with a factual operational report, not a score.

Do not show:

- points,
- stars,
- percentages representing user quality,
- success/failure verdicts,
- named outcome classes,
- celebratory or punitive language.

Required content:

- session version, opening variant, dominant profile, secondary modifier and seed,
- initial state,
- complete event and decision timeline,
- evidence available at each decision,
- selected actions and expected effects,
- observed effects,
- per-entity initial/final-state comparison,
- unresolved items and handover,
- no more than one or two clearly modelled counterfactuals,
- evidence and methodology links.

A one- or two-sentence summary may follow the factual state comparison.

Required footer:

> **VECTOR OPS — Simulation developed by Michał Biernacki**  
> michalbiernacki@protonmail.com | michalbiernacki.com

---

## 14. Alpha implementation boundary

Implement:

- six scenario entities,
- four operational modules plus shared core,
- approximately 14 observation types,
- typed semantic dependencies,
- six to eight consequence rules,
- three primary decisions,
- three opening variants,
- four tested condition profiles,
- one weaker secondary modifier per run,
- deterministic seeded parameter ranges,
- generic measurement rendering,
- dependency/evidence inspection,
- append-only audit trail,
- in-browser persistence, reset and replay.

Do not require:

- real SCADA or infrastructure integrations,
- a backend or database,
- accounts,
- paid APIs,
- runtime LLM,
- dynamic plugin installation,
- a scenario editor,
- unrestricted natural-language commands.

---

## 15. Handoff

Scenario selection, MVP module selection, opening variation and randomisation model are now accepted for implementation.

Detailed implementation behaviour is defined in:

- [System Contract](../architecture/system-contract.md),
- [Primary Operator Flow & Scenario Runtime Contract](../design/primary-operator-flow.md),
- [Primary Operational View](../design/primary-operational-view.md).

Further scenario-model changes should be driven by concrete implementation findings rather than speculative completeness.
