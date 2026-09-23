import { useEffect, useState } from 'react';
import type {
  Assessment,
  EntityId,
  Observation,
  ObservationSource,
  Projection,
} from '../core/contracts';
import { advanceScenarioRuntime } from '../core/runtime-step';
import {
  getEntities,
  getEntity,
  getEntityObservations,
  type ScenarioRuntimeState,
} from '../core/runtime-state';
import {
  scenario01InitialState,
  scenario01RuntimeDefinition,
} from '../scenarios/scenario-01/scenario';

const MAX_SELECTED_OBSERVATIONS = 3;
const SIMULATION_TICK_MS = 4_000;
const initialEntityId = scenario01InitialState.entityOrder[0];

if (!initialEntityId) {
  throw new Error('Scenario 01 runtime state contains no entities.');
}

const metricLabels: Record<string, string> = {
  'power.supplyState': 'Supply',
  'power.feederState': 'Feeder F-12',
  'power.loadPercentage': 'Load',
  'water.outputPressure': 'Output pressure',
  'water.reservoirLevel': 'Reservoir',
  'water.pumpState': 'Pumps',
  'communications.powerMode': 'Power mode',
  'communications.linkQuality': 'Link quality',
  'communications.packetLoss': 'Packet loss',
  'health.essentialServicesPosture': 'Essential services',
  'health.waterMargin': 'Water margin',
  'logistics.resourceState': 'Resource state',
  'logistics.routeState': 'Route state',
  'logistics.estimatedTravelTime': 'Travel time',
};

function formatScenarioTime(time: number) {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatValue(observation: Observation) {
  const { value, unit } = observation;

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => {
        const label = key.replace(/^pump/, 'Pump ');
        return `${label}: ${String(item)}`;
      })
      .join(' · ');
  }

  return `${String(value)}${unit ? ` ${unit}` : ''}`;
}

function formatSource(source: ObservationSource) {
  return source.organisation ?? source.id ?? source.type;
}

function latestRevisions<T extends { id: string; revision: number }>(
  items: readonly T[],
): T[] {
  const latestById = new Map<string, T>();

  for (const item of items) {
    const current = latestById.get(item.id);

    if (!current || item.revision > current.revision) {
      latestById.set(item.id, item);
    }
  }

  return [...latestById.values()];
}

function newestObservations(
  observations: readonly Observation[],
): Observation[] {
  return [...observations].sort((left, right) => {
    const timeDifference = right.receivedAt - left.receivedAt;

    return timeDifference !== 0
      ? timeDifference
      : left.id.localeCompare(right.id);
  });
}

function getDataCondition(observations: readonly Observation[]) {
  const latest = newestObservations(observations)[0];

  if (!latest) {
    return {
      label: 'No data',
      modifier: 'unknown',
    };
  }

  if (latest.quality === 'poor' || latest.quality === 'unknown') {
    return {
      label: 'Limited data',
      modifier: 'limited',
    };
  }

  if (
    latest.quality === 'degraded' ||
    latest.observedAt < latest.receivedAt
  ) {
    return {
      label: 'Delayed data',
      modifier: 'delayed',
    };
  }

  return {
    label: 'Current data',
    modifier: 'current',
  };
}

type EntityStatus = 'Normal' | 'Review' | 'Action';

const entityStatusDescriptions: Record<EntityStatus, string> = {
  Normal:
    'No active Assessment or Projection currently requires attention for this entity.',
  Review:
    'This entity is referenced by an active Assessment or Projection and requires operator review.',
  Action:
    'An active critical Assessment or Projection indicates that operator action may be required.',
};

function getEntityStatus(
  entityId: EntityId,
  claims: readonly (Assessment | Projection)[],
): EntityStatus {
  const relatedClaims = claims.filter((claim) =>
    claim.entityIds.includes(entityId),
  );

  if (
    relatedClaims.some(
      (claim) =>
        claim.attention === 'act' || claim.severity === 'critical',
    )
  ) {
    return 'Action';
  }

  return relatedClaims.length > 0 ? 'Review' : 'Normal';
}

