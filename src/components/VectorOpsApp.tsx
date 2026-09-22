import { useMemo, useState } from 'react';
import type {
  EntityId,
  Observation,
  ObservationSource,
} from '../core/contracts';
import {
  scenario01Entities,
  scenario01EntityIds,
} from '../scenarios/scenario-01/baseline';
import {
  SCENARIO_01_START_TIME,
  scenario01BaselineObservations,
} from '../scenarios/scenario-01/baseline-observations';

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

export default function VectorOpsApp() {
  const [selectedEntityId, setSelectedEntityId] = useState<EntityId>(
    scenario01EntityIds.gridSubstation,
  );

  const observationsByEntity = useMemo(() => {
    const grouped = new Map<EntityId, Observation[]>();

    for (const entity of scenario01Entities) {
      grouped.set(entity.id, []);
    }

    for (const observation of scenario01BaselineObservations) {
      grouped.get(observation.entityId)?.push(observation);
    }

    return grouped;
  }, []);

  const selectedEntity = scenario01Entities.find(
    (entity) => entity.id === selectedEntityId,
  );
  const selectedObservations =
    observationsByEntity.get(selectedEntityId) ?? [];

  return (
    <main className="vector-ops">
      <header className="app-header">
        <div>
          <p className="eyebrow">VECTOR OPS</p>
          <h1>Operational workspace</h1>
          <p className="scenario-name">
            Scenario 01 — Infrastructure disruption, Mazowieckie Voivodeship
          </p>
        </div>

        <div className="scenario-clock" aria-label="Scenario time">
          <span>Scenario time</span>
          <strong>{formatScenarioTime(SCENARIO_01_START_TIME)}</strong>
        </div>
      </header>

      <section className="system-bar" aria-label="System and data status">
        <span><strong>Modules:</strong> 4 active</span>
        <span><strong>Data:</strong> 14 baseline observations</span>
        <span><strong>Entities:</strong> 6 monitored</span>
      </section>

      <div className="workspace">
        <section className="entity-workspace" aria-labelledby="entities-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Current operational picture</p>
              <h2 id="entities-title">Monitored entities</h2>
            </div>
            <span>6 entities currently monitored</span>
          </div>

          <div className="entity-grid">
            {scenario01Entities.map((entity) => {
              const observations = observationsByEntity.get(entity.id) ?? [];
              const selected = entity.id === selectedEntityId;

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
                    <span className="status-badge">Baseline</span>
                  </div>

                  <p className="data-condition">
                    <span aria-hidden="true">●</span> Current data
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
                    {selected ? 'Viewing details' : 'View details'}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="intelligence-column">
          <section className="intelligence-panel">
            <p className="eyebrow">Assessment</p>
            <h2>No material cross-domain issue detected</h2>
            <p>
              Baseline observations do not currently indicate a material
              multi-service disruption.
            </p>
            <p className="panel-meta">
              Confidence: high · Recalculated at{' '}
              {formatScenarioTime(SCENARIO_01_START_TIME)}
            </p>
          </section>

          <section className="intelligence-panel">
            <p className="eyebrow">Projection</p>
            <h2>No active projections</h2>
            <p>
              Time-dependent consequences will appear when observations and
              dependencies meet a defined rule.
            </p>
          </section>

          <section className="intelligence-panel entity-detail">
            <p className="eyebrow">Selected entity</p>
            <h2>{selectedEntity?.name}</h2>
            <p>
              {selectedObservations.length} current observation
              {selectedObservations.length === 1 ? '' : 's'}
            </p>

            <ul>
              {selectedObservations.map((observation) => (
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
        </aside>
      </div>

      <style>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(body) {
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
          gap: 14px;
        }

        .entity-card,
        .intelligence-panel {
          border: 1px solid #273548;
          border-radius: 10px;
          background: rgba(17, 25, 35, 0.94);
        }

        .entity-card {
          padding: 17px;
          border-left: 4px solid #4f657d;
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
          padding: 4px 7px;
          border: 1px solid #3b4c61;
          border-radius: 999px;
          color: #b8c7d5;
          font-size: 0.7rem;
          text-transform: uppercase;
        }

        .data-condition {
          margin-bottom: 14px;
          font-size: 0.78rem;
        }

        .data-condition span {
          color: #68bf8b;
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
          padding: 8px 10px;
          border: 1px solid #33465b;
          border-radius: 6px;
          background: #172331;
          color: #dce7f1;
          cursor: pointer;
        }

        .details-button:hover,
        .details-button:focus-visible {
          border-color: #62a9f2;
          outline: none;
        }

        .intelligence-column {
          display: grid;
          align-content: start;
          gap: 14px;
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

        .entity-detail ul {
          display: grid;
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
