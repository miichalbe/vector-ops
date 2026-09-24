import { useEffect, useRef, useState } from 'react';
import type { Action, Decision } from '../core/contracts';

const AUTO_DISMISS_MS = 10_000;

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
  const onDismissRef = useRef(onDismiss);
  const [top, setTop] = useState(8);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const updateTop = () => {
      const header = document.querySelector<HTMLElement>('.app-header');
      const headerBottom = header?.getBoundingClientRect().bottom ?? 0;

      setTop(Math.max(8, Math.round(headerBottom + 8)));
    };

    updateTop();
    window.addEventListener('resize', updateTop);
    window.addEventListener('scroll', updateTop, { passive: true });

    return () => {
      window.removeEventListener('resize', updateTop);
      window.removeEventListener('scroll', updateTop);
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onDismissRef.current();
    }, AUTO_DISMISS_MS);

    return () => window.clearTimeout(timeoutId);
  }, [action.id, decision.id]);

  return (
    <section
      className="action-receipt"
      role="status"
      aria-live="polite"
      style={{ top }}
    >
      <div className="action-receipt__icon" aria-hidden="true">
        i
      </div>

      <div className="action-receipt__content">
        <div className="action-receipt__heading">
          <strong>Action recorded</strong>
          <span>
            {formatScenarioTime(decision.decidedAt ?? decision.openedAt)}
          </span>
        </div>
        <p>{action.title}</p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss action recorded notification"
        title="Dismiss"
      >
        ×
      </button>

      <style>{`
        .action-receipt {
          position: fixed;
          left: 50%;
          z-index: 80;
          display: grid;
          width: min(1500px, calc(100vw - 56px));
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 11px 14px;
          border: 1px solid #416f9f;
          border-left: 4px solid #62a9f2;
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(50, 105, 162, 0.18), transparent 58%),
            #101a26;
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.38);
          transform: translateX(-50%);
        }

        .action-receipt__icon {
          display: grid;
          width: 28px;
          height: 28px;
          place-items: center;
          border: 1px solid #5b91c8;
          border-radius: 50%;
          background: rgba(98, 169, 242, 0.12);
          color: #b9dcff;
          font-size: 0.78rem;
          font-weight: 900;
          text-transform: lowercase;
        }

        .action-receipt__content {
          min-width: 0;
        }

        .action-receipt__heading {
          display: flex;
          gap: 10px;
          align-items: baseline;
          margin-bottom: 2px;
        }

        .action-receipt__heading strong {
          color: #dcecff;
          font-size: 0.78rem;
          letter-spacing: 0.02em;
        }

        .action-receipt__heading span {
          color: #8fa8c1;
          font-size: 0.7rem;
          font-variant-numeric: tabular-nums;
        }

        .action-receipt p {
          margin: 0;
          overflow: hidden;
          color: #c4d1df;
          font-size: 0.8rem;
          line-height: 1.35;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .action-receipt > button {
          display: grid;
          width: 30px;
          height: 30px;
          place-items: center;
          border: 1px solid transparent;
          border-radius: 5px;
          background: transparent;
          color: #9eb5ca;
          font-size: 1.05rem;
          line-height: 1;
          cursor: pointer;
        }

        .action-receipt > button:hover {
          border-color: #416f9f;
          background: rgba(98, 169, 242, 0.1);
          color: #dcecff;
        }

        .action-receipt > button:focus-visible {
          outline: 2px solid #8bc4ff;
          outline-offset: 2px;
        }

        @media (max-width: 680px) {
          .action-receipt {
            width: calc(100vw - 36px);
            gap: 9px;
            padding: 10px 11px;
          }

          .action-receipt p {
            white-space: normal;
          }
        }
      `}</style>
    </section>
  );
}
