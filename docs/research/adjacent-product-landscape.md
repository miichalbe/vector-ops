# VECTOR OPS — Adjacent Product Landscape

**Version:** 0.2  
**Date:** 21 September 2026  
**Milestone:** Discovery  
**Issue:** #1 — Map adjacent product landscape  
**Status:** Research pass 2 — decision-support depth check

---

## 1. Purpose

This document maps adjacent product categories around VECTOR OPS and tests the product hypothesis against the current market.

The second research pass focuses on a narrower question:

> **Does a current product already combine cross-domain operational dependencies, adaptive / progressive transparency, and counterfactual comparison of operator actions in one workflow?**

The goal is not to prove novelty. It is to determine where VECTOR OPS can credibly create value without claiming capabilities that already exist in mature products.

---

# 2. Executive conclusion

The initial VECTOR OPS concept remains viable, but the market is **not** a clean white space.

Several mature products already cover substantial parts of the proposed experience:

- **Anduril Lattice** combines cross-domain sensor / asset integration, AI-supported decision points, recommendations and rapid tasking.
- **Everbridge 360 AI Advisor** prioritizes events, explains why they matter, recommends next actions and keeps authorized humans in control.
- **Palantir Foundry / AIP / Gotham** comes closest to the full VECTOR OPS hypothesis. Palantir publicly describes:
  - operational applications centered on decisions rather than dashboards,
  - an Ontology of objects, links, logic and actions,
  - scenario forks that let users compare alternative actions before committing,
  - models that predict downstream / knock-on effects,
  - durable capture of the decision and its rationale,
  - human approval of agent-proposed actions,
  - Gotham workflows that surface dependencies and options from live operational data.
- **C3 AI** also provides scenario simulation, optimization and reasoning-oriented decision tooling in industrial settings.

Therefore the combination:

> **cross-domain data + recommendations + explanations + what-if comparison + human approval**

cannot be treated as unique.

However, from the public product material reviewed, there is still a potentially useful interaction-design space:

> **Make the causal structure of an operational consequence itself a first-class, inspectable object, revealed progressively according to uncertainty, consequence and operator need.**

The narrower hypothesis is no longer “we provide explainable recommendations.”

It is:

> **VECTOR OPS makes the dependency chain behind an operational consequence easy to inspect, challenges its assumptions, compares alternative interventions, and reveals detail only when the operator needs it.**

This is not yet proven to be unique. Public material does not show an obvious product whose *central operator interaction model* is exactly this combination.

---

# 3. Market landscape by category

## A. TAK / ATAK / WinTAK

**Category:** Tactical situational awareness and team coordination  
**Primary strength:** Shared geospatial awareness and extensibility

TAK provides shared operational awareness, tracking, maps, route planning, communication, video and mission-specific plugins.

### Already addressed
- shared map,
- team / asset tracking,
- route and mission support,
- field / command collaboration,
- plugin model,
- operation in constrained network conditions.

### VECTOR OPS implication
A Common Operational Picture or plugin architecture is not a differentiator.

The relevant question is whether operators must still infer higher-order consequences manually across tasking, asset state, logistics and communications.

**Sources**
- https://tak.gov/
- https://tak.gov/solutions
- https://tak.gov/solutions/emergency
- https://tak.gov/solutions/military

---

## B. SitaWare Suite / SitaWare Headquarters

**Category:** Military C4ISR / battle management  
**Primary strength:** Cross-domain common operating picture, planning, logistics status and interoperability

SitaWare already combines situational awareness, collaborative planning, logistics / holdings status, unit readiness, sensor feeds and multi-domain interoperability.

### Already addressed
- multi-domain C2,
- cross-domain planning,
- logistics + operational picture,
- readiness and asset-state views,
- integration / SDK architecture.

### VECTOR OPS implication
We cannot claim that joining logistics with operational awareness is new.

The potentially interesting layer is how dependencies and consequences are explained and compared during a decision.

**Sources**
- https://systematic.com/int/industries/defence/products/sitaware-suite/
- https://systematic.com/int/industries/defence/products/sitaware-suite/sitaware-headquarters/

---

# 4. Deep-dive: products closest to the VECTOR OPS decision model

## 4.1 Anduril Lattice

