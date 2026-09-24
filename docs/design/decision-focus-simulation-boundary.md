# VECTOR OPS — Decision Focus simulation boundary

**Date:** 24 September 2026  
**Status:** Accepted VS1/public-alpha interaction boundary  
**Related artifacts:** [Action Review Pattern](action-review-pattern.md), [Primary Operator Flow](primary-operator-flow.md), [UX Requirements](ux-requirements.md)

## Purpose

This note records an explicit distinction exposed by manual end-to-end validation of Scenario 01: the way Decision Focus Mode is entered in the guided public simulation is not automatically the preferred behaviour for a real operational deployment.

## VS1 / public-simulation behaviour

For the current public alpha, a blocking Decision gate automatically opens Decision Focus Mode.

This behaviour is deliberate because the simulation must reliably demonstrate the core VECTOR OPS reasoning loop:

```text
state
→ dependency
→ projected consequence
→ options
→ expected effects
→ operator decision
→ observed downstream effects
```

Automatic entry ensures that:

- the user does not miss one of the three required Scenario 01 Decisions;
- scenario time pauses at the intended decision point;
- the Action Review pattern is experienced in every representative run;
- the public simulation remains understandable without prior product training.

This is therefore a **simulation-specific presentation decision**, not evidence that a production system should automatically take over the operator's workspace whenever a Decision becomes available.

## Target-product hypothesis

For a real operational deployment, the preferred hypothesis is:

```text
Decision threshold reached
→ high-priority but non-destructive attention state
→ operator consciously opens the Decision
→ Decision Focus Mode
```

The system should make a consequential Decision difficult to miss without assuming that the recommendation is automatically the operator's next task.

Potential attention mechanisms include:

- a prominent `Decision required` state;
- an attention queue / Notifications surface;
- persistent but bounded visual treatment;
- deadline or consequence cues where supported by evidence;
- explicit operator entry into Decision Focus Mode.

Automatic full-workspace takeover should be reserved, if used at all, for narrowly defined conditions where interruption is justified by time-critical consequence and validated operational practice.

## Why the distinction matters

Automatic takeover can create avoidable interruption and may strengthen automation bias by implying that the system-selected moment necessarily deserves immediate action.

The target product should preserve operator agency:

- VECTOR OPS identifies the decision state and explains why it matters;
- the operator controls when to enter focused review unless the operational contract explicitly requires otherwise;
- recording the Decision remains a conscious operator act.

This hypothesis requires validation with representative operators. VS1 does not attempt to solve the full notification, prioritisation, deferral or multi-Decision problem.

## Current implementation decision

No runtime/UI change is required for the public alpha at this stage.

Scenario 01 continues to auto-open the one blocking Decision at a time. Public-facing or case-study documentation should describe this as a guided-simulation mechanism and distinguish it from the target-product hypothesis above.
