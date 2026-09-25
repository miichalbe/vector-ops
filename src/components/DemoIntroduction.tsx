import { useEffect, useRef } from 'react';

export default function DemoIntroduction({
  mode,
  seed,
  onContinue,
}: {
  mode: 'intro' | 'about';
  seed: string;
  onContinue: () => void;
}) {
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primaryButtonRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    if (mode !== 'about') {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, onContinue]);

  const isIntro = mode === 'intro';

  return (
    <div
      className="demo-introduction"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-introduction-title"
      aria-describedby="demo-introduction-summary"
    >
      <div className="demo-introduction__panel">
        <header className="demo-introduction__hero">
          <div>
            <p className="demo-introduction__eyebrow">
              Public alpha · synthetic scenario
            </p>
            <h1 id="demo-introduction-title">
              Coordinate a cascading infrastructure disruption
            </h1>
            <p id="demo-introduction-summary">
              VECTOR OPS is a portfolio demonstrator for cross-domain operations
              coordination. In this scenario you are the Duty Operations Officer
              at a Voivodeship Crisis Management Centre.
            </p>
          </div>
          <div className="demo-introduction__run">
            <span>Scenario 01</span>
            <strong>Seed {seed}</strong>
          </div>
        </header>

        <div className="demo-introduction__guide" aria-label="How this demo works">
          <article>
            <span>01</span>
            <h2>Watch the operational picture</h2>
            <p>
              Entity tiles show current known state. Live Activity shows what
              changed and when.
            </p>
          </article>
          <article>
            <span>02</span>
            <h2>Inspect the reasoning</h2>
            <p>
              Assessments describe the current interpretation. Projections expose
              possible downstream consequences, evidence and uncertainty.
            </p>
          </article>
          <article>
            <span>03</span>
            <h2>Make bounded decisions</h2>
            <p>
              The simulation pauses at three Decision points. Review the available
              Actions, expected effects and unknowns before confirming a choice.
            </p>
          </article>
        </div>

        <section className="demo-introduction__disclosure" aria-label="Demo disclosure">
          <strong>Synthetic, non-live demonstrator</strong>
          <p>
            Nowy Brzeg County and the operational data in this scenario are
            fictional. VECTOR OPS is not connected to real infrastructure,
            emergency systems or live public-safety data and is not intended for
            operational use.
          </p>
        </section>

        <footer className="demo-introduction__footer">
          <p>
            {isIntro
              ? 'Scenario time remains at 07:40 until you start the run.'
              : 'Closing this information view returns you to the current run without resetting it.'}
          </p>
          <button
            ref={primaryButtonRef}
            type="button"
            onClick={onContinue}
          >
            {isIntro ? 'Start scenario' : 'Return to scenario'}
          </button>
        </footer>
      </div>

      <style>{`
        .demo-introduction {
          position: fixed;
          z-index: 200;
          inset: 0;
          display: grid;
          place-items: center;
          overflow-y: auto;
          padding: 28px;
          background: rgba(5, 8, 12, 0.88);
          backdrop-filter: blur(8px);
          color: #e7edf5;
        }

        .demo-introduction__panel {
          width: min(920px, 100%);
          border: 1px solid #38506a;
          border-radius: 14px;
          background:
            radial-gradient(circle at 8% 0%, rgba(43, 83, 123, 0.26), transparent 34%),
            #101821;
          box-shadow: 0 26px 80px rgba(0, 0, 0, 0.48);
        }

        .demo-introduction__hero {
          display: flex;
          justify-content: space-between;
          gap: 32px;
          padding: 28px 30px 24px;
          border-bottom: 1px solid #293a4e;
        }

        .demo-introduction__eyebrow {
          margin: 0 0 8px;
          color: #8fa8c0;
          font-size: 0.7rem;
          font-weight: 750;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .demo-introduction__hero h1 {
          max-width: 650px;
          margin: 0;
          font-size: clamp(1.7rem, 4vw, 2.5rem);
          line-height: 1.08;
        }

        .demo-introduction__hero p:last-child {
          max-width: 670px;
          margin: 12px 0 0;
          color: #aab9c8;
          font-size: 0.9rem;
          line-height: 1.55;
        }

        .demo-introduction__run {
          display: grid;
          align-content: start;
          gap: 4px;
          min-width: max-content;
          padding: 9px 11px;
          border: 1px solid #344b63;
          border-radius: 7px;
          background: #0d141c;
          text-align: right;
        }

        .demo-introduction__run span {
          color: #7f94a8;
          font-size: 0.66rem;
          text-transform: uppercase;
        }

        .demo-introduction__run strong {
          font-size: 0.78rem;
          font-variant-numeric: tabular-nums;
        }

        .demo-introduction__guide {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          padding: 22px 30px;
        }

        .demo-introduction__guide article {
          padding: 15px;
          border: 1px solid #293a4d;
          border-radius: 9px;
          background: rgba(10, 16, 23, 0.64);
        }

        .demo-introduction__guide article > span {
          color: #6e9bc8;
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .demo-introduction__guide h2 {
          margin: 7px 0 8px;
          font-size: 0.88rem;
        }

        .demo-introduction__guide p {
          margin: 0;
          color: #96a9bb;
          font-size: 0.77rem;
          line-height: 1.5;
        }

        .demo-introduction__disclosure {
          margin: 0 30px;
          padding: 13px 15px;
          border: 1px solid #3c526a;
          border-radius: 8px;
          background: #0d151e;
        }

        .demo-introduction__disclosure strong {
          color: #c5d7e8;
          font-size: 0.76rem;
        }

        .demo-introduction__disclosure p {
          margin: 5px 0 0;
          color: #8fa4b8;
          font-size: 0.76rem;
          line-height: 1.5;
        }

        .demo-introduction__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          padding: 22px 30px 28px;
        }

        .demo-introduction__footer p {
          margin: 0;
          color: #8195a8;
          font-size: 0.75rem;
        }

        .demo-introduction__footer button {
          min-width: 150px;
          padding: 10px 16px;
          border: 1px solid #5795d1;
          border-radius: 7px;
          background: #285e94;
          color: #f3f8fc;
          font-weight: 700;
          cursor: pointer;
        }

        .demo-introduction__footer button:hover {
          background: #316da7;
        }

        .demo-introduction__footer button:focus-visible {
          outline: 2px solid #9fd0ff;
          outline-offset: 3px;
        }

        @media (max-width: 760px) {
          .demo-introduction {
            place-items: start center;
            padding: 14px;
          }

          .demo-introduction__hero,
          .demo-introduction__footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .demo-introduction__run {
            text-align: left;
          }

          .demo-introduction__guide {
            grid-template-columns: 1fr;
          }

          .demo-introduction__footer button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