**Category:** AI-powered Command & Control / autonomous-system battle management

Anduril describes Lattice as an AI-powered C2 platform that:

1. creates a shared real-time understanding from thousands of sensors and data sources,
2. presents **decision points rather than noise**,
3. provides recommended decision support,
4. turns decisions into action through manned, unmanned and autonomous assets,
5. operates across domains and degraded communications environments.

Anduril also states that Lattice can allow one operator to supervise hundreds of autonomous systems.

### What this means for VECTOR OPS

Lattice directly invalidates several possible differentiation claims:

- “turning sensor data into decisions,”
- “decision points rather than raw alerts,”
- “one operator supervising many autonomous assets,”
- “cross-domain integration,”
- “AI-supported rapid decisions.”

### What public material does *not* establish clearly

The reviewed public material does not show in detail:

- an operator-facing causal graph explaining *why* a recommendation exists,
- progressive disclosure of that explanation based on uncertainty / workload,
- side-by-side counterfactual comparison of multiple courses of action with visible downstream effects,
- explicit inspection of which assumption would invalidate the recommendation.

This does **not** prove Lattice lacks these capabilities. It only means they are not established by the public material reviewed.

**Sources**
- https://www.anduril.com/lattice/command-and-control
- https://www.anduril.com/lattice/lattice-mesh
- https://developer.anduril.com/

---

## 4.2 Everbridge 360 AI Advisor

**Category:** Critical event management / organizational resilience

Everbridge Advisor publicly describes a workflow that is already close to part of the VECTOR OPS concept.

Advisor:

- cuts through large numbers of signals,
- surfaces risks and impacts that matter,
- **explains why each one matters**,
- recommends the next step,
- can prepare or carry out approved actions,
- keeps authorized operators in control,
- reviews outcomes after events to improve future guidance.

Everbridge explicitly states that Advisor does not independently make critical decisions or send communications without authorized operator review.

### What this means for VECTOR OPS

The following are **not** unique:
- “Why am I seeing this?”
- explanation of why an alert matters,
- AI-assisted prioritization,
- recommendation,
- human review / approval.

### What public material does *not* establish clearly

The reviewed public material does not show:

- an explicit multi-domain dependency graph,
- a visible causal chain from sensor state to projected consequence,
- simultaneous counterfactual comparison of several operational interventions,
- progressive / workload-sensitive explanation depth.

Again, this is a statement about public evidence, not a claim that the product cannot do these things.

**Source**
- https://www.everbridge.com/products/advisor/

---

## 4.3 Palantir Foundry / AIP / Gotham — closest match

**Category:** Data / operations platform, AI-enabled operational applications and mission planning

Palantir is the strongest challenge to the idea that the VECTOR OPS decision model is novel.

### Operational applications

Palantir defines an operational application as a user interface centered on a real decision rather than a read-only dashboard.

Its public documentation explicitly recommends:

- starting with the decision rather than the screen,
- showing only the objects, links and properties relevant to that decision,
- using live operational state,
- allowing the user to test a decision before committing,
- forking the Ontology into scenarios,
- applying alternative actions,
- predicting downstream effects,
- comparing competing courses of action,
- committing the chosen decision back into operational systems,
- recording the decision and its rationale for audit and learning.

Palantir's own logistics example includes comparing alternative carriers by:
- arrival time,
- cost,
- probability,
- knock-on effects to other shipments,

before choosing one.

### Cross-domain dependency representation

Palantir's Ontology represents operational objects, links, data, logic and actions.

Its platform description frames decisions as:
- **data** — state of the world,
- **logic** — rules, probabilities, forecasts, optimization and assumptions,
- **actions** — how the decision affects the world.

This is structurally close to VECTOR OPS's proposed dependency model.

### Gotham mission planning

Public Gotham material describes AI-enabled structured mission-planning workflows in which recommendations surface **dependencies and options based on live operational data**, including modelling asset availability across ongoing operations.

### Human control and auditability

AIP provides:
- explanations,
- evaluations,
- audit trails,
- agent proposals routed to humans for approval,
- durable records of decisions and rationale.

### Assessment

Palantir therefore already demonstrates much of the requested combination:

| VECTOR OPS hypothesis | Palantir public evidence |
|---|---|
| Cross-domain object / dependency model | **Strong** — Ontology objects and links |
| Recommendations / decision support | **Strong** |
| Human-in-the-loop | **Strong** |
| Counterfactual scenario comparison | **Strong** |
| Downstream / knock-on effects | **Strong** |
| Decision rationale / audit | **Strong** |
| Progressive “only what matters now” presentation | **Strong conceptual support** |
| Explicit operator-visible causal dependency graph | **Partial / unclear** |
| Transparency level dynamically adapted to workload / uncertainty | **Unclear** |

### Implication for VECTOR OPS

The full high-level concept cannot credibly be claimed as unique.

The remaining design opportunity must be more specific than “operational decision support with scenarios.”

**Sources**
- https://www.palantir.com/docs/foundry/app-building/operational-apps
- https://www.palantir.com/docs/foundry/platform-overview
- https://www.palantir.com/docs/foundry/aip
- Palantir Gotham AI-enabled operations material

---

## 4.4 C3 AI decision optimization

**Category:** Enterprise / industrial AI optimization

C3 AI demonstrates another relevant pattern.

Its public materials describe:
- models that unify data across operational sources,
- optimization across many constraints,
- real-time scenario analysis,
- what-if simulation,
- user-visible reasoning in solver selection,
- decision models containing controllable variables, uncertain variables, state variables, transition functions, objectives and constraints.

### Implication

Scenario analysis, constraint-aware optimization and some forms of transparent reasoning are established market capabilities outside defence / public-safety software as well.

The differentiator cannot simply be “we let the operator compare possible futures.”

**Sources**
- https://c3.ai/blog/accelerating-decision-optimization-alchemist
- https://www.c3.ai/products/applications/c3-ai-production-schedule-optimization
- https://www.c3.ai/products/applications/c3-ai-process-optimization

---

# 5. Other adjacent products

## ArcGIS Mission

Mission supports real-time command-and-control, geospatial collaboration, tasks, tracks, field communication and after-action review.

Esri announced its deprecation in September 2026 and is directing customers toward broader ArcGIS platform capabilities.

**Implication:** mission-management capabilities increasingly appear as platform capabilities rather than isolated applications.

**Sources**
- https://www.esri.com/en-us/arcgis/products/arcgis-mission/overview
- https://www.esri.com/arcgis-blog/products/arcgis-mission/announcements/arcgis-mission-deprecation-notice

---

## Motorola CommandCentral Aware

Combines radios, drones, cameras, emergency calls, incidents, alerts and workflows into a public-safety operational picture.

**Implication:** aggregation and “single pane of glass” are established.

**Source**
- https://www.motorolasolutions.com/en_us/products/command-center-software/public-safety-software/real-time-intelligence-operations/commandcentral-aware.html

---

## Juvare WebEOC

Emergency-management platform focused on shared operational picture, emergency-operation coordination and secure distributed information sharing.

**Implication:** multi-organization situational awareness is established.

**Source**
- https://www.juvare.com/industry/emergency-management/

---

## FlytBase

Enterprise drone-autonomy platform with one-to-many fleet operations, mission planning, telemetry, safety automation and integrations.

**Implication:** modular multi-drone orchestration is established.

**Sources**
- https://flytbase.com/platform
- https://flytbase.com/about

---

## Auterion Mission Control / Suite

Robot / UAV mission planning and fleet operations across supported platforms, with APIs and integrations.

**Implication:** “one interface for many autonomous platforms” is established.

**Sources**
- https://auterion.com/product/mission-control/
- https://auterion.com/product/

---

## Shark GCS

Ground-control platform with UAV telemetry, mission planning, multi-UAV and swarm coordination.

**Implication:** swarm supervision by itself is not sufficient differentiation.

**Source**
- https://sharkaviation.pl/en/products/shark-gcs

---

# 6. Capability comparison

Legend:
- **Strong** — publicly established as a core capability
- **Partial** — present or adjacent, but not clearly central
- **Unclear** — not established by reviewed public material

