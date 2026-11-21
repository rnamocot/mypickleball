/** Animated rally trajectories: dotted ball flight arcs with a light streak travelling along them. */
export function RallyBackground() {
  const a = "M-60 620 C 260 120, 620 80, 860 420 S 1300 720, 1560 160";
  const b = "M-80 260 C 300 520, 640 640, 980 300 S 1380 -40, 1600 380";
  return (
    <svg className="rally" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="trailGrad" x1="0" x2="1">
          <stop offset="0" stopColor="#d4ff3f" stopOpacity="0" />
          <stop offset="1" stopColor="#d4ff3f" stopOpacity=".9" />
        </linearGradient>
      </defs>
      <path className="trail" d={a} />
      <path className="trail" d={b} opacity=".6" />
      <path className="trail-solid" d={a} pathLength={1000} />
      <path className="trail-solid t2" d={b} pathLength={1000} />
      <circle r="5" fill="#d4ff3f">
        <animateMotion dur="7s" repeatCount="indefinite" path={a} />
      </circle>
      <circle r="4" fill="#d4ff3f" opacity=".7">
        <animateMotion dur="9s" begin="-3s" repeatCount="indefinite" path={b} />
      </circle>
    </svg>
  );
}
