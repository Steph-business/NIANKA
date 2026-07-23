export const Logo = ({ className = "", style = {} }: { className?: string, style?: React.CSSProperties }) => {
  return (
    <svg
      viewBox="0 0 230 52"
      className={className}
      style={{ height: '100%', width: 'auto', ...style }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>{`
          .logo-ni {
            font-family: var(--font-inter), 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 900;
            font-size: 44px;
            letter-spacing: -2px;
            fill: #1a6b0a;
          }
          .logo-anka {
            font-family: var(--font-inter), 'Inter', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 900;
            font-size: 44px;
            letter-spacing: -2px;
            fill: #40BB1B;
          }
        `}</style>
      </defs>

      {/* NIAN — dark green */}
      <text x="2" y="42" className="logo-ni">NIAN</text>

      {/* KA — bright green */}
      <text x="138" y="42" className="logo-anka">KA</text>
    </svg>
  );
};