| Product | Cross-domain model | Explains why | Human approval | Counterfactual comparison | Downstream effects | Operator-visible causal graph | Adaptive / progressive transparency |
|---|---|---|---|---|---|---|---|
| TAK | Partial | Unclear | Strong human control | Unclear | Unclear | Unclear | Unclear |
| SitaWare | Strong | Partial / unclear | Strong | Partial / unclear | Partial | Unclear | Unclear |
| Anduril Lattice | Strong | Partial / unclear | Strong | Unclear publicly | Strong optimization context | Unclear | Unclear |
| Everbridge Advisor | Strong org context | **Strong** | **Strong** | Unclear | Partial | Unclear | Partial |
| **Palantir Foundry / AIP / Gotham** | **Strong** | **Strong** | **Strong** | **Strong** | **Strong** | Partial / unclear | Partial / strong conceptually |
| C3 AI | Strong within domain | Strong in optimization context | Strong SME interaction | **Strong** | **Strong** | Partial | Partial |
| ArcGIS Mission | Strong geospatial | Limited | Strong | Unclear | Limited | Unclear | Unclear |
| Motorola Aware | Strong public-safety aggregation | Partial | Strong | Unclear | Partial | Unclear | Unclear |
| FlytBase | Strong drone domain | Partial | Strong | Partial | Partial | Unclear | Unclear |
| Auterion | Strong robotics domain | Partial | Strong | Partial | Partial | Unclear | Unclear |

> “Unclear” means the reviewed public sources do not establish the capability. It must not be read as proof that the capability is absent.

---

# 7. Answer to the key discovery question

## Question

> Does a current product already combine cross-domain operational dependency graph + adaptive transparency + counterfactual comparison of operator actions in one workflow?

## Answer

**Parts of this combination clearly exist today, and Palantir comes very close to the complete high-level concept.**

Public Palantir material establishes:
- cross-domain operational objects / relationships,
- decision-centered interfaces,
- selective presentation of relevant context,
- scenario forks,
- comparison of alternative actions,
- downstream-effect simulation,
- human approval,
- recorded rationale and auditability.

Therefore VECTOR OPS should **not** claim the full combination as a market-first capability.

However, the research did **not** identify a public product whose central operator UX is clearly documented as:

1. a visible, inspectable causal dependency chain behind each projected operational consequence,
2. progressive explanation depth that changes with uncertainty, consequence or operator need,
3. explicit identification of the weakest assumptions / dependencies,
4. side-by-side counterfactual interventions,
5. all within a mixed human + autonomous asset + communications + resource operational model.

This narrower combination remains a **credible design-space hypothesis**, not a proven market gap.

---

# 8. Refined opportunity hypothesis

The product opportunity should move away from:

> “VECTOR OPS explains AI recommendations.”

That is already addressed.

Instead test:

> **VECTOR OPS turns an operational consequence into an inspectable decision object.**

A decision object contains:

### 1. Consequence
What is projected to happen?

### 2. Time horizon
When will it happen?

### 3. Confidence
How certain is the projection?

### 4. Dependency chain
Which states and assumptions create the consequence?

### 5. Weakest link
Which assumption / data source most threatens the conclusion?

### 6. Options
Which interventions are available?

### 7. Counterfactual effects
What changes elsewhere under each option?

### 8. Operator decision
Accept, modify, defer or reject.

### 9. Outcome
What actually happened?

### 10. Audit / learning
Was the forecast correct and was the intervention effective?

This provides a concrete interaction object that can be designed, prototyped and tested.

---

# 9. Adaptive transparency principle

A critical refinement is that VECTOR OPS must **not force the full reasoning chain on the operator during routine work**.

The UI should support progressive disclosure:

### Level 0 — Routine
```text
Coverage loss predicted — Sector Bravo — 11 min
Recommended: Reassign UAV-12
Confidence: High
```

### Level 1 — Why?
```text
UAV-07 endurance < 9 min
Link loss predicted < 8 min
No redundant coverage
```

### Level 2 — Inspect
Show:
- sensor / module sources,
- timestamps,
- confidence per dependency,
- missing / conflicting inputs,
- causal graph.

### Level 3 — Compare
Compare interventions and downstream consequences.

The system should reveal more detail when:
- confidence is low,
- sources disagree,
- the consequence is high,
- the action is difficult to reverse,
- the operator asks for it.

