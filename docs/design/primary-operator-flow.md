# VECTOR OPS — Primary Operator Flow & Scenario Runtime Contract

**Version:** 0.1  
**Date:** 22 September 2026  
**Related issue:** #12 — Create primary operator flow  
**Status:** Accepted implementation specification for vertical slice

---

## 1. Purpose

This document turns Scenario 01 into an implementation-ready operator flow.

It defines:

- the end-to-end operator experience,
- the opening variants and condition profiles used for bounded replay variation,
- the three mandatory decision moments,
- what changes in response to earlier decisions,
- the minimum data-driven scenario format,
- the runtime/state-machine behaviour,
- deterministic seed behaviour,
- event, observation, Assessment and Projection update points,
- transition into the factual after-action report.

This is the last large up-front scenario specification required before implementation of the vertical slice. Remaining interaction detail should be resolved against working software rather than by expanding the architecture spec without an implementation need.

Supporting contracts:

- [Scenario Experience Contract](../scenario/scenario-experience-contract.md)
- [Primary Scenario Package](../scenario/primary-scenario-package.md)
- [System Contract](../architecture/system-contract.md)
- [Primary Operational View](primary-operational-view.md)

---

## 2. Experience objective

The live experience should demonstrate one central loop:

> fragmented observations → inspectable Assessment → time-dependent Projection → bounded operator decision → observed downstream effect

The operator should understand within the first minute that VECTOR OPS is not only presenting separate warnings. It is correlating observations through known dependencies and exposing the operational consequence of acting, waiting or escalating under uncertainty.

The session remains a 5–7 minute synthetic simulation representing approximately 80–90 minutes of operational time.

---

## 3. Run composition

Every run is defined by four inputs:

```ts
interface ScenarioRunConfig {
  scenarioId: string;
  scenarioVersion: string;
  seed: string;
  openingVariant: OpeningVariantId;
  dominantProfile: ConditionProfileId;
  secondaryModifier: ConditionProfileId;
}
```

The two variation axes are intentionally different.

### 3.1 Opening variant

The opening variant controls **how the operator first discovers the situation**.

Initial alpha variants:

- `power-first`
- `communications-first`
- `water-first`

The opening variant may change:

- first affected entity presented to the operator,
- order of the first three material observations,
- timing within bounded opening ranges,
- wording and emphasis of the first Assessment.

It must not change the fixed three-act spine or remove a required decision.

### 3.2 Condition profile

The dominant profile controls **which operational constraint is strongest across the run**.

Initial alpha profiles:

- `communications-fragile`
- `access-constrained`
- `resource-constrained`
- `low-confidence-data`

A second, weaker profile acts as a modifier.

The same scenario therefore supports combinations such as:

```text
openingVariant: water-first
dominantProfile: access-constrained
secondaryModifier: low-confidence-data
seed: 8F4C
```

Opening variant and condition profiles are configuration inputs to one scenario model. They must not be implemented as manually duplicated scenario branches.

---

## 4. Randomisation rules

Randomisation is seeded and bounded.

The same:

```text
scenario version + seed + operator decisions
```

must reproduce the same result.

The seed may choose:

- one opening variant,
- one dominant condition profile,
- one different secondary modifier,
- bounded timing values,
- battery/endurance values,
- report delays,
- route-delay values,
- external-response delays,
- partial intervention effectiveness where explicitly modelled.

Randomisation may change relative decision value. It must not:

- remove any of the three decisions,
- create contradictory physical state,
- hide information required for a defensible decision,
- create arbitrary punishment,
- change the operator's authority,
- bypass the Assessment/Projection reasoning path.

The public UI does not reveal the opening variant or profiles during the live run. The run seed is visible. Profile and opening information may appear in the After-Action Report.

---

## 5. Opening variants

All three variants use the same underlying dependency graph.

### 5.1 `power-first`

Opening sequence:

1. GPZ Brzeziny reports a short power-quality disturbance that appears to clear.
2. SUW Kępa reports a controller restart / pressure trend change.
3. R-4 reports increasing latency or packet loss.

Likely first Assessment emphasis:

> Possible shared power-related disruption affecting dependent services.

Operator-learning effect:

- physical dependency is comparatively easy to discover,
- uncertainty concerns persistence and breadth.

### 5.2 `communications-first`

Opening sequence:

1. R-4 reports increasing latency / packet loss.
2. SUW telemetry becomes irregular or delayed.
3. GPZ reports a recent power-quality disturbance.

