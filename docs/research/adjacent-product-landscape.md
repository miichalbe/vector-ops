# VECTOR OPS — Adjacent Product Landscape

**Version:** 0.1  
**Date:** 21 September 2026  
**Milestone:** Discovery  
**Issue:** #1 — Map adjacent product landscape  
**Status:** Research pass 1

## Purpose

This document maps adjacent product categories around VECTOR OPS and tests the initial product hypothesis against the current market.

The goal is to understand:
- which product categories already solve parts of the problem,
- where capabilities overlap,
- which ideas are already established,
- where cross-domain operational friction may still exist,
- what VECTOR OPS should not claim as unique without further evidence.

## Executive summary

The market is already strong in several areas that VECTOR OPS initially considered differentiators:
- common operational pictures,
- real-time situational awareness,
- extensible / modular architectures,
- distributed team coordination,
- autonomous-fleet management,
- cross-domain command-and-control,
- AI-assisted decision support,
- alert prioritization and recommendation.

Therefore VECTOR OPS should not position itself merely as:
> “a map that combines teams, drones and logistics”

or:
> “a modular platform that turns data into decisions.”

Both ideas already exist in mature products.

The most promising direction is narrower:
> **an explainable operations-orchestration layer that makes cross-domain dependencies visible and turns them into operator-reviewable consequences and decisions — especially for mixed human + autonomous teams in non-weaponized operations.**

This remains a hypothesis and needs validation through scenario-level comparison.

# Landscape by category

## TAK / ATAK / WinTAK
**Category:** Tactical situational awareness and team coordination  
**Primary strength:** Shared geospatial awareness and extensibility

TAK provides shared operational awareness, tracking, maps, route planning, communication, video and mission-specific plugins.

**Not unique for VECTOR OPS:**
- shared map,
- team tracking,
- plugin model,
- mission-specific extensions,
- field / command collaboration.

**Potential gap to explore:** whether operators still need to manually infer consequences across logistics, asset health, communications and task dependencies.

Sources:
- https://tak.gov/
- https://tak.gov/solutions
- https://tak.gov/solutions/emergency
- https://tak.gov/solutions/military

## SitaWare Suite / SitaWare Headquarters
**Category:** Military C4ISR / battle management  
**Primary strength:** Cross-domain common operating picture, planning and interoperability

SitaWare combines situational awareness, collaborative planning, logistics status, readiness, sensor feeds and interoperability across domains.

**Not unique for VECTOR OPS:**
- multi-domain C2,
- logistics + operational picture,
- open integration architecture,
- cross-domain planning.

**Potential gap to explore:** explicit dependency chains, transparent consequence generation, lighter browser-first interaction model and applicability outside large defence organizations.

Sources:
- https://systematic.com/int/industries/defence/products/sitaware-suite/
- https://systematic.com/int/industries/defence/products/sitaware-suite/sitaware-headquarters/

## Anduril Lattice
**Category:** AI-powered battle management / autonomous-system C2  
**Primary strength:** Large-scale sensor fusion, autonomy and decision support

Lattice explicitly emphasizes a shared real-time understanding, sensor fusion, presenting decision points rather than noise, recommended decision support, and tasking manned and autonomous assets.

**Implication:** “decision points, not noise” cannot be claimed as unique.

**Potential gap to explore:**
- explainability as a first-class UX object,
- operator-visible causal chains,
- non-weaponized operational domains,
- transparent workflows for mixed human, logistics, comms and autonomous assets.

Source:
- https://www.anduril.com/lattice/command-and-control

## ArcGIS Mission
**Category:** Geospatial command-and-control / public safety  
**Primary strength:** Plan → Execute → Review around a common operational picture

ArcGIS Mission combines mission planning, teams, real-time field updates, communication, incident mapping, resource tracking and after-action review.

A notable signal: Esri announced ArcGIS Mission deprecation in September 2026, with capabilities moving toward the broader ArcGIS platform.

**Implication:** a monolithic standalone mission app is not automatically a durable platform strategy.

Sources:
- https://www.esri.com/en-us/arcgis/products/arcgis-mission/overview
- https://www.esri.com/arcgis-blog/products/arcgis-mission/announcements/arcgis-mission-deprecation-notice

## Motorola CommandCentral Aware
**Category:** Public-safety real-time operations  
**Primary strength:** Unified map / video / incident intelligence

Combines radios, drones, cameras, emergency calls, incidents, device alerts, workflow automation and intelligence sharing.

**Implication:** “single pane of glass” aggregation is already established.

Source:
- https://www.motorolasolutions.com/en_us/products/command-center-software/public-safety-software/real-time-intelligence-operations/commandcentral-aware.html

## Everbridge 360 / Control Center
**Category:** Critical-event management and resilience  
**Primary strength:** Common operating picture + workflow orchestration + AI-assisted risk response

Everbridge combines crisis workflows, task assignments, resource coordination, alerts, risk intelligence, AI-generated assessments and action recommendations.

**Implication:** recommendation and prioritization are not unique.

**Potential gap:** Everbridge is oriented toward organizational resilience and crisis management rather than direct orchestration of mixed autonomous assets.

Sources:
- https://www.everbridge.com/platform/critical-event-management/
- https://www.everbridge.com/products/control-center/
- https://www.everbridge.com/use-cases/crisis-management/