function ClaimEvidence({
  claim,
  runtimeState,
}: {
  claim: Assessment | Projection;
  runtimeState: ScenarioRuntimeState;
}) {
  const evidence = claim.evidenceIds
    .map((evidenceId) =>
      runtimeState.observations.find(
        (observation) => observation.id === evidenceId,
      ),
    )
    .filter(
      (observation): observation is Observation =>
        observation !== undefined,
    );
  const dependencies = runtimeState.dependencies.filter((dependency) =>
    claim.dependencyIds.includes(dependency.id),
  );

  return (
    <details className="claim-evidence">
      <summary>Review evidence</summary>

      <div className="claim-evidence__content">
        <h3>Evidence</h3>
        <ul>
          {evidence.map((observation) => (
            <li key={observation.id}>
              <strong>
                {metricLabels[observation.metric] ?? observation.metric}
              </strong>
              <span>{formatValue(observation)}</span>
              <small>
                {formatSource(observation.source)} · received{' '}
                {formatScenarioTime(observation.receivedAt)}
              </small>
            </li>
          ))}
        </ul>

        <h3>Dependencies</h3>
        <ul>
          {dependencies.map((dependency) => (
            <li key={dependency.id}>
              <span>{dependency.description ?? dependency.type}</span>
            </li>
          ))}
        </ul>

        <h3>Assumptions</h3>
        <ul>
          {claim.assumptions.map((assumption) => (
            <li key={assumption.id}>
              <span>{assumption.statement}</span>
              <small>Status: {assumption.status}</small>
            </li>
          ))}
        </ul>

        <p className="rule-reference">Rule: {claim.ruleId}</p>
      </div>
    </details>
  );
}