Likely first Assessment emphasis:

> Possible loss of operational visibility with emerging cross-domain correlation.

Operator-learning effect:

- the first problem appears communications-local,
- later evidence reveals the shared dependency,
- the distinction between infrastructure state and visibility becomes prominent.

### 5.3 `water-first`

Opening sequence:

1. SUW Kępa reports controller restart / pressure decline.
2. GPZ reports a recent disturbance.
3. R-4 degradation appears.

Likely first Assessment emphasis:

> Possible local service degradation with emerging cross-domain correlation.

Operator-learning effect:

- the operator must distinguish a local plant problem from a wider dependency cascade.

---

## 6. Condition profiles

The profile system modifies bounded parameters. It does not replace the core narrative.

### 6.1 `communications-fragile`

Operational emphasis: communications continuity and loss of visibility.

Typical modifiers:

- lower R-4 backup-runtime range,
- faster link degradation,
- earlier telemetry delay/staleness,
- lower fallback-channel quality,
- longer or less reliable communications confirmation.

Expected effect on decisions:

- protecting R-4 may gain value,
- waiting consumes communications margin faster,
- maintaining an accurate common picture becomes harder.

### 6.2 `access-constrained`

Operational emphasis: physical access and delayed intervention.

Typical modifiers:

- earlier or stronger Z-17 restriction,
- higher generator travel-time multiplier,
- longer GPZ field-inspection delay,
- less favourable alternative-route estimate.

Expected effect on decisions:

- waiting may materially reduce later deployment options,
- expected action effects depend on arrival time rather than action selection alone.

### 6.3 `resource-constrained`

Operational emphasis: limited operational margin.

Typical modifiers:

- less favourable SUW reserve/service-margin range,
- reduced available contingency capacity,
- tighter AG-400 preparation/endurance margin where appropriate,
- more pronounced displaced risk when the generator is assigned.

Expected effect on decisions:

- the generator allocation trade-off becomes sharper,
- preserving one service may leave less capacity elsewhere.

### 6.4 `low-confidence-data`

Operational emphasis: decision-making under uncertain or delayed information.

Typical modifiers:

- longer human-report delay,
- more observations with medium/low confidence,
- earlier stale/manual data conditions,
- slower independent confirmation,
- more persistent ambiguity between competing explanations.

Expected effect on decisions:

- Decision 1 has greater downstream effect on knowledge quality,
- acting early versus seeking confirmation becomes a more visible trade-off.

### 6.5 Secondary modifier strength

The secondary modifier uses weaker parameter ranges than the dominant profile. It should colour the run without competing with the dominant operational theme.

For alpha, profile strengths are explicit configuration presets rather than a generic numerical difficulty system.

---

## 7. Fixed narrative spine

Every valid run follows this sequence:

```text
Briefing
  ↓
Baseline
  ↓
Opening variant observations
  ↓
Cross-domain correlation
  ↓
Assessment + first Projection
  ↓
Decision 1 — information posture
  ↓
Persistent feeder disruption
  ↓
Dependency cascade + route constraint
  ↓
Revised Assessments / Projections
  ↓
Decision 2 — generator recommendation
  ↓
External response + deployment progress
  ↓
Hospital / critical-service report
  ↓
Decision 3 — coordination posture
  ↓
Stabilisation or controlled deterioration
  ↓
Operational handover
  ↓
After-Action Report
```

Profiles and earlier decisions may change timing, evidence quality, confidence, margins and observed outcomes, but not this fixed structural spine.

---

## 8. Operator flow by beat

Times below are target ranges, not hard-coded wall-clock delays. Scenario time is accelerated.

