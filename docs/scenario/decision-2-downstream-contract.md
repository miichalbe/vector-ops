# VECTOR OPS — Decision 2 downstream / Act 3 contract

**Status:** Accepted implementation contract  
**Date:** 24 September 2026  
**Scenario:** Scenario 01 — Infrastructure disruption, Mazowieckie Voivodeship

## Purpose

This contract defines what happens after Decision 2 and before Decision 3.

The operator's D2 choice changes which operational margin is protected, what risk is displaced and how the next phase is observed. It does not create three unrelated narratives. All valid runs reconverge at the County Hospital report and the Decision 3 coordination gate.

The causal sequence remains:

```text
Decision 2 recorded
→ external response
→ AG-400 / restoration-information progression
→ observed downstream effects
→ revised Assessment / Projection state
→ County Hospital human report
→ Decision 3 — coordination posture
```

Times below are relative to `Decision 2.decidedAt` and may later be tuned for pacing. Profile parameters may adjust response, preparation, travel and information delay without changing the structural sequence.

## Shared principles

1. A WCZK duty operator recommends or requests; they do not directly command infrastructure operators.
2. A generator recommendation does not teleport AG-400. Deployment is represented through explicit lifecycle observations and external response events.
3. Expected effects exist at decision time; observed effects are recorded only when scenario events actually occur.
4. Route Z-17 affects travel time after a deployment recommendation and is a second-order consequence, not presentation decoration.
5. D2-C must provide a genuine information benefit for waiting, but it must not create a hidden fourth decision or reopen D2.
6. The County Hospital is represented through human reports, not invented live building telemetry.
7. No D2 choice is labelled correct. Seed/profile conditions may change the relative cost of each option.

## D2-A — Recommend AG-400 for SUW Kępa

### Intended operational effect

Protect physical water-service margin while accepting continued communications / visibility risk.

### Flow

- **T+0** — recommendation recorded.
- **T+3–5 min** — external operator accepts the recommendation. Earlier D1 regional awareness may reduce this response delay within a bounded range.
- AG-400 progresses from `Available` to `Reserved` and `Preparing`.
- **T+7–10 min** — AG-400 becomes `En route` to SUW Kępa.
- Current Z-17 restriction is applied to the deployment ETA; access-constrained profiles increase the delay.
- While AG-400 travels, R-4 remains on finite backup and communications quality continues to deteriorate.
- **T+16–20 min** — AG-400 reaches SUW Kępa and progresses through `On site` / `Connecting`.
- **T+22–25 min** — AG-400 becomes `Operational` at SUW Kępa.

### Observed effects

- pumping capacity stabilises or partially recovers;
- water-service margin stops deteriorating as quickly;
- water-service Projection P-03 may soften / revise;
- R-4 continuity risk remains and P-01/P-02 may worsen.

### Resulting trade-off

The run protects physical water continuity at the cost of information and communications margin.

## D2-B — Recommend AG-400 for R-4

### Intended operational effect

Protect communications continuity and operational visibility while accepting continued water-service deterioration.

### Flow

- **T+0** — recommendation recorded.
- **T+3–5 min** — external operator accepts the recommendation.
- AG-400 progresses from `Available` to `Reserved` and `Preparing`.
- **T+7–10 min** — AG-400 becomes `En route` to R-4.
- Current Z-17 restriction is applied to deployment ETA.
- While AG-400 travels, SUW remains on reduced pumping and water-service margin continues to decline.
- **T+16–20 min** — AG-400 reaches R-4 and progresses through `On site` / `Connecting`.
- **T+22–25 min** — AG-400 becomes `Operational` at R-4.

### Observed effects

- R-4 backup/endurance risk stabilises;
- communications quality stabilises or partially improves;
- SUW telemetry freshness / remote visibility improves;
- P-01 and P-02 may soften / resolve;
- reduced pumping persists and P-03 becomes more operationally important.

### Resulting trade-off

The run protects information and coordination continuity at the cost of water-service margin.

## D2-C — Wait briefly for firmer grid-restoration information

### Intended operational effect

Preserve AG-400 flexibility and gain better restoration information before committing the resource.

### Flow

- **T+0** — wait decision recorded.
- AG-400 remains `Available`; it is not implicitly reserved.
- **T+4–7 min** — GPZ field / operator update arrives.
- The update improves the restoration horizon information but does not resolve the feeder outage. Representative result: field inspection is underway and the earliest credible restoration window is now known as a bounded range, or restoration remains uncertain beyond the immediate decision window.
- No second generator allocation decision opens. D2 remains recorded.
- R-4 continues consuming finite backup margin.
- SUW continues reduced pumping.
- Z-17 restrictions continue to make any later deployment slower.

### Observed effects

- knowledge about restoration timing improves;
- resource flexibility is preserved;
- no service receives AG-400 protection during the run's D2 window;
- time margin is consumed on both communications and water-service sides.

### Resulting trade-off

Waiting produces real information value but carries an observable opportunity cost. The cost is especially material when access is constrained or service/resource margins are weak.

## Shared County Hospital beat

After the material downstream effects of D2 are visible, all three paths reconverge on a human report from County Hospital Nowy Brzeg.

Representative report:

> Essential services currently maintained. Requesting confirmation of expected water and communications continuity.

This report must:

- remain a human operational report rather than direct telemetry;
- avoid unsupported patient-harm or emergency claims;
- make the downstream service recipient explicit;
- increase the operational relevance of current water / communications Projections;
- provide evidence for the later coordination decision.

The context differs by D2 choice:

- **D2-A:** water continuity is better supported while communications / visibility remain degraded;
- **D2-B:** communications / visibility are better supported while water-service margin continues to fall;
- **D2-C:** neither side has received generator support; restoration knowledge is better, but both service margins have consumed time.

## Decision 3 readiness

Decision 3 should open only after:

- D2 is recorded;
- at least one material downstream effect of D2 has been observed;
- persistent cross-domain disruption remains active;
- the County Hospital report has arrived;
- enough current evidence exists to compare coordination postures honestly.

Decision 3 remains:

> Persistent infrastructure disruption now affects multiple services. What coordination posture should be recommended?

with the three accepted options:

1. Targeted notification and contingency preparation.
2. Recommend voivodeship-level coordination.
3. Continue operator-level coordination while seeking confirmation.

## Reconvergence rule

All D2 paths reconverge structurally at D3. They may arrive with different:

- service margins,
- communications quality,
- telemetry freshness,
- restoration knowledge,
- AG-400 lifecycle / assignment state,
- coordination readiness,
- current Assessment / Projection revisions.

They must not skip D3 or create a hidden preferred narrative.

## Testing expectations

Tests should demonstrate that:

- each D2 option produces a distinct downstream state;
- A/B use explicit external response and AG-400 lifecycle progression;
- C produces improved restoration information without reopening D2;
- route/profile parameters affect deployment timing where relevant;
- the hospital beat occurs for all three paths;
- D3 cannot open before the hospital beat and material downstream evidence;
- all three paths can reach the same generic D3 gate.
