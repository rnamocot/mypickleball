"use client";

import Link from "next/link";
import { useState } from "react";
import { IconArrow, IconCalendar, IconCheck, IconQueue, IconTrophy, IconWhistle } from "../Icons";
import { Ring } from "../dash/charts";
import { mmss, timeLeft } from "../dash/calc";
import { type Booking, addDays, fmtDate, fmtTime, money, parseYmd, uid, ymd } from "../dash/data";
import { courtPrice, overlaps, pickGroup, useNow, useStore } from "../dash/store";
import { Field, Meter, Modal, Status } from "../dash/ui";
import { useMe } from "./PlayShell";

/* ---------------- shared ---------------- */

function useClock() {
  const now = useNow(1000);
  const d = new Date(now);
  return { now, today: ymd(d), nowMin: d.getHours() * 60 + d.getMinutes() };
}

function Head({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <header className="p-head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children}
    </header>
  );
}

/** Where the player stands in open play right now. */
function useMyOpenPlay() {
  const { state } = useStore();
  const { me } = useMe();
  const entry = state.queue.find((q) => q.playerId === me.id);
  const waiting = state.queue
    .filter((q) => q.state === "waiting")
    .sort((a, b) => a.sessionGames - b.sessionGames || a.waitingSince - b.waitingSince);
  const pos = waiting.findIndex((q) => q.playerId === me.id) + 1;
  const court = state.courts.find((c) => c.game?.playerIds.includes(me.id));
  const running = Math.max(1, state.courts.filter((c) => c.game?.kind === "open" || c.status === "open").length);
  const estWait = pos ? Math.max(0, Math.floor((pos - 1) / (4 * running))) * state.settings.gameLength + (pos <= 4 ? 0 : state.settings.gameLength / 2) : 0;
  const next = pickGroup(state);
  return { entry, pos, court, estWait: Math.round(estWait), next, waitingCount: waiting.length };
}

/* ---------------- Home ---------------- */

