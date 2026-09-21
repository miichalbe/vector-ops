# VECTOR OPS — Evidence Library

**Version:** 0.1  
**Date:** 21 September 2026  
**Milestone:** Discovery  
**Primary issue:** #2 — Identify cross-domain decision friction  
**Status:** Living research document

---

## 1. Purpose

This document is the evidence and source library for VECTOR OPS.

It records sources that may support:

- problem framing,
- discovery decisions,
- operational-scenario design,
- product and interaction hypotheses,
- the future case study, presentation and public project narrative.

The library is not a list of sources that “prove VECTOR OPS.” Each entry states what the source supports, how VECTOR OPS may use it, and what must not be inferred from it.

---

## 2. Evidence-use rules

### Distinguish evidence from interpretation

Every claim derived from this library should be identified as one of:

- **Evidence** — directly supported by the cited source.
- **Inference** — a reasoned conclusion drawn from evidence, but not stated by the source.
- **Hypothesis** — a proposition that still requires validation.
- **Design decision** — a deliberate project choice, not an externally proven fact.

### Prefer the strongest available source

Use peer-reviewed research, official public-sector guidance and first-party project documentation before secondary commentary or marketing summaries.

### Preserve claim boundaries

A source confirming cross-sector infrastructure dependencies does not automatically validate:

- the VECTOR OPS product concept,
- a specific operator workflow,
- progressive / adaptive transparency,
- an AI recommendation model,
- market demand,
- product uniqueness or superiority.

### Use real incidents as grounding, not as fictional detail

Real incidents may provide the structure and constraints for a synthetic scenario. Values such as asset identifiers, fuel endurance, confidence scores, crew availability and projected times must be labelled as synthetic unless a source establishes them.

### Re-check sources before publication

Before a public case study, portfolio article or promotional post is published, verify that links, titles, dates and quoted claims still match the source.

---

## 3. Source classification

| Code | Source role | Typical use |
|---|---|---|
| **PF** | Problem framing | Establishes domain importance, systemic risk or policy context |
| **OF** | Operational friction | Documents real coordination, prioritisation, information or resource problems |
| **RC** | Reference case | Provides a real incident or programme from which scenario structure may be derived |
| **AP** | Adjacent product / project | Shows that relevant capabilities or approaches already exist |
| **IM** | Interaction-model evidence | Supports a specific operator interaction or explanation need |

**Relevance:**

- **Core** — directly supports the central discovery problem.
- **Supporting** — provides context or corroboration.
- **Watch** — potentially useful, but requires deeper review before use.

---

## 4. Current source index

| ID | Source | Type | Role | Relevance | Best current use |
|---|---|---|---|---|---|
| E-001 | Cha et al., *Assessing the cascading impacts of natural hazards on Critical National Infrastructure (CNI) using Scotland as a case study* | Peer-reviewed research | OF, RC | **Core** | Issue #2 friction patterns and Storm Éowyn-grounded scenario structure |
| E-002 | CISA, *Infrastructure Dependency Primer* | Official guidance / educational resource | PF, OF | **Core** | Dependency terminology and upstream/downstream framing |
| E-003 | OECD, *Ensuring the resilience of critical infrastructure* | Intergovernmental report chapter | PF | Supporting | Systems-based, all-hazards problem framing |
| E-004 | ENISA, *NIS360 2026* | EU agency assessment | PF | Supporting | Current European criticality and maturity context |
| E-005 | Connected Places Catapult, *Unlocking climate resilience through connected digital twins* / CReDO | First-party project case study | AP, RC | **Core** | Existing cross-sector modelling approach and adjacency check |

---

## 5. Detailed source records

### E-001 — Assessing the cascading impacts of natural hazards on Critical National Infrastructure (CNI) using Scotland as a case study

**Citation:** Cha, Y., White, C. J., Gonzalez, P. L. M. et al. (2025). “Assessing the cascading impacts of natural hazards on Critical National Infrastructure (CNI) using Scotland as a case study.” *npj Natural Hazards*, 2, Article 108.  
**Type:** Peer-reviewed research  
**Published:** 26 December 2025  
**DOI:** https://doi.org/10.1038/s44304-025-00161-9  
**Role:** Operational friction; reference case  
**Relevance:** **Core**  
**Review status:** Initial review completed; detailed extraction for Issue #2 still required

#### Supports

- Critical infrastructure disruption can cascade across energy, water, transport and telecommunications.
- Cross-sector dependencies can turn an initial physical disruption into wider service consequences.
- Storm Éowyn in Scotland provides a documented real-world reference case for compound and cascading infrastructure disruption.
- Electricity and telecommunications can become enabling dependencies for monitoring, coordination and restoration in other sectors.
- Recovery involves operational constraints such as backup generation, fuel, site access, field personnel and degraded communications.

#### VECTOR OPS use

- Primary evidence case for Issue #2.
- Extraction of recurring decision-friction patterns.
- Grounding for a synthetic multi-infrastructure disruption scenario.
- Evidence for modelling consequences as time-dependent dependency chains rather than isolated alerts.
- Future case-study explanation of why the demonstrator includes power, communications, water, access, crews and constrained resources.

