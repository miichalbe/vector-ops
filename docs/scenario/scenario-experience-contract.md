# VECTOR OPS — Scenario Experience Contract

**Version:** 0.1  
**Date:** 22 September 2026  
**Milestone:** M1 — Discovery Complete / prerequisite for M2 and M3  
**Related issue:** #4 — Define primary demonstration scenario  
**Status:** Experience contract agreed; concrete scenario content pending

---

## 1. Purpose

This document defines the stable experience and implementation contract for the first VECTOR OPS public-alpha scenario.

It specifies:

- what the user must understand before the simulation,
- how the live scenario behaves,
- how time, events, uncertainty and decisions are represented,
- which elements are fixed and which may vary,
- how the result is recorded and explained,
- what the implementation must support,
- which design and content decisions remain open.

It does **not** yet define the exact fictional region, infrastructure assets, numerical values, event sequence or final scenario branches. Those belong to the concrete scenario definition produced under Issue #4.

The contract exists to prevent the scenario from becoming:

- a linear click-through prototype,
- an arbitrary collection of alerts,
- a game of reflexes,
- a sensational story about an unexplained attack,
- a one-off implementation that cannot accept future scenarios,
- an experience that grants the WCZK duty officer unrealistic authority.

---

## 2. Experience proposition

The user assumes the role of a:

> **Dyżurny operacyjny Wojewódzkiego Centrum Zarządzania Kryzysowego (WCZK)**  
> Duty Operations Officer — Voivodeship Crisis Management Centre

During a short synthetic disruption, the user receives reports from several organisations and infrastructure systems. The reports are individually credible but initially fragmented.

VECTOR OPS helps the user:

1. recognise that separate observations may form one cascading consequence,
2. inspect the evidence, dependencies, timestamps and uncertainty,
3. request missing confirmation when necessary,
4. identify an applicable coordination or escalation action,
5. understand the expected benefits and displaced risks,
6. document what was known and why an action was selected,
7. compare expected and observed outcomes after the scenario.

The central experience is:

> **fragmented observations → inspectable consequence → bounded operator action → observed downstream result**

---

## 3. Product context layer

The public demo must not begin directly inside an unexplained operational interface.

Before the scenario, the user needs enough context to understand what VECTOR OPS is, why it exists and what they are about to experience.

### 3.1 Required information

The landing/context layer must answer:

- What is VECTOR OPS?
- What category of system is it exploring?
- Who could use this kind of system?
- In what environment?
- What problem is it intended to address?
- Why was this demonstrator created?
- Is it a real government or infrastructure system?
- Is the scenario real or synthetic?
- How long will the experience take?
- What will the user be asked to do?

### 3.2 Required positioning

VECTOR OPS should be described as:

> An independent concept for a modular operational coordination system that turns cross-domain state into explainable consequences and operator-reviewable coordination actions.

The introduction must make clear that:

- this is a portfolio and research demonstrator,
- it is not an official Polish government system,
- it is not connected to live infrastructure,
- the scenario, organisations, locations, parameters and procedures are synthetic,
- the role and institutional context are grounded in the Polish crisis-management system,
- the dependency patterns are informed by documented incidents and official sources.

### 3.3 Motivation statement

The project may include a concise civic/patriotic motivation:

> VECTOR OPS was created as an independent Polish portfolio exploration: an attempt to use contemporary design, software and AI-assisted tools to build the foundation of something that could contribute to the resilience and safety of modern Poland.

The statement must remain:

- constructive rather than militaristic,
- transparent about the project's independent status,
- free of claims that VECTOR OPS is already operationally validated,
- focused on public benefit, resilience and responsible technology.

### 3.4 Example landing copy

> **See the consequence before it becomes the crisis.**  
> VECTOR OPS is a concept for a modular operational coordination system. It connects reports from multiple services and infrastructure domains, exposes their dependencies and helps a duty officer prepare the right coordination or escalation action.
>
> This public alpha is an independent, synthetic demonstrator grounded in the Polish crisis-management context and documented infrastructure incidents. No real operational data or critical-infrastructure locations are used.

### 3.5 Entry actions

Required actions:

- **Begin briefing** — primary call to action;
- **About the project** — access to methodology, evidence and repository;
- **Skip to simulation** — available to returning users.

The context layer must be available again from inside the application.

---

## 4. Scenario briefing and onboarding