## Juvare WebEOC
**Category:** Emergency management / emergency operations center  
**Primary strength:** Shared operational picture and secure information exchange

Focuses on common operating picture, emergency-operation coordination, secure data sharing and distributed stakeholders.

Source:
- https://www.juvare.com/industry/emergency-management/

## FlytBase
**Category:** Enterprise drone autonomy / fleet operations  
**Primary strength:** Large-scale, hardware-agnostic autonomous drone operations

FlytBase is modular, hardware-agnostic and built for one-to-many fleet operations, mission planning, telemetry, multi-site operations, automated safety and integrations.

**Not unique:**
- modularity,
- one operator managing many drones,
- fleet orchestration,
- mission planning.

**Potential gap:** drone-first versus a broader operational model where autonomous assets are peers to humans, vehicles, logistics, comms and incidents.

Sources:
- https://flytbase.com/platform
- https://flytbase.com/about

## Auterion Mission Control / Suite
**Category:** Autonomous-robot operations platform  
**Primary strength:** Standardized mission planning and fleet operations across robotic platforms

Offers mission planning, execution, monitoring, fleet management, live data and APIs.

**Implication:** VECTOR OPS should not compete as a robot-control platform.

Sources:
- https://auterion.com/product/mission-control/
- https://auterion.com/product/

## Shark GCS
**Category:** UAV ground-control station  
**Primary strength:** Centralized drone / swarm mission control

Provides UAV telemetry, mission planning, multi-UAV management, swarm coordination and safety modes.

**Implication:** a drone or swarm controller alone would not differentiate VECTOR OPS.

Source:
- https://sharkaviation.pl/en/products/shark-gcs

# What is clearly not a VECTOR OPS differentiator

Avoid claiming uniqueness around:
1. Common Operational Picture
2. Real-time situational awareness
3. Modular / plugin architecture
4. Multi-domain operation
5. One-to-many autonomous fleet supervision
6. Single-pane-of-glass aggregation
7. AI-assisted recommendations
8. “decision points, not noise”
9. Mission planning + execution + review
10. Offline / degraded communications support

# Emerging opportunity hypotheses

## H1 — Explainable operational consequence graph
Make the chain explicit:
**state → dependency → projected consequence → options → expected effects**

The opportunity is not merely the recommendation; it is making the causal chain understandable and reviewable.

## H2 — Mixed human + autonomous + logistics orchestration
Treat humans, UAVs / robots, vehicles, communications, resources, tasks and incidents as first-class peers in one dependency model.

## H3 — Decision support without black-box autonomy
The system:
1. detects,
2. explains,
3. forecasts,
4. proposes,
5. lets the operator decide,
6. records rationale and outcome.

## H4 — Lighter modular operations layer
Explore a browser-first modular model suitable for public-safety, SAR, critical infrastructure and other non-weaponized scenarios.

# Cross-domain friction hypothesis

The landscape suggests:
- tactical-awareness tools are strongest at **where / what is happening**,
- autonomy tools are strongest at **what the robotic fleet is doing**,
- emergency-management tools are strongest at **who must respond and which process must execute**,
- high-end C2 platforms span more domains but are large institutional systems.

A plausible friction point is:
> Operators may receive accurate state from multiple systems yet still perform cross-domain dependency reasoning mentally or organizationally.

This is an inference from product segmentation, not yet evidence from user research.

# Recommended positioning adjustment

Keep:
> **A modular operations coordination platform for distributed teams and autonomous assets.**

Treat:
> **Cross-domain operational consequences rather than disconnected alerts**

as a design principle, not a unique-market claim.

Explore:
> **VECTOR OPS makes operational dependencies inspectable — connecting people, autonomous assets, communications, resources and tasks into explainable consequences and operator-controlled decisions.**

The key word is **inspectable**.

# Discovery implications

Keep:
- modular architecture,
- shared entity model,
- event-driven core,
- mixed teams / autonomous assets,
- decision-oriented interaction,
- non-weaponized public demo.

Refine:
- do not claim that decision support itself is new,
- do not frame COP as the core innovation,
- make explainability / causal dependencies more explicit,
- validate whether logistics is a first-class MVP module,
- test a scenario where the important decision cannot be understood from any single module alone.

# Proposed next research task

For Issue #2 — **Identify cross-domain decision friction** — compare 3 candidate operational scenarios:

1. **Search & Rescue**
   - UAV battery degradation
   - lost communications
   - search-sector coverage
   - human team availability

2. **Wildfire / disaster response**
   - evacuation zones
   - field teams
   - drone reconnaissance
   - road closure
   - resource constraints

3. **Critical infrastructure incident**
   - sensor alarm
   - inspection drone
   - technician dispatch
   - access restrictions
   - communications or weather constraint

For each scenario, identify the point where multiple domains must be combined to make one operational decision.

# Conclusion

The concept remains viable as a design exploration, but the landscape is more mature than the first concept suggested.

The strongest portfolio story is not:
> “we invented a new category.”

It is:
> **We studied mature tactical, public-safety, emergency-management and autonomous-operation platforms, identified a recurring systems-design challenge, and designed an interaction model that makes cross-domain dependencies and consequences explicit, inspectable and actionable.**
