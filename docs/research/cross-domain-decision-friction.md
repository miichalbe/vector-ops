# VECTOR OPS — Cross-Domain Decision Friction

**Version:** 0.1  
**Date:** 22 September 2026  
**Milestone:** M1 — Discovery Complete  
**Issue:** #2 — Identify cross-domain decision friction  
**Status:** Research pass completed

---

## 1. Research question

Which recurring decision frictions appear during live disruptions that cross infrastructure domains, and which of them are sufficiently supported to inform a synthetic VECTOR OPS scenario?

The original issue wording assumed that existing tools expose separate data and force operators to infer consequences manually. The reviewed evidence supports a more careful conclusion:

> During multi-infrastructure disruptions, dependency, impact and criticality information can be incomplete, unevenly shared or insufficiently connected to restoration and resource-allocation decisions.

The research does **not** establish that all current tools are siloed or that operators always reconstruct consequences manually.

---

## 2. Method and evidence boundary

This pass compared official and peer-reviewed material covering:

- Storm Éowyn, Scotland, January 2025;
- Storm Arwen, Great Britain, November 2021;
- Winter Storm Uri, Texas and the South-Central United States, February 2021;
- Hurricane Maria, Puerto Rico, September 2017.

The cases were selected to test whether similar coordination and prioritisation problems recur across different hazards, jurisdictions and infrastructure systems.

Each pattern below distinguishes:

- **Evidence** — directly documented by the sources;
- **Inference** — a cross-case interpretation;
- **Product hypothesis** — something VECTOR OPS may test but the sources do not prove;
- **Design implication** — a deliberate choice for the demonstrator.

---

## 3. Friction patterns

### F1 — Missing shared dependency and criticality context

**Evidence**

During Winter Storm Uri, loss of electricity at parts of the natural-gas supply chain contributed to reduced gas availability while gas-fired generation was itself needed to restore the electricity system. The FERC–NERC review consequently emphasized gas–electric coordination and identification of critical gas infrastructure.

Storm Arwen reviews also documented the need to coordinate electricity restoration with telecommunications, emergency communications and water services.

**Inference**

A locally reasonable action—such as shedding a load or restoring the largest number of direct customers—can create a larger system consequence when downstream dependencies are not visible at the decision point.

**Product hypothesis**

A shared dependency view may help an operator understand why an apparently lower-volume site has higher operational criticality.

**Design implication**

Every projected consequence in the demonstrator should expose the dependency chain that produced it.

---

### F2 — Prioritisation based on direct impact can hide downstream service impact

**Evidence**

During Storm Arwen, detailed information from water-sector organisations helped electricity operators understand the wider service consequences of outages. Emergency communications and water assets competed for attention alongside residential restoration.

Winter Storm Uri demonstrated a related need to identify and protect facilities whose downstream role was critical to electricity generation.

**Inference**

Customer count, asset count or current severity alone may be an inadequate basis for prioritisation. Operators also need to consider the services enabled by each asset.

**Product hypothesis**

An intervention comparison that includes downstream effects may produce a more defensible decision than a severity-only queue.

**Design implication**

Decision options should display both immediate benefit and displaced or downstream risk.

---

### F3 — Power and communications failures create a self-reinforcing visibility problem

**Evidence**

Storm Arwen caused power-related disruption to telecommunications and emergency-service communications. Some remote sites were difficult to reach with generators because of access conditions.

Following Hurricane Maria, widespread power loss contributed to prolonged communications outages, while unclear coordination roles added friction to the response.

**Inference**

Communications are both an affected service and a coordination dependency. Their degradation reduces telemetry, contact with field teams and confidence in the operational picture, which can then slow restoration.

**Product hypothesis**

VECTOR OPS should represent declining information confidence, not merely show a communications asset as online or offline.

**Design implication**

The scenario should visibly degrade data freshness, confidence or reach when communications dependencies fail.

---

### F4 — Scarce restoration resources create cross-domain trade-offs

**Evidence**

Storm Arwen response required transport, installation and refuelling of mobile generators, sometimes at difficult-to-access sites. Water-sector mitigation reduced customer impact through generators, tankers and coordinated prioritisation.

Hurricane Maria required unusually extensive federal involvement in grid restoration, while transporting personnel, equipment and materials to the island was difficult and time-consuming.

**Inference**

Generators, fuel, field crews, transport capacity and site access form a shared constraint system. Assigning a resource to one service can protect it while allowing another risk to grow.

**Product hypothesis**

Showing the opportunity cost of an assignment may help users compare interventions more meaningfully.

**Design implication**

At least one demo decision should require reallocating a constrained resource, with a visible benefit and a visible trade-off.

---

