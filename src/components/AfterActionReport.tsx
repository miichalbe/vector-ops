import type { ScenarioRuntimeState } from '../core/runtime-state';
import {
  buildAfterActionReport,
  type AfterActionReportDecision,
} from './after-action-report';

function formatScenarioTime(time: number) {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function labelFromId(value: string) {
  return value
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function DecisionRecord({
  decision,
  index,
}: {
  decision: AfterActionReportDecision;
  index: number;
}) {
  return (
    <article className="aar-decision">
      <header className="aar-decision__header">
        <div>
          <p className="aar-eyebrow">Decision {index + 1}</p>
          <h3>{decision.selectedActionTitle}</h3>
        </div>
        <div className="aar-decision__meta">
          <strong>{formatScenarioTime(decision.decidedAt)}</strong>
          <span>Action {decision.actionLifecycle}</span>
        </div>
      </header>

      <div className="aar-effect-grid">
        <section>
          <h4>Expected effects at decision time</h4>
          {decision.expectedEffects.length > 0 ? (
            <ul>
              {decision.expectedEffects.map((effect, effectIndex) => (
                <li key={`${effect.type}-${effectIndex}`}>
                  <strong>{labelFromId(effect.type)}</strong>
                  <span>{effect.description}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No expected effects were recorded.</p>
          )}
        </section>

        <section>
          <h4>Observed downstream effects</h4>
          {decision.observedEffects.length > 0 ? (
            <ul>
              {decision.observedEffects.map((effect, effectIndex) => (
                <li key={`${effect.type}-${effectIndex}`}>
                  <strong>{labelFromId(effect.type)}</strong>
                  <span>{effect.description}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No downstream effect was recorded before handover.</p>
          )}
        </section>
      </div>

      <details className="aar-details">
        <summary>
          Evidence and unknowns available when this Decision opened
        </summary>
        <div className="aar-details__grid">
          <div>
            <h4>Evidence</h4>
            <ul>
              {decision.evidence.map((evidence) => (
                <li key={evidence.id}>
                  <strong>{evidence.entityName}</strong>
                  <span>
                    {evidence.metric}: {evidence.value}
                  </span>
                  <small>
                    received {formatScenarioTime(evidence.receivedAt)} ·{' '}
                    {evidence.confidence} confidence · {evidence.classification}
                  </small>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Unknowns</h4>
            {decision.unknowns.length > 0 ? (
              <ul>
                {decision.unknowns.map((unknown) => (
                  <li key={unknown}>{unknown}</li>
                ))}
              </ul>
            ) : (
              <p>No explicit unknowns were recorded.</p>
            )}
          </div>
        </div>
      </details>
    </article>
  );
}

export default function AfterActionReport({
  runtimeState,
}: {
  runtimeState: ScenarioRuntimeState;
}) {
  const report = buildAfterActionReport(runtimeState);

  return (
    <div className="aar-overlay" role="document" aria-labelledby="aar-title">
      <main className="aar-report">
        <header className="aar-hero">
          <div>
            <p className="aar-eyebrow">Operational reconstruction</p>
            <h1 id="aar-title">After-Action Report</h1>
            <p>
              {report.scenarioTitle} · version {report.scenarioVersion}
            </p>
          </div>
          <div className="aar-completion">
            <span>Operational phase complete</span>
            <strong>{formatScenarioTime(report.completedAt)}</strong>
            <small>
              {report.durationMinutes} scenario minutes · no operator score
            </small>
          </div>
        </header>

        <section className="aar-section" aria-labelledby="aar-run-title">
          <div className="aar-section__heading">
            <div>
              <p className="aar-eyebrow">Run</p>
              <h2 id="aar-run-title">Scenario configuration</h2>
            </div>
            <p>
              Recorded configuration, not a retrospective explanation of operator intent.
            </p>
          </div>

          <dl className="aar-summary-grid">
            <div>
              <dt>Seed</dt>
              <dd>{report.seed}</dd>
            </div>
            <div>
              <dt>Opening variant</dt>
              <dd>{labelFromId(report.openingVariant)}</dd>
            </div>
            <div>
              <dt>Dominant profile</dt>
              <dd>{labelFromId(report.dominantProfile)}</dd>
            </div>
            <div>
              <dt>Secondary modifier</dt>
              <dd>{labelFromId(report.secondaryModifier)}</dd>
            </div>
            <div>
              <dt>Scenario window</dt>
              <dd>
                {formatScenarioTime(report.startedAt)}–
                {formatScenarioTime(report.completedAt)}
              </dd>
            </div>
            <div>
              <dt>Decisions recorded</dt>
              <dd>{report.decisions.length}</dd>
            </div>
          </dl>
        </section>

        <section className="aar-section" aria-labelledby="aar-decisions-title">
          <div className="aar-section__heading">
            <div>
              <p className="aar-eyebrow">Operator record</p>
              <h2 id="aar-decisions-title">Decisions and consequences</h2>
            </div>
            <p>
              Expected effects are preserved separately from effects observed later in the run.
            </p>
          </div>

          <div className="aar-decision-list">
            {report.decisions.map((decision, index) => (
              <DecisionRecord
                key={decision.id}
                decision={decision}
                index={index}
              />
            ))}
          </div>
        </section>

        <section className="aar-section" aria-labelledby="aar-chronology-title">
          <div className="aar-section__heading">
            <div>
              <p className="aar-eyebrow">Operational history</p>
              <h2 id="aar-chronology-title">Key chronology</h2>
            </div>
            <p>Oldest first · based on information available during the run.</p>
          </div>

          <ol className="aar-chronology">
            {report.chronology.map((entry) => (
              <li key={entry.id}>
                <time>{formatScenarioTime(entry.scenarioTime)}</time>
                <div>
                  <div className="aar-chronology__title">
                    <strong>{entry.title}</strong>
                    <span>{entry.label}</span>
                  </div>
                  <p>{entry.summary}</p>
                  {entry.meta ? <small>{entry.meta}</small> : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="aar-section" aria-labelledby="aar-state-title">
          <div className="aar-section__heading">
            <div>
              <p className="aar-eyebrow">State comparison</p>
              <h2 id="aar-state-title">Initial vs final known state</h2>
            </div>
            <p>
              Metrics first observed after the baseline are labelled explicitly rather than backfilled.
            </p>
          </div>

          <div className="aar-entity-grid">
            {report.entityStates.map((entity) => {
              const relevantMetrics = entity.metrics.filter(
                (metric) => metric.changed || metric.finalAt > report.startedAt,
              );

              return (
                <article className="aar-entity" key={entity.entityId}>
                  <header>
                    <h3>{entity.entityName}</h3>
                    <span>
                      {entity.hasMaterialChange ? 'Changed' : 'No material change'}
                    </span>
                  </header>

                  {relevantMetrics.length > 0 ? (
                    <dl>
                      {relevantMetrics.map((metric) => (
                        <div key={metric.metric}>
                          <dt>{metric.label}</dt>
                          <dd>
                            <span>{metric.initialValue}</span>
                            <span aria-hidden="true">→</span>
                            <strong>{metric.finalValue}</strong>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p>No material observation changed during this run.</p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="aar-section" aria-labelledby="aar-reasoning-title">
          <div className="aar-section__heading">
            <div>
              <p className="aar-eyebrow">Behind the scenes</p>
              <h2 id="aar-reasoning-title">Reasoning context</h2>
            </div>
            <p>
              Selected model context exposed for traceability; this is not a developer debug dump.
            </p>
          </div>

          <div className="aar-reasoning-grid">
            <article>
              <h3>Dependencies used by derived claims</h3>
              <ul>
                {report.dependencies.map((dependency) => (
                  <li key={dependency.id}>{dependency.description}</li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Resolved run parameters</h3>
              <p className="aar-note">
                These values describe the bounded run configuration. A parameter may exist without being exercised by the selected path.
              </p>
              <dl className="aar-parameter-list">
                {report.parameters.map((parameter) => (
                  <div key={parameter.label}>
                    <dt>{parameter.label}</dt>
                    <dd>{parameter.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>
        </section>

        <section className="aar-section aar-handover" aria-labelledby="aar-handover-title">
          <div className="aar-section__heading">
            <div>
              <p className="aar-eyebrow">Operational handover</p>
              <h2 id="aar-handover-title">Current mitigations and unresolved items</h2>
            </div>
            {report.handover ? (
              <p>Prepared {formatScenarioTime(report.handover.preparedAt)}</p>
            ) : null}
          </div>

          {report.handover ? (
            <div className="aar-handover-grid">
              <article>
                <h3>Current mitigations</h3>
                <ul>
                  {report.handover.currentMitigations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article>
                <h3>Unresolved</h3>
                <ul>
                  {report.handover.unresolvedItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          ) : (
            <p>No operational handover record was found.</p>
          )}

          <p className="aar-method-note">
            This report reconstructs recorded scenario state and operator-visible knowledge. It does not grade the selected Actions and does not reinterpret earlier Decisions using information that arrived later.
          </p>
        </section>
      </main>

      <style>{`
        .aar-overlay {
          position: fixed;
          z-index: 100;
          inset: 0;
          overflow-y: auto;
          background:
            radial-gradient(circle at 8% 0%, rgba(42, 77, 111, 0.28), transparent 30%),
            #0b0f14;
          color: #e7edf5;
        }

        .aar-report {
          width: min(1320px, calc(100% - 48px));
          margin: 0 auto;
          padding: 40px 0 72px;
        }

        .aar-hero,
        .aar-section__heading,
        .aar-decision__header,
        .aar-entity header {
          display: flex;
          justify-content: space-between;
          gap: 24px;
        }

        .aar-hero {
          align-items: end;
          margin-bottom: 24px;
          padding: 26px;
          border: 1px solid #31455d;
          border-radius: 12px;
          background: rgba(17, 25, 35, 0.97);
        }

        .aar-hero h1 {
          margin: 0 0 8px;
          font-size: clamp(2rem, 4vw, 3rem);
        }

        .aar-hero p,
        .aar-section__heading p,
        .aar-note,
        .aar-method-note {
          color: #94a8bc;
        }

        .aar-eyebrow {
          margin: 0 0 6px;
          color: #8da2b8;
          font-size: 0.72rem;
          font-weight: 750;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .aar-completion {
          display: grid;
          gap: 5px;
          text-align: right;
        }

        .aar-completion span,
        .aar-completion small {
          color: #91a6ba;
        }

        .aar-completion strong {
          font-size: 2rem;
          font-variant-numeric: tabular-nums;
        }

        .aar-section {
          margin-top: 18px;
          padding: 22px;
          border: 1px solid #273548;
          border-radius: 12px;
          background: rgba(17, 25, 35, 0.95);
        }

        .aar-section__heading {
          align-items: end;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid #263446;
        }

        .aar-section__heading h2,
        .aar-section__heading p {
          margin: 0;
        }

        .aar-section__heading > p {
          max-width: 520px;
          font-size: 0.82rem;
          line-height: 1.45;
          text-align: right;
        }

        .aar-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin: 0;
        }

        .aar-summary-grid > div {
          padding: 13px 14px;
          border: 1px solid #2b3a4c;
          border-radius: 8px;
          background: #0f1720;
        }

        .aar-summary-grid dt,
        .aar-parameter-list dt {
          color: #7f93a7;
          font-size: 0.72rem;
          text-transform: uppercase;
        }

        .aar-summary-grid dd,
        .aar-parameter-list dd {
          margin: 5px 0 0;
          color: #e3ebf3;
          font-weight: 650;
        }

        .aar-decision-list {
          display: grid;
          gap: 14px;
        }

        .aar-decision {
          padding: 18px;
          border: 1px solid #304157;
          border-radius: 10px;
          background: #0f1720;
        }

        .aar-decision__header {
          align-items: start;
          margin-bottom: 15px;
        }

        .aar-decision__header h3 {
          margin: 0;
          font-size: 1rem;
        }

        .aar-decision__meta {
          display: grid;
          gap: 3px;
          color: #899daf;
          font-size: 0.74rem;
          text-align: right;
        }

        .aar-decision__meta strong {
          color: #bad4ef;
          font-size: 0.9rem;
        }

        .aar-effect-grid,
        .aar-details__grid,
        .aar-reasoning-grid,
        .aar-handover-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .aar-effect-grid > section,
        .aar-details__grid > div,
        .aar-reasoning-grid > article,
        .aar-handover-grid > article {
          padding: 14px;
          border: 1px solid #26374a;
          border-radius: 8px;
          background: rgba(11, 17, 24, 0.7);
        }

        .aar-effect-grid h4,
        .aar-details h4,
        .aar-reasoning-grid h3,
        .aar-handover-grid h3 {
          margin: 0 0 10px;
          color: #cbd9e6;
          font-size: 0.82rem;
        }

        .aar-effect-grid ul,
        .aar-details ul,
        .aar-reasoning-grid ul,
        .aar-handover-grid ul {
          display: grid;
          gap: 9px;
          margin: 0;
          padding-left: 18px;
        }

        .aar-effect-grid li {
          padding-left: 2px;
        }

        .aar-effect-grid li strong,
        .aar-effect-grid li span,
        .aar-details li strong,
        .aar-details li span,
        .aar-details li small {
          display: block;
        }

        .aar-effect-grid li strong {
          margin-bottom: 2px;
          color: #91bde9;
          font-size: 0.72rem;
        }

        .aar-effect-grid li span,
        .aar-details li,
        .aar-reasoning-grid li,
        .aar-handover-grid li {
          color: #cbd7e2;
          font-size: 0.8rem;
          line-height: 1.45;
        }

        .aar-details {
          margin-top: 13px;
          border-top: 1px solid #263446;
          padding-top: 12px;
        }

        .aar-details summary {
          color: #9fc1e2;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .aar-details__grid {
          margin-top: 12px;
        }

        .aar-details li small {
          margin-top: 2px;
          color: #75899c;
        }

        .aar-chronology {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .aar-chronology li {
          display: grid;
          grid-template-columns: 68px minmax(0, 1fr);
          gap: 14px;
          padding: 11px 0;
          border-bottom: 1px solid #223043;
        }

        .aar-chronology li:last-child {
          border-bottom: 0;
        }

        .aar-chronology time {
          color: #a8bdd2;
          font-size: 0.8rem;
          font-weight: 750;
          font-variant-numeric: tabular-nums;
        }

        .aar-chronology__title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .aar-chronology__title span {
          padding: 2px 6px;
          border: 1px solid #3b5068;
          border-radius: 999px;
          color: #9fb4c9;
          font-size: 0.61rem;
          text-transform: uppercase;
        }

        .aar-chronology p {
          margin: 3px 0 2px;
          color: #d4dfe9;
          font-size: 0.82rem;
        }

        .aar-chronology small {
          color: #788c9f;
        }

        .aar-entity-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .aar-entity {
          padding: 15px;
          border: 1px solid #2b3b50;
          border-radius: 9px;
          background: #0f1720;
        }

        .aar-entity header {
          align-items: center;
          margin-bottom: 10px;
        }

        .aar-entity h3 {
          margin: 0;
          font-size: 0.92rem;
        }

        .aar-entity header span {
          color: #8ba0b4;
          font-size: 0.7rem;
        }

        .aar-entity dl,
        .aar-parameter-list {
          display: grid;
          gap: 8px;
          margin: 0;
        }

        .aar-entity dl > div {
          padding-top: 8px;
          border-top: 1px solid #233246;
        }

        .aar-entity dt {
          margin-bottom: 4px;
          color: #8195a8;
          font-size: 0.7rem;
          text-transform: uppercase;
        }

        .aar-entity dd {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          gap: 8px;
          align-items: center;
          margin: 0;
          color: #98aabc;
          font-size: 0.78rem;
        }

        .aar-entity dd strong {
          color: #e0e8f0;
        }

        .aar-parameter-list > div {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 7px;
          border-bottom: 1px solid #233246;
        }

        .aar-parameter-list dd {
          margin: 0;
          text-align: right;
        }

        .aar-note {
          font-size: 0.76rem;
          line-height: 1.45;
        }

        .aar-method-note {
          margin: 16px 0 0;
          padding-top: 14px;
          border-top: 1px solid #263446;
          font-size: 0.78rem;
          line-height: 1.5;
        }

        @media (max-width: 820px) {
          .aar-report {
            width: min(100% - 24px, 1320px);
            padding-top: 20px;
          }

          .aar-hero,
          .aar-section__heading,
          .aar-decision__header {
            align-items: start;
            flex-direction: column;
          }

          .aar-completion,
          .aar-decision__meta,
          .aar-section__heading > p {
            text-align: left;
          }

          .aar-summary-grid,
          .aar-effect-grid,
          .aar-details__grid,
          .aar-entity-grid,
          .aar-reasoning-grid,
          .aar-handover-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