The briefing introduces the specific session without revealing future events.

### 4.1 Required briefing content

- fictional date and local time,
- fictional voivodeship/operational area,
- user's role,
- current readiness context,
- current weather or environmental conditions when relevant,
- systems currently being monitored,
- initial resource availability,
- current known incidents,
- operational objective,
- authority boundary,
- expected duration,
- information that may vary between runs.

### 4.2 Initial-state principle

The scenario begins in a credible and readable state, not in immediate chaos.

At least:

- most monitored services appear stable,
- one or two low-priority items may already be open,
- resources are limited but not yet critically constrained,
- the user can establish a baseline before the first anomaly,
- the interface shows enough normal state for later deterioration to be meaningful.

The quiet period must remain short.

### 4.3 Authority briefing

The user must be told:

> You may assess, request confirmation, activate authorised procedures, notify, recommend and escalate. Actions controlled by external organisations require their approval or confirmation.

This prevents the simulation from teaching an inaccurate role model.

### 4.4 UI onboarding

Onboarding should be contextual and minimal. It may point to no more than four primary areas:

1. **Operational picture** — where assets, areas and incidents appear;
2. **Attention queue** — where new reports and consequences require review;
3. **Consequence panel** — where dependencies, evidence and forecasts are inspected;
4. **Action / decision panel** — where the user requests, recommends, activates or escalates.

The interface should remain understandable without a long tutorial.

### 4.5 Timing

Recommended targets:

- context layer for a first-time user: 20–40 seconds;
- scenario briefing and onboarding: 20–40 seconds;
- returning user quick start: under 10 seconds.

A user must be able to skip or revisit both layers.

---

## 5. Live-scenario duration and pacing

### 5.1 Target duration

- **Fast path:** 3–4 minutes;
- **Intended complete path:** 5–7 minutes;
- **Exploratory path:** up to 8–10 minutes.

The experience must not require ten minutes to reveal its central value.

### 5.2 Opening pace

Recommended pacing after the user starts the shift:

| Simulation time | Experience target |
|---:|---|
| 0–10 s | Baseline state visible |
| 10–20 s | First anomaly or report |
| 20–40 s | Additional report from another source/domain |
| 35–50 s | First meaningful connection or projected consequence |
| 45–60 s | First operator action required |
| 1–3 min | Verification, first outcome and expanding cascade |
| 3–5 min | Resource or priority conflict |
| 5–7 min | Escalation, stabilisation or controlled deterioration |
| 7–10 min | Optional investigation and after-action analysis |

Exact times may vary within bounded ranges.

### 5.3 Simulation clock

The simulation has its own explicit clock.

Required behaviours:

- normal running speed,
- pause,
- optional accelerated mode for quiet intervals,
- automatic pause or strong slowdown when a mandatory decision opens,
- no irreversible consequence while a first-time user is reading the required decision explanation,
- clearly distinguish wall-clock time from scenario time.

The user must not be penalised for reading.

---

## 6. Narrative structure

Every valid run follows a three-act fixed spine.

### Act 1 — Detection and correlation

Purpose:

- establish normal state,
- introduce two or more fragmented observations,
- reveal that they may be related,
- require an information or verification decision.

The first decision should answer a question such as:

> Is the current evidence sufficient to escalate, or should limited time be used to obtain confirmation?

### Act 2 — Dependency and trade-off

Purpose:

- confirm or revise the initial interpretation,
- expose at least one cross-sector dependency,
- introduce a time-to-impact,
- create a conflict around one constrained resource or coordination priority.

The second decision should require a defensible trade-off rather than offer one obviously correct option.

### Act 3 — Escalation and outcome

Purpose:

- show the accumulated effect of previous actions,
- introduce a wider consequence or closing opportunity,
- require procedure activation, recommendation or escalation,
- resolve the session into a measurable final state.

The final action must remain within the WCZK duty officer's authority boundary.

---

## 7. Decision contract

The public alpha contains three primary decision moments.

### 7.1 Required decision types

1. **Information decision**
   - request confirmation,
   - wait for additional data,
   - correlate and escalate with stated uncertainty.

2. **Coordination / priority recommendation**
   - recommend which consequence should receive attention,
   - request allocation of a constrained resource,
   - accept a known displaced risk.

