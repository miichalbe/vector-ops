import type {
  Assessment,
  EntityId,
  Observation,
  Projection,
} from '../core/contracts';
import {
  getEntities,
  getEntity,
  getEntityObservations,
  type ScenarioRuntimeState,
} from '../core/runtime-state';
import { getScenario01EntityPresentation } from '../scenarios/scenario-01/entity-presentation';
import {
  formatObservationSource,
  formatObservationValue,
  formatScenarioTime,
  getEntityDataCondition,
  getEntityDependencies,
  getLatestEntityUpdate,
  newestObservations,
  resolveEntityMetricSlots,
} from './entity-state';

const metricLabels: Record<string, string> = {
  'power.supplyState': 'Supply',
  'power.feederState': 'Feeder F-12',
  'power.loadPercentage': 'Load',
  'power.qualityEvent': 'Power quality',
  'power.restorationEstimate': 'Restoration estimate',
  'water.outputPressure': 'Output pressure',
  'water.reservoirLevel': 'Reservoir',
  'water.pumpState': 'Pumps',
  'water.controllerState': 'Controller',
  'water.telemetryFreshness': 'Telemetry freshness',
  'water.powerSupport': 'Power support',
  'water.serviceMarginTrend': 'Service margin',
  'communications.powerMode': 'Power mode',
  'communications.linkQuality': 'Link quality',
  'communications.packetLoss': 'Packet loss',
  'health.essentialServicesPosture': 'Essential services',
  'health.waterMargin': 'Water margin',
  'health.continuityRequest': 'Continuity request',
  'health.contingencyPreparation': 'Contingency preparation',
  'logistics.resourceState': 'Resource state',
  'logistics.assignment': 'Assignment',
  'logistics.estimatedArrival': 'Travel time',
  'logistics.routeState': 'Route state',
  'logistics.estimatedTravelTime': 'Travel time',
};

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

function observationLabel(observation: Observation): string {
  return metricLabels[observation.metric] ?? observation.metric;
}

