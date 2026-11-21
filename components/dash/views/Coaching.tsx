"use client";

import { useState } from "react";
import { IconPlus } from "../../Icons";
import { type Lesson, addDays, fmtDate, fmtTime, money, uid, ymd } from "../data";
import { PlayerPicker } from "../modals";
import { usePlayerLookup, useStore } from "../store";
import { Avatar, Drawer, Field, Meter, Modal, PageHead, Panel, Status } from "../ui";

export function Coaching() {
  const { state } = useStore();
  const [coach, setCoach] = useState<string | "all">("all");
  const [sel, setSel] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const today = ymd(new Date());
  const weekEnd = ymd(addDays(new Date(), 6));
  const week = state.lessons.filter((l) => l.date >= today && l.date <= weekEnd);
  const shown = week.filter((l) => coach === "all" || l.coachId === coach).sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
  const days = Array.from(new Set(shown.map((l) => l.date)));

  const statsFor = (id: string) => {
    const ls = week.filter((l) => l.coachId === id);
    const seats = ls.reduce((a, l) => a + l.capacity, 0);
    const filled = ls.reduce((a, l) => a + l.enrolled.length, 0);
    const revenue = ls.reduce((a, l) => a + l.enrolled.length * l.price, 0);
    return { sessions: ls.length, fill: seats ? Math.round((filled / seats) * 100) : 0, revenue };
  };

  return (
    <>
      <PageHead title="Coaching" sub={`${week.length} sessions this week · ${week.reduce((a, l) => a + l.enrolled.length, 0)} players enrolled`}>
        <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
          <IconPlus size={16} /> New session
        </button>
      </PageHead>

      <div className="grid g-4">
        {state.coaches.map((c, i) => {
          const s = statsFor(c.id);
          return (
            <button key={c.id} className={`card ${coach === c.id ? "is-selected" : ""}`} style={{ animationDelay: `${i * 50}ms` }} onClick={() => setCoach(coach === c.id ? "all" : c.id)} aria-pressed={coach === c.id}>
              <div className="card-top">
                <span className="who">
                  <Avatar name={c.name} hue={c.hue} size={42} />
                  <span>
                    <b style={{ fontSize: 15 }}>{c.name}</b>
                    <small>{c.specialty}</small>
                  </span>
                </span>
              </div>
              <div className="card-stats">
                <div>
                  <b>{s.sessions}</b>
                  <span>Sessions</span>
                </div>
                <div>
                  <b>{s.fill}%</b>
                  <span>Filled</span>
                </div>
                <div>
                  <b>{money(s.revenue)}</b>
                  <span>Booked</span>
                </div>
              </div>
              <p style={{ marginTop: 14, fontSize: 12.5, color: "var(--dim)" }}>
                {money(c.rate)}/hr private · ★ {c.rating.toFixed(1)}
              </p>
            </button>
          );
        })}
      </div>

      <Panel
        className="mt"
        title={
          <>
            Schedule <small>{coach === "all" ? "all coaches · next 7 days" : `${state.coaches.find((c) => c.id === coach)?.name} · next 7 days`}</small>
          </>
        }
        action={
          coach !== "all" ? (
            <button className="link-btn" onClick={() => setCoach("all")}>
              Show all coaches
            </button>
          ) : undefined
        }
        pad={false}
      >
        {days.map((d) => (
          <div key={d}>
            <div className="day-head">{d === today ? "Today" : fmtDate(d, { weekday: "long", month: "short", day: "numeric" })}</div>
            <ul className="rows">
              {shown
                .filter((l) => l.date === d)
                .map((l) => {
                  const c = state.coaches.find((x) => x.id === l.coachId)!;
                  const full = l.enrolled.length >= l.capacity;
                  return (
                    <li key={l.id} style={{ cursor: "pointer" }} onClick={() => setSel(l.id)}>
                      <time>{fmtTime(l.start)}</time>
                      <span className="grow">
                        <b style={{ fontWeight: 550 }}>{l.title}</b>
                        <small style={{ display: "block", color: "var(--dim)", fontSize: 12.5 }}>
                          {c.name} · {state.courts.find((x) => x.id === l.courtId)?.name} · {l.level} · {l.duration} min
                        </small>
                      </span>
                      <span style={{ width: 120 }}>
                        <span style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5, color: "var(--muted)" }}>
                          <span>{l.kind}</span>
                          <span style={{ fontVariantNumeric: "tabular-nums" }}>
                            {l.enrolled.length}/{l.capacity}
                          </span>
                        </span>
                        <Meter value={l.enrolled.length} max={l.capacity} tone={full ? "warn" : "neon"} />
                      </span>
                      <span style={{ minWidth: 80, textAlign: "right" }}>{full ? <Status tone="warn">Full</Status> : <Status tone="good">Open</Status>}</span>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </Panel>

      <LessonDrawer id={sel} onClose={() => setSel(null)} />
      <NewLesson open={adding} onClose={() => setAdding(false)} />
    </>
  );
}

function LessonDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const P = usePlayerLookup();
  const [picking, setPicking] = useState(false);
  const l = state.lessons.find((x) => x.id === id);
  if (!l) return null;
  const c = state.coaches.find((x) => x.id === l.coachId)!;
  return (
    <Drawer
      open
      onClose={() => {
        setPicking(false);
        onClose();
      }}
      title={l.title}
      footer={
        <button className="btn btn-primary btn-sm" disabled={l.enrolled.length >= l.capacity} onClick={() => setPicking(!picking)}>
          {picking ? "Done" : "Enroll player"}
        </button>
      }
    >
      <dl className="dl">
        <dt>Coach</dt>
        <dd>{c.name}</dd>
        <dt>When</dt>
        <dd>
          {fmtDate(l.date, { weekday: "long", month: "short", day: "numeric" })} · {fmtTime(l.start)} ({l.duration} min)
        </dd>
        <dt>Court</dt>
        <dd>{state.courts.find((x) => x.id === l.courtId)?.name}</dd>
        <dt>Level</dt>
        <dd>{l.level}</dd>
        <dt>Price</dt>
        <dd>{money(l.price)} per player</dd>
        <dt>Coach payout</dt>
        <dd>{money(Math.round(l.enrolled.length * l.price * 0.7))} (70%)</dd>
      </dl>
      <div className="section-title">
        Roster · {l.enrolled.length}/{l.capacity}
      </div>
      {picking ? (
        <PlayerPicker
          selected={l.enrolled}
          max={l.capacity}
          onToggle={(pid) => dispatch({ t: l.enrolled.includes(pid) ? "unenroll" : "enroll", lessonId: l.id, playerId: pid })}
        />
      ) : (
        <ul className="rows" style={{ margin: "0 -20px" }}>
          {l.enrolled.length === 0 && <li style={{ color: "var(--dim)" }}>No one enrolled yet.</li>}
          {l.enrolled.map((pid) => {
            const p = P(pid);
            if (!p) return null;
            return (
              <li key={pid}>
                <Avatar name={p.name} hue={p.hue} size={28} />
                <span className="grow">{p.name}</span>
                <span className="rating">{p.rating.toFixed(2)}</span>
                <button className="link-btn" onClick={() => dispatch({ t: "unenroll", lessonId: l.id, playerId: pid })}>
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}

function NewLesson({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [f, setF] = useState({
    coachId: state.coaches[0].id,
    title: "",
    kind: "Clinic" as Lesson["kind"],
    date: ymd(addDays(new Date(), 1)),
    start: 18 * 60,
    duration: 60,
    courtId: state.courts[0]?.id,
    capacity: 8,
    price: 30,
    level: "3.0–3.5",
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF({ ...f, [k]: v });
  const times = [];
  for (let m = state.settings.open; m < state.settings.close; m += 30) times.push(m);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New coaching session"
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              dispatch({ t: "addLesson", lesson: { ...f, id: uid("l"), title: f.title || (f.kind === "Private" ? "Private lesson" : `${f.level} ${f.kind.toLowerCase()}`), capacity: f.kind === "Private" ? 1 : f.capacity, enrolled: [] } });
              onClose();
            }}
          >
            Publish session
          </button>
        </>
      }
    >
      <div className="form">
        <Field label="Coach">
          <select value={f.coachId} onChange={(e) => set("coachId", e.target.value)}>
            {state.coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Format">
          <select value={f.kind} onChange={(e) => set("kind", e.target.value as Lesson["kind"])}>
            <option>Private</option>
            <option>Clinic</option>
            <option>Camp</option>
          </select>
        </Field>
        <Field label="Title" full>
          <input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Reset & speed-up clinic" />
        </Field>
        <Field label="Date">
          <input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label="Start">
          <select value={f.start} onChange={(e) => set("start", Number(e.target.value))}>
            {times.map((m) => (
              <option key={m} value={m}>
                {fmtTime(m)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Duration">
          <select value={f.duration} onChange={(e) => set("duration", Number(e.target.value))}>
            {[45, 60, 90, 120].map((d) => (
              <option key={d} value={d}>
                {d} min
              </option>
            ))}
          </select>
        </Field>
        <Field label="Court">
          <select value={f.courtId} onChange={(e) => set("courtId", e.target.value)}>
            {state.courts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        {f.kind !== "Private" && (
          <Field label="Capacity">
            <input type="number" min={2} max={24} value={f.capacity} onChange={(e) => set("capacity", Number(e.target.value))} />
          </Field>
        )}
        <Field label="Price per player">
          <input type="number" min={0} value={f.price} onChange={(e) => set("price", Number(e.target.value))} />
        </Field>
        <Field label="Level">
          <select value={f.level} onChange={(e) => set("level", e.target.value)}>
            {["2.0–2.5", "3.0–3.5", "3.5–4.0", "4.0+", "Juniors", "All levels"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>
      </div>
    </Modal>
  );
}
