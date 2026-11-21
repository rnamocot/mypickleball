import type { Court, Player } from "./data";
import { initials } from "./data";

/** Top-down pickleball court: blue playing area, green apron, kitchen lines, net, player tokens. */
export function CourtViz({ court, players }: { court: Court; players: (Player | undefined)[] }) {
  const maint = court.status === "maintenance";
  const outdoor = court.surface === "Outdoor";
  const spots = [
    [34, 22],
    [34, 66],
    [166, 22],
    [166, 66],
  ];
  const singles = players.length === 2 ? [spots[0], spots[3]] : spots;
  const lesson = court.game?.kind === "lesson";
  return (
    <svg viewBox="0 0 200 110" role="img" aria-label={`${court.name} diagram`}>
      <rect width="200" height="110" fill={outdoor ? "#1d3b2c" : "#1b3324"} />
      <rect x="14" y="8" width="172" height="94" rx="2" fill={maint ? "#2a2f30" : outdoor ? "#24518f" : "#1f4a86"} />
      <g stroke="rgba(255,255,255,.85)" strokeWidth="1.2" fill="none">
        <rect x="14" y="8" width="172" height="94" />
        <path d="M76 8v94M124 8v94M14 55h62M124 55h62" />
      </g>
      <path d="M100 4v102" stroke="#e9eee6" strokeWidth="2.2" />
      <path d="M100 4v102" stroke="rgba(0,0,0,.35)" strokeWidth=".6" strokeDasharray="1.5 1.5" />
      {maint && (
        <g>
          <rect x="14" y="8" width="172" height="94" fill="url(#hatch)" />
          <defs>
            <pattern id="hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <rect width="3" height="8" fill="rgba(224,161,0,.25)" />
            </pattern>
          </defs>
        </g>
      )}
      {court.status === "open" && (
        <circle cx="100" cy="55" r="5" fill="var(--neon)" className="ply">
          <animate attributeName="r" values="4;6;4" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
      {!maint &&
        players.length > 0 &&
        (lesson
          ? [
              <g key="coach" className="ply">
                <circle cx="100" cy="55" r="9" fill="var(--neon)" />
                <text x="100" y="58.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0a0d05">
                  CO
                </text>
              </g>,
              ...[
                [50, 30],
                [50, 80],
                [150, 30],
                [150, 80],
                [70, 55],
                [130, 55],
              ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.5" fill="rgba(255,255,255,.8)" />),
            ]
          : singles.map(([x, y], i) => {
              const p = players[i];
              if (!p) return null;
              return (
                <g key={i} className="ply">
                  <circle cx={x} cy={y} r="10" fill={`oklch(0.86 0.12 ${p.hue})`} stroke="rgba(7,9,10,.6)" strokeWidth="1.5" />
                  <text x={x} y={y + 3.4} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#0a0d05">
                    {initials(p.name)}
                  </text>
                </g>
              );
            }))}
      {court.game && court.game.kind !== "lesson" && (
        <circle r="2.6" fill="#d4ff3f">
          <animateMotion dur="2.2s" repeatCount="indefinite" path="M40 30 Q 100 -6 160 62 Q 100 96 40 30" />
        </circle>
      )}
    </svg>
  );
}
