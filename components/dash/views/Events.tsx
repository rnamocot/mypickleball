"use client";

import { useState } from "react";
import { IconPlus, IconShuffle, IconTrophy } from "../../Icons";
import { type ClubEvent, type Match, type Standing, addDays, fmtDate, money, uid, ymd } from "../data";
import { PlayerPicker } from "../modals";
import { useStore } from "../store";
import { Empty, Field, Meter, Modal, PageHead, Panel, Status, type Tone } from "../ui";

const tone: Record<ClubEvent["status"], Tone> = { Registering: "info", "In progress": "good", Completed: "idle" };

/** Doubles round robin with rotating partners (circle method). */
function roundRobin(names: string[], courts: string[], rounds: number): Match[] {
  const ps = [...names];
  if (ps.length % 4) ps.length = ps.length - (ps.length % 4);
  const out: Match[] = [];
  const fixed = ps[0];
  let rest = ps.slice(1);
  for (let r = 1; r <= rounds; r++) {
    const order = [fixed, ...rest];
    for (let i = 0; i + 3 < order.length; i += 4) {
      out.push({ round: r, court: courts[(i / 4) % courts.length], a: `${order[i]} / ${order[i + 3]}`, b: `${order[i + 1]} / ${order[i + 2]}` });
    }
    rest = [rest[rest.length - 1], ...rest.slice(0, -1)];
  }
  return out;
}

function applyScore(e: ClubEvent, m: Match, sa: number, sb: number): Standing[] {
  const individual = e.kind === "Round robin" || e.kind === "Ladder";
  const sideA = individual ? m.a.split(" / ") : [m.a];
  const sideB = individual ? m.b.split(" / ") : [m.b];
  const table = new Map(e.standings.map((s) => [s.name, { ...s }]));
  const bump = (name: string, won: boolean, pf: number, pa: number) => {
    const s = table.get(name) ?? { name, w: 0, l: 0, pf: 0, pa: 0 };
    s.w += won ? 1 : 0;
    s.l += won ? 0 : 1;
    s.pf += pf;
    s.pa += pa;
    table.set(name, s);
  };
  sideA.forEach((n) => bump(n, sa > sb, sa, sb));
  sideB.forEach((n) => bump(n, sb > sa, sb, sa));
  return Array.from(table.values());
}

