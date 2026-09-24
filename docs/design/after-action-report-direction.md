# VECTOR OPS — After-Action Report direction

**Status:** Product direction; implementation deferred until Scenario 01 completion  
**Date:** 24 September 2026

## Purpose

The After-Action Report is not only an end screen. It should reconstruct the run in a way that is useful to the operator and also reveal enough of VECTOR OPS' internal reasoning model to explain what the system was doing during the scenario.

## Alpha requirements

The first report should serve two roles.

### 1. Reconstruct the run

Show the operational progression clearly:

```text
state
→ incoming observations
→ Assessment / Projection changes
→ operator decisions
→ expected effects
→ observed consequences
→ final state / unresolved items
```

The report should make it possible to understand the run without remembering every live-screen detail.

Minimum content remains aligned with the Primary Operator Flow contract:

- scenario version and seed;
- opening variant and condition profiles;
- chronological material event timeline;
- D1, D2 and D3 with the evidence / unknowns available at the time;
- selected Actions and their expected effects;
- observed downstream effects;
- relevant Assessment / Projection revisions;
- initial vs final entity state;
- unresolved items and handover.

The report must distinguish contemporaneous knowledge from hindsight and must not score the operator or label choices as good/bad.

### 2. Reveal selected "behind the scenes" mechanics

The report should deliberately expose a small amount of implementation / model context that was hidden during live operation. This is both explanatory and product-demonstration material.

Useful examples include:

- which opening variant was selected;
- dominant and secondary condition profiles;
- how the seed affected bounded timings / constraints;
- which dependencies connected the relevant entities;
- which evidence caused an Assessment or Projection to revise;
- where a decision changed information timing, coordination state or resource allocation;
- expected effect versus what was actually observed.

This must not become a developer debug dump. The goal is to make the system's causal model inspectable and to demonstrate the product hypothesis:

> state → dependency → projected consequence → options → expected effects → operator decision → observed effects

## Later distribution capabilities

After the basic in-browser report is stable, the report should be designed so that it can support:

1. **PDF export** — a portable snapshot suitable for portfolio / review / handover use.
2. **Easy sharing** — a straightforward way to share a completed run/report without requiring another person to reproduce the live session.

The exact sharing mechanism is intentionally not chosen yet. It may later be a downloadable artifact, shareable URL, encoded run record or another approach consistent with the no-backend / static-alpha architecture.

PDF export and sharing are future capabilities and do not block Act 3 implementation. Whether PDF export is required before the first public alpha should be decided when AAR implementation begins, based on remaining scope and deployment architecture.

## Presentation principle

The report should feel like an operational reconstruction plus an explanation of VECTOR OPS, not a game results screen.

Avoid:

- scores;
- grades;
- winners / losers;
- success/failure verdicts;
- celebratory language;
- hindsight-based judgement of operator competence.

Prefer factual comparison, causal traceability and explicit uncertainty.
