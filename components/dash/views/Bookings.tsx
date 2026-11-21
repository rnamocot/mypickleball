"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { IconChevron, IconChevronLeft, IconPlus } from "../../Icons";
import { type Booking, addDays, fmtDate, fmtShortTime, fmtTime, money, parseYmd, ymd } from "../data";
import { BookingModal } from "../modals";
import { useNow, usePlayerLookup, useStore } from "../store";
import { Avatar, Drawer, Empty, PageHead, Panel, SearchInput, Status, Tabs, type Tone } from "../ui";

const SLOT = 30; // minutes per row
const ROW = 26; // px per row

const statusTone: Record<Booking["status"], Tone> = {
  confirmed: "info",
  "checked-in": "good",
  cancelled: "idle",
  "no-show": "bad",
};
const statusLabel: Record<Booking["status"], string> = {
  confirmed: "Confirmed",
  "checked-in": "Checked in",
  cancelled: "Cancelled",
  "no-show": "No-show",
};

type Col = { key: string; courtId: string; date: string; label: string; sub: string; blocked: boolean };

export function Bookings() {
  const { state } = useStore();
  const params = useSearchParams();
  const now = useNow(60000);
  const today = ymd(new Date(now));
  const [view, setView] = useState<"day" | "week" | "list">("day");
  const [date, setDate] = useState(params.get("date") ?? today);
  const [weekCourt, setWeekCourt] = useState(state.courts[0]?.id ?? "");
  const [modal, setModal] = useState<{ courtId?: string; date?: string; start?: number } | null>(params.get("new") ? {} : null);
  const [selected, setSelected] = useState<string | null>(params.get("open"));

  // Follow deep links (search results, the top bar "New booking" button) when the URL changes.
  const key = params.toString();
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    if (params.get("new")) setModal({});
    if (params.get("date")) {
      setDate(params.get("date")!);
      setView("day");
    }
    if (params.get("open")) setSelected(params.get("open"));
  }

  const s = state.settings;
  const weekStart = addDays(parseYmd(date), -((parseYmd(date).getDay() + 6) % 7)); // Monday
  const weekDates = Array.from({ length: 7 }, (_, i) => ymd(addDays(weekStart, i)));
  const step = view === "week" ? 7 : 1;
  const weekCourtObj = state.courts.find((x) => x.id === weekCourt) ?? state.courts[0];

  const cols: Col[] =
    view === "week"
      ? weekDates.map((d) => ({
          key: d,
          courtId: weekCourtObj?.id ?? "",
          date: d,
          label: d === today ? "Today" : fmtDate(d, { weekday: "short" }),
          sub: fmtDate(d, { month: "short", day: "numeric" }),
          blocked: weekCourtObj?.status === "maintenance" && d === today,
        }))
      : state.courts.map((c) => ({
          key: c.id,
          courtId: c.id,
          date,
          label: c.name,
          sub: c.surface + (c.status === "maintenance" ? " · blocked" : ""),
          blocked: c.status === "maintenance",
        }));

  const inView =
    view === "week"
      ? state.bookings.filter((b) => b.courtId === weekCourtObj?.id && weekDates.includes(b.date))
      : state.bookings.filter((b) => b.date === date);
  const live = inView.filter((b) => b.status !== "cancelled");
  const revenue = live.reduce((a, b) => a + b.price, 0);
  const title =
    view === "week"
      ? `Week of ${fmtDate(weekDates[0], { month: "long", day: "numeric" })} · ${weekCourtObj?.name ?? ""}`
      : fmtDate(date, { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <PageHead title="Bookings" sub={view === "list" ? "All bookings" : `${title} · ${live.length} bookings · ${money(revenue)}`}>
        <div className="seg" role="group" aria-label="View">
          {(["day", "week", "list"] as const).map((v) => (
            <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal({ date })}>
          <IconPlus size={16} /> New booking
        </button>
      </PageHead>

      {view !== "list" ? (
        <Panel
          pad={false}
          title={
            <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <button className="icon-btn sm" aria-label={view === "week" ? "Previous week" : "Previous day"} onClick={() => setDate(ymd(addDays(parseYmd(date), -step)))}>
                <IconChevronLeft size={16} />
              </button>
              <button className="icon-btn sm" aria-label={view === "week" ? "Next week" : "Next day"} onClick={() => setDate(ymd(addDays(parseYmd(date), step)))}>
                <IconChevron size={16} />
              </button>
              <button className="btn btn-ghost btn-xs" onClick={() => setDate(today)} disabled={view === "week" ? weekDates.includes(today) : date === today}>
                Today
              </button>
              <input
                type="date"
                className="select"
                style={{ height: 32, backgroundImage: "none", paddingRight: 12 }}
                value={date}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                aria-label="Pick date"
              />
              {view === "week" && (
                <select className="select" style={{ height: 32 }} value={weekCourtObj?.id} onChange={(e) => setWeekCourt(e.target.value)} aria-label="Court">
                  {state.courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </span>
          }
          action={
            <div className="legend-row">
              {[
                ["Court", "#3987e5"],
                ["Coaching", "#9085e9"],
                ["League", "#199e70"],
                ["Event", "#d95926"],
              ].map(([l, c]) => (
                <span key={l}>
                  <i style={{ background: `${c}33`, borderColor: c }} />
                  {l}
                </span>
              ))}
            </div>
          }
        >
          <Calendar
            cols={cols}
            bookings={inView}
            today={today}
            nowMin={new Date(now).getHours() * 60 + new Date(now).getMinutes()}
            onSlot={(courtId, d, start) => setModal({ courtId, date: d, start })}
            onPick={setSelected}
            open={s.open}
            close={s.close}
          />
        </Panel>
      ) : (
        <BookingList onPick={setSelected} />
      )}

      <BookingModal open={!!modal} onClose={() => setModal(null)} preset={modal ?? undefined} />
      <BookingDrawer id={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function Calendar({
  cols,
  bookings,
  today,
  nowMin,
  onSlot,
  onPick,
  open,
  close,
}: {
  cols: Col[];
  bookings: Booking[];
  today: string;
  nowMin: number;
  onSlot: (courtId: string, date: string, start: number) => void;
  onPick: (id: string) => void;
  open: number;
  close: number;
}) {
  const { state } = useStore();
  const rows: number[] = [];
  for (let m = open; m < close; m += SLOT) rows.push(m);
  const grid = `64px repeat(${cols.length}, minmax(120px, 1fr))`;
  const firstToday = cols.findIndex((c) => c.date === today);
  const isWeek = cols.length > 0 && cols[0].date !== cols[cols.length - 1].date;

  return (
    <div className="cal-wrap">
      <div className="cal" style={{ gridTemplateColumns: grid }}>
        <div className="cal-head cal-times" style={{ zIndex: 4 }} />
        {cols.map((c) => (
          <div className={`cal-head ${isWeek && c.date === today ? "is-today" : ""}`} key={c.key}>
            {c.label}
            <small>{c.sub}</small>
          </div>
        ))}

        <div className="cal-times">
          {rows.map((m, i) => (
            <div key={m} className={`cal-time ${i === 0 ? "first" : ""}`} style={{ height: ROW }}>
              {m % 60 === 0 ? fmtShortTime(m) : ""}
            </div>
          ))}
        </div>

        {cols.map((c, ci) => (
          <div className="cal-col" key={c.key}>
            {c.date === today && nowMin >= open && nowMin <= close && (
              <div className={`cal-now ${ci === firstToday ? "first" : ""}`} style={{ top: ((nowMin - open) / SLOT) * ROW }} aria-hidden="true" />
            )}
            {rows.map((m) => (
              <button
                key={m}
                className={`cal-slot ${m % 60 === 0 ? "hour" : ""} ${c.blocked ? "off" : ""}`}
                style={{ height: ROW }}
                aria-label={`Book ${c.label} ${c.sub} at ${fmtTime(m)}`}
                onClick={() => !c.blocked && onSlot(c.courtId, c.date, m)}
              />
            ))}
            {bookings
              .filter((b) => b.courtId === c.courtId && b.date === c.date)
              .map((b) => {
                const p = state.players.find((x) => x.id === b.playerId);
                return (
                  <button
                    key={b.id}
                    className={`bk bk-${b.type} is-${b.status}`}
                    style={{ top: ((b.start - open) / SLOT) * ROW + 1, height: (b.duration / SLOT) * ROW - 3 }}
                    onClick={() => onPick(b.id)}
                  >
                    <b>{b.title}</b>
                    <span>
                      {fmtShortTime(b.start)}–{fmtShortTime(b.start + b.duration)}
                      {b.duration >= 60 && p ? ` · ${p.name.split(" ")[0]}` : ""}
                    </span>
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingList({ onPick }: { onPick: (id: string) => void }) {
  const { state } = useStore();
  const P = usePlayerLookup();
  const [tab, setTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [q, setQ] = useState("");
  const today = ymd(new Date());
  const list = useMemo(() => {
    let l = state.bookings;
    if (tab === "upcoming") l = l.filter((b) => b.date >= today && b.status !== "cancelled");
    if (tab === "past") l = l.filter((b) => b.date < today && b.status !== "cancelled");
    if (tab === "cancelled") l = l.filter((b) => b.status === "cancelled" || b.status === "no-show");
    if (q) {
      const s = q.toLowerCase();
      l = l.filter((b) => b.title.toLowerCase().includes(s) || P(b.playerId)?.name.toLowerCase().includes(s));
    }
    return [...l].sort((a, b) => (tab === "upcoming" ? 1 : -1) * (a.date.localeCompare(b.date) || a.start - b.start)).slice(0, 80);
  }, [state.bookings, tab, q, today, P]);

  return (
    <Panel pad={false}>
      <div style={{ padding: "8px 20px 0", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <Tabs
          label="Booking filter"
          value={tab}
          onChange={setTab}
          items={[
            { value: "upcoming", label: "Upcoming" },
            { value: "past", label: "Past" },
            { value: "cancelled", label: "Cancelled & no-shows" },
          ]}
        />
        <SearchInput value={q} onChange={setQ} placeholder="Search by player or title" />
      </div>
      {list.length === 0 ? (
        <Empty title="No bookings here" text="Try a different filter or search." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Court</th>
                <th>Booking</th>
                <th>Player</th>
                <th>Status</th>
                <th>Payment</th>
                <th className="num">Price</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => {
                const p = P(b.playerId);
                return (
                  <tr key={b.id} className="click" onClick={() => onPick(b.id)}>
                    <td>{fmtDate(b.date, { weekday: "short", month: "short", day: "numeric" })}</td>
                    <td className="muted">{fmtTime(b.start)}</td>
                    <td>{state.courts.find((c) => c.id === b.courtId)?.name ?? "Removed"}</td>
                    <td>
                      {b.title} <span className="muted">· {b.type}</span>
                    </td>
                    <td>
                      {p ? (
                        <span className="who">
                          <Avatar name={p.name} hue={p.hue} size={24} /> {p.name}
                        </span>
                      ) : (
                        <span className="muted">Guest</span>
                      )}
                    </td>
                    <td>
                      <Status tone={statusTone[b.status]}>{statusLabel[b.status]}</Status>
                    </td>
                    <td>{b.paid ? <Status tone="good">Paid</Status> : <Status tone="warn">Unpaid</Status>}</td>
                    <td className="num">{money(b.price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function BookingDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const b = state.bookings.find((x) => x.id === id);
  const p = state.players.find((x) => x.id === b?.playerId);
  if (!b) return null;
  const court = state.courts.find((c) => c.id === b.courtId);
  const set = (patch: Partial<Booking>) => dispatch({ t: "updateBooking", id: b.id, patch });
  return (
    <Drawer
      open={!!b}
      onClose={onClose}
      title={b.title}
      footer={
        b.status === "confirmed" ? (
          <>
            <button className="btn btn-danger btn-sm" onClick={() => set({ status: "cancelled" })}>
              Cancel booking
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => set({ status: "no-show" })}>
              Mark no-show
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => set({ status: "checked-in" })}>
              Check in
            </button>
          </>
        ) : b.status !== "checked-in" ? (
          <button className="btn btn-ghost btn-sm" onClick={() => set({ status: "confirmed" })}>
            Restore booking
          </button>
        ) : undefined
      }
    >
      <dl className="dl">
        <dt>Status</dt>
        <dd>
          <Status tone={statusTone[b.status]}>{statusLabel[b.status]}</Status>
        </dd>
        <dt>When</dt>
        <dd>
          {fmtDate(b.date, { weekday: "long", month: "long", day: "numeric" })}
          <br />
          {fmtTime(b.start)} to {fmtTime(b.start + b.duration)} ({b.duration} min)
        </dd>
        <dt>Court</dt>
        <dd>
          {court?.name} · {court?.surface}
        </dd>
        <dt>Type</dt>
        <dd>{b.type}</dd>
        <dt>Player</dt>
        <dd>
          {p ? (
            <span className="who">
              <Avatar name={p.name} hue={p.hue} size={28} />
              <span>
                <b>{p.name}</b>
                <small>
                  {p.phone} · rating {p.rating.toFixed(2)}
                </small>
              </span>
            </span>
          ) : (
            "Guest / walk-in"
          )}
        </dd>
        <dt>Price</dt>
        <dd>{money(b.price)}</dd>
        <dt>Payment</dt>
        <dd style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {b.paid ? <Status tone="good">Paid</Status> : <Status tone="warn">Unpaid</Status>}
          {!b.paid && b.status !== "cancelled" && (
            <button className="btn btn-primary btn-xs" onClick={() => set({ paid: true })}>
              Collect {money(b.price)}
            </button>
          )}
        </dd>
      </dl>
      {b.status === "no-show" && (
        <p style={{ marginTop: 20, color: "var(--muted)", fontSize: 13.5 }}>
          Your no-show fee is {money(state.settings.noShowFee)}. Players are charged automatically when a card is on file.
        </p>
      )}
    </Drawer>
  );
}