#### Candidate friction patterns to test against the paper

1. Fragmented state requires manual reconstruction of the dependency chain.
2. Restoration priorities change when downstream services are considered.
3. Reallocating a constrained resource resolves one risk while increasing another.
4. Degraded communications reduce both situational awareness and recovery capacity.
5. Cascading effects unfold over time and create decision deadlines.

#### Scenario-design note

The demonstrator may be described as:

> A synthetic operational scenario inspired by documented cross-sector infrastructure impacts observed during Storm Éowyn in Scotland in January 2025.

It must not be presented as a reconstruction or simulation of the actual response.

#### Do not overclaim

- The paper does not validate VECTOR OPS as a product.
- It does not establish the proposed interaction model as unique, necessary or superior.
- It does not provide permission to invent operational details and attribute them to the real incident.
- It does not, by itself, establish a specific primary operator persona or purchasing market.

---

### E-002 — CISA Infrastructure Dependency Primer

**Publisher:** Cybersecurity and Infrastructure Security Agency (CISA)  
**Type:** Official guidance / educational resource  
**Published:** Resource page dated 29 June 2023; web primer remains available  
**URL:** https://www.cisa.gov/topics/critical-infrastructure-security-and-resilience/resilience-services/infrastructure-dependency-primer  
**Role:** Problem framing; operational friction  
**Relevance:** **Core**  
**Review status:** Initial review completed

#### Supports

- Critical infrastructure should be understood as interdependent systems and assets, not as isolated facilities.
- Dependency analysis includes upstream resources and services required for operation and downstream entities affected by disruption.
- Infrastructure resilience planning requires identifying dependencies and engaging relevant service providers and stakeholders.

#### VECTOR OPS use

- Vocabulary for dependency chains and upstream/downstream consequences.
- Problem-framing support for cross-domain operational reasoning.
- A reference for structuring the shared operational model and consequence graph.
- A check that scenario dependencies reflect recognised resilience-planning concepts.

#### Do not overclaim

- The primer is planning guidance, not evidence that operators require the exact VECTOR OPS interface.
- It does not prove that current tools fail to represent dependencies.
- It does not validate automated recommendations, counterfactual comparison or adaptive transparency.

---

### E-003 — Ensuring the resilience of critical infrastructure

**Citation:** OECD (2025). “Ensuring the resilience of critical infrastructure.” In *Government at a Glance 2025*. OECD Publishing, Paris.  
**Type:** Intergovernmental report chapter  
**Published:** 19 June 2025  
**Chapter URL:** https://www.oecd.org/en/publications/government-at-a-glance-2025_0efd0bcd-en/full-report/ensuring-the-resilience-of-critical-infrastructure_896f59cf.html  
**Report DOI:** https://doi.org/10.1787/0efd0bcd-en  
**Role:** Problem framing  
**Relevance:** Supporting  
**Review status:** Initial review completed

#### Supports

- Disruption to telecommunications, water, energy, transport or finance can affect citizens and economies beyond the originating sector.
- Critical-infrastructure resilience benefits from a system-based, all-hazards approach.
- Multi-sector governance, interdependencies, vulnerabilities, secure information sharing and partnerships are recognised elements of resilience governance.
- Resilience strategy should consider infrastructure as part of a wider system and prioritise vulnerabilities that can affect the whole system.

#### VECTOR OPS use

- High-level justification for selecting critical infrastructure as the Discovery domain.
- Policy-level context for cross-sector coordination and dependency awareness.
- Support for a cause-agnostic scenario focused on consequences rather than a cyberattack-, storm- or sabotage-specific product.

#### Do not overclaim

- This chapter supports the importance of systemic resilience, not a particular operational application.
- Its governance indicators do not measure operator-interface quality or real-time decision friction.
- It should not be cited as direct evidence for a specific feature.

---

### E-004 — ENISA NIS360 2026

**Publisher:** European Union Agency for Cybersecurity (ENISA)  
**Type:** EU agency sector assessment  
**Published:** 28 May 2026  
**Report:** https://www.enisa.europa.eu/enisa-nis360-2026  
**Press release:** https://www.enisa.europa.eu/news/nis360-the-bigger-picture-on-maturity-and-criticality-of-nis-critical-sectors  
**Role:** Problem framing  
**Relevance:** Supporting  
**Review status:** Initial review completed

#### Supports

- High-criticality sectors under the NIS2 framework remain an active European resilience and cybersecurity priority.
- Electricity and telecommunications remain among the sectors assessed as both mature and critical.
- The assessment provides a current European comparison of sector criticality, maturity and ecosystem readiness.

#### VECTOR OPS use

- Evidence that the selected domain is contemporary and relevant in the European context.
- Background for the portfolio narrative and rationale for focusing on essential services.
- A source for identifying sectors worth considering when defining the synthetic scenario.

#### Do not overclaim