export default function VectorOpsApp() {
  const [runtimeState, setRuntimeState] =
    useState<ScenarioRuntimeState>(scenario01InitialState);
  const [selectedEntityId, setSelectedEntityId] =
    useState<EntityId>(initialEntityId);
  const [isPaused, setIsPaused] = useState(false);
  const [hasAutoPaused, setHasAutoPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setRuntimeState((currentState) =>
        advanceScenarioRuntime(
          currentState,
          1,
          scenario01RuntimeDefinition,
          new Date().toISOString(),
        ),
      );
    }, SIMULATION_TICK_MS);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  useEffect(() => {
    if (runtimeState.projections.length > 0 && !hasAutoPaused) {
      setIsPaused(true);
      setHasAutoPaused(true);
    }
  }, [runtimeState.projections.length, hasAutoPaused]);

  const entities = getEntities(runtimeState);
  const selectedEntity = getEntity(runtimeState, selectedEntityId);
  const selectedObservations = newestObservations(
    getEntityObservations(runtimeState, selectedEntityId),
  );
  const visibleSelectedObservations = selectedObservations.slice(
    0,
    MAX_SELECTED_OBSERVATIONS,
  );
  const activeAssessments = latestRevisions(
    runtimeState.assessments,
  ).filter((assessment) => assessment.status === 'active');
  const activeProjections = latestRevisions(
    runtimeState.projections,
  ).filter(
    (projection) =>
      projection.status === 'projected' ||
      projection.status === 'developing',
  );
  const primaryAssessment = activeAssessments[0];
  const primaryProjection = activeProjections[0];
  const activeClaims = [
    ...activeAssessments,
    ...activeProjections,
  ];
  const delayedObservationCount = runtimeState.observations.filter(
    (observation) =>
      observation.quality === 'degraded' ||
      observation.observedAt < observation.receivedAt,
  ).length;

  return (
    <main className="vector-ops">
      <header className="app-header">
        <div>
          <p className="eyebrow">VECTOR OPS</p>
          <h1>Operational workspace</h1>
          <p className="scenario-name">
            {runtimeState.scenario.title}
          </p>
        </div>

        <div className="scenario-controls">
          <div className="scenario-clock" aria-label="Scenario time">
            <span>Scenario time</span>
            <strong>{formatScenarioTime(runtimeState.now)}</strong>
          </div>
          <button
            type="button"
            className="runtime-control"
            aria-pressed={isPaused}
            onClick={() => setIsPaused((paused) => !paused)}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </header>

      <section className="system-bar" aria-label="System and data status">
        <span><strong>Modules:</strong> 4 active</span>
        <span>
          <strong>Data:</strong> {runtimeState.observations.length}{' '}
          observations
          {delayedObservationCount > 0
            ? ` · ${delayedObservationCount} delayed`
            : ' · current'}
        </span>
        <span>
          <strong>Entities:</strong> {runtimeState.entityOrder.length} monitored
        </span>
        <span>
          <strong>Run:</strong> {isPaused ? 'Paused' : 'Running'}
        </span>
      </section>

      <div className="workspace">
        <section className="entity-workspace" aria-labelledby="entities-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Current operational picture</p>
              <h2 id="entities-title">Monitored entities</h2>
            </div>
            <span>{runtimeState.entityOrder.length} entities currently monitored</span>
          </div>

          <div className="entity-grid">
            {entities.map((entity) => {
              const observations = newestObservations(
                getEntityObservations(runtimeState, entity.id),
              );
              const selected = entity.id === selectedEntityId;
              const dataCondition = getDataCondition(observations);
              const entityStatus = getEntityStatus(
                entity.id,
                activeClaims,
              );
              const statusTooltipId = `status-tooltip-${entity.id.replaceAll('.', '-')}`;

              return (
                <article
                  className={`entity-card${selected ? ' entity-card--selected' : ''}`}
                  key={entity.id}
                >
                  <div className="entity-card__header">
                    <div>
                      <p className="entity-kind">
                        {entity.kind.replaceAll('-', ' ')}
                      </p>
                      <h3>{entity.name}</h3>
                    </div>
                    <span
                      className={`status-badge status-badge--${entityStatus.toLowerCase()}`}
                      onClick={() => setSelectedEntityId(entity.id)}
                    >
                      {entityStatus}
                      <span
                        className="status-tooltip"
                        id={statusTooltipId}
                        role="tooltip"
                      >
                        {entityStatusDescriptions[entityStatus]}
                      </span>
                    </span>
                  </div>

                  <p
                    className={`data-condition data-condition--${dataCondition.modifier}`}
                  >
                    <span aria-hidden="true">●</span>{' '}
                    {dataCondition.label}
                  </p>

                  <dl>
                    {observations.slice(0, 3).map((observation) => (
                      <div key={observation.id}>
                        <dt>
                          {metricLabels[observation.metric] ??
                            observation.metric}
                        </dt>
                        <dd>{formatValue(observation)}</dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    className="details-button"
                    aria-pressed={selected}
                    onClick={() => setSelectedEntityId(entity.id)}
                  >
                    View details
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="intelligence-column">
          <div className="section-heading intelligence-heading">
            <div>
              <p className="eyebrow">Inspection context</p>
              <h2>Selection details</h2>
            </div>
          </div>

          <section
            className="intelligence-panel entity-detail entity-detail--selected"
            aria-live="polite"
          >
            <div className="selection-label">
              <span aria-hidden="true">↳</span>
              <p className="eyebrow">Selected entity</p>
            </div>
            <h2>{selectedEntity?.name}</h2>
            <p className="selection-context">
              Details for the highlighted entity tile
            </p>
            <p>
              {selectedObservations.length > MAX_SELECTED_OBSERVATIONS
                ? `Showing ${MAX_SELECTED_OBSERVATIONS} of ${selectedObservations.length} current observations`
                : `${selectedObservations.length} current observation${selectedObservations.length === 1 ? '' : 's'}`}
            </p>

            <ul>
              {visibleSelectedObservations.map((observation) => (
                <li key={observation.id}>
                  <strong>
                    {metricLabels[observation.metric] ?? observation.metric}
                  </strong>
                  <span>{formatValue(observation)}</span>
                  <small>
                    {formatSource(observation.source)} ·{' '}
                    {observation.confidence.level} confidence · received{' '}
                    {formatScenarioTime(observation.receivedAt)}
                  </small>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={`intelligence-panel claim-panel${primaryAssessment ? ' claim-panel--active' : ''}`}
            aria-live="polite"
          >
            <p className="eyebrow">Assessment</p>
            {primaryAssessment ? (
              <>
                <h2>{primaryAssessment.title}</h2>
                <p className="claim-summary">
                  {primaryAssessment.evidenceIds.length} observations ·{' '}
                  {primaryAssessment.dependencyIds.length} dependencies ·{' '}
                  {primaryAssessment.assumptions.length} assumptions
                </p>
                <p className="panel-meta">
                  Confidence: {primaryAssessment.confidence.level} ·{' '}
                  Recalculated at{' '}
                  {formatScenarioTime(primaryAssessment.recalculatedAt)}
                </p>
                <ClaimEvidence
                  claim={primaryAssessment}
                  runtimeState={runtimeState}
                />
              </>
            ) : (
              <>
                <h2>No material cross-domain issue detected</h2>
                <p>
                  Current observations do not indicate a material
                  multi-service disruption.
                </p>
                <p className="panel-meta">
                  Confidence: high · Recalculated at{' '}
                  {formatScenarioTime(runtimeState.now)}
                </p>
              </>
            )}
          </section>

          <section
            className={`intelligence-panel claim-panel${primaryProjection ? ' claim-panel--active' : ''}`}
            aria-live="polite"
          >
            <p className="eyebrow">Projection</p>
            {primaryProjection ? (
              <>
                <h2>{primaryProjection.title}</h2>
                <p className="projection-window">
                  Projected window:{' '}
                  <strong>
                    {primaryProjection.horizon.earliest !== undefined
                      ? formatScenarioTime(
                          primaryProjection.horizon.earliest,
                        )
                      : 'Unknown'}
                    {'–'}
                    {primaryProjection.horizon.latest !== undefined
                      ? formatScenarioTime(
                          primaryProjection.horizon.latest,
                        )
                      : 'Unknown'}
                  </strong>
                </p>
                <p>
                  Main uncertainty: {primaryProjection.mainUncertainty}
                </p>
                <p className="panel-meta">
                  Confidence: {primaryProjection.confidence.level} ·{' '}
                  Recalculated at{' '}
                  {formatScenarioTime(primaryProjection.recalculatedAt)}
                </p>
                <ClaimEvidence
                  claim={primaryProjection}
                  runtimeState={runtimeState}
                />
              </>
            ) : (
              <>
                <h2>No active projections</h2>
                <p>
                  Time-dependent consequences will appear when
                  observations and dependencies meet a defined rule.
                </p>
              </>
            )}
          </section>
        </aside>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #0b0f14;
          color: #e7edf5;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        button {
          font: inherit;
        }

        .vector-ops {
          min-height: 100vh;
          padding: 28px;
          background:
            radial-gradient(circle at top left, #152131 0, transparent 36%),
            #0b0f14;
        }

        .app-header,
        .system-bar,
        .workspace {
          max-width: 1500px;
          margin-inline: auto;
        }

        .app-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          padding-bottom: 22px;
        }

        h1,
        h2,
        h3,
        p {
          margin-top: 0;
        }

        h1 {
          margin-bottom: 8px;
          font-size: clamp(1.75rem, 3vw, 2.6rem);
        }

        h2 {
          font-size: 1.05rem;
          line-height: 1.35;
        }

        .eyebrow,
        .entity-kind {
          margin-bottom: 7px;
          color: #8da2b8;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .scenario-name,
        .panel-meta,
        .data-condition {
          color: #9aabbd;
        }

        .scenario-controls {
          display: flex;
          align-items: end;
          gap: 14px;
        }

        .scenario-clock {
          display: grid;
          gap: 4px;
          text-align: right;
        }

        .scenario-clock span {
          color: #8da2b8;
          font-size: 0.78rem;
        }

        .scenario-clock strong {
          font-size: 1.7rem;
          font-variant-numeric: tabular-nums;
        }

        .runtime-control {
          min-width: 84px;
          padding: 8px 12px;
          border: 1px solid #3b5068;
          border-radius: 6px;
          background: #172331;
          color: #dce7f1;
          cursor: pointer;
        }

        .runtime-control:hover,
        .runtime-control:focus-visible {
          border-color: #62a9f2;
          outline: 2px solid transparent;
        }

        .runtime-control:focus-visible {
          outline-color: #8bc4ff;
          outline-offset: 2px;
        }

        .system-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 24px;
          margin-bottom: 20px;
          padding: 12px 16px;
          border: 1px solid #263446;
          border-radius: 8px;
          background: #111923;
          color: #aebdcb;
          font-size: 0.86rem;
        }

        .workspace {
          display: grid;
          grid-template-columns: minmax(0, 7fr) minmax(300px, 3fr);
          gap: 20px;
        }

        .entity-workspace,
        .intelligence-column {
          min-width: 0;
        }

        .section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 14px;
        }

        .section-heading h2 {
          margin-bottom: 0;
          font-size: 1.25rem;
        }

        .section-heading > span {
          color: #8496a8;
          font-size: 0.8rem;
        }

        .entity-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-auto-rows: 1fr;
          gap: 14px;
        }

        .entity-card,
        .intelligence-panel {
          border: 1px solid #273548;
          border-radius: 10px;
          background: rgba(17, 25, 35, 0.94);
        }

        .entity-card {
          position: relative;
          display: flex;
          height: 100%;
          flex-direction: column;
          padding: 17px;
          border-left: 4px solid #4f657d;
          transition:
            border-color 140ms ease,
            background-color 140ms ease,
            box-shadow 140ms ease,
            transform 140ms ease;
        }

        .entity-card:hover {
          z-index: 2;
          border-color: #47729e;
          border-left-color: #62a9f2;
          background: rgba(21, 34, 48, 0.98);
          transform: translateY(-1px);
        }

        .entity-card--selected {
          border-color: #4d90d8;
          border-left-color: #62a9f2;
          box-shadow: 0 0 0 1px rgba(98, 169, 242, 0.16);
        }

        .entity-card__header {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 12px;
        }

        .entity-card h3 {
          margin-bottom: 8px;
          font-size: 1rem;
        }

        .status-badge {
          position: relative;
          z-index: 2;
          padding: 4px 7px;
          border: 1px solid #3b4c61;
          border-radius: 999px;
          color: #b8c7d5;
          font-size: 0.7rem;
          text-transform: uppercase;
          cursor: help;
        }

        .status-tooltip {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 250px;
          padding: 9px 11px;
          border: 1px solid #40546b;
          border-radius: 6px;
          background: #080c11;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.42);
          color: #dce7f1;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: normal;
          line-height: 1.45;
          text-align: left;
          text-transform: none;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-3px);
          transition:
            opacity 120ms ease,
            transform 120ms ease,
            visibility 120ms ease;
          pointer-events: none;
        }

        .status-badge:hover .status-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .status-badge--review {
          border-color: #9f783d;
          background: rgba(159, 120, 61, 0.16);
          color: #f0cf9c;
        }

        .status-badge--action {
          border-color: #a84e52;
          background: rgba(168, 78, 82, 0.16);
          color: #f5b7ba;
        }

        .data-condition {
          margin-bottom: 14px;
          font-size: 0.78rem;
        }

        .data-condition span {
          color: #68bf8b;
        }

        .data-condition--delayed span,
        .data-condition--limited span {
          color: #e6ad5d;
        }

        .data-condition--unknown span {
          color: #8da2b8;
        }

        dl {
          display: grid;
          gap: 8px;
          margin: 0 0 16px;
        }

        dl div {
          display: grid;
          grid-template-columns: minmax(110px, 0.8fr) minmax(0, 1.2fr);
          gap: 12px;
          align-items: baseline;
        }

        dt {
          color: #8799aa;
          font-size: 0.76rem;
        }

        dd {
          margin: 0;
          overflow-wrap: anywhere;
          color: #f0f5fa;
          font-size: 0.84rem;
          font-weight: 650;
          text-align: right;
        }

        .details-button {
          width: 100%;
          margin-top: auto;
          padding: 8px 10px;
          border: 1px solid #33465b;
          border-radius: 6px;
          background: #172331;
          color: #dce7f1;
          cursor: pointer;
        }

        .details-button::after {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          content: '';
        }

        .details-button:hover,
        .details-button:focus-visible {
          border-color: #62a9f2;
          outline: none;
        }

        .details-button:focus-visible::after {
          outline: 2px solid #8bc4ff;
          outline-offset: 3px;
        }

        .intelligence-column {
          display: grid;
          align-content: start;
          gap: 14px;
        }

        .intelligence-heading {
          margin-bottom: 0;
        }

        .intelligence-heading h2 {
          margin-bottom: 0;
          font-size: 1.25rem;
        }

        .intelligence-panel {
          padding: 18px;
        }

        .intelligence-panel p {
          color: #aebdcb;
          font-size: 0.86rem;
          line-height: 1.55;
        }

        .intelligence-panel .panel-meta {
          margin-bottom: 0;
          color: #8295a8;
          font-size: 0.74rem;
        }

        .claim-panel--active {
          border-left: 4px solid #d09a4d;
          background:
            linear-gradient(135deg, rgba(156, 111, 48, 0.12), transparent 58%),
            rgba(17, 25, 35, 0.98);
        }

        .claim-summary,
        .projection-window {
          color: #d6e0e9 !important;
        }

        .claim-evidence {
          margin-top: 14px;
          border-top: 1px solid #2a394b;
          padding-top: 12px;
        }

        .claim-evidence summary {
          width: fit-content;
          color: #9ccaff;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }

        .claim-evidence summary:focus-visible {
          border-radius: 3px;
          outline: 2px solid #8bc4ff;
          outline-offset: 3px;
        }

        .claim-evidence__content {
          display: grid;
          gap: 8px;
          margin-top: 14px;
        }

        .claim-evidence h3 {
          margin: 8px 0 0;
          color: #8da2b8;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .claim-evidence ul {
          display: grid;
          gap: 8px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .claim-evidence li {
          display: grid;
          gap: 3px;
          padding-left: 10px;
          border-left: 2px solid #34475c;
          color: #dce7f1;
          font-size: 0.78rem;
        }

        .claim-evidence li small,
        .rule-reference {
          color: #7f91a3 !important;
          font-size: 0.7rem !important;
        }

        .rule-reference {
          margin: 6px 0 0;
          overflow-wrap: anywhere;
        }

        .entity-detail--selected {
          display: flex;
          height: 430px;
          flex-direction: column;
          overflow: hidden;
          border-color: #4d90d8;
          border-left: 4px solid #62a9f2;
          background:
            linear-gradient(135deg, rgba(50, 105, 162, 0.18), transparent 55%),
            rgba(17, 25, 35, 0.98);
          box-shadow: 0 0 0 1px rgba(98, 169, 242, 0.12);
        }

        .selection-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #62a9f2;
        }

        .selection-label .eyebrow {
          margin-bottom: 0;
          color: #9ccaff;
        }

        .selection-context {
          margin-top: -4px;
          color: #9ccaff !important;
          font-size: 0.76rem !important;
        }

        .entity-detail ul {
          display: grid;
          flex: 1;
          align-content: start;
          gap: 11px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .entity-detail li {
          display: grid;
          gap: 4px;
          padding-top: 11px;
          border-top: 1px solid #263446;
        }

        .entity-detail li > span {
          color: #f1f5f9;
          font-size: 0.88rem;
        }

        .entity-detail small {
          color: #7f91a3;
          line-height: 1.4;
        }

        @media (max-width: 980px) {
          .workspace {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 680px) {
          .vector-ops {
            padding: 18px;
          }

          .app-header,
          .section-heading {
            align-items: start;
            flex-direction: column;
          }

          .scenario-controls {
            width: 100%;
            align-items: center;
            justify-content: space-between;
          }

          .scenario-clock {
            text-align: left;
          }

          .entity-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