| Real time | Scenario time | Incoming state / event | VECTOR OPS derivation | Operator experience |
|---:|---:|---|---|---|
| 0:00–0:12 | 07:40–07:43 | Stable initial state | No material Assessment | User establishes baseline across six entities |
| 0:12–0:25 | 07:43–07:46 | First opening observation | Local warning only | One entity changes from Normal to Warning; no forced action |
| 0:20–0:38 | 07:45–07:49 | Second and third opening observations | Dependency/time correlation becomes possible | Related tiles change; evidence begins to accumulate |
| 0:35–0:50 | 07:48–07:51 | Correlation threshold reached | Primary Assessment created | User sees first cross-domain interpretation and can inspect Why? |
| 0:42–0:58 | 07:50–07:53 | Continuing trend/dependency risk | First Projection created | Future visibility/service consequence appears with time range |
| ~0:55 | ~07:53 | Decision gate | Decision 1 opens | Clock pauses or strongly slows |
| 1:10–1:35 | ~08:00 | F-12 trips and remains isolated | Primary Assessment revised | Earlier tentative interpretation becomes more strongly supported |
| 1:25–1:55 | ~08:05 | R-4 moves to backup | Communications Projection revised/created | Backup endurance and dependency consequence become visible |
| 1:45–2:10 | ~08:10 | Z-17 becomes Restricted | Deployment/inspection ETA changes | Access constraint enters causal chain |
| 1:55–2:25 | ~08:12–08:16 | SUW reduced pumping / stale data progression | Secondary Assessment may appear; projections recalc | Operator sees physical disruption and information-quality degradation separately |
| ~2:30 | ~08:18 | Resource conflict mature | Decision 2 opens | Generator options compared with expected effects and displaced risk |
| 2:50–3:45 | 08:22–08:38 | External acceptance/rejection; AG-400 lifecycle; route impact | ETA and projections revise | User sees downstream consequence of recommendation rather than instant execution |
| 3:40–4:15 | ~08:45 | Hospital human report | Critical-service projection may revise | Abstract water/comms consequences gain operational recipient context |
| ~4:30 | ~08:50 | Broader coordination threshold | Decision 3 opens | Operator selects coordination/escalation posture |
| 4:45–5:45 | 08:55–09:10 | Final response and stabilisation events | Claims resolve/develop/supersede | Final operational state remains factual; unresolved items may remain |
| ~5:45+ | — | Completion condition reached | Run marked completed | User enters After-Action Report |

The sequence must remain understandable even if a user does not open every evidence panel.

---

## 9. Baseline state

At start:

- GPZ Brzeziny: Normal,
- SUW Kępa: Normal,
- R-4: Normal,
- County Hospital Nowy Brzeg: Normal,
- AG-400: Available,
- Z-17: Open.

One or two low-priority informational items may be present, but none require immediate intervention.

The Assessment and Projection panels should communicate absence of a material cross-domain issue without implying that all uncertainty is zero.

Example:

> No material cross-domain issue currently detected.

The baseline exists so later deterioration is legible.

---

## 10. Assessment progression

Scenario 01 uses at most two simultaneous operator-facing Assessments.

### A-01 — Cross-domain disruption

Possible lifecycle:

```text
created: possible correlated disruption
→ revised: persistent power disruption affecting dependent services
→ active through trade-off phase
→ resolved / superseded during final stabilisation
```

Opening-variant wording may differ, but it remains the same logical Assessment family when it represents the same operational claim.

### A-02 — Degrading operational visibility

Created only when data transport/freshness degradation becomes operationally distinct from the physical service disruption.

Possible statement:

> Operational visibility is degrading as R-4 deterioration delays or removes SUW and field information.

This Assessment must not claim physical SUW failure solely because telemetry is stale.

---

## 11. Projection progression

The live UI exposes at most three active Projections.

Typical Projection families:

### P-01 — Communications continuity

> Primary R-4 communications may be lost within a bounded time range if current degradation continues.

Inputs may include:

- backup power mode,
- estimated endurance,
- current link quality,
- profile modifiers,
- generator assignment state.

### P-02 — SUW monitoring / control visibility

> Remote monitoring or limited remote-control visibility for SUW Kępa may become unavailable before local pumping stops.

This Projection is a core demonstration of the physical-state versus observed-state distinction.

### P-03 — Water-service margin / critical-service consequence

> Water-service margin will continue to decrease if reduced pumping persists; critical-service contingency preparation may become necessary.

Hospital reports may increase operational relevance without creating fictional direct telemetry.

Every material revision preserves the previous version in the audit history and states what changed.

---

## 12. Decision 1 — Information posture

Trigger: first cross-domain Assessment plus first meaningful Projection.

Question:

> Evidence suggests a possible cross-domain disruption. How should the current information posture change?

Options:

### D1-A — Open cross-domain incident and request synchronised confirmation

Expected effects:

- coordinated confirmation requested from relevant organisations,
- confirmation likely arrives sooner,
- later Assessment confidence may improve,
- small coordination/time cost.

### D1-B — Continue separate monitoring

Expected effects:

- no additional coordination burden,
- uncertainty remains longer,
- later correlation may occur with lower contemporaneous confidence.

