import type { Action, Decision } from '../core/contracts';

interface ActionReceiptProps {
  action: Action;
  decision: Decision;
  onDismiss(): void;
}

function formatScenarioTime(time: number) {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export default function ActionReceipt({
  action,
  decision,
  onDismiss,
}: ActionReceiptProps) {
  return (
    <section className="action-receipt" aria-live="polite">
      <div className="action-receipt__icon" aria-hidden="true">
        ✓
      </div>

      <div className="action-receipt__content">
        <p className="action-receipt__eyebrow">Action recorded</p>
        <h2>{action.title}</h2>
        <p>
          Recorded at{' '}
          <strong>
            {formatScenarioTime(decision.decidedAt ?? decision.openedAt)}
          </strong>
          . The decision context remains available for the operational history and After-Action Report.
        </p>

        <details>
          <summary>Review recorded effects</summary>
          <div className="action-receipt__details">
            <section>
              <h3>Expected effects</h3>
              <ul>
                {action.expectedEffects.map((effect, index) => (
                  <li key={`${action.id}-receipt-effect-${index}`}>
                    {effect.description}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3>Displaced risk / cost</h3>
              <ul>
                {action.displacedRisks.map((effect, index) => (
                  <li key={`${action.id}-receipt-risk-${index}`}>
                    {effect.description}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </details>
      </div>

      <button type="button" onClick={onDismiss}>
        Continue
      </button>

      <style>{`
        .action-receipt {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 16px;
          width: min(1500px, 100%);
          margin: 0 auto 20px;
          padding: 16px 18px;
          border: 1px solid #2f6f58;
          border-left: 4px solid #5fb98c;
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(47, 111, 88, 0.16), transparent 54%),
            #101b1a;
          box-shadow: 0 0 0 1px rgba(95, 185, 140, 0.06);
        }

        .action-receipt__icon {
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border: 1px solid #5fb98c;
          border-radius: 50%;
          background: rgba(95, 185, 140, 0.12);
          color: #a7e2c4;
          font-weight: 900;
        }

        .action-receipt__content {
          min-width: 0;
        }

        .action-receipt__eyebrow {
          margin: 0 0 4px;
          color: #8dd2ad;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .action-receipt h2 {
          margin: 0 0 6px;
          color: #edf7f2;
          font-size: 0.98rem;
          line-height: 1.4;
        }

        .action-receipt p {
          margin: 0;
          color: #a8bbb2;
          font-size: 0.78rem;
          line-height: 1.5;
        }

        .action-receipt details {
          margin-top: 10px;
        }

        .action-receipt summary {
          width: fit-content;
          color: #9dd8bb;
          font-size: 0.76rem;
          font-weight: 750;
          cursor: pointer;
        }

        .action-receipt summary:focus-visible {
          border-radius: 3px;
          outline: 2px solid #9dd8bb;
          outline-offset: 3px;
        }

        .action-receipt__details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #28443a;
        }

        .action-receipt__details h3 {
          margin: 0 0 6px;
          color: #7fa895;
          font-size: 0.68rem;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .action-receipt__details ul {
          display: grid;
          gap: 5px;
          margin: 0;
          padding-left: 16px;
          color: #b9cbc2;
          font-size: 0.74rem;
          line-height: 1.45;
        }

        .action-receipt > button {
          align-self: center;
          padding: 8px 13px;
          border: 1px solid #477c67;
          border-radius: 5px;
          background: #173b2e;
          color: #dff4e9;
          font-weight: 750;
          cursor: pointer;
        }

        .action-receipt > button:hover,
        .action-receipt > button:focus-visible {
          border-color: #7bc7a1;
          background: #1f4b3b;
        }

        .action-receipt > button:focus-visible {
          outline: 2px solid #9dd8bb;
          outline-offset: 3px;
        }

        @media (max-width: 720px) {
          .action-receipt {
            grid-template-columns: auto 1fr;
          }

          .action-receipt > button {
            grid-column: 1 / -1;
            width: 100%;
          }

          .action-receipt__details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
