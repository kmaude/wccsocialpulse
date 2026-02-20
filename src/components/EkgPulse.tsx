const EkgPulse = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 60"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline
      points="0,30 30,30 40,30 50,10 60,50 70,20 80,40 90,30 120,30 130,30 140,10 150,50 160,20 170,40 180,30 200,30"
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ekg-line"
    />
    <style>{`
      .ekg-line {
        stroke-dasharray: 400;
        stroke-dashoffset: 400;
        animation: ekg-draw 2s linear infinite;
      }
      @keyframes ekg-draw {
        0% { stroke-dashoffset: 400; opacity: 0.4; }
        50% { opacity: 1; }
        100% { stroke-dashoffset: 0; opacity: 0.4; }
      }
    `}</style>
  </svg>
);

export default EkgPulse;