- NIS360 is principally a cybersecurity maturity and criticality assessment.
- It does not directly document the operational coordination friction targeted by VECTOR OPS.
- It should not be used as evidence that the proposed consequence model or interface is needed.

---

### E-005 — CReDO: Unlocking climate resilience through connected digital twins

**Publisher:** Connected Places Catapult  
**Type:** First-party project case study / adjacent project  
**Published:** 28 August 2025  
**URL:** https://cp.catapult.org.uk/case-study/unlocking-climate-resilience-through-connected-digital-twins/  
**Related project:** https://cp.catapult.org.uk/project/climate-resilience-demonstrator-credo/  
**Role:** Adjacent product / project; reference case  
**Relevance:** **Core**  
**Review status:** Initial review completed; deeper adjacency review required

#### Supports

- Infrastructure networks are interdependent while their data and models may remain organisationally siloed.
- CReDO connects data across energy, water, gas and telecommunications.
- Connected digital twins can be used for system-wide scenario modelling, resilience analysis and risk-mitigation decisions.
- Existing work already addresses cross-sector visibility and cascading infrastructure risk.

#### VECTOR OPS use

- Strong challenge to any claim that cross-sector infrastructure modelling is novel.
- Adjacent reference for the data, dependency and scenario-modelling layer.
- Comparison point for asking where VECTOR OPS may differ: live operational coordination, inspectable decision objects, progressive explanation and operator action trade-offs.
- Input to the next revision of `adjacent-product-landscape.md`.

#### Questions for the next research pass

- Is CReDO primarily a strategic planning / resilience-modelling environment or does it also support live incident operations?
- What operator roles and decision workflows are represented?
- How are dependencies and uncertainty shown to users?
- Can users compare alternative interventions and their downstream effects?
- Does the system capture decisions, rationales and observed outcomes?

#### Do not overclaim

- First-party project material is not independent proof of operational outcomes or market adoption.
- Public material does not establish that CReDO lacks the VECTOR OPS interaction capabilities.
- VECTOR OPS should not claim a unique ability to combine cross-sector data or model cascading effects.

---

## 6. Initial claim register

This register maps likely project claims to their present evidence strength.

| Candidate claim | Evidence status | Supporting sources | Current wording guidance |
|---|---|---|---|
| Critical infrastructure sectors are interdependent and disruption can cascade across sectors. | **Strong** | E-001, E-002, E-003, E-005 | May be stated as evidence-backed. |
| Energy and telecommunications are important enabling dependencies for other essential services and recovery. | **Moderate to strong** | E-001, E-002 | State with incident or dependency context; avoid universal absolutes. |
| Infrastructure data and models are often managed in organisational silos. | **Moderate** | E-005; further independent evidence needed | Attribute to the source or describe as a research finding, not a universal fact. |
| Operators must manually reconstruct cross-domain consequences during live incidents. | **Emerging** | E-001; detailed extraction and more cases required | Treat as an Issue #2 hypothesis. |
| Existing tools do not adequately expose causal chains, assumptions and counterfactual trade-offs. | **Unproven** | Adjacent-product research only | Do not state as fact; continue product and user research. |
| Progressive transparency will improve operational decisions. | **Unproven** | No direct source yet | Treat as an interaction hypothesis requiring evaluation. |
| VECTOR OPS addresses a unique market gap. | **Unproven and currently discouraged** | Existing adjacent products challenge the claim | Do not claim uniqueness. |

---

## 7. Research gaps for Issue #2

The next evidence pass should add at least two independent incident cases and seek direct support for:

- real-time prioritisation conflicts across infrastructure sectors,
- resource reallocation trade-offs,
- degraded communications and stale or conflicting operational data,
- restoration decisions based on downstream critical services rather than direct customer count,
- how operators currently combine information from multiple organisations or systems,
- uncertainty communication during live response,
- differences between strategic resilience modelling and operational incident coordination.

Priority source types:

1. post-incident reviews from infrastructure operators or regulators,
2. peer-reviewed case studies,
3. public inquiry or government resilience reports,
4. operator interviews, conference talks or documented exercises,
5. first-party product documentation for adjacency checks.

---

## 8. Maintenance protocol

For every new source:

1. assign the next evidence ID,
2. record full citation metadata and a stable URL or DOI,
3. classify its role and relevance,
4. extract only claims the source actually supports,
5. state the intended VECTOR OPS use,
6. add a **Do not overclaim** boundary,
7. update the claim register if the source changes evidence strength,
8. link the source record from the relevant issue or research artifact.

When an issue is closed, its completion comment should link to a commit-specific version of the relevant research artifact. The evidence library itself remains a living document and may continue to evolve.

---

## 9. Working conclusion

The current evidence strongly supports the existence of cross-sector infrastructure dependencies and cascading service consequences. It also establishes that connected, cross-sector modelling is already an active field with credible adjacent projects such as CReDO.

The evidence does **not yet** establish VECTOR OPS's central product claim. Issue #2 must determine whether a recurring, operationally meaningful friction remains around understanding consequences, prioritising interventions, inspecting uncertainty and comparing downstream trade-offs during live response.