Routine operation should remain fast.

**Working principle:**
> **Fast when you can. Transparent when you need it.**

---

# 10. What is clearly not a VECTOR OPS differentiator

Do not claim uniqueness around:

1. Common Operational Picture
2. Real-time situational awareness
3. Modular / plugin architecture
4. Multi-domain operation
5. Autonomous fleet supervision
6. Single-pane-of-glass aggregation
7. AI recommendations
8. Human-in-the-loop approval
9. “Why does this alert matter?”
10. Decision points instead of raw noise
11. Scenario / what-if analysis
12. Comparing alternative courses of action
13. Audit trails
14. Capturing decision rationale

These are all represented in current products.

---

# 11. What may still differentiate the interaction model

Research should now test four much narrower propositions:

### H1 — Inspectable causality as the primary object
The dependency chain itself is a first-class operator interaction, not merely a hidden explanation.

### H2 — Adaptive transparency
The system exposes only the necessary explanation by default and expands when risk, uncertainty or operator intent requires it.

### H3 — Assumption-aware decisions
The operator can see:
- what the recommendation assumes,
- which assumption is weakest,
- what would invalidate the recommendation.

### H4 — Cross-domain counterfactuals for mixed operations
Alternative actions show consequences across:
- people,
- autonomous assets,
- communications,
- resources,
- task commitments.

These should be treated as hypotheses until scenario research and further product comparison support them.

---

# 12. Recommended next step

Issue #2 — **Identify cross-domain decision friction** — is now more important than additional broad competitor collection.

Test three operational scenarios:

1. **Search & Rescue**
2. **Wildfire / disaster response**
3. **Critical infrastructure incident**

For each scenario:

1. define the operational decision,
2. list the domains required to make it,
3. identify data uncertainty,
4. identify hidden dependencies,
5. create at least three plausible interventions,
6. map second-order consequences,
7. determine what the operator must understand immediately,
8. determine what explanation can remain hidden until requested.

The winning scenario should be one where the operator **cannot make a good decision from any single module alone**.

---

# 13. Research conclusion — pass 2

The second research pass materially changes the product story.

VECTOR OPS should not present itself as inventing:
- operational decision support,
- explainable AI,
- scenario comparison,
- human approval,
- or cross-domain operational software.

Those capabilities already exist.

The more credible opportunity is an interaction-model contribution:

> **Make complex operational consequences inspectable without making routine operations cognitively expensive.**

A stronger portfolio story is therefore:

> We studied mature C2, critical-event, enterprise-operations and autonomy platforms. Instead of building another dashboard or generic AI advisor, we focused on a narrower human-factors problem: how an operator can move rapidly from a projected consequence to its dependencies, uncertainty, alternative interventions and downstream trade-offs — without being forced to process that complexity when it is not needed.

This remains a discovery hypothesis to validate, not a market-uniqueness claim.

---

## Sources reviewed / updated in research pass 2

- TAK Product Center — https://tak.gov/
- Systematic SitaWare — https://systematic.com/int/industries/defence/products/sitaware-suite/
- Anduril Lattice C2 — https://www.anduril.com/lattice/command-and-control
- Anduril Lattice developer documentation — https://developer.anduril.com/
- Everbridge 360 AI Advisor — https://www.everbridge.com/products/advisor/
- Palantir Operational Applications — https://www.palantir.com/docs/foundry/app-building/operational-apps
- Palantir Platform / Ontology overview — https://www.palantir.com/docs/foundry/platform-overview
- Palantir AIP — https://www.palantir.com/docs/foundry/aip
- Palantir Gotham AI-enabled operations material
- C3 AI Alchemist — https://c3.ai/blog/accelerating-decision-optimization-alchemist
- C3 AI Production Schedule Optimization — https://www.c3.ai/products/applications/c3-ai-production-schedule-optimization
- ArcGIS Mission — https://www.esri.com/en-us/arcgis/products/arcgis-mission/overview
- ArcGIS Mission deprecation — https://www.esri.com/arcgis-blog/products/arcgis-mission/announcements/arcgis-mission-deprecation-notice
- Motorola CommandCentral Aware
- Juvare WebEOC
- FlytBase
- Auterion Mission Control
- Shark GCS