### F5 — Decisions are made with incomplete, ageing or uncertain information

**Evidence**

The Storm Arwen reviews identified problems with restoration-time estimates, customer communications and maintaining an accurate view of outages. The reviews also noted the potential value of more accurate operational data.

Hurricane Maria reviews documented damaged communications infrastructure, unclear federal roles and delays or confusion in aspects of coordination.

**Inference**

The operational picture is not simply complete or unavailable. Data can be stale, partial, conflicting or based on assumptions that change during the response.

**Product hypothesis**

Inspecting data age, confidence and assumptions may be more useful than presenting an unexplained recommendation.

**Design implication**

Consequences and recommendations should show their supporting observations, assumptions and confidence rather than appear as authoritative system truth.

---

## 4. Cross-case comparison

| Pattern | Éowyn | Arwen | Uri | Maria |
|---|---:|---:|---:|---:|
| F1 — Dependency and criticality context | Strong | Strong | Strong | Supporting |
| F2 — Downstream-service prioritisation | Supporting | Strong | Strong | Supporting |
| F3 — Power–communications feedback | Strong | Strong | Supporting | Strong |
| F4 — Shared restoration resources | Strong | Strong | Supporting | Strong |
| F5 — Incomplete or uncertain information | Strong | Strong | Supporting | Strong |

“Strong” means the case directly documents the pattern. “Supporting” means it corroborates the pattern without being the clearest example.

Time is a cross-cutting dimension rather than a sixth pattern: backup endurance, access delay, resource travel and restoration estimates turn dependencies into decision deadlines.

---

## 5. Implications for the first demonstrator

The evidence supports a narrow synthetic scenario containing:

- one coordinating operator;
- power, telecommunications, water and access dependencies;
- a shared pool of crews, generators or fuel;
- three meaningful decision moments;
- consequences that unfold over simulated time;
- inspectable dependency chains;
- explicit data age, confidence and assumptions;
- an audit trail showing decisions and observed outcomes.

The first demonstrator should test whether this interaction model is understandable and useful. It must not claim that the model has already been validated with real operators.

---

## 6. Claims we may and may not make

### Evidence-backed

- Infrastructure disruption can cascade across sectors.
- Electricity and communications can become enabling dependencies for other services and for recovery.
- Restoration priorities can change when downstream critical services are considered.
- Scarce resources and degraded access create cross-sector trade-offs.
- Incident decisions may rely on incomplete, ageing or uncertain information.

### Still hypotheses

- VECTOR OPS provides a better interaction model than existing operational systems.
- Operators need the exact consequence cards, dependency views or comparison flow proposed here.
- Progressive explanation improves decision quality.
- The concept represents a unique market gap.

These hypotheses require operator or expert validation and comparison with existing tools.

---

## 7. Primary sources

1. Cha, Y., White, C. J., Gonzalez, P. L. M. et al. (2025). *Assessing the cascading impacts of natural hazards on Critical National Infrastructure (CNI) using Scotland as a case study*. https://doi.org/10.1038/s44304-025-00161-9
2. Energy Emergencies Executive Committee (2022). *Storm Arwen Review: Final Report*. https://assets.publishing.service.gov.uk/media/629fa8b1d3bf7f0371a9b0ca/storm-arwen-review-final-report.pdf
3. Ofgem (2022). *Final report on the review into the networks' response to Storm Arwen*. https://www.ofgem.gov.uk/sites/default/files/2022-06/Final%20report%20on%20the%20review%20into%20the%20networks%27%20response%20to%20Storm%20Arwen.pdf
4. FERC, NERC and Regional Entity Staff (2021). *The February 2021 Cold Weather Outages in Texas and the South Central United States*. https://www.ferc.gov/media/february-2021-cold-weather-outages-texas-and-south-central-united-states-ferc-nerc-and
5. U.S. Government Accountability Office (2021). *FCC Assisted in Hurricane Maria Network Restoration, but a Clarified Disaster Response Role and Enhanced Communication Are Needed* (GAO-21-297). https://www.gao.gov/products/gao-21-297
6. U.S. Government Accountability Office (2019). *Federal Support for Electricity Grid Restoration in the U.S. Virgin Islands and Puerto Rico* (GAO-19-296). https://www.gao.gov/products/gao-19-296

---

## 8. Working conclusion

Issue #2 identifies a credible and evidence-backed coordination problem, but not a proven product solution.

The strongest opportunity for VECTOR OPS is not another consolidated dashboard. It is an inspectable decision layer that connects current state, dependencies, time, uncertainty, constrained interventions and downstream consequences.

That opportunity now needs to be converted into one primary operator, one synthetic scenario and a deliberately narrow public-alpha vertical slice.
