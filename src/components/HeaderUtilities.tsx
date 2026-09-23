export default function HeaderUtilities() {
  return (
    <div className="header-utilities" aria-label="Planned workspace utilities">
      <span
        className="header-utility"
        aria-label="Operational history, coming soon"
        data-tooltip="History · Coming soon"
        role="img"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 7v5l3 2" />
          <path d="M3.7 9a8.5 8.5 0 1 1-.2 5" />
          <path d="M3 4v5h5" />
        </svg>
      </span>

      <span
        className="header-utility"
        aria-label="Notifications, coming soon"
        data-tooltip="Coming soon"
        role="img"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      </span>

      <style>{`
        .header-utilities {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .header-utility {
          position: relative;
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border: 1px solid #2f4053;
          border-radius: 6px;
          background: #111923;
          color: #72879a;
          cursor: help;
        }

        .header-utility svg {
          width: 17px;
          height: 17px;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 1.7;
        }

        .header-utility::after {
          position: absolute;
          z-index: 20;
          right: 0;
          bottom: calc(100% + 8px);
          width: max-content;
          max-width: 180px;
          padding: 6px 8px;
          border: 1px solid #40546b;
          border-radius: 5px;
          background: #080c11;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.38);
          color: #dce7f1;
          content: attr(data-tooltip);
          font-size: 0.68rem;
          font-weight: 650;
          opacity: 0;
          visibility: hidden;
          transform: translateY(3px);
          transition:
            opacity 120ms ease,
            transform 120ms ease,
            visibility 120ms ease;
          pointer-events: none;
        }

        .header-utility:hover::after {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