### D1-C — Recommend early regional escalation with stated uncertainty

Expected effects:

- wider coordination chain becomes aware earlier,
- later external response may start sooner,
- escalation begins before persistence is confirmed,
- potential unnecessary coordination burden.

Decision 1 changes knowledge state and response timing. It does not create three separate narratives.

Example downstream modifiers:

```ts
interface Decision1Modifiers {
  confirmationDelayDelta?: number;
  regionalAwarenessAt?: ScenarioTime;
  confidenceSupport?: "none" | "moderate" | "strong";
  coordinationLoad?: "normal" | "increased";
}
```

---

## 13. Persistent disruption and Act 2

After Decision 1, F-12 later trips and remains isolated.

Material effects:

- GPZ feeder state becomes unavailable/locked out,
- SUW operates with reduced pumping capacity,
- R-4 transitions to backup power,
- R-4 communications quality progressively degrades,
- Z-17 becomes Restricted,
- inspection and generator travel estimates change.

This sequence confirms or revises the initial interpretation but does not retroactively overwrite what was known during Decision 1.

The runtime reevaluates relevant rules after every material event and relevant time threshold.

---

## 14. Decision 2 — Generator recommendation

Trigger: one AG-400 is available while both SUW and R-4 have plausible competing need and the consequences are inspectable.

Question:

> One compatible mobile generator is available. Which deployment should be recommended?

### D2-A — Recommend AG-400 for SUW Kępa

Expected benefit:

- protects pumping capacity,
- improves water-service margin.

Displaced risk:

- R-4 remains on finite backup,
- communications and remote visibility may deteriorate or be lost.

### D2-B — Recommend AG-400 for R-4

Expected benefit:

- preserves communications continuity,
- preserves remote SUW monitoring/control for longer,
- supports broader coordination.

Displaced risk:

- SUW remains on reduced pumping,
- water-service margin continues to fall.

### D2-C — Wait briefly for firmer grid-restoration information

Expected benefit:

- preserves resource flexibility,
- may avoid unnecessary deployment.

Displaced risk:

- consumes time margin for both R-4 and SUW,
- route/access deterioration may increase later deployment time.

No option is labelled as correct. The visible run conditions determine the trade-off.

---

## 15. Action and external-response behaviour

A recommendation does not teleport the generator or directly command an infrastructure operator.

For AG-400 the runtime may use:

```text
Available
→ Reserved
→ Preparing
→ En route
→ On site
→ Connecting
→ Operational
```

External actions use explicit response events:

```text
action.requested
→ action.accepted | action.rejected
→ later action.completed
```

Expected effects are shown when the operator decides. Observed effects are added only when events actually occur.

Z-17 may revise deployment ETA after the recommendation. This is an intentional second-order consequence.

---

## 16. Critical-service beat

Before Decision 3, County Hospital Nowy Brzeg provides a human report rather than synthetic direct building telemetry.

Representative content:

> Essential services currently maintained. Requesting confirmation of expected water and communications continuity.

The report may:

- increase relevance of an existing Projection,
- add supporting evidence,
- expose a contingency-preparation Action,
- change severity/attention when rule conditions justify it.

It must not create sensational or unsupported harm claims.

---

## 17. Decision 3 — Coordination posture

Trigger: persistent multi-service disruption plus enough downstream evidence to justify a coordination decision.

Question:

> Persistent infrastructure disruption now affects multiple services. What coordination posture should be recommended?

### D3-A — Targeted notification and contingency preparation

Expected effects:

- affected organisations receive targeted notification,
- local contingency preparation begins,
- broader regional coordination is not activated.

### D3-B — Recommend voivodeship-level coordination

Expected effects:

- broader coordination package is prepared/escalated to the responsible authority,
- wider organisational awareness and response capacity may improve,
- coordination load increases.

### D3-C — Continue operator-level coordination while seeking confirmation

Expected effects:

- current coordination level remains,
- remaining confirmation is requested,
- escalation is delayed while uncertainty may reduce.

All wording remains within the WCZK duty officer authority boundary.

---

## 18. Resolution and completion

The scenario does not end when every entity becomes Normal.

Possible final states include:

- R-4 stabilised while SUW remains under reduced pumping,
- SUW stabilised while communications fall back to reduced/manual channels,
- both remain partially degraded but with improved coordination and documented handover,
- unresolved GPZ restoration remains an open item.

Completion condition:

