export default function RunCompletionControls({
  seed,
  onReplay,
  onNewRun,
}: {
  seed: string;
  onReplay: () => void;
  onNewRun: () => void;
}) {
  return (
    <aside className="run-completion-controls" aria-label="Run controls">
      <div>
        <span>Completed run</span>
        <strong>Seed {seed}</strong>
      </div>
      <button type="button" onClick={onReplay}>
        Replay same seed
      </button>
      <button type="button" className="run-completion-controls__primary" onClick={onNewRun}>
        New run
      </button>

      <style>{`
        .run-completion-controls {
          position: fixed;
          z-index: 110;
          right: 28px;
          bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 1px solid #40546b;
          border-radius: 10px;
          background: rgba(8, 12, 17, 0.96);
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.42);
          color: #dce7f1;
        }

        .run-completion-controls > div {
          display: grid;
          gap: 2px;
          margin-right: 4px;
        }

        .run-completion-controls span {
          color: #8498aa;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .run-completion-controls strong {
          font-size: 0.78rem;
          font-variant-numeric: tabular-nums;
        }

        .run-completion-controls button {
          padding: 8px 11px;
          border: 1px solid #3b5068;
          border-radius: 6px;
          background: #172331;
          color: #dce7f1;
          cursor: pointer;
        }

        .run-completion-controls button:hover,
        .run-completion-controls button:focus-visible {
          border-color: #62a9f2;
          outline: 2px solid transparent;
        }

        .run-completion-controls button:focus-visible {
          outline-color: #8bc4ff;
          outline-offset: 2px;
        }

        .run-completion-controls__primary {
          background: #285e94 !important;
          border-color: #4c8dcc !important;
        }

        @media (max-width: 680px) {
          .run-completion-controls {
            right: 12px;
            bottom: 12px;
            left: 12px;
            flex-wrap: wrap;
          }

          .run-completion-controls > div {
            width: 100%;
          }
        }
      `}</style>
    </aside>
  );
}
