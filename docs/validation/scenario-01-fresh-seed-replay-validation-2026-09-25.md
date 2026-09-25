# VECTOR OPS — Scenario 01 Fresh-Seed and Replay Validation

**Date:** 25 September 2026  
**Branch:** `build/vertical-slice`  
**Scenario:** Scenario 01 — Infrastructure disruption, Mazowieckie Voivodeship  
**Status:** Automated coverage passed; Replay and New run manually confirmed

## Purpose

This validation checkpoint verifies that Scenario 01 is no longer dependent on the documented reference seed `8F4C` and that a run can be reconstructed deterministically from its seed.

The goal is not to prove every possible seed / Decision combination exhaustively. The validation combines two complementary forms of coverage:

- **Decision-path depth:** the existing fixed-seed runtime audit covers all 27 D1 × D2 × D3 Action combinations for the documented `8F4C` run.
- **Run-configuration breadth:** the fresh-seed regression covers all three opening variants across all four dominant condition profiles through the complete D1 → D2 → D3 → handover → completion runtime.

Together these checks provide broader confidence without creating an unnecessarily large Cartesian test matrix.

## Implementation under validation

Scenario 01 now exposes a run factory:

```text
seed
→ resolved ScenarioRunConfig
→ initial runtime state
→ seed-dependent opening events
→ ScenarioRuntimeDefinition
```

The same seed therefore recreates the same opening variant, condition profiles, run parameters and opening event definitions.

The application run lifecycle is now:

```text
run
→ Decisions and downstream consequences
→ operational handover
→ completed
→ After-Action Report
→ Replay same seed OR New run
```

`Replay same seed` reconstructs the run from the recorded seed rather than mutating the completed state back toward a baseline.

`New run` generates a new hexadecimal seed and creates a new Scenario 01 run through the same factory.

## Automated coverage

### Run factory

The run-factory tests verify that:

- the same seed resolves to the same run configuration;
- the same seed creates equivalent initial state and opening events;
- separate factory calls return separate runtime objects rather than sharing mutable state;
- opening events are bound to the opening variant resolved for that run;
- the documented default seed `8F4C` remains compatible with the previous reference configuration.

### Fresh-seed runtime matrix

The fresh-seed end-to-end regression exercises a deterministic matrix of **12 run configurations**:

```text
3 opening variants × 4 dominant condition profiles
```

Opening variants:

- `power-first`
- `communications-first`
- `water-first`

Dominant profiles:

- `communications-fragile`
- `access-constrained`
- `resource-constrained`
- `low-confidence-data`

Each matrix case is advanced minute-by-minute through the full Scenario 01 runtime using a representative D1 / D2 / D3 Action path. Every case must reach:

```text
baseline
→ detection
→ dependency
→ escalation
→ resolution
→ operational handover
→ completed
```

The regression also verifies that each completed run records all three Decisions, completes the selected Actions, expires unselected alternatives and emits the final handover / completion events.

### Same-seed deterministic replay

A dedicated regression runs the same seed twice with the same operator Decisions and requires equivalent final runtime history and state.

This checks deterministic reconstruction beyond the initial configuration: identical seed + identical Decisions must produce the same scenario progression.

## Manual validation

### Replay same seed

On 25 September 2026 the completed reference run with seed `8F4C` was manually replayed from its After-Action Report.

Observed behaviour:

- `Replay same seed` dismissed the AAR;
- scenario time returned to `07:40`;
- the operational picture returned to the baseline state;
- the displayed seed remained `8F4C`;
- the scenario resumed from the beginning rather than continuing the completed state.

This confirms the user-facing same-seed replay lifecycle for the reference run.

### New run

The `New run` path was also manually exercised from the AAR on 25 September 2026.

Observed behaviour:

- the completed AAR was exited into a fresh runtime;
- the displayed seed changed from the completed run seed;
- the new run started from the scenario baseline rather than inheriting completed state;
- the fresh run used the same Scenario 01 run factory rather than a duplicated branch-specific bootstrap.

This confirms the public-facing fresh-run lifecycle at the UI level.

### Status-language semantic review

Manual review also identified two operator-facing labels that implied stronger semantics than the implementation supported:

- `Modules: 4 active` suggested live runtime module-health reporting even though the alpha currently exposes four configured operational domains rather than a health-checked module registry;
- entity badge `ACTION` could be interpreted as a directly executable domain `Action`, even though the badge represented attention level derived from an active Assessment or Projection.

The UI was refined to:

- `Operational domains: 4`, with Power, Water, Communications and Critical Services & Response exposed as supporting context;
- `URGENT` for the highest entity attention state, preserving `Action` as the domain term for an operator-reviewable operational step inside Decision Focus Mode.

The resulting semantics were manually reviewed and accepted.

## Verification gate

After the fresh-seed regression, run-lifecycle integration and status-language refinement, the local developer verification gate was reported green for:

```text
npm test
npm run check
npm run build
```

No failing automated test, Astro diagnostic or production-build error was reported at this checkpoint.

## Coverage boundaries

This checkpoint intentionally does **not** claim exhaustive coverage of every seed combined with every D1 × D2 × D3 Action path.

Current coverage is deliberately layered:

- all 27 Decision combinations: fixed reference seed `8F4C`;
- all opening variants × dominant profiles: representative complete Decision path;
- same-seed replay: automated deterministic comparison plus manual reference-run replay;
- fresh-run lifecycle: manual New run confirmation.

The following remain before public deployment:

- manual execution of representative fresh-seed runs, including visible differences between opening variants;
- final keyboard / focus / acknowledgement / Timeline / AAR regression on the public-demo build;
- minimal synthetic-data / non-live onboarding disclosure;
- production deployment and post-deploy fresh-seed smoke tests.

## Conclusion

Scenario 01 is no longer structurally tied to one fixed opening. The current implementation supports reproducible seeded runs, same-seed replay and bounded fresh-run variation through one runtime architecture.

The validation strategy now covers both dimensions relevant to the public alpha:

```text
Decision-path depth
+
run-configuration breadth
```

This is sufficient to move from runtime implementation toward final manual public-demo validation and deployment preparation without claiming exhaustive scenario-space coverage.
