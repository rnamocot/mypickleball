"use client";

import { useMemo, useState } from "react";
import { IconShuffle, IconUserPlus } from "../../Icons";
import { Ring } from "../charts";
import { mmss, timeLeft } from "../calc";
import { money } from "../data";
import { pickGroup, useNow, usePlayerLookup, useStore } from "../store";
import { Avatar, Empty, Meter, PageHead, Panel, SearchInput, Status } from "../ui";

export function OpenPlay() {
  const { state, dispatch } = useStore();
  const now = useNow(1000);
  const P = usePlayerLookup();
  const [q, setQ] = useState("");

  const s = state.settings;
  const inQueue = new Set(state.queue.map((x) => x.playerId));
  const waiting = state.queue.filter((x) => x.state === "waiting").sort((a, b) => a.sessionGames - b.sessionGames || a.waitingSince - b.waitingSince);
  const playing = state.queue.filter((x) => x.state === "playing");
  const next = pickGroup(state);
  const openCourts = state.courts.filter((c) => c.status === "open");
  const opCourts = state.courts.filter((c) => c.game?.kind === "open");
  const candidates = useMemo(
    () =>
      state.players
        .filter((p) => !inQueue.has(p.id))
        .filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.phone.includes(q))
        .sort((a, b) => b.lastVisit.localeCompare(a.lastVisit))
        .slice(0, 30),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.players, state.queue, q],
  );

  const avgWait = waiting.length ? waiting.reduce((a, w) => a + (now - w.waitingSince), 0) / waiting.length / 60000 : 0;
  const board = [...state.queue].sort((a, b) => b.sessionMinutes - a.sessionMinutes);
  const maxMin = Math.max(1, ...board.map((b) => b.sessionMinutes));

  return (
    <>
      <PageHead title="Open play" sub={`${state.queue.length} checked in · ${waiting.length} waiting · avg wait ${Math.round(avgWait)} min · ${opCourts.length} courts running`}>
        <div className="seg" role="group" aria-label="Rotation mode">
          <button aria-pressed={s.queueMode === "skill"} onClick={() => dispatch({ t: "settings", patch: { queueMode: "skill" } })}>
            Skill balanced
          </button>
          <button aria-pressed={s.queueMode === "fifo"} onClick={() => dispatch({ t: "settings", patch: { queueMode: "fifo" } })}>
            First come
          </button>
        </div>
        <select className="select" value={s.gameLength} onChange={(e) => dispatch({ t: "settings", patch: { gameLength: Number(e.target.value) } })} aria-label="Game length" style={{ height: 38 }}>
          {[10, 12, 15, 20, 25].map((m) => (
            <option key={m} value={m}>
              {m} min games
            </option>
          ))}
        </select>
        <a href="/tv" target="_blank" rel="noopener" className="btn btn-ghost btn-sm">
          TV board
        </a>
        <button className="btn btn-primary btn-sm" onClick={() => dispatch({ t: "fillCourts" })} disabled={next.length < 4 || openCourts.length === 0}>
          <IconShuffle size={16} /> Fill {openCourts.length} open court{openCourts.length === 1 ? "" : "s"}
        </button>
      </PageHead>

      <div className="op-grid">
        {/* check in */}
        <Panel
          title={
            <>
              <IconUserPlus size={18} /> Check in
            </>
          }
          pad={false}
        >
          <div style={{ padding: "14px 20px 6px" }}>
            <SearchInput value={q} onChange={setQ} placeholder="Name or phone" />
            <p style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 8 }}>Members play free. Drop-ins are charged {money(s.dropInFee)}.</p>
          </div>
          <div className="pick-list" style={{ margin: 0, maxHeight: 520 }}>
            {candidates.map((p) => (
              <button key={p.id} onClick={() => dispatch({ t: "checkIn", playerId: p.id })}>
                <Avatar name={p.name} hue={p.hue} size={30} />
                <span className="grow">
                  {p.name}
                  <small style={{ display: "block", color: "var(--dim)", fontSize: 12 }}>{p.planId ? state.plans.find((x) => x.id === p.planId)?.name : `Drop-in ${money(s.dropInFee)}`}</small>
                </span>
                <span className="rating">{p.rating.toFixed(2)}</span>
              </button>
            ))}
            {candidates.length === 0 && <p style={{ padding: 20, color: "var(--dim)" }}>No matching players.</p>}
          </div>
        </Panel>

        {/* queue */}
        <Panel
          title={
            <>
              Queue <small>{waiting.length} waiting</small>
            </>
          }
          pad={false}
        >
          {waiting.length === 0 ? (
            <Empty title="Nobody waiting" text="Check players in on the left. They join the back of the line." />
          ) : (
            <ul className="q-list">
              {waiting.map((w, i) => {
                const p = P(w.playerId);
                if (!p) return null;
                const isNext = next.includes(w.playerId);
                const mins = Math.floor((now - w.waitingSince) / 60000);
                return (
                  <li key={w.playerId} className={`q-item ${isNext ? "is-next" : ""}`} style={{ animationDelay: `${i * 20}ms` }}>
                    <span className="pos">{isNext ? "Up" : i + 1}</span>
                    <span className="who">
                      <Avatar name={p.name} hue={p.hue} size={30} />
                      <span>
                        <b>{p.name}</b>
                        <small>
                          {w.sessionGames} games · {w.sessionMinutes} min today
                        </small>
                      </span>
                    </span>
                    <span className="rating">{p.rating.toFixed(2)}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="wait" style={mins >= 15 ? { color: "var(--warn)" } : undefined}>
                        {mins} min
                      </span>
                      <button className="link-btn" onClick={() => dispatch({ t: "checkOut", playerId: p.id })} aria-label={`Check out ${p.name}`}>
                        Leave
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {next.length === 4 && (
            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Next group</span>
              <span className="av-stack">
                {next.map((id) => {
                  const p = P(id)!;
                  return <Avatar key={id} name={p.name} hue={p.hue} size={28} />;
                })}
              </span>
              <span style={{ fontSize: 13, color: "var(--dim)" }}>
                avg {(next.reduce((a, id) => a + (P(id)?.rating ?? 0), 0) / 4).toFixed(2)}
              </span>
            </div>
          )}
        </Panel>

        {/* courts */}
        <div className="stack">
          <Panel title="Courts running open play" pad={false}>
            {opCourts.length === 0 && <p style={{ padding: 20, color: "var(--dim)" }}>No open play games right now.</p>}
            {opCourts.map((c) => {
              const g = c.game!;
              const t = timeLeft(g.startedAt, g.durationMin, now);
              const over = t.left < 0;
              const soon = !over && t.left < 120;
              return (
                <div className="mini-court" key={c.id}>
                  <Ring pct={t.pct} size={46} tone={over ? "bad" : soon ? "warn" : "neon"}>
                    {c.name.replace("Court ", "C")}
                  </Ring>
                  <div style={{ minWidth: 0 }}>
                    <b style={{ fontVariantNumeric: "tabular-nums", color: over ? "var(--coral)" : undefined }}>
                      {mmss(t.left)} {over ? "over" : "left"}
                    </b>
                    <div className="names">{g.playerIds.map((id) => P(id)?.name.split(" ")[0]).join(", ")}</div>
                  </div>
                  <button className="btn btn-ghost btn-xs" onClick={() => dispatch({ t: "endGame", courtId: c.id })}>
                    End
                  </button>
                </div>
              );
            })}
            {openCourts.map((c) => (
              <div className="mini-court" key={c.id}>
                <Ring pct={0} size={46}>
                  {c.name.replace("Court ", "C")}
                </Ring>
                <div>
                  <Status tone="neon">Open</Status>
                </div>
                <button
                  className="btn btn-primary btn-xs"
                  disabled={next.length < 4}
                  onClick={() => dispatch({ t: "startGame", courtId: c.id, playerIds: next, label: "Open play", kind: "open", durationMin: s.gameLength })}
                >
                  Send group
                </button>
              </div>
            ))}
          </Panel>

          <Panel
            title={
              <>
                Play time today <small>fair-play tracker</small>
              </>
            }
            pad={false}
          >
            <ul className="rows" style={{ maxHeight: 380, overflowY: "auto" }}>
              {board.slice(0, 14).map((b) => {
                const p = P(b.playerId);
                if (!p) return null;
                return (
                  <li key={b.playerId}>
                    <span className="grow">
                      <span style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}>
                        <span>
                          {p.name}
                          {b.state === "playing" && <span style={{ color: "var(--neon)", marginLeft: 8, fontSize: 12 }}>on court</span>}
                        </span>
                        <b style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                          {b.sessionMinutes}m · {b.sessionGames}g
                        </b>
                      </span>
                      <Meter value={b.sessionMinutes} max={maxMin} tone={b.sessionGames === 0 ? "warn" : "neon"} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
      <p style={{ marginTop: 16, fontSize: 12.5, color: "var(--dim)" }}>
        Players with the fewest games go first. {s.queueMode === "skill" ? "Groups are matched within a tight rating band." : "Groups are formed strictly by arrival order."} {playing.length} players are on court now.
      </p>
    </>
  );
}
