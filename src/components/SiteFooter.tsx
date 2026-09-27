export default function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Project information">
      <span>© 2026 Michał Biernacki</span>
      <span aria-hidden="true">·</span>
      <a href="https://michalbiernacki.com/work/vector-ops/" target="_blank" rel="noreferrer">
        Case Study ↗
      </a>
      <span aria-hidden="true">·</span>
      <a href="https://github.com/miichalbe/vector-ops" target="_blank" rel="noreferrer">
        GitHub ↗
      </a>

      <style>{`
        .site-footer {
          position: fixed;
          z-index: 100;
          right: 0;
          bottom: 0;
          left: 0;
          display: flex;
          min-height: 46px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px 18px;
          border-top: 1px solid #202d3b;
          background: rgba(17, 25, 35, 0.97);
          box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.22);\n          color: #7d91a4;
          font-size: 0.75rem;
          line-height: 1.2;
          backdrop-filter: blur(8px);
        }

        .site-footer a {
          color: #9ab4cc;
          font-weight: 650;
          text-decoration: none;
        }

        .site-footer a:hover {
          color: #b6cee3;
        }

        .site-footer a:focus-visible {
          border-radius: 2px;
          outline: 2px solid #8bc4ff;
          outline-offset: 2px;
        }

        @media (max-width: 480px) {
          .site-footer {
            gap: 6px;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </footer>
  );
}