3. **Procedural escalation**
   - activate an authorised notification or coordination procedure,
   - prepare an escalation package,
   - record or request approval from the responsible authority.

### 7.2 Required decision anatomy

Every decision object must contain:

- decision ID,
- title,
- trigger,
- decision owner,
- authority level,
- deadline or time-to-impact,
- current evidence,
- missing information,
- assumptions,
- confidence,
- two or three options,
- expected benefit per option,
- expected cost or displaced risk per option,
- reversibility,
- recipients/affected organisations,
- user choice,
- optional rationale,
- resulting events,
- observed outcome,
- audit timestamp.

### 7.3 Decision fairness

- No option may be labelled as secretly correct.
- Critical missing information must be shown as missing.
- Requesting confirmation may improve confidence but consume time.
- Acting early may preserve time but rely on uncertainty.
- Consequences must follow declared scenario rules rather than arbitrary punishment.
- At least one decision should have no dominant option.
- The interface must distinguish expected effects from observed effects.

### 7.4 Authority verbs

Preferred:

- request,
- verify,
- notify,
- recommend,
- escalate,
- activate procedure,
- prepare report,
- record approval.

Restricted unless the scenario explicitly establishes authority:

- command,
- dispatch,
- switch,
- shut down,
- reroute,
- execute external action.

---

## 8. Observation, event and consequence contract

### 8.1 Observation

An observation is a sourced piece of information, for example:

- sensor reading,
- system-status change,
- telephone report,
- email/meldunek,
- field-team update,
- weather warning,
- operator confirmation,
- inferred missing telemetry.

Required fields:

- ID,
- source,
- source organisation,
- timestamp,
- received time,
- domain,
- location or area,
- value/status,
- units where applicable,
- freshness,
- confirmation state,
- confidence,
- classification: fact / report / assumption / forecast,
- related entities.

### 8.2 Event

An event is a state-changing occurrence in the simulation.

Required fields:

- ID and typed event name,
- scheduled or triggering condition,
- source observation(s),
- affected entities,
- state changes,
- emitted follow-up events,
- visibility rules,
- randomisation bounds,
- audit description.

Example naming:

- `power.voltage.degraded`,
- `telecom.backup.started`,
- `telemetry.feed.stale`,
- `water.pressure.decreasing`,
- `access.route.blocked`,
- `report.confirmation.received`,
- `procedure.notification.started`,
- `recommendation.approved`.

### 8.3 Consequence

A consequence combines several states, events and dependencies into an operator-facing projection.

Required fields:

- ID,
- operator-facing statement,
- affected service/population/area,
- severity,
- confidence,
- time horizon,
- time-to-impact,
- dependency chain,
- supporting observations,
- contradicting or missing evidence,
- assumptions,
- possible actions,
- next recalculation condition,
- current status: projected / developing / observed / avoided / superseded.

A consequence must always provide a path to inspect:

> **What produced this conclusion?**

### 8.4 Update behaviour

When evidence changes:

- confidence may increase or decrease,
- time-to-impact may change,
- an assumption may become confirmed or invalid,
- a consequence may be superseded,
- the system must show what changed and why,
- previous versions remain available in the audit trail.

The system must not silently rewrite its earlier projection.

---

## 9. Randomisation contract

Randomisation creates replay value and uncertainty while preserving narrative quality.

### 9.1 Seeded determinism

Each run receives a scenario seed.

The same:

- scenario version,
- seed,
- user decisions,

must produce the same result.

The seed must be stored in the session record and final report.

### 9.2 Fixed elements

Every valid run must contain:

- the three-act structure,
- three primary decisions,
- at least one cross-domain dependency,
- at least one data-quality or confirmation problem,
- at least one time-dependent consequence,
- at least one constrained-resource or priority trade-off,
- at least one escalation outside the duty officer's direct authority,
- a complete after-action report.

### 9.3 Variable elements

Eligible for bounded variation:

- first affected asset or area,
- event arrival order,
- small timing differences,
- battery/UPS endurance,
- fuel level,
- route availability,
- field-team location,
- weather severity,
- report delay,
- source confidence,
- confirmation result,
- external-organisation response time,
- one secondary distracting incident,
- partial effectiveness of an intervention.

### 9.4 Randomisation safeguards

Randomisation must not:

- remove a required act or decision,
- create impossible or contradictory state,
- reveal sensitive real-world infrastructure information,
- make success depend on an unobservable random roll,
- generate an unwinnable run without explanation,
- produce large branch combinations that cannot be tested,
- change the operator's legal authority.

### 9.5 Scenario profiles

The alpha may define a small number of tested profiles rather than unrestricted procedural generation:

- **communications-fragile**,
- **access-constrained**,
- **resource-constrained**,
- **low-confidence-data**.

A seed selects bounded values inside one profile.

---

## 10. Gamification contract

The experience should be engaging but should not trivialise public safety.

### 10.1 No conventional game score

Avoid:

- stars,
- coins,
- “perfect victory”,
- celebratory treatment of harm,
- points based directly on casualties,
- hidden punishment mechanics.

### 10.2 Outcome dimensions

The system may track:

- continuity of essential services,
- population/service exposure,
- remaining response capacity,
- time margin,
- situational confidence,
- unresolved critical dependencies,
- procedure and communication completion,
- documentation completeness.

These may be shown as qualitative bands or operational values rather than one total score.

### 10.3 Engagement sources

Engagement should come from:

- discovering a hidden dependency,
- deciding under bounded uncertainty,
- seeing time-dependent consequences,
- trading one risk against another,
- observing the effect of earlier choices,
- comparing expected and actual outcomes,
- replaying a different seed or decision path.

### 10.4 No dead end

A poor decision may worsen the final state, but the user must remain able to:

- continue the scenario,
- understand what changed,
- take a later mitigation action,
- reach the after-action report.

---

## 11. Live interface contract

The exact visual design remains open, but the live experience must provide:

### 11.1 Persistent shell

- scenario time and run state,
- pause/resume control,
- current role and operational area,
- access to briefing/help,
- reset/restart,
- indication that the data is synthetic.

### 11.2 Common Operational Picture

- operational area/map or spatial schematic,
- relevant infrastructure/service entities,
- incidents and affected areas,
- status and freshness,
- selectable relationships/dependencies,
- no requirement to show all raw telemetry simultaneously.

### 11.3 Attention queue

- new reports,
- changed forecasts,
- consequences approaching thresholds,
- confirmation requests,
- approvals/responses,
- clear separation of unread, acknowledged and resolved items.

### 11.4 Consequence view

- concise operator-facing consequence,
- time-to-impact,
- severity and confidence,
- dependency chain,
- evidence and assumptions,
- update history,
- available coordination actions.

### 11.5 Decision/action view

- authority level,
- decision deadline,
- options and expected effects,
- missing information,
- rationale field where appropriate,
- confirm/recommend/escalate action,
- clear statement when external approval is required.

### 11.6 Timeline/audit view

- observations,
- system projections,
- user actions,
- outgoing notifications,
- external responses,
- state changes,
- superseded predictions.

---

## 12. Final report / After-Action Review contract

Every completed or deliberately ended run produces a report.

### 12.1 Report purpose

The report must help the user understand:

- what happened,
- what they knew at each decision point,
- what they decided,
- why the system projected particular consequences,
- what actually followed,
- what remained unresolved,
- how the final state differs from the initial state.

It must avoid judging earlier decisions using information that was unavailable at the time.

### 12.2 Required report sections

#### A. Session summary

- scenario title and version,
- fictional region,
- role,
- start/end scenario time,
- real session duration,
- seed/profile,
- outcome summary,
- explicit synthetic-scenario label.

#### B. Initial state

A snapshot of:

- infrastructure/service state,
- known incidents,
- available resources,
- active warnings,
- initial uncertainty,
- baseline population/service exposure.

#### C. Decision timeline

For each material step:

- scenario time,
- incoming observation or state change,
- projected consequence,
- information available at that moment,
- user action,
- rationale if supplied,
- expected effect,
- subsequent observed effect,
- confidence or assumption changes.

The timeline must include both user actions and relevant non-user events.

#### D. Decision review

For each primary decision:

- selected option,
- alternative options,
- what was known then,
- what remained unknown,
- why the selected option was defensible or risky,
- immediate effect,
- delayed/downstream effect,
- whether external approval was required and received.

#### E. Final state

For each relevant domain/entity:

| Item | Initial state | Final state | Trend | Remaining risk |
|---|---|---|---|---|

Required domains are determined by the concrete scenario.

#### F. Outcome dimensions

