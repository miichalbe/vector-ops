# VECTOR OPS — Decision 3 downstream / completion contract

**Status:** Accepted implementation contract  
**Date:** 24 September 2026  
**Scenario:** Scenario 01 — Infrastructure disruption, Mazowieckie Voivodeship

## Purpose

This contract defines the final live-scenario phase after Decision 3 and before the After-Action Report.

Decision 3 changes coordination posture, information flow and organisational readiness. It does not magically repair infrastructure or overwrite the physical consequences already established by Decision 2.

The shared sequence is:

```text
Decision 3 recorded
→ coordination / confirmation response
→ final observed effects
→ stabilisation or controlled deterioration
→ operational handover
→ completion rule satisfied
→ runtime status = completed
→ After-Action Report
```

Times below are relative to `Decision 3.decidedAt` and may be tuned later for pacing. The structural sequence and authority boundary are fixed.

## Shared principles

1. D3 changes coordination posture rather than physical infrastructure state.
2. Physical and service conditions at the end of the run remain primarily consequences of D2 and the persistent F-12 outage.
3. No D3 option is labelled correct or produces a hidden success state.
4. Actions outside the WCZK duty officer's authority remain notifications, requests, recommendations or coordination actions.
5. The final phase may stabilise risk, improve preparedness or reduce uncertainty without returning every entity to Normal.
6. Unresolved items remain visible and are explicitly transferred into handover and the After-Action Report.
7. The run completes only after a factual handover checkpoint, not immediately after D3 selection.

## D3-A — Targeted notification and contingency preparation

### Intended effect

Increase readiness among directly affected organisations without activating broader voivodeship-level coordination.

### Flow

- **T+0** — decision recorded.
- **T+1–2 min** — targeted notifications and contingency-preparation requests are issued to the affected organisations.
- **T+4–6 min** — acknowledgements arrive; County Hospital Nowy Brzeg confirms local contingency preparation is active while essential services remain maintained.
- Current infrastructure mitigations continue unchanged.
- No regional coordination package is activated.

### Observed effect

- directly affected organisations have a shared operational picture;
- local contingency preparation is confirmed;
- hospital readiness improves without implying patient harm or service failure;
- broader coordination capacity remains unactivated.

### Final posture

This path may be operationally sufficient when current mitigations hold, but it leaves less organisational headroom if the disruption widens after handover.

## D3-B — Recommend voivodeship-level coordination

### Intended effect

Escalate a broader coordination package to the responsible authority and increase regional awareness / response readiness.

### Flow

- **T+0** — decision recorded.
- **T+1 min** — the coordination recommendation is formally requested / escalated.
- **T+3–5 min** — the responsible authority acknowledges and accepts the recommendation.
- **T+6–8 min** — the broader coordination package becomes active and relevant organisations receive the updated common picture.
- Infrastructure operators retain operational control; no additional physical resource is invented solely because coordination broadens.

### Observed effect

- wider organisational awareness is confirmed;
- access to regional coordination capacity improves;
- coordination load increases;
- physical service state remains dependent on existing mitigations and unresolved restoration work.

### Final posture

The run ends with stronger organisational coordination but not necessarily better infrastructure state.

## D3-C — Continue operator-level coordination while seeking confirmation

### Intended effect

Maintain the current coordination level while reducing uncertainty through additional operational confirmation.

### Flow

- **T+0** — decision recorded.
- **T+2–4 min** — additional confirmation is requested from relevant operator channels.
- **T+5–7 min** — a new field/operator update arrives.
- The update improves confidence in the current restoration / service picture but does not resolve F-12 or create a new generator allocation decision.
- Broader coordination remains deferred.

### Observed effect

- uncertainty reduces;
- the current operator-level coordination picture becomes better supported;
- broader coordination remains unactivated;
- physical/service margins continue according to the D2 path.

### Final posture

This path preserves a narrower coordination footprint and gains information, but hands over a situation with less regional coordination already in motion.

## D2 state remains visible through the final phase

Decision 3 does not erase the D2 trade-off.

Representative final service states remain:

- **D2-A — AG-400 at SUW:** water-service margin stabilising; R-4 primary communications poor/degraded with fallback/manual coordination still relevant.
- **D2-B — AG-400 at R-4:** communications and remote visibility stabilising; SUW remains on reduced pumping with declining water-service margin.
- **D2-C — wait:** no AG-400 deployment; restoration information is better but both communications and water-service margins have consumed time.

The exact final handover must be derived from runtime observations, not from the D3 label alone.

## Shared resolution checkpoint

After the selected D3 path has produced at least one observed downstream effect, the scenario progresses to a shared resolution checkpoint.

The checkpoint should occur roughly **T+12–16 min** after D3, subject to bounded information delay.

At the checkpoint:

- County Hospital essential services remain factually reported as maintained unless later evidence says otherwise;
- F-12 may remain isolated / under field investigation;
- existing D2 mitigation state is preserved;
- current communications / water limitations remain visible;
- unresolved items are collected for handover;
- no success/failure verdict is generated.

## Operational handover

The final live event is an explicit handover record.

Representative transition copy:

> Operational phase complete. Current mitigations and unresolved dependencies are prepared for handover.

The handover record should include factual runtime-derived items such as:

- current F-12 restoration status;
- current AG-400 assignment / lifecycle;
- current SUW service-margin posture;
- current R-4 communications / visibility posture;
- hospital essential-service posture and contingency readiness;
- Z-17 access restriction where still relevant;
- current coordination posture;
- unresolved confirmations or restoration work.

The handover is not a claim that the incident is resolved.

## Completion rule

Scenario 01 completes only when all of the following are true:

```text
D1 recorded
AND D2 recorded
AND D3 recorded
AND selected D3 downstream response observed
AND operational handover event processed
```

The runtime then transitions to:

```text
status = completed
phase = resolution
```

Scenario time must no longer advance after completion.

A generic core completion-rule mechanism should perform this transition rather than presentation code or a Scenario 01 component directly mutating runtime status.

## Timeline requirements

Live Activity should surface the final phase selectively:

- material D3 acknowledgement / coordination response;
- material additional confirmation for D3-C;
- operational handover;
- not every low-level notification delivery event.

The final handover entry should make it obvious that the live operational phase has ended without presenting a success banner.

## Testing expectations

Tests should demonstrate that:

- each D3 option produces a distinct coordination/information state;
- D3 does not rewrite the D2 physical/service outcome;
- external-authority D3-B uses an explicit request/accept/complete lifecycle;
- D3-C produces real information value without opening a fourth decision;
- no branch completes immediately on D3 selection;
- all branches reach a shared handover event;
- completion requires D1, D2, D3 and handover;
- completed runtime no longer advances scenario time;
- final unresolved items remain represented for later AAR use.
