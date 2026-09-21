# VECTOR OPS — Decision Log

This document records product decisions made during discovery so that future changes can be understood in context.

## 21 September 2026 — v0.1

### D1 — Product scope
**Decision:** Build a modular operations system rather than a single-purpose drone interface.

**Reasoning:** The strongest concept is not fleet control itself, but coordination across multiple operational domains.

### D2 — Relationship to tactical-awareness systems
**Decision:** Do not attempt to compete with TAK / ATAK on situational awareness alone.

**Reasoning:** Shared maps, positions and tactical awareness already exist in mature systems.

### D3 — Differentiator hypothesis
**Decision:** Use cross-domain operational consequences as the primary differentiation hypothesis.

**Reasoning:** The system should combine information from separate modules into consequences and operator decisions rather than expose more raw telemetry.

### D4 — Public demonstrator safety boundary
**Decision:** Keep the public demonstrator non-weaponized.

**Reasoning:** Complex operational coordination can be demonstrated without weapon control, target engagement or lethal autonomy.

### D5 — Design sequence
**Decision:** Define architecture and operational logic before high-fidelity interface design.

**Reasoning:** The project is intended to demonstrate systems thinking, not just visual execution.

### D6 — Demonstrator fidelity
**Decision:** Build real interactive software rather than a static portfolio prototype.

**Reasoning:** State changes, event propagation, dependencies and operator decisions are central to the concept.

### D7 — Documentation model
**Decision:** Keep documentation in version-controlled Markdown and derive public-facing artifacts from it.

**Reasoning:** Git history should preserve the reasoning trail, while the same source material can later support the project website and downloadable PDF.