```text
Decision 1 recorded
AND Decision 2 recorded
AND Decision 3 recorded
AND required downstream response events processed
AND resolution checkpoint reached
```

Then:

```ts
run.status = "completed";
```

Remaining unresolved items are preserved for handover and the After-Action Report.

---

## 19. After-Action Report transition

Do not show success/failure, score, celebratory language or a named outcome class.

The transition should read approximately:

> Operational phase complete. Review the situation, decisions and observed effects.

The report contains:

- scenario version,
- seed,
- opening variant,
- dominant profile,
- secondary modifier,
- initial state,
- chronological event timeline,
- each decision with evidence available at that time,
- unknowns and assumptions,
- selected action,
- expected effects,
- observed effects,
- per-entity initial/final comparison,
- unresolved items and handover,
- at most one or two clearly modelled counterfactual comparisons.

The report must distinguish contemporaneous knowledge from hindsight.

---

## 20. Scenario as data

Scenario logic must not be encoded in presentation components.

Minimum definition:

```ts
export interface ScenarioDefinition {
  id: string;
  version: string;
  title: string;

  initialEntities: Entity[];
  capabilities?: Capability[];
  dependencies: Dependency[];

  openingVariants: OpeningVariant[];
  conditionProfiles: ConditionProfile[];

  events: ScenarioEventDefinition[];
  decisions: DecisionDefinition[];

  completionRules: CompletionRule[];
}
```

### 20.1 Opening variant

```ts
export interface OpeningVariant {
  id: "power-first" | "communications-first" | "water-first";
  openingEventIds: string[];
  assessmentVariant?: string;
  parameterOverrides?: Record<string, unknown>;
}
```

### 20.2 Condition profile

```ts
export interface ConditionProfile {
  id:
    | "communications-fragile"
    | "access-constrained"
    | "resource-constrained"
    | "low-confidence-data";

  strength: "dominant" | "modifier";
  parameters: Record<string, number | string | boolean | [number, number]>;
}
```

The implementation may use more strongly typed parameter objects per profile once concrete values are coded. A generic `Record` is shown here only to define the data boundary, not to mandate weak typing inside the codebase.

### 20.3 Scenario events

```ts
export interface ScenarioEventDefinition {
  id: string;
  phase: ScenarioPhase;
  trigger: ScenarioTrigger;
  effects: ScenarioEffect[];
  conditions?: ScenarioCondition[];
}
```

Supported trigger families for alpha:

```ts
export type ScenarioTrigger =
  | { type: "scenarioTime"; at: ScenarioTime | SeededRange }
  | { type: "afterEvent"; eventId: string; delay?: SeededRange }
  | { type: "afterDecision"; decisionId: string; delay?: SeededRange }
  | { type: "condition"; conditionId: string };
```

Effects may include:

- update hidden physical scenario state,
- emit DomainEvent,
- append Observation,
- make Action available,
- change external-response state,
- update resource lifecycle,
- schedule a follow-up event.

Assessment and Projection creation should normally remain rule-driven rather than hard-coded as presentation effects.

---

## 21. Scenario runtime

The runtime is deliberately small.

### 21.1 Runtime state

```ts
export type ScenarioRunStatus =
  | "briefing"
  | "running"
  | "awaitingDecision"
  | "resolving"
  | "completed";

export type ScenarioPhase =
  | "baseline"
  | "detection"
  | "dependency"
  | "escalation"
  | "resolution";
```

Runtime status answers **what the engine is doing**.

Scenario phase answers **where the narrative currently is**.

They must remain separate.

### 21.2 Minimal state machine

```text
briefing
   ↓
running
   ↓
awaitingDecision
   ↓
running
   ↓
awaitingDecision
   ↓
running
   ↓
awaitingDecision
   ↓
resolving
   ↓
completed
```

The runtime does not need separate states for every narrative branch.

### 21.3 Runtime loop

On a material runtime step:

```text
advance simulation clock
→ evaluate due scenario triggers
→ apply hidden physical-state changes
→ emit Domain Events
→ create incoming Observations
→ update shared indexes/state
→ recalculate relevant Assessment/Projection rules
→ revise Action availability
→ append audit events
→ open Decision when gate conditions are met
```

At a mandatory Decision:

- clock automatically pauses or strongly slows,
- the user is not penalised for reading,
- evidence snapshot is captured,
- selection is recorded,
- resulting action/event modifiers are applied,
- runtime returns to `running`.

---

