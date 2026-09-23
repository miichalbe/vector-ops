import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  Action,
  ActionId,
  Assessment,
  Decision,
  Observation,
  Projection,
} from '../core/contracts';
import type { ScenarioRuntimeState } from '../core/runtime-state';

interface ActionReviewProps {
  runtimeState: ScenarioRuntimeState;
  decision: Decision;
  question: string;
  ownerLabel: string;
  onConfirm(actionId: ActionId): void;
}

const confidenceRank = {
  low: 0,
  medium: 1,
  high: 2,
} as const;

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

function authorityLabel(action: Action) {
  if (
    action.authority === 'operator' &&
    action.title.trim().toLowerCase().startsWith('recommend ')
  ) {
    return 'Operator · recommendation only';
  }

  switch (action.authority) {
    case 'operator':
      return 'Operator';
    case 'supervisor':
      return 'Supervisor';
    case 'wzzk':
      return 'WZZK';
    case 'voivode':
      return 'Voivode';
    case 'external':
      return 'External authority';
  }
}

function lowestConfidence(
  assessments: readonly Assessment[],
  projections: readonly Projection[],
) {
  const claims = [...assessments, ...projections];

  if (claims.length === 0) {
    return 'unknown';
  }

  return claims.reduce<'low' | 'medium' | 'high'>(
    (lowest, claim) =>
      confidenceRank[claim.confidence.level] < confidenceRank[lowest]
        ? claim.confidence.level
        : lowest,
    'high',
  );
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
  const panelRef = useRef<HTMLElement>(null);

  const actions = useMemo(
    () =>
      decision.actionIds
        .map((actionId) =>
          runtimeState.actions.find((action) => action.id === actionId),
        )
        .filter((action): action is Action => action !== undefined),
    [decision.actionIds, runtimeState.actions],
  );
  const evidence = useMemo(
    () =>
      decision.evidenceIds
        .map((evidenceId) =>
          runtimeState.observations.find(
            (observation) => observation.id === evidenceId,
          ),
        )
        .filter(
          (observation): observation is Observation =>
            observation !== undefined,
        ),
    [decision.evidenceIds, runtimeState.observations],
  );
  const assessmentIds = useMemo(
    () => [
      ...new Set(
        actions.flatMap((action) => action.scope.assessmentIds ?? []),
      ),
    ],
    [actions],
  );
  const projectionIds = useMemo(
    () => [
      ...new Set(
        actions.flatMap((action) => action.scope.projectionIds ?? []),
      ),
    ],
    [actions],
  );
  const assessments = useMemo(
    () =>
      assessmentIds
        .map((assessmentId) =>
          runtimeState.assessments
            .filter((assessment) => assessment.id === assessmentId)
            .reduce<Assessment | undefined>(
              (latest, assessment) =>
                !latest || assessment.revision > latest.revision
                  ? assessment
                  : latest,
              undefined,
            ),
        )
        .filter((assessment): assessment is Assessment => assessment !== undefined),
    [assessmentIds, runtimeState.assessments],
  );
  const projections = useMemo(
    () =>
      projectionIds
        .map((projectionId) =>
          runtimeState.projections
            .filter((projection) => projection.id === projectionId)
            .reduce<Projection | undefined>(
              (latest, projection) =>
                !latest || projection.revision > latest.revision
                  ? projection
                  : latest,
              undefined,
            ),
        )
        .filter((projection): projection is Projection => projection !== undefined),
    [projectionIds, runtimeState.projections],
  );
  const reasoningConfidence = lowestConfidence(assessments, projections);
  const selectedAction = selectedActionId
    ? actions.find((action) => action.id === selectedActionId)
    : undefined;

  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return undefined;
    }

    const focusPanel = panel;
    const focusableSelector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'summary',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    const firstFocusable = focusPanel.querySelector<HTMLElement>(focusableSelector);

    (firstFocusable ?? focusPanel).focus();

    function trapFocus(event: KeyboardEvent) {
      if (event.key !== 'Tab') {
        return;
      }

      const focusable = [
        ...focusPanel.querySelectorAll<HTMLElement>(focusableSelector),
      ].filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        focusPanel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable.at(-1);

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    focusPanel.addEventListener('keydown', trapFocus);
    return () => focusPanel.removeEventListener('keydown', trapFocus);
  }, []);

  return (
    <div className="decision-focus-overlay">
      <section
        ref={panelRef}
        className="action-review"
        aria-labelledby="action-review-title"
        aria-describedby="action-review-mode-description"
        tabIndex={-1}
      >
        <div className="action-review__mode-strip">
          <div>
            <span className="action-review__mode-dot" aria-hidden="true" />
            <span>Decision focus mode</span>
          </div>
          <p id="action-review-mode-description">
            Scenario progression is paused until this blocking decision is recorded.
          </p>
        </div>

        <div className="action-review__header">
          <div className="action-review__question">
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

        <div className="action-review__why-now">
          <div>
            <span className="action-review__why-label">Why now</span>
            <strong>
              {evidence.length} correlated observation{evidence.length === 1 ? '' : 's'} ·{' '}
              {assessments.length} active Assessment{assessments.length === 1 ? '' : 's'} ·{' '}
              {projections.length} Projection{projections.length === 1 ? '' : 's'} ·{' '}
              {reasoningConfidence} confidence
            </strong>
          </div>

          <details className="action-review__reasoning">
            <summary>Review reasoning</summary>
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
                <h3>Assumptions used by reasoning</h3>
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
          </details>
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
                    <span>{selected ? 'Selected' : 'Select option'}</span>
                  </div>

                  <h3>{action.title}</h3>

                  <dl className="action-option__meta">
                    <div>
                      <dt>Authority</dt>
                      <dd>{authorityLabel(action)}</dd>
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
          <div className="action-review__selection-summary" aria-live="polite">
            {selectedAction ? (
              <>
                <span>Selected action</span>
                <strong>{selectedAction.title}</strong>
              </>
            ) : (
              <>
                <span>No action selected</span>
                <strong>Select one option to continue.</strong>
              </>
            )}
          </div>

          <button
            type="button"
            disabled={!selectedActionId}
            onClick={() => {
              if (selectedActionId) {
                onConfirm(selectedActionId);
              }
            }}
          >
            Confirm selection
          </button>
        </div>
      </section>

      <style>{`
        .decision-focus-overlay {
          position: fixed;
          z-index: 1000;
          inset: 0;
          overflow-y: auto;
          padding: clamp(108px, 12vh, 150px) 28px 36px;
          background: rgba(3, 9, 16, 0.58);
          backdrop-filter: saturate(0.58) brightness(0.62);
        }

        .action-review {
          width: min(1500px, 100%);
          margin-inline: auto;
          overflow: hidden;
          border: 1px solid #4aa3df;
          border-radius: 8px;
          background:
            linear-gradient(155deg, rgba(16, 77, 123, 0.46), transparent 42%),
            linear-gradient(180deg, #081c2f 0%, #061625 100%);
          box-shadow:
            0 24px 80px rgba(0, 0, 0, 0.62),
            0 0 0 1px rgba(112, 196, 255, 0.1) inset;
          color: #eaf5ff;
        }

        .action-review:focus-visible {
          outline: 2px solid #8fd5ff;
          outline-offset: 3px;
        }

        .action-review__mode-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 10px 16px;
          border-bottom: 1px solid rgba(101, 185, 239, 0.32);
          background: #0b4168;
          color: #dff4ff;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.74rem;
          letter-spacing: 0.04em;
        }

        .action-review__mode-strip > div {
          display: flex;
          align-items: center;
          gap: 9px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .action-review__mode-strip p {
          margin: 0;
          color: #a9d6ef;
          font-size: 0.7rem;
          text-align: right;
        }

        .action-review__mode-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #78d4ff;
          box-shadow: 0 0 12px rgba(120, 212, 255, 0.82);
        }

        .action-review__header {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 28px;
          padding: 24px 24px 18px;
        }

        .action-review__question {
          min-width: 0;
        }

        .action-review__eyebrow {
          margin: 0 0 8px;
          color: #82d2ff;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .action-review h2 {
          max-width: 920px;
          margin: 0;
          color: #f4f9fd;
          font-size: clamp(1.15rem, 2vw, 1.45rem);
          line-height: 1.42;
        }

        .action-review__meta,
        .action-option__meta {
          margin: 0;
        }

        .action-review__meta {
          display: grid;
          min-width: 250px;
          gap: 8px;
          padding: 12px 14px;
          border: 1px solid rgba(109, 188, 239, 0.18);
          border-radius: 6px;
          background: rgba(3, 18, 31, 0.4);
        }

        .action-review__meta div,
        .action-option__meta div {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .action-review__meta dt,
        .action-option__meta dt {
          color: #86a8bf;
          font-size: 0.72rem;
        }

        .action-review__meta dd,
        .action-option__meta dd {
          margin: 0;
          color: #eef8ff;
          font-size: 0.76rem;
          font-weight: 700;
          text-align: right;
        }

        .action-review__why-now {
          margin: 0 24px;
          padding: 14px 16px;
          border: 1px solid rgba(99, 181, 233, 0.22);
          border-radius: 7px;
          background: rgba(5, 25, 42, 0.72);
        }

        .action-review__why-now > div {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 10px;
        }

        .action-review__why-label {
          color: #8cd7ff;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .action-review__why-now strong {
          color: #dcecf6;
          font-size: 0.8rem;
          font-weight: 650;
        }

        .action-review__reasoning {
          margin-top: 10px;
          border-top: 1px solid rgba(99, 181, 233, 0.16);
          padding-top: 10px;
        }

        .action-review__reasoning summary {
          width: fit-content;
          color: #8cd7ff;
          font-size: 0.78rem;
          font-weight: 750;
          cursor: pointer;
        }

        .action-review__reasoning summary:focus-visible {
          border-radius: 3px;
          outline: 2px solid #8fd5ff;
          outline-offset: 3px;
        }

        .action-review__context-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          gap: 18px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(99, 181, 233, 0.16);
        }

        .action-review__context-grid section {
          min-width: 0;
          padding-right: 14px;
          border-right: 1px solid rgba(99, 181, 233, 0.16);
        }

        .action-review__context-grid section:last-child {
          padding-right: 0;
          border-right: 0;
        }

        .action-review__context-grid h3,
        .action-option__section h4,
        .action-option__scope strong {
          margin: 0 0 8px;
          color: #8daec3;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .action-review__context-grid ul,
        .action-option__section ul {
          display: grid;
          gap: 7px;
          margin: 0;
          padding-left: 18px;
          color: #c7dae7;
          font-size: 0.76rem;
          line-height: 1.48;
        }

        .action-review__context-grid p {
          margin: 0;
          color: #9db5c5;
          font-size: 0.76rem;
        }

        .action-review__context-grid li small {
          display: block;
          margin-top: 3px;
          color: #7894a7;
          font-size: 0.68rem;
        }

        .action-review__evidence-list {
          padding-left: 0 !important;
          list-style: none;
        }

        .action-review__evidence-list li {
          display: grid;
          gap: 2px;
          padding-left: 10px;
          border-left: 2px solid #397ca8;
        }

        .action-review__evidence-list strong,
        .action-review__evidence-list span {
          overflow-wrap: anywhere;
        }

        .action-review__evidence-list strong {
          color: #dbedf8;
          font-size: 0.74rem;
        }

        .action-review__evidence-list span {
          color: #f2f8fc;
        }

        .action-review__options {
          margin: 22px 24px 0;
          padding: 0;
          border: 0;
        }

        .action-review__options legend {
          margin-bottom: 12px;
          color: #e5f1f8;
          font-size: 0.84rem;
          font-weight: 800;
        }

        .action-review__option-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .action-option {
          position: relative;
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 14px;
          padding: 16px;
          border: 1px solid #294d66;
          border-radius: 7px;
          background: rgba(4, 21, 35, 0.76);
          cursor: pointer;
          transition:
            border-color 120ms ease,
            background-color 120ms ease,
            box-shadow 120ms ease,
            transform 120ms ease;
        }

        .action-option:hover {
          border-color: #579ccc;
          background: rgba(10, 45, 72, 0.78);
          transform: translateY(-1px);
        }

        .action-option:focus-within {
          border-color: #8fd5ff;
          box-shadow: 0 0 0 2px rgba(143, 213, 255, 0.18);
        }

        .action-option--selected {
          border-color: #79ceff;
          background:
            linear-gradient(160deg, rgba(35, 123, 180, 0.34), transparent 62%),
            rgba(7, 35, 56, 0.96);
          box-shadow:
            0 0 0 2px rgba(121, 206, 255, 0.2),
            0 12px 30px rgba(0, 0, 0, 0.26);
        }

        .action-option--selected::before {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          height: 3px;
          border-radius: 7px 7px 0 0;
          background: #79ceff;
          content: '';
        }

        .action-option__choice {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8fd5ff;
          font-size: 0.74rem;
          font-weight: 800;
        }

        .action-option__choice input {
          width: 17px;
          height: 17px;
          margin: 0;
          accent-color: #69c7fa;
        }

        .action-option__choice input:focus-visible {
          outline: 2px solid #8fd5ff;
          outline-offset: 3px;
        }

        .action-option h3 {
          margin: 0;
          color: #f3f8fb;
          font-size: 0.94rem;
          line-height: 1.42;
        }

        .action-option__meta {
          display: grid;
          gap: 6px;
          padding: 10px 0;
          border-top: 1px solid rgba(99, 181, 233, 0.16);
          border-bottom: 1px solid rgba(99, 181, 233, 0.16);
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
          border-top: 1px solid rgba(99, 181, 233, 0.16);
        }

        .action-option__scope strong {
          margin-bottom: 0;
        }

        .action-option__scope span {
          color: #a9bfcd;
          font-size: 0.7rem;
          line-height: 1.45;
        }

        .action-review__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          margin-top: 22px;
          padding: 16px 24px 22px;
          border-top: 1px solid rgba(99, 181, 233, 0.2);
          background: rgba(3, 16, 27, 0.44);
        }

        .action-review__selection-summary {
          display: grid;
          max-width: 920px;
          gap: 3px;
        }

        .action-review__selection-summary span {
          color: #7f9db1;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .action-review__selection-summary strong {
          color: #dfeef7;
          font-size: 0.78rem;
          line-height: 1.42;
        }

        .action-review__footer button {
          min-width: 166px;
          padding: 10px 14px;
          border: 1px solid #70c9fa;
          border-radius: 5px;
          background: #0e6b9f;
          color: #f5fbff;
          font-weight: 800;
          cursor: pointer;
        }

        .action-review__footer button:hover:not(:disabled),
        .action-review__footer button:focus-visible:not(:disabled) {
          border-color: #b8e7ff;
          background: #1280bc;
        }

        .action-review__footer button:focus-visible {
          outline: 2px solid #a9e1ff;
          outline-offset: 3px;
        }

        .action-review__footer button:disabled {
          border-color: #294d66;
          background: #112a3b;
          color: #63839a;
          cursor: not-allowed;
        }

        @media (max-width: 1080px) {
          .decision-focus-overlay {
            padding-top: 80px;
          }

          .action-review__option-grid,
          .action-review__context-grid {
            grid-template-columns: 1fr;
          }

          .action-review__context-grid section {
            padding: 0 0 14px;
            border-right: 0;
            border-bottom: 1px solid rgba(99, 181, 233, 0.16);
          }

          .action-review__context-grid section:last-child {
            padding-bottom: 0;
            border-bottom: 0;
          }
        }

        @media (max-width: 680px) {
          .decision-focus-overlay {
            padding: 24px 14px;
          }

          .action-review__mode-strip,
          .action-review__header,
          .action-review__footer {
            align-items: stretch;
            flex-direction: column;
          }

          .action-review__mode-strip p {
            text-align: left;
          }

          .action-review__header,
          .action-review__footer {
            padding-right: 16px;
            padding-left: 16px;
          }

          .action-review__why-now,
          .action-review__options {
            margin-right: 16px;
            margin-left: 16px;
          }

          .action-review__meta {
            min-width: 0;
          }

          .action-review__footer button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