export function PlayHome() {
  const { state } = useStore();
  const { me } = useMe();
  const { now, today, nowMin } = useClock();
  const op = useMyOpenPlay();
  const plan = state.plans.find((p) => p.id === me.planId);
  const mine = state.bookings
    .filter((b) => b.playerId === me.id && (b.date > today || (b.date === today && b.start + b.duration > nowMin)) && b.status !== "cancelled" && b.status !== "no-show")
    .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
  const myLessons = state.lessons.filter((l) => l.enrolled.includes(me.id) && (l.date > today || (l.date === today && l.start > nowMin)));
  const soon = state.lessons
    .filter((l) => l.capacity > 1 && (l.date > today || (l.date === today && l.start > nowMin)) && l.date <= ymd(addDays(new Date(now), 6)))
    .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)
    .slice(0, 3);
  const hour = new Date(now).getHours();

  return (
    <>
      <section className="p-hero">
        <h1>
          {hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"}, {me.name.split(" ")[0]}.
        </h1>
        <p>
          {plan ? `${plan.name} member · ${plan.courtDiscount}% off courts` : "Drop-in player"} · rating {me.rating.toFixed(2)}
        </p>
        <div className="p-quick">
          <Link href="/play/book" className="p-quick-btn">
            <IconCalendar size={22} />
            Book a court
          </Link>
          <Link href="/play/open-play" className="p-quick-btn">
            <IconQueue size={22} />
            Open play
          </Link>
          <Link href="/play/clinics" className="p-quick-btn">
            <IconWhistle size={22} />
            Clinics
          </Link>
          <Link href="/play/events" className="p-quick-btn">
            <IconTrophy size={22} />
            Events
          </Link>
        </div>
      </section>

      <section className="p-card p-live">
        <div className="p-card-head">
          <h2>Open play now</h2>
          <span className="live">Live</span>
        </div>
        {op.court && op.court.game ? (
          <OnCourt />
        ) : op.entry ? (
          <p className="p-big">
            You&apos;re <b>#{op.pos}</b> in line · about {op.estWait} min
          </p>
        ) : (
          <p className="p-big">
            {op.waitingCount} waiting · {state.courts.filter((c) => c.game?.kind === "open").length} courts running
          </p>
        )}
        <Link href="/play/open-play" className="text-link" style={{ marginTop: 14 }}>
          {op.entry || op.court ? "See open play" : "Join open play"} <IconArrow size={16} />
        </Link>
      </section>

      <section className="p-card">
        <div className="p-card-head">
          <h2>Your upcoming</h2>
          <Link href="/play/me" className="panel-link">
            All
          </Link>
        </div>
        {mine.length + myLessons.length === 0 ? (
          <p className="p-empty">
            Nothing booked yet. <Link href="/play/book">Book a court</Link> or <Link href="/play/clinics">join a clinic</Link>.
          </p>
        ) : (
          <ul className="p-list">
            {mine.slice(0, 3).map((b) => (
              <li key={b.id}>
                <span className="p-date">
                  <b>{b.date === today ? "Today" : fmtDate(b.date, { weekday: "short" })}</b>
                  {fmtDate(b.date)}
                </span>
                <span className="grow">
                  <b>{state.courts.find((c) => c.id === b.courtId)?.name}</b>
                  <small>
                    {fmtTime(b.start)} · {b.duration} min
                  </small>
                </span>
                {b.status === "checked-in" ? <Status tone="good">Checked in</Status> : <Status tone="info">Booked</Status>}
              </li>
            ))}
            {myLessons.slice(0, 2).map((l) => (
              <li key={l.id}>
                <span className="p-date">
                  <b>{l.date === today ? "Today" : fmtDate(l.date, { weekday: "short" })}</b>
                  {fmtDate(l.date)}
                </span>
                <span className="grow">
                  <b>{l.title}</b>
                  <small>
                    {fmtTime(l.start)} · {state.coaches.find((c) => c.id === l.coachId)?.name}
                  </small>
                </span>
                <Status tone="good">Signed up</Status>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="p-card">
        <div className="p-card-head">
          <h2>Clinics this week</h2>
          <Link href="/play/clinics" className="panel-link">
            See all
          </Link>
        </div>
        <ul className="p-list">
          {soon.map((l) => (
            <li key={l.id}>
              <span className="p-date">
                <b>{l.date === today ? "Today" : fmtDate(l.date, { weekday: "short" })}</b>
                {fmtTime(l.start)}
              </span>
              <span className="grow">
                <b>{l.title}</b>
                <small>
                  {l.level} · {Math.max(0, l.capacity - l.enrolled.length)} spots left
                </small>
              </span>
              <span className="p-price">{money(l.price)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function OnCourt() {
  const { now } = useClock();
  const op = useMyOpenPlay();
  const g = op.court!.game!;
  const t = timeLeft(g.startedAt, g.durationMin, now);
  return (
    <div className="p-oncourt">
      <Ring pct={t.pct} size={64} tone={t.left < 0 ? "bad" : t.left < 120 ? "warn" : "neon"}>
        {op.court!.name.replace("Court ", "C")}
      </Ring>
      <div>
        <p className="p-big" style={{ margin: 0 }}>
          You&apos;re on <b>{op.court!.name}</b>
        </p>
        <p style={{ color: "var(--muted)" }}>
          {mmss(t.left)} {t.left < 0 ? "over time" : "left in this game"}
        </p>
      </div>
    </div>
  );
}

/* ---------------- Book a court ---------------- */

export function PlayBook() {
  const { state, dispatch } = useStore();
  const { me } = useMe();
  const { now, today, nowMin } = useClock();
  const s = state.settings;
  const [day, setDay] = useState(today);
  const [dur, setDur] = useState(60);
  const [pick, setPick] = useState<{ start: number; courts: string[] } | null>(null);
  const [courtId, setCourtId] = useState("");
  const days = Array.from({ length: 7 }, (_, i) => ymd(addDays(new Date(now), i)));

  const usable = state.courts.filter((c) => c.status !== "maintenance");
  const freeAt = (m: number) =>
    usable.filter((c) => !state.bookings.some((b) => b.courtId === c.id && b.date === day && b.status !== "cancelled" && overlaps(b.start, b.duration, m, dur))).map((c) => c.id);

  const slots: number[] = [];
  for (let m = s.open; m + dur <= s.close; m += 30) if (day !== today || m > nowMin) slots.push(m);
  const groups = [
    { label: "Morning", list: slots.filter((m) => m < 12 * 60) },
    { label: "Afternoon", list: slots.filter((m) => m >= 12 * 60 && m < 17 * 60) },
    { label: "Evening", list: slots.filter((m) => m >= 17 * 60) },
  ].filter((g) => g.list.length);
  const myWait = (m: number) => state.courtWaitlist.find((w) => w.playerId === me.id && w.date === day && w.start === m && w.duration === dur);

  const confirm = () => {
    if (!pick) return;
    const cid = courtId || pick.courts[0];
    const b: Booking = {
      id: uid("b"),
      courtId: cid,
      date: day,
      start: pick.start,
      duration: dur,
      type: "Court",
      title: `${me.name.split(" ").slice(-1)[0]} party`,
      playerId: me.id,
      price: courtPrice(state, me.id, pick.start, dur),
      paid: true,
      status: "confirmed",
    };
    dispatch({ t: "addBooking", booking: b });
    setPick(null);
  };

  return (
    <>
      <Head title="Book a court" sub={`Peak ${fmtTime(s.peakStart)} to ${fmtTime(s.peakEnd)}. Members save on every booking.`} />

      <div className="p-days" role="tablist" aria-label="Day">
        {days.map((d) => (
          <button key={d} role="tab" aria-selected={day === d} onClick={() => setDay(d)}>
            <small>{d === today ? "Today" : fmtDate(d, { weekday: "short" })}</small>
            <b>{parseYmd(d).getDate()}</b>
          </button>
        ))}
      </div>

      <div className="p-row">
        <div className="seg" role="group" aria-label="Length">
          {[60, 90, 120].map((d) => (
            <button key={d} aria-pressed={dur === d} onClick={() => setDur(d)}>
              {d} min
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && <p className="p-empty">No more times today. Pick another day.</p>}
      {groups.map((g) => (
        <section key={g.label} className="p-slots-group">
          <h2>{g.label}</h2>
          <div className="p-slots">
            {g.list.map((m) => {
              const free = freeAt(m);
              const peak = m >= s.peakStart && m < s.peakEnd;
              const w = myWait(m);
              const price = courtPrice(state, me.id, m, dur);
              return (
                <div key={m} className={`p-slot ${free.length ? "" : "is-full"}`}>
                  <span>
                    <b>{fmtTime(m)}</b>
                    <small>
                      {free.length ? `${free.length} court${free.length > 1 ? "s" : ""} free` : "Fully booked"}
                      {peak ? " · peak" : ""}
                    </small>
                  </span>
                  {free.length ? (
                    <button
                      className="btn btn-primary btn-xs"
                      onClick={() => {
                        setPick({ start: m, courts: free });
                        setCourtId(free[0]);
                      }}
                    >
                      {money(price)}
                    </button>
                  ) : w ? (
                    <button className="btn btn-ghost btn-xs" onClick={() => dispatch({ t: "leaveCourtWaitlist", id: w.id })}>
                      <IconCheck size={14} /> On waitlist
                    </button>
                  ) : (
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => dispatch({ t: "joinCourtWaitlist", wait: { id: uid("w"), playerId: me.id, date: day, start: m, duration: dur, at: Date.now() } })}
                    >
                      Join waitlist
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <Modal
        open={!!pick}
        onClose={() => setPick(null)}
        title="Confirm your court"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setPick(null)}>
              Cancel
            </button>
            <button className="btn btn-primary btn-sm" onClick={confirm}>
              Book & pay {pick ? money(courtPrice(state, me.id, pick.start, dur)) : ""}
            </button>
          </>
        }
      >
        {pick && (
          <>
            <dl className="dl">
              <dt>When</dt>
              <dd>
                {fmtDate(day, { weekday: "long", month: "long", day: "numeric" })}, {fmtTime(pick.start)} to {fmtTime(pick.start + dur)}
              </dd>
              <dt>Player</dt>
              <dd>{me.name}</dd>
              <dt>Price</dt>
              <dd>
                {money(courtPrice(state, me.id, pick.start, dur))}
                {me.planId && <small style={{ color: "var(--dim)", marginLeft: 8 }}>member rate</small>}
              </dd>
            </dl>
            <div className="form" style={{ marginTop: 18, gridTemplateColumns: "1fr" }}>
              <Field label="Court">
                <select value={courtId} onChange={(e) => setCourtId(e.target.value)}>
                  {pick.courts.map((id) => {
                    const c = state.courts.find((x) => x.id === id)!;
                    return (
                      <option key={id} value={id}>
                        {c.name} · {c.surface}
                      </option>
                    );
                  })}
                </select>
              </Field>
            </div>
            <p style={{ marginTop: 14, fontSize: 13, color: "var(--dim)" }}>
              Free cancellation up to {s.cancelHours} hours before. Your card on file is charged now.
            </p>
          </>
        )}
      </Modal>
    </>
  );
}

/* ---------------- Open play ---------------- */

export function PlayOpen() {
  const { state, dispatch } = useStore();
  const { me } = useMe();
  const { now } = useClock();
  const op = useMyOpenPlay();
  const opCourts = state.courts.filter((c) => c.game?.kind === "open");
  const name = (id: string) => state.players.find((p) => p.id === id)?.name.split(" ")[0] ?? "";

  return (
    <>
      <Head title="Open play" sub={`${state.settings.gameLength}-minute games · ${state.settings.queueMode === "skill" ? "skill-balanced groups" : "first come, first served"}`} />

      <section className="p-card p-live">
        {op.court && op.court.game ? (
          <OnCourt />
        ) : op.entry ? (
          <>
            <p className="p-kicker">You&apos;re in line</p>
            <p className="p-huge">#{op.pos}</p>
            <p style={{ color: "var(--muted)" }}>
              About {op.estWait} minutes · {op.entry.sessionGames} games today · {op.entry.sessionMinutes} min on court
            </p>
            {op.next.includes(me.id) && <p style={{ marginTop: 8, color: "var(--neon)", fontWeight: 600 }}>You&apos;re in the next group. Head to the desk area.</p>}
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 18 }} onClick={() => dispatch({ t: "checkOut", playerId: me.id })}>
              Leave the queue
            </button>
          </>
        ) : (
          <>
            <p className="p-big">{op.waitingCount} players waiting right now.</p>
            <p style={{ color: "var(--muted)", marginTop: 6 }}>
              {me.planId ? "Open play is included in your membership." : `Drop-in fee ${money(state.settings.dropInFee)}, charged when you join.`}
            </p>
            <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => dispatch({ t: "checkIn", playerId: me.id })}>
              Join open play <IconArrow size={18} />
            </button>
          </>
        )}
      </section>

      <section className="p-card">
        <div className="p-card-head">
          <h2>On court</h2>
          <span style={{ color: "var(--dim)", fontSize: 13 }}>{opCourts.length} courts</span>
        </div>
        {opCourts.length === 0 && <p className="p-empty">No open play games right now.</p>}
        <ul className="p-list">
          {opCourts.map((c) => {
            const t = timeLeft(c.game!.startedAt, c.game!.durationMin, now);
            return (
              <li key={c.id}>
                <Ring pct={t.pct} size={44} tone={t.left < 0 ? "bad" : t.left < 120 ? "warn" : "neon"}>
                  {c.name.replace("Court ", "C")}
                </Ring>
                <span className="grow">
                  <b>{c.game!.playerIds.map(name).join(", ")}</b>
                  <small>{t.left < 0 ? "Finishing up" : `${mmss(t.left)} left`}</small>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {op.next.length === 4 && (
        <section className="p-card">
          <div className="p-card-head">
            <h2>Up next</h2>
          </div>
          <p className="p-big" style={{ fontSize: 18 }}>
            {op.next.map(name).join(", ")}
          </p>
        </section>
      )}
    </>
  );
}

/* ---------------- Clinics ---------------- */

export function PlayClinics() {
  const { state, dispatch } = useStore();
  const { me } = useMe();
  const { today, nowMin } = useClock();
  const [kind, setKind] = useState<"all" | "Clinic" | "Private" | "Camp">("all");
  const list = state.lessons
    .filter((l) => (l.date > today || (l.date === today && l.start > nowMin)) && (kind === "all" || l.kind === kind))
    .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
  const days = Array.from(new Set(list.map((l) => l.date)));

  return (
    <>
      <Head title="Clinics & lessons" sub="Sign up online. If a session is full, join the waitlist and you'll move in when a spot opens.">
        <div className="seg" role="group" aria-label="Type">
          {(["all", "Clinic", "Private", "Camp"] as const).map((k) => (
            <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>
              {k === "all" ? "All" : k === "Private" ? "Privates" : `${k}s`}
            </button>
          ))}
        </div>
      </Head>

      {days.length === 0 && <p className="p-empty">Nothing scheduled. Check back soon.</p>}
      {days.map((d) => (
        <section key={d} className="p-slots-group">
          <h2>{d === today ? "Today" : fmtDate(d, { weekday: "long", month: "short", day: "numeric" })}</h2>
          <div className="p-grid">
            {list
              .filter((l) => l.date === d)
              .map((l) => {
                const coach = state.coaches.find((c) => c.id === l.coachId);
                const inIt = l.enrolled.includes(me.id);
                const wpos = l.waitlist.indexOf(me.id) + 1;
                const full = l.enrolled.length >= l.capacity;
                return (
                  <article key={l.id} className={`p-card p-session ${inIt ? "is-mine" : ""}`}>
                    <div className="p-card-head">
                      <span style={{ color: "var(--muted)", fontSize: 13 }}>
                        {fmtTime(l.start)} · {l.duration} min
                      </span>
                      <span className="p-price">{money(l.price)}</span>
                    </div>
                    <h3>{l.title}</h3>
                    <p className="p-sub">
                      {coach?.name} · {l.level} · {state.courts.find((c) => c.id === l.courtId)?.name}
                    </p>
                    <div style={{ margin: "14px 0" }}>
                      <span style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--muted)", marginBottom: 6 }}>
                        <span>{full ? `Full${l.waitlist.length ? ` · ${l.waitlist.length} waiting` : ""}` : `${l.capacity - l.enrolled.length} of ${l.capacity} spots left`}</span>
                      </span>
                      <Meter value={l.enrolled.length} max={l.capacity} tone={full ? "warn" : "neon"} />
                    </div>
                    {inIt ? (
                      <div className="p-row-between">
                        <Status tone="good">You&apos;re signed up</Status>
                        <button className="link-btn" onClick={() => dispatch({ t: "unenroll", lessonId: l.id, playerId: me.id })}>
                          Leave
                        </button>
                      </div>
                    ) : wpos ? (
                      <div className="p-row-between">
                        <Status tone="info">Waitlist #{wpos}</Status>
                        <button className="link-btn" onClick={() => dispatch({ t: "leaveLessonWaitlist", lessonId: l.id, playerId: me.id })}>
                          Leave waitlist
                        </button>
                      </div>
                    ) : (
                      <button className={`btn btn-sm btn-block ${full ? "btn-ghost" : "btn-primary"}`} onClick={() => dispatch({ t: "enroll", lessonId: l.id, playerId: me.id })}>
                        {full ? "Join waitlist" : l.kind === "Private" ? "Book this private" : "Sign up"}
                      </button>
                    )}
                  </article>
                );
              })}
          </div>
        </section>
      ))}
    </>
  );
}

/* ---------------- Events ---------------- */

export function PlayEvents() {
  const { state, dispatch } = useStore();
  const { me } = useMe();
  const list = state.events.filter((e) => e.status !== "Completed");

  return (
    <>
      <Head title="Leagues & events" sub="Register online. Entry fees are charged to your card on file." />
      <div className="p-grid">
        {list.map((e) => {
          const registered = e.registrations.includes(me.id);
          const full = e.entrants >= e.capacity;
          const top = [...e.standings].sort((a, b) => b.w - a.w || b.pf - b.pa - (a.pf - a.pa)).slice(0, 3);
          return (
            <article key={e.id} className={`p-card p-session ${registered ? "is-mine" : ""}`}>
              <div className="p-card-head">
                <span style={{ color: "var(--muted)", fontSize: 13 }}>{e.kind}</span>
                <Status tone={e.status === "Registering" ? "info" : "good"}>{e.status}</Status>
              </div>
              <h3>{e.name}</h3>
              <p className="p-sub">
                {fmtDate(e.start, { month: "short", day: "numeric" })}
                {e.end !== e.start ? ` to ${fmtDate(e.end, { month: "short", day: "numeric" })}` : ""} · {e.level} · {e.fee ? money(e.fee) : "Free"}
              </p>
              <div style={{ margin: "14px 0" }}>
                <span style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--muted)", marginBottom: 6 }}>
                  <span>Entrants</span>
                  <span>
                    {e.entrants}/{e.capacity}
                  </span>
                </span>
                <Meter value={e.entrants} max={e.capacity} />
              </div>
              {e.status === "Registering" ? (
                registered ? (
                  <div className="p-row-between">
                    <Status tone="good">You&apos;re registered</Status>
                    <button className="link-btn" onClick={() => dispatch({ t: "unregisterEvent", eventId: e.id, playerId: me.id })}>
                      Withdraw
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-sm btn-block" disabled={full} onClick={() => dispatch({ t: "registerEvent", eventId: e.id, playerId: me.id })}>
                    {full ? "Event full" : `Register${e.fee ? ` · ${money(e.fee)}` : ""}`}
                  </button>
                )
              ) : top.length ? (
                <ol className="p-standings">
                  {top.map((s) => (
                    <li key={s.name}>
                      <span>{s.name}</span>
                      <b>
                        {s.w}-{s.l}
                      </b>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="p-empty" style={{ padding: 0 }}>
                  Standings appear once scores are in.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}

/* ---------------- Me ---------------- */

export function PlayMe() {
  const { state, dispatch } = useStore();
  const { me } = useMe();
  const { today, nowMin, now } = useClock();
  const [cancel, setCancel] = useState<Booking | null>(null);
  const plan = state.plans.find((p) => p.id === me.planId);
  const upcoming = state.bookings
    .filter((b) => b.playerId === me.id && (b.date > today || (b.date === today && b.start + b.duration > nowMin)) && b.status === "confirmed")
    .sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
  const lessons = state.lessons.filter((l) => (l.enrolled.includes(me.id) || l.waitlist.includes(me.id)) && l.date >= today);
  const waits = state.courtWaitlist.filter((w) => w.playerId === me.id && w.date >= today);
  const pays = state.transactions.filter((t) => t.playerId === me.id).slice(0, 8);
  const hoursUntil = (b: Booking) => (parseYmd(b.date).getTime() + b.start * 60000 - now) / 3600000;

  return (
    <>
      <Head title={me.name} sub={`${plan ? `${plan.name} member${me.renewsOn ? `, renews ${fmtDate(me.renewsOn, { month: "long", day: "numeric" })}` : ""}` : "Drop-in player"} · rating ${me.rating.toFixed(2)}`} />

      <div className="p-stats">
        <div>
          <b>{me.games}</b>
          <span>Games (30d)</span>
        </div>
        <div>
          <b>{Math.round(me.minutes / 60)}h</b>
          <span>On court</span>
        </div>
        <div>
          <b>{upcoming.length}</b>
          <span>Upcoming</span>
        </div>
      </div>

      <section className="p-card">
        <div className="p-card-head">
          <h2>Court bookings</h2>
        </div>
        {upcoming.length === 0 && (
          <p className="p-empty">
            No upcoming courts. <Link href="/play/book">Book one</Link>.
          </p>
        )}
        <ul className="p-list">
          {upcoming.map((b) => (
            <li key={b.id}>
              <span className="p-date">
                <b>{b.date === today ? "Today" : fmtDate(b.date, { weekday: "short" })}</b>
                {fmtDate(b.date)}
              </span>
              <span className="grow">
                <b>
                  {state.courts.find((c) => c.id === b.courtId)?.name} · {fmtTime(b.start)}
                </b>
                <small>
                  {b.duration} min · {money(b.price)} {b.paid ? "paid" : "due at the desk"}
                </small>
              </span>
              <button className="link-btn" onClick={() => setCancel(b)}>
                Cancel
              </button>
            </li>
          ))}
        </ul>
      </section>

      {(lessons.length > 0 || waits.length > 0) && (
        <section className="p-card">
          <div className="p-card-head">
            <h2>Clinics & waitlists</h2>
          </div>
          <ul className="p-list">
            {lessons.map((l) => {
              const wpos = l.waitlist.indexOf(me.id) + 1;
              return (
                <li key={l.id}>
                  <span className="p-date">
                    <b>{l.date === today ? "Today" : fmtDate(l.date, { weekday: "short" })}</b>
                    {fmtTime(l.start)}
                  </span>
                  <span className="grow">
                    <b>{l.title}</b>
                    <small>{wpos ? `Waitlist #${wpos}` : "Signed up"}</small>
                  </span>
                  <button
                    className="link-btn"
                    onClick={() => dispatch(wpos ? { t: "leaveLessonWaitlist", lessonId: l.id, playerId: me.id } : { t: "unenroll", lessonId: l.id, playerId: me.id })}
                  >
                    Leave
                  </button>
                </li>
              );
            })}
            {waits.map((w) => (
              <li key={w.id}>
                <span className="p-date">
                  <b>{w.date === today ? "Today" : fmtDate(w.date, { weekday: "short" })}</b>
                  {fmtTime(w.start)}
                </span>
                <span className="grow">
                  <b>Court waitlist</b>
                  <small>{w.duration} min · any court</small>
                </span>
                <button className="link-btn" onClick={() => dispatch({ t: "leaveCourtWaitlist", id: w.id })}>
                  Leave
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="p-card">
        <div className="p-card-head">
          <h2>Payments</h2>
        </div>
        {pays.length === 0 && <p className="p-empty">No payments yet.</p>}
        <ul className="p-list">
          {pays.map((t) => (
            <li key={t.id}>
              <span className="grow">
                <b>{t.description}</b>
                <small>{new Date(t.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</small>
              </span>
              <span className={`p-price ${t.status === "refunded" ? "strike" : ""}`}>{money(t.amount)}</span>
            </li>
          ))}
        </ul>
      </section>

      <Modal
        open={!!cancel}
        onClose={() => setCancel(null)}
        title="Cancel this booking?"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setCancel(null)}>
              Keep it
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (cancel) dispatch({ t: "updateBooking", id: cancel.id, patch: { status: "cancelled" } });
                setCancel(null);
              }}
            >
              Cancel booking
            </button>
          </>
        }
      >
        {cancel && (
          <p style={{ color: "var(--muted)" }}>
            {state.courts.find((c) => c.id === cancel.courtId)?.name}, {fmtDate(cancel.date, { weekday: "long", month: "short", day: "numeric" })} at {fmtTime(cancel.start)}.{" "}
            {hoursUntil(cancel) < state.settings.cancelHours
              ? `This is within ${state.settings.cancelHours} hours of your start time, so the club may keep your payment.`
              : "You're outside the cancellation window, so you won't be charged."}{" "}
            If someone is on the waitlist, the court goes to them.
          </p>
        )}
      </Modal>
    </>
  );
}