export function EntityGrid({
  runtimeState,
  selectedEntityId,
  activeClaims,
  onSelectEntity,
}: {
  runtimeState: ScenarioRuntimeState;
  selectedEntityId: EntityId;
  activeClaims: readonly (Assessment | Projection)[];
  onSelectEntity: (entityId: EntityId) => void;
}) {
  const entities = getEntities(runtimeState);

  return (
    <div className="entity-grid">
      {entities.map((entity) => {
        const observations = getEntityObservations(runtimeState, entity.id);
        const schema = getScenario01EntityPresentation(entity.id);
        const metrics = resolveEntityMetricSlots(observations, schema.tile);
        const selected = entity.id === selectedEntityId;
        const dataCondition = getEntityDataCondition(observations);
        const entityStatus = getEntityStatus(entity.id, activeClaims);
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
                aria-describedby={statusTooltipId}
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
              <span aria-hidden="true">●</span> {dataCondition.label}
            </p>

            <dl className="entity-current-state">
              {metrics.map((metric) => (
                <div key={metric.id}>
                  <dt>{metric.label}</dt>
                  <dd className={metric.observation ? undefined : 'metric-value--empty'}>
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              className="details-button"
              aria-pressed={selected}
              onClick={() => onSelectEntity(entity.id)}
            >
              View details
            </button>
          </article>
        );
      })}
    </div>
  );
}

export function SelectedEntityPanel({
  runtimeState,
  selectedEntityId,
}: {
  runtimeState: ScenarioRuntimeState;
  selectedEntityId: EntityId;
}) {
  const entity = getEntity(runtimeState, selectedEntityId);
  const observations = getEntityObservations(runtimeState, selectedEntityId);
  const schema = getScenario01EntityPresentation(selectedEntityId);
  const metrics = resolveEntityMetricSlots(observations, schema.detail);
  const dataCondition = getEntityDataCondition(observations);
  const latestUpdate = getLatestEntityUpdate(observations);
  const dependencies = getEntityDependencies(runtimeState, selectedEntityId);
  const recentActivity = newestObservations(observations).slice(0, 4);

  return (
    <section
      className="intelligence-panel entity-detail entity-detail--selected"
      aria-live="polite"
    >
      <div className="selection-label">
        <span aria-hidden="true">↳</span>
        <p className="eyebrow">Selected entity</p>
      </div>
      <h2>{entity?.name}</h2>
      <p className="selection-context">
        Current state, data provenance and operational dependencies
      </p>

      <div className="entity-detail__scroll" key={selectedEntityId} tabIndex={0}>
        <section className="entity-detail__section entity-detail__section--first">
          <div className="entity-detail__section-heading">
            <h3>Current state</h3>
            <span className={`data-condition data-condition--${dataCondition.modifier}`}>
              <span aria-hidden="true">●</span> {dataCondition.label}
            </span>
          </div>

          <dl className="entity-detail__metrics">
            {metrics.map((metric) => (
              <div key={metric.id}>
                <dt>{metric.label}</dt>
                <dd>
                  <span className={metric.observation ? undefined : 'metric-value--empty'}>
                    {metric.value}
                  </span>
                  <small>
                    {metric.observation
                      ? `updated ${formatScenarioTime(metric.observation.receivedAt)}`
                      : 'No observation yet'}
                  </small>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="entity-detail__section">
          <h3>Data</h3>
          <dl className="entity-detail__data">
            <div>
              <dt>Latest update</dt>
              <dd>
                {latestUpdate
                  ? formatScenarioTime(latestUpdate.receivedAt)
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Latest source</dt>
              <dd>
                {latestUpdate
                  ? formatObservationSource(latestUpdate.source)
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{latestUpdate?.confidence.level ?? '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="entity-detail__section">
          <h3>Dependencies</h3>
          {dependencies.length > 0 ? (
            <ul className="entity-detail__dependencies">
              {dependencies.map((dependency) => (
                <li key={dependency.id}>
                  {dependency.description ?? dependency.type}
                </li>
              ))}
            </ul>
          ) : (
            <p className="entity-detail__empty">No registered dependencies.</p>
          )}
        </section>

        <section className="entity-detail__section">
          <h3>Recent activity</h3>
          {recentActivity.length > 0 ? (
            <ul className="entity-detail__recent">
              {recentActivity.map((observation) => (
                <li key={observation.id}>
                  <strong>{formatScenarioTime(observation.receivedAt)}</strong>
                  <span>
                    {observationLabel(observation)}: {formatObservationValue(observation)}
                  </span>
                  <small>
                    {formatObservationSource(observation.source)} ·{' '}
                    {observation.confidence.level} confidence
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="entity-detail__empty">No recent observations.</p>
          )}
        </section>
      </div>

      <style>{`
        .entity-current-state {
          min-height: 0;
        }

        .metric-value--empty {
          color: #73879a !important;
          font-weight: 500 !important;
        }

        .entity-detail__scroll {
          min-height: 0;
          flex: 1;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding-right: 8px;
          scrollbar-gutter: stable;
        }

        .entity-detail__scroll:focus-visible {
          border-radius: 4px;
          outline: 2px solid #8bc4ff;
          outline-offset: 3px;
        }

        .entity-detail__section {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid #263446;
        }

        .entity-detail__section--first {
          margin-top: 4px;
          padding-top: 0;
          border-top: 0;
        }

        .entity-detail__section h3 {
          margin: 0 0 10px;
          color: #8da2b8;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .entity-detail__section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .entity-detail__section-heading .data-condition {
          margin: 0 0 10px;
        }

        .entity-detail__metrics,
        .entity-detail__data {
          margin-bottom: 0;
        }

        .entity-detail__metrics dd {
          display: grid;
          justify-items: end;
          gap: 2px;
        }

        .entity-detail__metrics dd small {
          color: #75889b;
          font-size: 0.66rem;
          font-weight: 500;
        }

        .entity-detail__dependencies,
        .entity-detail__recent {
          display: grid;
          gap: 8px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .entity-detail__dependencies li {
          padding-left: 10px;
          border-left: 2px solid #34475c;
          color: #c9d5df;
          font-size: 0.76rem;
          line-height: 1.45;
        }

        .entity-detail__recent li {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr);
          gap: 3px 8px;
          padding-top: 8px;
          border-top: 1px solid #223043;
          font-size: 0.74rem;
        }

        .entity-detail__recent li > strong {
          color: #9ccaff;
          font-variant-numeric: tabular-nums;
        }

        .entity-detail__recent li > span {
          color: #dce7f1;
        }

        .entity-detail__recent li > small {
          grid-column: 2;
          color: #75889b;
        }

        .entity-detail__empty {
          margin-bottom: 0;
          color: #75889b !important;
          font-size: 0.76rem !important;
        }
      `}</style>
    </section>
  );
}
