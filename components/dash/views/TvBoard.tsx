"use client";

import { Ring } from "../charts";
import { mmss, timeLeft } from "../calc";
import { LogoMark } from "../../Logo";
import { fmtTime } from "../data";
import { StoreProvider, pickGroup, useNow, useStore } from "../store";

/** Full-screen court board for the facility TV. Updates every second, no controls. */
export function TvBoard() {
  return (
    <StoreProvider fallback={<div className="dash-loading" />}>
      <Board />
    </StoreProvider>
  );
}

function Board() {
  const { state } = useStore();
  const now = useNow(1000);
  const first = (id: string) => state.players.find((p) => p.id === id)?.name.split(" ")[0] ?? "";
  const waiting = state.queue
    .filter((q) => q.state === "waiting")
    .sort((a, b) => a.sessionGames - b.sessionGames || a.waitingSince - b.waitingSince);
  const next = pickGroup(state);
  const d = new Date(now);

  return (
    <div className="tv">
      <header className="tv-head">
        <div className="tv-brand">
          <LogoMark size={44} />
          <div>
            <b>{state.settings.clubName}</b>
            <span>Court board</span>
          </div>
        </div>
        <div className="tv-clock" suppressHydrationWarning>
          {fmtTime(d.getHours() * 60 + d.getMinutes())}
        </div>
      </header>

      <div className="tv-grid">
        <section className="tv-courts">
          {state.courts.map((c) => {
            const g = c.game;
            const t = g ? timeLeft(g.startedAt, g.durationMin, now) : null;
            const over = !!t && t.left < 0;
            const soon = !!t && !over && t.left < 120;
            return (
              <div key={c.id} className={`tv-court ${c.status} ${over ? "over" : ""}`}>
                <div className="tv-court-top">
                  <b>{c.name}</b>
                  <span>{c.status === "maintenance" ? "Closed" : g ? (g.kind === "open" ? "Open play" : g.kind === "lesson" ? "Clinic" : "Booked") : "Open"}</span>
                </div>
                {g && t ? (
                  <div className="tv-court-body">
                    <Ring pct={t.pct} size={86} tone={over ? "bad" : soon ? "warn" : g.kind === "lesson" ? "blue" : "neon"}>
                      <span style={{ fontSize: 18 }}>{mmss(t.left)}</span>
                    </Ring>
                    <p>{g.kind === "lesson" ? g.label : g.playerIds.map(first).join(" · ")}</p>
                  </div>
                ) : (
                  <div className="tv-court-body">
                    <p className="tv-free">{c.status === "maintenance" ? c.note ?? "Maintenance" : "Available"}</p>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <aside className="tv-side">
          <div className="tv-next">
            <span>Up next</span>
            <b>{next.length === 4 ? next.map(first).join(", ") : "Check in at the desk"}</b>
          </div>
          <div className="tv-queue">
            <span>
              In line · {waiting.length} · {state.settings.gameLength}-min games
            </span>
            <ol>
              {waiting.slice(0, 12).map((q) => (
                <li key={q.playerId} className={next.includes(q.playerId) ? "is-next" : ""}>
                  {first(q.playerId)} {state.players.find((p) => p.id === q.playerId)?.name.split(" ")[1]?.[0]}.
                  <em>{q.sessionGames} games</em>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
