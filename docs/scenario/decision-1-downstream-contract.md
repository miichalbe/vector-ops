# VECTOR OPS — Decision 1 Downstream Contract

**Version:** 0.1  
**Date:** 24 September 2026  
**Status:** Accepted Scenario 01 implementation contract  
**Related artifacts:** [Primary Operator Flow](../design/primary-operator-flow.md), [Action Review Pattern](../design/action-review-pattern.md), [Decision Log](../decisions/decision-log.md)

---

## 1. Purpose

This document defines what happens after Decision 1 in Scenario 01.

Decision 1 changes the operator's **information and coordination posture**. It does not create three separate physical narratives and it does not directly change whether the underlying infrastructure disruption occurs.

The accepted model is:

```text
same physical world
+ different information timing
+ different confidence support
+ different regional awareness
+ different coordination load
```

The three Decision 1 options therefore create three different operational knowledge states that later reconverge on the same Act 2 physical spine and the same Decision 2 gate.

This contract exists to keep Scenario 01 deterministic, auditable and reusable without turning operator choices into arbitrary narrative branches.

---

## 2. Decision 1 completion semantics

Decision 1 is blocking only while the operator is in Decision Focus Mode.

The accepted sequence is:

```text
Decision Focus Mode
→ operator selects Action
→ Confirm selection
→ Decision and selected Action are recorded
→ runtime returns to running
→ Action recorded receipt may remain visible
→ scenario continues regardless of whether the operator dismisses the receipt
```

The receipt is confirmation of an already recorded decision. It is not another blocking state and the `Continue` control must not gate scenario time.

---

## 3. Reference timing model

Post-D1 timings are defined relative to the scenario time at which Decision 1 is confirmed.

Use:

```text
T0 = Decision 1 decidedAt
```

For the current `8F4C` reference run, T0 is expected around 07:49–07:53 depending on the exact opening progression and operator reading time. The implementation must use `decidedAt` rather than assume a fixed absolute clock time.

Target Act 2 timing relative to T0:

| Relative time | Reference purpose | Shared physical event |
|---:|---|---|
| T0 | Decision 1 confirmed | runtime resumes |
| T0 + 11 min | ~08:00 reference beat | F-12 trips and remains isolated |
| T0 + 16 min | ~08:05 reference beat | R-4 transitions to backup power |
| T0 + 21 min | ~08:10 reference beat | Z-17 becomes Restricted |
| T0 + 23 min | ~08:12 reference beat | SUW Kępa enters reduced pumping |
| T0 + 25 min | ~08:14 reference beat | R-4 degradation reduces freshness / reliability of SUW visibility |
| T0 + 29 min | ~08:18 reference beat | resource conflict is mature enough for Decision 2 |

These are deterministic alpha values for the current reference flow. Later scenario-profile work may apply bounded modifiers where already supported by the run configuration, but Decision 1 itself must not arbitrarily move the shared physical events.

---

## 4. Shared physical Act 2 spine

All three Decision 1 outcomes converge on the same physical sequence:

```text
F-12 persistent trip
→ GPZ feeder isolated
→ R-4 on backup power
→ communications degradation continues
→ Z-17 restricted
→ SUW reduced pumping
→ operational visibility degrades
→ revised Assessment / Projection state
→ Decision 2 — generator recommendation
```

Decision 1 must not:

- prevent the F-12 persistent trip,
- cause the F-12 persistent trip,
- create a different infrastructure failure for each option,
- teleport resources or complete external actions,
- turn a recommendation into an accepted external response,
- hide evidence required to make Decision 2 defensible.

The purpose of Decision 1 is to change **how early and how confidently the operator understands the developing shared situation**, and who else has already been brought into the coordination chain.

---

## 5. Downstream modifier model

The implementation should map the selected Decision 1 Action to one deterministic set of downstream modifiers.

```ts
interface Decision1DownstreamModifiers {
  confirmationBehaviour:
    | "synchronised"
    | "organic";
  confirmationDelayDeltaMinutes: number;
  confidenceSupport:
    | "none"
    | "moderate";
  regionalAwareness:
    | "normal"
    | "early";
  coordinationLoad:
    | "normal"
    | "increased";
}
```

The current alpha mapping is:

| Decision 1 Action | Confirmation | Confidence support | Regional awareness | Coordination load |
|---|---|---|---|---|
| D1-A — Open cross-domain incident and request synchronised confirmation | earlier / synchronised | moderate | normal | increased |
| D1-B — Continue separate monitoring | later / organic | none | normal | normal |
| D1-C — Recommend early regional escalation with stated uncertainty | normal confirmation timing | none | early | increased |

The mapping is deterministic and auditable. It should be derived from the recorded selected Action rather than stored as unrelated UI state.

---

## 6. D1-A — Open cross-domain incident and request synchronised confirmation

### Operator intent

Spend a small amount of coordination capacity now in exchange for faster cross-domain confirmation.

### Immediate downstream state

At T0:

- the selected Action is recorded;
- a synchronised confirmation request is considered active across the relevant GPZ, SUW and R-4 operational channels;
- coordination load becomes `increased`;
- regional awareness remains unchanged.

### Information consequence

Target confirmation beat:

```text
T0 + 4 min
```

The operator receives a coordinated confirmation package indicating that the local conditions reported by GPZ, SUW and R-4 are real and contemporaneous enough to be treated as one active cross-domain investigation.

This confirmation does **not** prove a shared physical cause or persistence by itself.

Representative system wording:

> Cross-domain confirmation received. GPZ, SUW and R-4 have confirmed the reported local conditions through their operational channels.

### Assessment effect

Before the persistent feeder trip, the confirmation may support an earlier A-01 revision by:

- reducing the chance that the opening picture is a telemetry artefact;
- providing `moderate` confidence support;
- keeping the persistence assumption unverified until later physical evidence arrives.

When F-12 later trips and remains isolated, the existing synchronised channel makes the developing cross-domain interpretation easier to confirm promptly.

### Trade-off

Benefit:

- earlier coherent operational picture;
- earlier confidence support.

Cost:

- increased coordination load while persistence is still partly uncertain.

---

## 7. D1-B — Continue separate monitoring

### Operator intent

Avoid additional coordination overhead until stronger evidence appears.

### Immediate downstream state

At T0:

- the selected Action is recorded;
- no synchronised confirmation request is opened;
- coordination load remains `normal`;
- regional awareness remains unchanged;
- no artificial confirmation event is generated merely because the operator selected this option.

### Information consequence

Evidence continues to arrive through the existing separate operational channels.

The physical F-12 trip at T0 + 11 min produces a strong local GPZ fact, but the operator does not receive a preassembled cross-domain confirmation package.

R-4 backup transition and later SUW reduced pumping progressively strengthen the correlation.

The same broad understanding is therefore reachable, but later and through accumulated evidence rather than an earlier synchronised confirmation.

### Assessment effect

A-01 may revise after the persistent feeder trip, but confidence support from coordination remains `none`.

Confidence should increase only when the later observations themselves justify it.

### Trade-off

Benefit:

- no additional coordination burden at the uncertain opening stage.

Cost:

- uncertainty persists longer;
- cross-domain correlation relies on later, less contemporaneous evidence.

This option must remain operationally defensible and must not be treated as a hidden wrong answer.

---

## 8. D1-C — Recommend early regional escalation with stated uncertainty

### Operator intent

Bring the wider coordination chain into awareness before persistence is fully confirmed.

### Authority boundary

The WCZK duty officer records and sends a **recommendation**. The selected Action does not itself create regional acceptance, activation or command authority.

External acknowledgement or acceptance must remain a separate event / Action lifecycle transition.

### Immediate downstream state

At T0:

- the recommendation is recorded;
- regional awareness is marked `early`;
- coordination load becomes `increased`;
- physical confirmation timing is not automatically accelerated.

Target acknowledgement beat:

```text
T0 + 3 min
```

Representative system wording:

> Regional coordination recommendation acknowledged. Wider coordination has been notified; operational confirmation remains pending.

Acknowledgement means that the wider coordination chain is aware of the possible disruption. It does **not** increase the confidence of A-01 by itself and it does not prove the disruption's persistence.

### Later consequence

When F-12 later trips and subsequent downstream effects appear, the wider coordination chain does not need to be introduced to the situation from zero.

The principal benefit of D1-C should become more visible in later external-response timing, especially after Decision 2, when early awareness may reduce organisational response latency.

### Trade-off

Benefit:

- earlier regional awareness;
- potential reduction in later organisational response latency.

Cost:

- increased coordination load;
- escalation activity begins before persistence is confirmed;
- the recommendation may later prove unnecessary.

---

## 9. Reconvergence before Decision 2

The three Decision 1 choices do not create three different Decision 2 timings in the current alpha.

All paths reconverge on a common resource-conflict gate around:

```text
T0 + 29 min
```

By this point all valid paths must provide enough visible evidence for the operator to understand:

- F-12 remains isolated;
- SUW Kępa has reduced pumping capacity;
- R-4 is operating on finite backup power with degrading communications;
- Z-17 restriction affects intervention / deployment time;
- AG-400 remains one compatible resource with competing plausible uses.

The operator may reach this point with a different knowledge history, confidence trajectory and coordination state, but Decision 2 remains the same bounded resource-allocation question.

---

## 10. UI / observability requirement

The Decision 1 consequences must be visible in the operational experience rather than exist only as hidden runtime flags.

At minimum, the live run should expose material information-state changes through normal operational evidence / events, for example:

- D1-A: `Cross-domain confirmation received`;
- D1-B: no equivalent synthetic confirmation; later facts accumulate separately;
- D1-C: `Regional coordination recommendation acknowledged`.

The UI must distinguish:

- a physical fact,
- a received report,
- a coordination acknowledgement,
- an Assessment confidence change,
- an external Action acceptance.

These must not be collapsed into a generic success notification.

---

## 11. Audit and AAR requirements

The append-only history must allow reconstruction of:

1. what evidence existed when D1 opened;
2. which Action was selected;
3. which downstream modifier set applied;
4. which confirmation / acknowledgement events followed;
5. when the shared physical Act 2 events occurred;
6. how A-01 / P-01 revisions changed afterward;
7. what the operator knew when D2 opened.

The After-Action Report may compare timing or knowledge-state consequences between D1 choices, but it must not label one choice as universally correct.

---

## 12. Implementation sequence

Implement this contract in two separate steps:

1. **Model Decision 1 downstream outcomes**
   - deterministic Action → modifier mapping;
   - tests for all three D1 Actions;
   - no UI-specific state.

2. **Add Scenario 01 Act 2 events**
   - decision-relative scenario events;
   - D1-specific confirmation / awareness events;
   - shared F-12, R-4, Z-17 and SUW progression;
   - events remain deterministic from run config + recorded Decision.

Assessment / Projection revisions should consume these resulting observations and coordination facts in subsequent implementation work rather than being hard-coded into presentation components.