- essential-service continuity,
- exposed population/services,
- remaining response capacity,
- situational confidence,
- unresolved dependencies,
- procedure/communication status,
- documentation completeness.

#### G. Counterfactual insight

Show no more than one or two carefully calculated alternatives:

- what may have changed under another decision,
- which assumptions make that counterfactual valid,
- why it remains a modelled comparison rather than a factual claim.

#### H. Open items and handover

- unresolved incidents,
- pending confirmations,
- approaching deadlines,
- actions awaiting external response,
- recommended next-shift attention.

#### I. Evidence and methodology

Links to:

- scenario assumptions,
- evidence library,
- research artifact,
- project repository,
- synthetic-data disclosure.

### 12.3 Report actions

Required for alpha:

- replay same seed,
- start a new variation,
- return to timeline,
- print-friendly view.

Desirable after alpha:

- shareable URL containing scenario version and seed,
- downloadable PDF,
- machine-readable JSON export,
- compare two completed runs.

### 12.4 Partial session report

If the user ends early, the system should still create a partial report marked:

> **Session ended before scenario resolution**

It should preserve the timeline and current state without presenting a completed outcome.

---

## 13. State and persistence contract

The scenario must separate:

- **scenario definition** — authored data and rules,
- **run configuration** — seed, profile and generated values,
- **current state** — entities, resources, incidents, observations and consequences,
- **event log** — append-only record,
- **decision record** — user and external decisions,
- **report projection** — derived from the event log and final state.

The report should be reconstructable from the run configuration and append-only event log.

For the public alpha:

- state may remain entirely in-browser,
- current run should survive an accidental page refresh where practical,
- reset must require confirmation,
- no personal data or account is required,
- no backend is required.

---

## 14. Conceptual data contract

The implementation may refine field names, but it must preserve the separation below.

```ts
interface ScenarioDefinition {
  id: string;
  version: string;
  title: string;
  briefing: ScenarioBriefing;
  initialState: EntityState[];
  dependencies: Dependency[];
  eventTemplates: EventTemplate[];
  decisionPoints: DecisionDefinition[];
  consequenceRules: ConsequenceRule[];
  randomisation: RandomisationProfile[];
  completionRules: CompletionRule[];
}

interface ScenarioRun {
  runId: string;
  scenarioId: string;
  scenarioVersion: string;
  seed: string;
  profile: string;
  startedAt: string;
  scenarioTime: number;
  state: EntityState[];
  eventLog: AuditEvent[];
  decisions: DecisionRecord[];
  status: "briefing" | "running" | "paused" | "completed" | "ended";
}

interface DecisionRecord {
  decisionId: string;
  authority: "operator" | "supervisor" | "wzzk" | "voivode" | "external";
  evidenceAvailable: string[];
  unknowns: string[];
  options: DecisionOption[];
  selectedOption?: string;
  rationale?: string;
  selectedAt?: number;
  expectedEffects: Effect[];
  observedEffects: Effect[];
}

interface AfterActionReport {
  run: RunSummary;
  initialState: StateSnapshot;
  timeline: AuditEvent[];
  decisions: DecisionReview[];
  finalState: StateSnapshot;
  outcomes: OutcomeDimension[];
  counterfactuals: Counterfactual[];
  handover: OpenItem[];
}
```

No UI component should contain the only copy of scenario logic.

---

## 15. Information integrity and uncertainty

Every operational item must make clear whether it is:

- confirmed fact,
- unconfirmed report,
- assumption,
- system inference,
- forecast,
- recommendation,
- observed outcome.

Required metadata where relevant:

- source,
- source organisation,
- timestamp,
- freshness,
- confidence,
- last change,
- related evidence.

The UI must not rely on colour alone to communicate status.

If the system changes its interpretation, the user should be able to inspect:

- previous interpretation,
- new information,
- revised consequence,
- reason for the revision.

---

## 16. Accessibility and usability

Minimum alpha requirements:

- keyboard access to primary actions,
- visible focus states,
- sufficient contrast,
- status communicated through text/icon as well as colour,
- pause available at all times,
- reduced-motion support where animation is used,
- no essential information available only on hover,
- readable text at standard desktop zoom,
- no audio required,
- critical countdowns expressed numerically and semantically,
- user can revisit briefing and help.

Desktop-first is acceptable for alpha. The experience should remain readable on a tablet-sized viewport but full mobile optimisation is not required for the first release.

