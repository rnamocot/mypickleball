"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconArrow, IconCalendar, IconCourt, IconQueue, IconUserPlus, IconWallet } from "../../Icons";
import { BarChart, Ring } from "../charts";
import { mmss, revenueByDay, sumRange, timeLeft } from "../calc";
import { fmtShortTime, fmtTime, money, nowMinutes, ymd } from "../data";
import { BookingModal, QuickSale } from "../modals";
import { pickGroup, useNow, usePlayerLookup, useStore } from "../store";
import { Avatar, Kpi, Panel, Status } from "../ui";
import { ago } from "../Shell";

export function Overview() {
  const { state, dispatch } = useStore();
  const now = useNow(1000);
  const P = usePlayerLookup();
  const [booking, setBooking] = useState(false);
  const [sale, setSale] = useState(false);

  const today = ymd(new Date());
  const nm = nowMinutes();
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const owner = state.staff.find((s) => s.role === "Owner")?.name.split(" ")[0] ?? "there";

  const rev = useMemo(() => revenueByDay(state, 14), [state]);
  const todayRev = sumRange(state, 0);
  const sameDayLastWeek = sumRange(state, 7, 7);
  const todays = state.bookings.filter((b) => b.date === today && b.status !== "cancelled");
  const lastWeekCount = state.bookings.filter((b) => b.date === ymd(new Date(Date.now() - 7 * 864e5)) && b.status !== "cancelled").length;
  const live = state.courts.filter((c) => c.status === "play").length;
  const usable = state.courts.filter((c) => c.status !== "maintenance").length;
  const waiting = state.queue.filter((q) => q.state === "waiting");
  const checkedIn = state.queue.length;
  const upcoming = [
    ...todays.filter((b) => b.start + b.duration > nm).map((b) => ({ id: b.id, start: b.start, title: b.title, where: state.courts.find((c) => c.id === b.courtId)?.name, kind: b.type, status: b.status })),
    ...state.lessons.filter((l) => l.date === today && l.start + l.duration > nm).map((l) => ({ id: l.id, start: l.start, title: l.title, where: state.courts.find((c) => c.id === l.courtId)?.name, kind: "Lesson", status: `${l.enrolled.length}/${l.capacity}` })),
  ].sort((a, b) => a.start - b.start);

  const expiring = state.players.filter((p) => p.renewsOn && p.renewsOn >= today && p.renewsOn <= ymd(new Date(Date.now() + 7 * 864e5)));
  const overdue = state.players.filter((p) => p.balance > 0);
  const nextGroup = pickGroup(state);

  return (
    <>
      <section className="greet">
        <svg className="greet-arc" viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 180 C 160 20, 360 10, 600 120" fill="none" stroke="rgba(212,255,63,.35)" strokeDasharray="2 8" strokeWidth="1.5" />
          <circle r="4" fill="#d4ff3f">
            <animateMotion dur="6s" repeatCount="indefinite" path="M0 180 C 160 20, 360 10, 600 120" />
          </circle>
        </svg>
        <div>
          <h1>
            {greet}, {owner}.
          </h1>
          <p>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {live} of {usable} courts in play ·{" "}
            {waiting.length} waiting for open play
          </p>
        </div>
        <div className="d-head-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setSale(true)}>
            <IconWallet size={16} /> Quick sale
          </button>
          <Link href="/dashboard/open-play" className="btn btn-ghost btn-sm">
            <IconUserPlus size={16} /> Check in
          </Link>
          <button className="btn btn-primary btn-sm" onClick={() => setBooking(true)}>
            <IconCalendar size={16} /> New booking
          </button>
        </div>
      </section>

      <div className="grid g-4">
        <Kpi label="Revenue today" value={money(todayRev)} delta={sameDayLastWeek ? ((todayRev - sameDayLastWeek) / sameDayLastWeek) * 100 : undefined} hint="vs same day last week" icon={<IconWallet size={20} />} />
        <Kpi label="Bookings today" value={todays.length} delta={lastWeekCount ? ((todays.length - lastWeekCount) / lastWeekCount) * 100 : undefined} hint="vs last week" icon={<IconCalendar size={20} />} />
        <Kpi
          label="Courts in use"
          value={
            <>
              {Math.round((live / Math.max(1, usable)) * 100)}% <small>{live} of {usable}</small>
            </>
          }
          hint={`${state.courts.length - usable} under maintenance`}
          icon={<IconCourt size={20} />}
        />
        <Kpi
          label="Open play"
          value={
            <>
              {checkedIn} <small>checked in</small>
            </>
          }
          hint={`${waiting.length} waiting · ${checkedIn - waiting.length} playing`}
          icon={<IconQueue size={20} />}
        />
      </div>

      <div className="grid g-main mt">
        <Panel
          title={
            <>
              Live courts <small>updates every second</small>
            </>
          }
          action={
            <Link href="/dashboard/courts" className="panel-link">
              Court board <IconArrow size={14} />
            </Link>
          }
          pad={false}
        >
          <div>
            {state.courts.map((c) => {
              const g = c.game;
              const t = g ? timeLeft(g.startedAt, g.durationMin, now) : null;
              const over = t && t.left < 0;
              const soon = t && t.left >= 0 && t.left < 120;
              return (
                <div className="mini-court" key={c.id}>
                  <Ring pct={t ? t.pct : 0} size={46} tone={over ? "bad" : soon ? "warn" : g?.kind === "lesson" ? "blue" : "neon"}>
                    {c.name.replace("Court ", "C")}
                  </Ring>
                  <div style={{ minWidth: 0 }}>
                    {g ? (
                      <>
                        <b>{g.label}</b>
                        <div className="names">
                          {g.kind === "lesson" ? `${g.durationMin} min session` : g.playerIds.map((id) => P(id)?.name.split(" ")[0]).join(", ")}
                        </div>
                      </>
                    ) : c.status === "maintenance" ? (
                      <>
                        <b>Maintenance</b>
                        <div className="names">{c.note ?? "Unavailable"}</div>
                      </>
                    ) : (
                      <>
                        <b>Available</b>
                        <div className="names">{nextGroup.length === 4 ? `Next group ready: ${nextGroup.map((id) => P(id)?.name.split(" ")[0]).join(", ")}` : c.surface}</div>
                      </>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {t ? (
                      <>
                        <Status tone={over ? "bad" : soon ? "warn" : "good"}>{over ? "Over time" : soon ? "Ending" : "In play"}</Status>
                        <div style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, marginTop: 2 }}>{mmss(t.left)}</div>
                      </>
                    ) : c.status === "maintenance" ? (
                      <Status tone="warn">Blocked</Status>
                    ) : nextGroup.length === 4 ? (
                      <button className="btn btn-primary btn-xs" onClick={() => dispatch({ t: "startGame", courtId: c.id, playerIds: nextGroup, label: "Open play", kind: "open", durationMin: state.settings.gameLength })}>
                        Send next group
                      </button>
                    ) : (
                      <Status tone="neon">Open</Status>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="stack">
          <Panel
            title={
              <>
                Coming up today <small>{upcoming.length}</small>
              </>
            }
            action={
              <Link href="/dashboard/bookings" className="panel-link">
                Calendar <IconArrow size={14} />
              </Link>
            }
            pad={false}
          >
            <ul className="rows" style={{ maxHeight: 300, overflowY: "auto" }}>
              {upcoming.length === 0 && <li style={{ color: "var(--dim)" }}>Nothing else on the calendar today.</li>}
              {upcoming.slice(0, 12).map((u) => (
                <li key={u.id}>
                  <time>{fmtTime(u.start)}</time>
                  <span className="grow">
                    <b style={{ fontWeight: 550 }}>{u.title}</b>
                    <small style={{ display: "block", color: "var(--dim)", fontSize: 12.5 }}>
                      {u.where} · {u.kind}
                    </small>
                  </span>
                  {u.status === "checked-in" ? <Status tone="good">Checked in</Status> : u.kind === "Lesson" ? <span className="rating">{u.status}</span> : <Status tone="idle">Confirmed</Status>}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Needs attention" pad={false}>
            <ul className="rows">
              {state.courts
                .filter((c) => c.game && timeLeft(c.game.startedAt, c.game.durationMin, now).left < 0)
                .map((c) => (
                  <li key={c.id}>
                    <Status tone="bad">{c.name} over time</Status>
                    <span className="grow" />
                    <button className="btn btn-ghost btn-xs" onClick={() => dispatch({ t: "endGame", courtId: c.id })}>
                      End game
                    </button>
                  </li>
                ))}
              {state.courts
                .filter((c) => c.status === "maintenance")
                .map((c) => (
                  <li key={c.id}>
                    <Status tone="warn">{c.name}: {c.note ?? "maintenance"}</Status>
                    <span className="grow" />
                    <button className="btn btn-ghost btn-xs" onClick={() => dispatch({ t: "setCourt", courtId: c.id, patch: { status: "open" } })}>
                      Reopen
                    </button>
                  </li>
                ))}
              <li>
                <Status tone="info">{expiring.length} memberships renew this week</Status>
                <span className="grow" />
                <Link href="/dashboard/memberships" className="panel-link">
                  Review
                </Link>
              </li>
              <li>
                <Status tone={overdue.length ? "warn" : "good"}>
                  {overdue.length} players with unpaid balance · {money(overdue.reduce((a, p) => a + p.balance, 0))}
                </Status>
                <span className="grow" />
                <Link href="/dashboard/players?filter=balance" className="panel-link">
                  View
                </Link>
              </li>
            </ul>
          </Panel>
        </div>
      </div>

      <div className="grid g-main mt">
        <Panel
          title={
            <>
              Revenue <small>last 14 days · {money(rev.reduce((a, d) => a + d.total, 0))}</small>
            </>
          }
          action={
            <Link href="/dashboard/reports" className="panel-link">
              Reports <IconArrow size={14} />
            </Link>
          }
        >
          <BarChart
            label="Revenue per day, last 14 days"
            data={rev.map((d) => ({
              label: d.d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
              sub: d.d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
              value: d.total,
            }))}
            fmt={(n) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n)}`)}
          />
        </Panel>

        <Panel
          title="Recent payments"
          action={
            <Link href="/dashboard/payments" className="panel-link">
              All <IconArrow size={14} />
            </Link>
          }
          pad={false}
        >
          <ul className="rows">
            {state.transactions.slice(0, 7).map((t) => {
              const p = P(t.playerId);
              return (
                <li key={t.id}>
                  {p ? <Avatar name={p.name} hue={p.hue} size={30} /> : <Avatar name="Walk In" hue={0} size={30} />}
                  <span className="grow">
                    <b style={{ fontWeight: 550, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.description}</b>
                    <small style={{ color: "var(--dim)", fontSize: 12.5 }}>
                      {p?.name ?? "Walk-in"} · {ago(t.at)}
                    </small>
                  </span>
                  <span className={`amt ${t.status === "refunded" ? "strike" : ""}`}>{money(t.amount)}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <p style={{ marginTop: 20, fontSize: 12.5, color: "var(--dim)" }}>
        Peak hours {fmtShortTime(state.settings.peakStart)}–{fmtShortTime(state.settings.peakEnd)} · Open play games are {state.settings.gameLength} min ·{" "}
        {state.settings.queueMode === "skill" ? "Skill-balanced" : "First-come"} rotation
      </p>

      <BookingModal open={booking} onClose={() => setBooking(false)} />
      <QuickSale open={sale} onClose={() => setSale(false)} />
    </>
  );
}
