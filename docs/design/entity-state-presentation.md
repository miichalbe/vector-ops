# VECTOR OPS — Entity state presentation refinement

**Date:** 24 September 2026  
**Status:** Accepted interaction refinement from manual full-run validation  
**Related:** [Primary Operational View](primary-operational-view.md), [Operational Timeline / Live Activity](operational-timeline.md)

## Context

Manual validation of the completed Scenario 01 runtime exposed an information-architecture overlap in the primary operational workspace.

The initial implementation populated each entity tile with the three newest Observations for that entity. The Selected entity panel then showed the same entity's Observation history in a longer newest-first list.

This made the two surfaces semantically similar:

- entity tile — shortened recent Observation history;
- Selected entity — expanded recent Observation history.

That behavior conflicted with the intended role of entity tiles in the Primary Operational View, which describes them as a compact representation of **current entity state** with stable key values.

It also duplicated the role of Live Activity, whose explicit purpose is to answer **what just changed?**

## Decision

The operational workspace separates four information roles explicitly:

| Surface | Primary question |
|---|---|
| Entity tile | What is the entity's state now? |
| Selected entity | What do we currently know about this entity? |
| Live Activity | What changed and when? |
| Assessment / Projection | What does VECTOR OPS believe the state means, and what may happen next? |

### Entity tiles

Each Scenario 01 entity receives a stable presentation schema. The labels and order of tile metrics do not change when new Observations arrive. Only the current values and their data condition change.

This supports spatial memory: an operator can repeatedly look to the same location for the same operational quantity rather than scanning a changing list of recently updated metrics.

A configured slot remains visible when no Observation exists yet and displays `—` rather than disappearing.

Current Scenario 01 tile schemas:

- **GPZ Brzeziny:** Supply, Feeder F-12, Load;
- **SUW Kępa:** Output pressure, Reservoir, Pump 1, Pump 2, Telemetry;
- **Regional Communications Gateway R-4:** Power mode, Link quality, Packet loss;
- **County Hospital Nowy Brzeg:** Essential services, Water margin, Continuity request, Contingency preparation;
- **Mobile Generator AG-400:** Resource state, Assignment, Travel time;
- **Technical Access Route Z-17:** Route state, Travel time.

The schema is scenario configuration, not hard-coded rendering logic. A metric may resolve a nested value from a structured Observation, such as `Pump 1` and `Pump 2` from `water.pumpState`.

### Selected entity

Selected entity becomes a present-state inspection surface rather than a second timeline.

It contains:

1. **Current state** — a broader stable metric set than the entity tile;
2. **Data** — latest update time, latest source and confidence;
3. **Dependencies** — registered operational dependencies involving the entity or its capabilities;
4. **Recent activity** — a short supporting list of recent Observations.

Recent activity remains deliberately secondary. Complete cross-domain chronology belongs to Live Activity during the run and to the After-Action Report after completion.

### Freshness and missing data

A displayed value must preserve its relationship to Observation time and quality.

The tile continues to expose aggregate data condition separately from operational status. Selected entity shows the received time for each current metric where available.

A missing Observation is represented explicitly as `— / No observation yet`; absence of data is not treated as a current normal state.

## Non-goals

This refinement does not change:

- scenario rules or event timing;
- entity domain state;
- Decision gates or Decision Focus Mode;
- Assessment / Projection generation;
- Live Activity chronology;
- AAR reconstruction;
- operational severity rules.

It is a presentation and inspection refinement over the existing runtime state.

## Acceptance criteria

- tile labels and order remain stable while runtime events change values;
- SUW pump states can update independently in fixed tile slots;
- missing configured metrics remain visible as unknown rather than disappearing;
- Selected entity presents current state before recent activity;
- Selected entity exposes data provenance and registered dependencies;
- Live Activity remains the primary answer to `what changed?`;
- selecting an entity-linked Live Activity entry still changes Selected entity context without altering runtime state;
- no scenario consequence rule is introduced into a visual component.

## Validation note

This refinement originated from manual full-run review after Scenario 01, handover and the alpha After-Action Report were functional. The finding is therefore treated as implementation feedback from working software rather than a speculative pre-build requirement.
