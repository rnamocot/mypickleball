"use client";

import { useEffect, useState } from "react";

type Court = { no: number; title: string; sub: string; left: number; total: number };

const initial: Court[] = [
  { no: 1, title: "Rivera / Chen vs Park / Ali", sub: "Open play · 3.5–4.0", left: 754, total: 900 },
  { no: 2, title: "Third-shot drop clinic", sub: "Coach Dana · 6 of 8", left: 2140, total: 3600 },
  { no: 3, title: "Okafor / Lee vs Brooks / Kim", sub: "Open play · 3.0–3.5", left: 138, total: 900 },
  { no: 4, title: "Available now", sub: "Next group in queue: 4 players", left: 0, total: 0 },
];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function CourtBoard() {
  const [courts, setCourts] = useState(initial);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setCourts((cs) =>
        cs.map((c) => {
          if (c.total === 0) return c;
          const left = c.left <= 1 ? c.total : c.left - 1;
          return { ...c, left };
        }),
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="board" role="img" aria-label="Live court board showing four pickleball courts, timers and the open play queue">
      <div className="board-head">
        <strong>Court board</strong>
        <span className="live">Live</span>
      </div>
      {courts.map((c) => {
        const open = c.total === 0;
        const warn = !open && c.left < 180;
        return (
          <div key={c.no} className={`court-row ${open ? "is-open" : ""} ${warn ? "is-warn" : ""}`}>
            <span className="court-no">C{c.no}</span>
            <div className="court-meta">
              <b>{c.title}</b>
              <small>{c.sub}</small>
              {!open && (
                <div className="court-bar">
                  <i style={{ width: `${(1 - c.left / c.total) * 100}%` }} />
                </div>
              )}
            </div>
            <span className="court-time">{open ? "Open" : fmt(c.left)}</span>
          </div>
        );
      })}
      <div className="board-foot">
        <span>11 players waiting</span>
        <span className="avatars" aria-hidden="true">
          {["#d4ff3f", "#8fb4ff", "#ffb199", "#c7f0d8"].map((bg, i) => (
            <span key={i} style={{ background: bg }}>
              {["JM", "AR", "SK", "TL"][i]}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