---

## 17. Safety and public-release boundaries

The scenario must use fictional:

- voivodeship/powiat/municipality names,
- infrastructure locations and identifiers,
- operators and organisations,
- technical parameters,
- response resources,
- procedures beyond generic public concepts,
- vulnerability and access details.

It may use real:

- Polish institutional role structure,
- public categories of infrastructure,
- general sensor and operational concepts,
- documented dependency patterns,
- generic crisis-management terminology.

The scenario must not:

- teach attack methods,
- identify exploitable real infrastructure,
- imply endorsement by a Polish authority,
- present synthetic details as a reconstruction of a real event,
- infer malicious intent without evidence,
- require the user to attribute the incident cause.

The cause may remain unknown throughout the scenario.

---

## 18. Scenario acceptance criteria

A concrete scenario is ready for implementation when:

- [ ] the fictional geography and starting context are defined,
- [ ] the initial state is understandable within 10 seconds,
- [ ] the first anomaly appears within 10–20 seconds,
- [ ] the first consequence becomes visible within 35–50 seconds,
- [ ] three primary decisions match the required decision types,
- [ ] every option has an explainable benefit, cost and uncertainty,
- [ ] at least one cross-domain dependency is essential to understanding the outcome,
- [ ] at least one observation may become stale, contradicted or confirmed,
- [ ] at least one action requires escalation or external approval,
- [ ] the duty officer never receives fictional command authority,
- [ ] randomisation cannot break narrative invariants,
- [ ] the same seed and decisions reproduce the same run,
- [ ] all synthetic values are labelled as such,
- [ ] no real sensitive infrastructure data is used,
- [ ] every run produces a reconstructable timeline,
- [ ] initial and final state can be compared,
- [ ] a poor decision worsens conditions without blocking completion,
- [ ] the fast path completes in 3–4 minutes,
- [ ] the intended path completes in 5–7 minutes,
- [ ] optional inspection can extend the experience to 8–10 minutes,
- [ ] the report distinguishes knowledge available then from hindsight,
- [ ] the scenario can be authored outside UI components.

---

## 19. Quality and implementation tests

Minimum deterministic tests should cover:

1. same seed + same decisions → same final state,
2. same seed + different decision → expected branch difference,
3. every profile reaches all three required decisions,
4. no event references a missing entity,
5. resource values never become invalid,
6. consequence rules expose supporting evidence,
7. superseded projections remain in the audit trail,
8. external actions cannot complete without external confirmation,
9. refresh restores the current run or fails safely,
10. reset produces a clean new run,
11. partial session produces a partial report,
12. complete session produces all required report sections.

---

## 20. Decisions still required

The contract is sufficiently complete to design the concrete scenario. The following choices remain:

### A. Primary language

Options:

- Polish-first;
- English-first with Polish institutional terminology;
- bilingual from alpha.

**Recommendation:** Polish-first public alpha with all copy stored in a localisation dictionary and English added immediately after the first stable run. This best serves the Polish context while preserving the international portfolio path.

### B. Fictional geography

Choose whether the region is:

- clearly fictional but recognisably Polish,
- an unnamed generic voivodeship,
- a fictionalised composite inspired by central/eastern Poland.

**Recommendation:** a named fictional composite, without copying real infrastructure geography.

### C. Exact scenario cause and conditions

Define:

- environmental backdrop,
- initial anomaly,
- systems affected,
- constrained resource,
- data uncertainty,
- three decision moments,
- possible final states.

**Recommendation:** keep root cause unconfirmed and focus entirely on observable service and sensor effects.

### D. Outcome presentation

Choose qualitative or numerical emphasis.

**Recommendation:** operational values and qualitative outcome bands, without one total score.

### E. Sharing scope

Decide whether the Friday alpha needs:

- only replay/print,
- shareable seed URL,
- PDF export.

**Recommendation:** replay and print are required; shareable seed URL if implementation time remains; PDF export after alpha.

---

## 21. Completion definition

This experience contract is complete when it is accepted as the stable boundary for Issue #4.

Issue #4 itself remains open until a concrete scenario definition supplies:

- fictional place and starting state,
- infrastructure entities and dependencies,
- event sequence,
- randomisation profiles and bounds,
- three decisions and options,
- consequence rules,
- endings and final-state model,
- user-facing briefing copy.
