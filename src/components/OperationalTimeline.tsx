import { useEffect, useRef, useState } from 'react';
import type { EntityId } from '../core/contracts';
import type {
  OperationalTimelineClaimKind,
  OperationalTimelineEntry,
} from './operational-timeline';

function formatScenarioTime(time: number) {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function TimelineEntryContent({ entry }: { entry: OperationalTimelineEntry }) {
  return (
    <>
      <time className="timeline-entry__time">
        {formatScenarioTime(entry.scenarioTime)}
      </time>
      <div className="timeline-entry__body">
        <div className="timeline-entry__title-row">
          <strong>{entry.title}</strong>
          <span className={`timeline-entry__kind timeline-entry__kind--${entry.kind}`}>
            {entry.label}
          </span>
        </div>
        <span className="timeline-entry__summary">{entry.summary}</span>
        {entry.meta ? <small>{entry.meta}</small> : null}
      </div>
    </>
  );
}

function claimKind(
  entry: OperationalTimelineEntry,
): OperationalTimelineClaimKind | undefined {
  return entry.kind === 'assessment' || entry.kind === 'projection'
    ? entry.kind
    : undefined;
}

export default function OperationalTimeline({
  entries,
  onSelectEntity,
  onSelectClaim,
}: {
  entries: readonly OperationalTimelineEntry[];
  onSelectEntity: (entityId: EntityId) => void;
  onSelectClaim: (
    kind: OperationalTimelineClaimKind,
    claimId: string,
  ) => void;
}) {
  const seenEntryIds = useRef(new Set(entries.map((entry) => entry.id)));
  const [freshEntryIds, setFreshEntryIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    const newlyArrived = entries
      .map((entry) => entry.id)
      .filter((id) => !seenEntryIds.current.has(id));

    if (newlyArrived.length === 0) {
      return;
    }

    for (const id of newlyArrived) {
      seenEntryIds.current.add(id);
    }

    setFreshEntryIds((current) => {
      const next = new Set(current);

      for (const id of newlyArrived) {
        next.add(id);
      }

      return next;
    });
  }, [entries]);

  return (
    <section className="operational-timeline" aria-labelledby="live-activity-title">
      <div className="operational-timeline__heading">
        <div>
          <p className="eyebrow">Cross-domain chronology</p>
          <h2 id="live-activity-title">Live activity</h2>
        </div>
        <span>{entries.length} entries · newest first</span>
      </div>

      <ol
        className="operational-timeline__list"
        tabIndex={entries.length > 5 ? 0 : undefined}
        aria-label="Operational activity, newest first"
      >
        {entries.map((entry) => {
          const entryClaimKind = claimKind(entry);
          const hasClaimTarget =
            entry.claimId !== undefined && entryClaimKind !== undefined;
          const interactive = entry.entityId !== undefined || hasClaimTarget;
          const actionLabel = entry.entityId
            ? 'View entity →'
            : entryClaimKind === 'assessment'
              ? 'View Assessment →'
              : 'View Projection →';

          return (
            <li
              key={entry.id}
              className={
                freshEntryIds.has(entry.id)
                  ? 'timeline-entry-row timeline-entry-row--fresh'
                  : 'timeline-entry-row'
              }
            >
              {interactive ? (
                <button
                  type="button"
                  className="timeline-entry timeline-entry--interactive"
                  onClick={() => {
                    if (entry.entityId) {
                      onSelectEntity(entry.entityId);
                      return;
                    }

                    if (entry.claimId && entryClaimKind) {
                      onSelectClaim(entryClaimKind, entry.claimId);
                    }
                  }}
                  aria-label={`${formatScenarioTime(entry.scenarioTime)} ${entry.title}: ${entry.summary}. ${entry.entityId ? 'View entity details.' : `View current ${entryClaimKind}.`}`}
                >
                  <TimelineEntryContent entry={entry} />
                  <span className="timeline-entry__action" aria-hidden="true">
                    {actionLabel}
                  </span>
                </button>
              ) : (
                <div className="timeline-entry">
                  <TimelineEntryContent entry={entry} />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <style>{`
        .operational-timeline {
          max-width: 1500px;
          margin: 0 auto 20px;
          overflow: hidden;
          border: 1px solid #273548;
          border-radius: 10px;
          background:
            linear-gradient(135deg, rgba(45, 86, 125, 0.1), transparent 45%),
            rgba(17, 25, 35, 0.94);
        }

        .operational-timeline__heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          padding: 14px 16px 12px;
          border-bottom: 1px solid #263446;
        }

        .operational-timeline__heading h2,
        .operational-timeline__heading p {
          margin-top: 0;
        }

        .operational-timeline__heading h2 {
          margin-bottom: 0;
          color: #e7edf5;
          font-size: 1.05rem;
        }

        .operational-timeline__heading .eyebrow {
          margin-bottom: 5px;
          color: #8da2b8;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .operational-timeline__heading > span {
          color: #8496a8;
          font-size: 0.76rem;
        }

        .operational-timeline__list {
          max-height: 276px;
          margin: 0;
          padding: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          list-style: none;
          scrollbar-gutter: stable;
        }

        .operational-timeline__list:focus-visible {
          outline: 2px solid #8bc4ff;
          outline-offset: -2px;
        }

        .timeline-entry-row {
          background: transparent;
        }

        .operational-timeline__list .timeline-entry-row + .timeline-entry-row {
          border-top: 1px solid #223043;
        }

        .timeline-entry-row--fresh {
          animation: timeline-entry-fresh 2.6s ease-out;
        }

        @keyframes timeline-entry-fresh {
          0% {
            background: rgba(98, 169, 242, 0.28);
            box-shadow: inset 4px 0 0 #62a9f2;
          }
          38% {
            background: rgba(98, 169, 242, 0.16);
            box-shadow: inset 4px 0 0 rgba(98, 169, 242, 0.74);
          }
          100% {
            background: transparent;
            box-shadow: inset 4px 0 0 transparent;
          }
        }

        .timeline-entry {
          display: grid;
          width: 100%;
          grid-template-columns: 72px minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
          padding: 11px 16px;
          border: 0;
          background: transparent;
          color: inherit;
          text-align: left;
        }

        .timeline-entry--interactive {
          cursor: pointer;
          transition: background-color 120ms ease;
        }

        .timeline-entry--interactive:hover {
          background: rgba(71, 114, 158, 0.12);
        }

        .timeline-entry--interactive:focus-visible {
          background: rgba(71, 114, 158, 0.16);
          outline: 2px solid #8bc4ff;
          outline-offset: -2px;
        }

        .timeline-entry__time {
          align-self: start;
          padding-top: 2px;
          color: #a8bdd2;
          font-size: 0.82rem;
          font-weight: 750;
          font-variant-numeric: tabular-nums;
        }

        .timeline-entry__body {
          display: grid;
          min-width: 0;
          gap: 3px;
        }

        .timeline-entry__title-row {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 9px;
        }

        .timeline-entry__title-row strong {
          overflow: hidden;
          color: #e7edf5;
          font-size: 0.82rem;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .timeline-entry__kind {
          flex: none;
          padding: 2px 6px;
          border: 1px solid #3b5068;
          border-radius: 999px;
          color: #9fb4c9;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .timeline-entry__kind--assessment,
        .timeline-entry__kind--projection {
          border-color: #8b6c3c;
          color: #e8c891;
        }

        .timeline-entry__kind--coordination,
        .timeline-entry__kind--decision {
          border-color: #416f9f;
          color: #a9d1fb;
        }

        .timeline-entry__summary {
          overflow: hidden;
          color: #d6e0e9;
          font-size: 0.82rem;
          line-height: 1.35;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .timeline-entry__body small {
          overflow: hidden;
          color: #7f91a3;
          font-size: 0.7rem;
          line-height: 1.3;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .timeline-entry__action {
          color: #91bde9;
          font-size: 0.72rem;
          font-weight: 650;
          white-space: nowrap;
        }

        @media (prefers-reduced-motion: reduce) {
          .timeline-entry-row--fresh {
            animation-duration: 0.01ms;
          }
        }

        @media (max-width: 680px) {
          .operational-timeline__heading {
            align-items: start;
            flex-direction: column;
          }

          .timeline-entry {
            grid-template-columns: 58px minmax(0, 1fr);
          }

          .timeline-entry__action {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
