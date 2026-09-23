import { useState } from 'react';
import type {
  Action,
  ActionId,
  Decision,
  Observation,
} from '../core/contracts';
import type { ScenarioRuntimeState } from '../core/runtime-state';

interface ActionReviewProps {
  runtimeState: ScenarioRuntimeState;
  decision: Decision;
  question: string;
  ownerLabel: string;
  onConfirm(actionId: ActionId): void;
}

const authorityLabels: Record<Action['authority'], string> = {
  operator: 'Operator',
  supervisor: 'Supervisor',
  wzzk: 'WZZK',
  voivode: 'Voivode',
  external: 'External authority',
};

function formatScenarioTime(time: number) {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatObservationValue(observation: Observation) {
  if (typeof observation.value === 'object' && observation.value !== null) {
    return Object.entries(observation.value as Record<string, unknown>)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(' · ');
  }

  return `${String(observation.value)}${observation.unit ? ` ${observation.unit}` : ''}`;
}

export default function ActionReview({
  runtimeState,
  decision,
  question,
  ownerLabel,
  onConfirm,
}: ActionReviewProps) {
  const [selectedActionId, setSelectedActionId] =
    useState<ActionId | null>(null);
  const actions = decision.actionIds
    .map((actionId) =>
      runtimeState.actions.find((action) => action.id === actionId),
    )
    .filter((action): action is Action => action !== undefined);
  const evidence = decision.evidenceIds
    .map((evidenceId) =>
      runtimeState.observations.find(
        (observation) => observation.id === evidenceId,
      ),
    )
    .filter(
      (observation): observation is Observation =>
        observation !== undefined,
    );

  return (
    <section
      className="action-review"
      aria-labelledby="action-review-title"
    >
      <div className="action-review__header">
        <div>
          <p className="action-review__eyebrow">Decision required</p>
          <h2 id="action-review-title">{question}</h2>
        </div>

        <dl className="action-review__meta">
          <div>
            <dt>Opened</dt>
            <dd>{formatScenarioTime(decision.openedAt)}</dd>
          </div>
          <div>
            <dt>Decision owner</dt>
            <dd>{ownerLabel}</dd>
          </div>
        </dl>
      </div>

      <div className="action-review__context-grid">
        <section>
          <h3>Evidence available now</h3>
          <ul className="action-review__evidence-list">
            {evidence.map((observation) => (
              <li key={observation.id}>
                <strong>{observation.metric}</strong>
                <span>{formatObservationValue(observation)}</span>
                <small>
                  {observation.source.organisation ??
                    observation.source.id ??
                    observation.source.type}{' '}
                  · {observation.confidence.level} confidence · received{' '}
                  {formatScenarioTime(observation.receivedAt)}
                </small>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Unknowns</h3>
          {decision.unknowns.length > 0 ? (
            <ul>
              {decision.unknowns.map((unknown) => (
                <li key={unknown}>{unknown}</li>
              ))}
            </ul>
          ) : (
            <p>No material unknowns recorded at decision time.</p>
          )}
        </section>

        <section>
          <h3>Assumptions</h3>
          {decision.assumptions.length > 0 ? (
            <ul>
              {decision.assumptions.map((assumption) => (
                <li key={assumption.id}>
                  {assumption.statement}
                  <small>Status: {assumption.status}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No explicit assumptions recorded.</p>
          )}
        </section>
      </div>

      <fieldset className="action-review__options">
        <legend>Choose one information-posture action</legend>

        <div className="action-review__option-grid">
          {actions.map((action) => {
            const selected = selectedActionId === action.id;
            const affectedEntityNames = (action.scope.entityIds ?? [])
              .map((entityId) => runtimeState.entitiesById[entityId]?.name)
              .filter((name): name is string => name !== undefined);

            return (
              <label
                className={`action-option${selected ? ' action-option--selected' : ''}`}
                key={action.id}
              >
                <div className="action-option__choice">
                  <input
                    type="radio"
                    name={`decision-${decision.id}`}
                    value={action.id}
                    checked={selected}
                    onChange={() => setSelectedActionId(action.id)}
                  />
                  <span>Select option</span>
                </div>

                <h3>{action.title}</h3>

                <dl className="action-option__meta">
                  <div>
                    <dt>Authority</dt>
                    <dd>{authorityLabels[action.authority]}</dd>
                  </div>
                  <div>
                    <dt>Reversible</dt>
                    <dd>{action.reversible ? 'Yes' : 'No'}</dd>
                  </div>
                </dl>

                <div className="action-option__section">
                  <h4>Expected effects</h4>
                  <ul>
                    {action.expectedEffects.map((effect, index) => (
                      <li key={`${action.id}-effect-${index}`}>
                        {effect.description}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="action-option__section">
                  <h4>Displaced risk / cost</h4>
                  <ul>
                    {action.displacedRisks.map((effect, index) => (
                      <li key={`${action.id}-risk-${index}`}>
                        {effect.description}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="action-option__scope">
                  <strong>Affected entities</strong>
                  <span>
                    {affectedEntityNames.length > 0
                      ? affectedEntityNames.join(' · ')
                      : 'No entity scope recorded'}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="action-review__footer">
        <p>
          Confirming records the selected Action and contemporaneous
          decision context in the runtime audit trail.
        </p>
        <button
          type="button"
          disabled={!selectedActionId}
          onClick={() => {
            if (selectedActionId) {
              onConfirm(selectedActionId);
            }
          }}
        >
          Confirm selected action
        </button>
      </div>

      <style>{`
        .action-review {
          max-width: 1500px;
          margin: 0 auto 20px;
          padding: 20px;
          border: 1px solid #8a6635;
          border-left: 4px solid #d09a4d;
          border-radius: 10px;
          background:
            linear-gradient(135deg, rgba(156, 111, 48, 0.14), transparent 48%),
            rgba(17, 25, 35, 0.98);
          box-shadow: 0 0 0 1px rgba(208, 154, 77, 0.08);
        }

        .action-review__header {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 24px;
          padding-bottom: 18px;
          border-bottom: 1px solid #354254;
        }

        .action-review__eyebrow {
          margin: 0 0 7px;
          color: #f0cf9c;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .action-review h2 {
          max-width: 880px;
          margin: 0;
          font-size: 1.2rem;
          line-height: 1.45;
        }

        .action-review__meta,
        .action-option__meta {
          margin: 0;
        }

        .action-review__meta {
          display: grid;
          min-width: 230px;
          gap: 8px;
        }

        .action-review__meta div,
        .action-option__meta div {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .action-review__meta dt,
        .action-option__meta dt {
          color: #8799aa;
          font-size: 0.74rem;
        }

        .action-review__meta dd,
        .action-option__meta dd {
          margin: 0;
          color: #eef4fa;
          font-size: 0.78rem;
          font-weight: 650;
          text-align: right;
        }

        .action-review__context-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          gap: 18px;
          padding: 18px 0;
          border-bottom: 1px solid #354254;
        }

        .action-review__context-grid section {
          min-width: 0;
          padding-right: 14px;
          border-right: 1px solid #2d3b4d;
        }

        .action-review__context-grid section:last-child {
          padding-right: 0;
          border-right: 0;
        }

        .action-review__context-grid h3,
        .action-option__section h4,
        .action-option__scope strong {
          margin: 0 0 8px;
          color: #91a5b9;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .action-review__context-grid ul,
        .action-option__section ul {
          display: grid;
          gap: 7px;
          margin: 0;
          padding-left: 18px;
          color: #c9d5df;
          font-size: 0.78rem;
          line-height: 1.45;
        }

        .action-review__context-grid p {
          margin: 0;
          color: #9eafbf;
          font-size: 0.78rem;
        }

        .action-review__context-grid li small {
          display: block;
          margin-top: 3px;
          color: #8295a8;
          font-size: 0.7rem;
        }

        .action-review__evidence-list {
          padding-left: 0 !important;
          list-style: none;
        }

        .action-review__evidence-list li {
          display: grid;
          gap: 2px;
          padding-left: 10px;
          border-left: 2px solid #51657a;
        }

        .action-review__evidence-list strong {
          overflow-wrap: anywhere;
          color: #dce7f1;
          font-size: 0.76rem;
        }

        .action-review__evidence-list span {
          overflow-wrap: anywhere;
          color: #f2f6fa;
        }

        .action-review__options {
          margin: 18px 0 0;
          padding: 0;
          border: 0;
        }

        .action-review__options legend {
          margin-bottom: 12px;
          color: #dbe5ee;
          font-size: 0.86rem;
          font-weight: 700;
        }

        .action-review__option-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .action-option {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 14px;
          padding: 16px;
          border: 1px solid #34465a;
          border-radius: 8px;
          background: #111923;
          cursor: pointer;
          transition:
            border-color 120ms ease,
            background-color 120ms ease,
            box-shadow 120ms ease;
        }

        .action-option:hover {
          border-color: #5b7795;
          background: #152131;
        }

        .action-option--selected {
          border-color: #62a9f2;
          background: rgba(35, 70, 105, 0.42);
          box-shadow: 0 0 0 1px rgba(98, 169, 242, 0.16);
        }

        .action-option__choice {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #9ccaff;
          font-size: 0.76rem;
          font-weight: 700;
        }

        .action-option__choice input {
          width: 17px;
          height: 17px;
          margin: 0;
          accent-color: #62a9f2;
        }

        .action-option__choice input:focus-visible {
          outline: 2px solid #8bc4ff;
          outline-offset: 3px;
        }

        .action-option h3 {
          margin: 0;
          color: #f1f5f9;
          font-size: 0.94rem;
          line-height: 1.4;
        }

        .action-option__meta {
          display: grid;
          gap: 6px;
          padding: 10px 0;
          border-top: 1px solid #2a394b;
          border-bottom: 1px solid #2a394b;
        }

        .action-option__section {
          display: grid;
          gap: 2px;
        }

        .action-option__section ul {
          padding-left: 16px;
        }

        .action-option__scope {
          display: grid;
          gap: 4px;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid #2a394b;
        }

        .action-option__scope strong {
          margin-bottom: 0;
        }

        .action-option__scope span {
          color: #aebdcb;
          font-size: 0.72rem;
          line-height: 1.45;
        }

        .action-review__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid #354254;
        }

        .action-review__footer p {
          max-width: 780px;
          margin: 0;
          color: #8fa1b2;
          font-size: 0.75rem;
          line-height: 1.45;
        }

        .action-review__footer button {
          min-width: 190px;
          padding: 10px 14px;
          border: 1px solid #4d90d8;
          border-radius: 6px;
          background: #1d568d;
          color: #f4f8fc;
          font-weight: 700;
          cursor: pointer;
        }

        .action-review__footer button:hover:not(:disabled),
        .action-review__footer button:focus-visible:not(:disabled) {
          border-color: #8bc4ff;
          background: #2567a7;
        }

        .action-review__footer button:focus-visible {
          outline: 2px solid #8bc4ff;
          outline-offset: 3px;
        }

        .action-review__footer button:disabled {
          border-color: #34465a;
          background: #1a2530;
          color: #6f8295;
          cursor: not-allowed;
        }

        @media (max-width: 1080px) {
          .action-review__option-grid,
          .action-review__context-grid {
            grid-template-columns: 1fr;
          }

          .action-review__context-grid section {
            padding: 0 0 14px;
            border-right: 0;
            border-bottom: 1px solid #2d3b4d;
          }

          .action-review__context-grid section:last-child {
            padding-bottom: 0;
            border-bottom: 0;
          }
        }

        @media (max-width: 680px) {
          .action-review {
            padding: 16px;
          }

          .action-review__header,
          .action-review__footer {
            align-items: stretch;
            flex-direction: column;
          }

          .action-review__meta {
            min-width: 0;
          }

          .action-review__footer button {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