export function Events() {
  const { state, dispatch } = useStore();
  const [selId, setSelId] = useState(state.events[0]?.id);
  const [creating, setCreating] = useState(false);
  const [gen, setGen] = useState(false);
  const ev = state.events.find((e) => e.id === selId);

  const standings = ev ? [...ev.standings].sort((a, b) => b.w - a.w || b.pf - b.pa - (a.pf - a.pa)) : [];
  const pending = ev?.matches.filter((m) => !m.score) ?? [];
  const done = ev?.matches.filter((m) => m.score) ?? [];

  return (
    <>
      <PageHead title="Leagues & events" sub={`${state.events.filter((e) => e.status !== "Completed").length} active · ${state.events.reduce((a, e) => a + e.entrants, 0)} entrants`}>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>
          <IconPlus size={16} /> New event
        </button>
      </PageHead>

      <div className="grid g-4">
        {state.events.map((e, i) => (
          <button key={e.id} className={`card ${selId === e.id ? "is-selected" : ""}`} style={{ animationDelay: `${i * 50}ms` }} onClick={() => setSelId(e.id)} aria-pressed={selId === e.id}>
            <div className="card-top">
              <span style={{ color: "var(--muted)", fontSize: 13 }}>{e.kind}</span>
              <Status tone={tone[e.status]}>{e.status}</Status>
            </div>
            <h3 style={{ marginTop: 10 }}>{e.name}</h3>
            <p className="sub">
              {fmtDate(e.start)}
              {e.end !== e.start ? ` to ${fmtDate(e.end)}` : ""} · {e.level}
            </p>
            <div style={{ marginTop: 16 }}>
              <span style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--muted)", marginBottom: 6 }}>
                <span>Entrants</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {e.entrants}/{e.capacity}
                </span>
              </span>
              <Meter value={e.entrants} max={e.capacity} />
            </div>
          </button>
        ))}
      </div>

      {ev && (
        <div className="grid g-main mt">
          <Panel
            title={
              <>
                <IconTrophy size={18} /> {ev.name} <small>standings</small>
              </>
            }
            action={
              <span style={{ display: "flex", gap: 8 }}>
                {ev.status === "Registering" && (
                  <button className="btn btn-ghost btn-xs" onClick={() => dispatch({ t: "updateEvent", id: ev.id, patch: { status: "In progress" } })}>
                    Start event
                  </button>
                )}
                {ev.status === "In progress" && (
                  <button className="btn btn-ghost btn-xs" onClick={() => dispatch({ t: "updateEvent", id: ev.id, patch: { status: "Completed" } })}>
                    Mark completed
                  </button>
                )}
                <button className="btn btn-primary btn-xs" onClick={() => setGen(true)}>
                  <IconShuffle size={14} /> Generate round robin
                </button>
              </span>
            }
            pad={false}
          >
            {standings.length === 0 ? (
              <Empty title="No results yet" text="Generate a round robin or add match scores to build the standings." />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>{ev.kind === "League" ? "Team" : "Player"}</th>
                      <th className="num">W</th>
                      <th className="num">L</th>
                      <th className="num">Win %</th>
                      <th className="num">Points +/-</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, i) => (
                      <tr key={s.name}>
                        <td className="muted" style={i === 0 ? { color: "var(--neon)", fontWeight: 700 } : undefined}>
                          {i + 1}
                        </td>
                        <td style={{ fontWeight: i < 3 ? 600 : 400 }}>{s.name}</td>
                        <td className="num">{s.w}</td>
                        <td className="num muted">{s.l}</td>
                        <td className="num">{s.w + s.l ? Math.round((s.w / (s.w + s.l)) * 100) : 0}%</td>
                        <td className="num" style={{ color: s.pf - s.pa >= 0 ? "var(--good)" : "var(--coral)" }}>
                          {s.pf - s.pa >= 0 ? "+" : ""}
                          {s.pf - s.pa}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <div className="stack">
            <Panel
              title={
                <>
                  Matches <small>{pending.length} to play</small>
                </>
              }
              pad={false}
            >
              {ev.matches.length === 0 && <p style={{ padding: 20, color: "var(--dim)" }}>No matches scheduled.</p>}
              <ul className="rows" style={{ maxHeight: 420, overflowY: "auto" }}>
                {pending.slice(0, 12).map((m, i) => (
                  <MatchRow key={`${m.round}-${m.a}-${i}`} m={m} onScore={(a, b) => {
                    const idx = ev.matches.indexOf(m);
                    const matches = ev.matches.map((x, j) => (j === idx ? { ...x, score: `${a}-${b}` } : x));
                    dispatch({ t: "updateEvent", id: ev.id, patch: { matches, standings: applyScore(ev, m, a, b) } });
                  }} />
                ))}
                {done.slice(-6).reverse().map((m, i) => (
                  <li key={`d-${i}`}>
                    <span className="t">R{m.round}</span>
                    <span className="grow" style={{ fontSize: 13 }}>
                      {m.a} <span style={{ color: "var(--dim)" }}>vs</span> {m.b}
                    </span>
                    <b style={{ fontVariantNumeric: "tabular-nums" }}>{m.score}</b>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Event details">
              <dl className="dl">
                <dt>Format</dt>
                <dd>{ev.kind}</dd>
                <dt>Dates</dt>
                <dd>
                  {fmtDate(ev.start, { month: "long", day: "numeric" })} to {fmtDate(ev.end, { month: "long", day: "numeric" })}
                </dd>
                <dt>Entry fee</dt>
                <dd>{money(ev.fee)}</dd>
                <dt>Collected</dt>
                <dd>{money(ev.fee * ev.entrants)}</dd>
                <dt>Spots left</dt>
                <dd>{Math.max(0, ev.capacity - ev.entrants)}</dd>
              </dl>
            </Panel>
          </div>
        </div>
      )}

      <NewEvent open={creating} onClose={() => setCreating(false)} onCreated={setSelId} />
      {ev && <GenerateRR open={gen} onClose={() => setGen(false)} ev={ev} />}
    </>
  );
}

function MatchRow({ m, onScore }: { m: Match; onScore: (a: number, b: number) => void }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  return (
    <li style={{ flexWrap: "wrap" }}>
      <span className="t">
        R{m.round} · {m.court.replace("Court ", "C")}
      </span>
      <span className="grow" style={{ fontSize: 13 }}>
        {m.a} <span style={{ color: "var(--dim)" }}>vs</span> {m.b}
      </span>
      <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <input className="select" style={{ width: 46, height: 32, padding: "0 8px", backgroundImage: "none" }} inputMode="numeric" value={a} onChange={(e) => setA(e.target.value.replace(/\D/g, ""))} aria-label={`${m.a} score`} />
        <input className="select" style={{ width: 46, height: 32, padding: "0 8px", backgroundImage: "none" }} inputMode="numeric" value={b} onChange={(e) => setB(e.target.value.replace(/\D/g, ""))} aria-label={`${m.b} score`} />
        <button className="btn btn-primary btn-xs" disabled={!a || !b || a === b} onClick={() => onScore(Number(a), Number(b))}>
          Save
        </button>
      </span>
    </li>
  );
}

function GenerateRR({ open, onClose, ev }: { open: boolean; onClose: () => void; ev: ClubEvent }) {
  const { state, dispatch } = useStore();
  const [sel, setSel] = useState<string[]>([]);
  const [rounds, setRounds] = useState(4);
  const usable = sel.length - (sel.length % 4);
  const courts = state.courts.filter((c) => c.status !== "maintenance").map((c) => c.name);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate round robin"
      footer={
        <>
          <span style={{ marginRight: "auto", alignSelf: "center", color: "var(--muted)", fontSize: 13.5 }}>
            {usable} players · {(usable / 4) * rounds} games
          </span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            disabled={usable < 4}
            onClick={() => {
              const names = sel.slice(0, usable).map((id) => state.players.find((p) => p.id === id)!.name);
              dispatch({
                t: "updateEvent",
                id: ev.id,
                patch: { matches: roundRobin(names, courts, rounds), standings: [], entrants: Math.max(ev.entrants, usable), status: "In progress" },
              });
              dispatch({ t: "notice", text: `Round robin created for ${ev.name}: ${rounds} rounds.`, tone: "good" });
              setSel([]);
              onClose();
            }}
          >
            Create schedule
          </button>
        </>
      }
    >
      <p style={{ color: "var(--muted)", marginBottom: 16, fontSize: 14 }}>
        Partners rotate every round so everyone plays with and against new people. Pick players in multiples of four.
      </p>
      <div className="form" style={{ marginBottom: 16 }}>
        <Field label="Rounds">
          <select value={rounds} onChange={(e) => setRounds(Number(e.target.value))}>
            {[3, 4, 5, 6, 7].map((r) => (
              <option key={r} value={r}>
                {r} rounds
              </option>
            ))}
          </select>
        </Field>
      </div>
      <PlayerPicker selected={sel} onToggle={(id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))} max={32} />
    </Modal>
  );
}

function NewEvent({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const { dispatch } = useStore();
  const [f, setF] = useState({ name: "", kind: "Round robin" as ClubEvent["kind"], start: ymd(addDays(new Date(), 7)), end: ymd(addDays(new Date(), 7)), level: "3.0–3.5", fee: 15, capacity: 16 });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF({ ...f, [k]: v });
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New event"
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            disabled={!f.name.trim()}
            onClick={() => {
              const id = uid("e");
              dispatch({ t: "addEvent", event: { ...f, id, end: f.end < f.start ? f.start : f.end, entrants: 0, status: "Registering", standings: [], matches: [] } });
              onCreated(id);
              onClose();
            }}
          >
            Open registration
          </button>
        </>
      }
    >
      <div className="form">
        <Field label="Name" full>
          <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Saturday Social Round Robin" />
        </Field>
        <Field label="Format">
          <select value={f.kind} onChange={(e) => set("kind", e.target.value as ClubEvent["kind"])}>
            {(["Round robin", "League", "Ladder", "Tournament"] as const).map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Level">
          <select value={f.level} onChange={(e) => set("level", e.target.value)}>
            {["2.5–3.0", "3.0–3.5", "3.5–4.0", "4.0+", "All levels"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Starts">
          <input type="date" value={f.start} onChange={(e) => set("start", e.target.value)} />
        </Field>
        <Field label="Ends">
          <input type="date" value={f.end} onChange={(e) => set("end", e.target.value)} />
        </Field>
        <Field label="Entry fee">
          <input type="number" min={0} value={f.fee} onChange={(e) => set("fee", Number(e.target.value))} />
        </Field>
        <Field label="Capacity">
          <input type="number" min={4} value={f.capacity} onChange={(e) => set("capacity", Number(e.target.value))} />
        </Field>
      </div>
    </Modal>
  );
}