## 22. Hidden physical state versus operator knowledge

The runtime maintains scenario truth separately from visible state.

Example:

```text
08:04 physical state:
SUW still pumping locally

08:04 operator knowledge:
last SUW telemetry received 3 minutes ago
```

The UI may therefore show:

> Status unknown / data stale

rather than:

> SUW failed

unless a later report or observation supports that conclusion.

This separation is mandatory in all opening variants and condition profiles.

---

## 23. Rule recalculation

For alpha, rules are reevaluated:

- after every material Domain Event,
- after every new Observation relevant to the rule,
- when freshness thresholds are crossed,
- when a Projection horizon/time threshold is crossed,
- after operator decisions whose effects alter rule inputs.

The engine does not need to evaluate every rule on every visual clock tick.

A material semantic change creates a new Assessment/Projection revision. A recalculation that changes only `recalculatedAt` does not.

---

## 24. Seeded values

A seeded random helper should be the only source of scenario variation.

Example:

```ts
const backupRuntime = rng.range(18, 28);
const confirmationDelay = rng.range(4, 8);
const routeDelay = rng.range(6, 12);
```

Do not call uncontrolled `Math.random()` inside domain rules or UI components.

Random values should be resolved into the ScenarioRun configuration/state early enough that replay is deterministic and inspectable.

---

## 25. Test reference runs

Before unrestricted random runs are used publicly, maintain at least one reference seed per opening variant:

```text
power-first / reference seed P01
communications-first / reference seed C01
water-first / reference seed W01
```

Each reference run should exercise a known profile combination and all three decisions.

These are test fixtures, not separate public scenario definitions.

In addition, each of the four condition profiles must be covered by at least one repeatable reference/test run.

---

## 26. Minimum Action Review behaviour required for implementation

Detailed visual design remains under issue #14, but #12 requires enough interaction detail to build the vertical slice.

When a mandatory decision opens, the reusable review surface must show:

- decision question/title,
- current scenario time,
- decision owner/authority,
- deadline or time-to-impact if relevant,
- current evidence,
- missing/uncertain information,
- two or three options,
- expected benefit per option,
- displaced risk/cost per option,
- reversibility where relevant,
- affected organisations/entities,
- confirmation action.

After selection:

- the selected Action is recorded,
- expected effects remain distinguishable from observed effects,
- external actions enter Requested rather than Completed,
- the scenario resumes,
- the decision is immediately available in the audit timeline.

Deferred to #14 / implementation iteration:

- exact visual layout,
- keyboard-navigation detail,
- final focus behaviour,
- animation/transitions,
- visual comparison treatment beyond the required information hierarchy.

These deferred items do not block starting the application shell and scenario runtime.

---

## 27. Vertical-slice acceptance criteria

The 24 September vertical slice is ready when:

1. one browser run can start from briefing and reach After-Action Report;
2. all six entities exist in shared state;
3. all three opening variants can be selected deterministically;
4. all four condition profiles exist as real parameter configurations;
5. a run selects one dominant profile and one weaker different modifier;
6. one seed reproduces the same opening, values and downstream events when the same decisions are made;
7. the opening observations create/revise real Assessment and Projection objects through rules;
8. the three decisions use real Action/Decision objects rather than UI-only branching;
9. Decision 1 changes later information/response timing;
10. Decision 2 changes AG-400 assignment and downstream consequences;
11. Z-17 can alter deployment/inspection ETA;
12. Decision 3 changes coordination/escalation events within operator authority;
13. stale/unavailable telemetry never automatically means physical failure;
14. Assessment/Projection revisions preserve prior history;
15. material Domain Events are append-only and reconstruct the run;
16. final report shows what was known at each decision, expected effects, observed effects and unresolved items;
17. no scenario rule exists only inside a visual component;
18. no score, hidden winning option or success/failure verdict is presented.

---

## 28. Implementation boundary after this specification

Do not add another architecture layer before implementation unless coding exposes a concrete contract gap.

Immediate implementation sequence:

```text
application shell
→ shared types/state
→ seeded scenario configuration
→ simulation clock/runtime
→ event processing
→ observations + dependency registry
→ Assessment/Projection rules
→ primary operational view
→ Decision / Action Review
→ audit timeline
→ After-Action Report
→ profile/seed validation and polish
```

The project may move into working-prototype implementation while M3 interaction details continue to be refined against the running UI.

The next architectural question should come from code, not from speculative completeness.
