"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IconChevron, IconChevronLeft, IconPlus } from "../../Icons";
import { type Booking, addDays, fmtDate, fmtShortTime, fmtTime, money, nowMinutes, parseYmd, ymd } from "../data";
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

export function Bookings() {
  const { state } = useStore();
  const params = useSearchParams();
  useNow(60000);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [date, setDate] = useState(ymd(new Date()));
  const [modal, setModal] = useState<{ courtId?: string; date?: string; start?: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (params.get("new")) setModal({});
  }, [params]);

  const s = state.settings;
  const dayBookings = state.bookings.filter((b) => b.date === date);
  const revenue = dayBookings.filter((b) => b.status !== "cancelled").reduce((a, b) => a + b.price, 0);
  const isToday = date === ymd(new Date());

  return (
    <>
      <PageHead title="Bookings" sub={`${fmtDate(date, { weekday: "long", month: "long", day: "numeric" })} · ${dayBookings.filter((b) => b.status !== "cancelled").length} bookings · ${money(revenue)}`}>
        <div className="seg" role="group" aria-label="View">
          <button aria-pressed={view === "calendar"} onClick={() => setView("calendar")}>
            Calendar
          </button>
          <button aria-pressed={view === "list"} onClick={() => setView("list")}>
            List
          </button>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal({ date })}>
          <IconPlus size={16} /> New booking
        </button>
      </PageHead>

      {view === "calendar" ? (
        <Panel
          pad={false}
          title={
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="icon-btn sm" aria-label="Previous day" onClick={() => setDate(ymd(addDays(parseYmd(date), -1)))}>
                <IconChevronLeft size={16} />
              </button>
              <button className="icon-btn sm" aria-label="Next day" onClick={() => setDate(ymd(addDays(parseYmd(date), 1)))}>
                <IconChevron size={16} />
              </button>
              <button className="btn btn-ghost btn-xs" onClick={() => setDate(ymd(new Date()))} disabled={isToday}>
                Today
              </button>
              <input type="date" className="select" style={{ height: 32, backgroundImage: "none", paddingRight: 12 }} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Pick date" />
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
          <Calendar date={date} bookings={dayBookings} onSlot={(courtId, start) => setModal({ courtId, date, start })} onPick={setSelected} isToday={isToday} open={s.open} close={s.close} />
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
  date,
  bookings,
  onSlot,
  onPick,
  isToday,
  open,
  close,
}: {
  date: string;
  bookings: Booking[];
  onSlot: (courtId: string, start: number) => void;
  onPick: (id: string) => void;
  isToday: boolean;
  open: number;
  close: number;
}) {
  const { state } = useStore();
  const rows: number[] = [];
  for (let m = open; m < close; m += SLOT) rows.push(m);
  const nm = nowMinutes();
  const cols = `64px repeat(${state.courts.length}, minmax(120px, 1fr))`;

  return (
    <div className="cal-wrap">
      <div className="cal" style={{ gridTemplateColumns: cols }}>
        <div className="cal-head cal-times" style={{ zIndex: 4 }} />
        {state.courts.map((c) => (
          <div className="cal-head" key={c.id}>
            {c.name}
            <small>
              {c.surface}
              {c.status === "maintenance" ? " · blocked" : ""}
            </small>
          </div>
        ))}

        <div className="cal-times">
          {rows.map((m) => (
            <div key={m} className="cal-time" style={{ height: ROW }}>
              {m % 60 === 0 ? fmtShortTime(m) : ""}
            </div>
          ))}
        </div>

        {state.courts.map((c, ci) => (
          <div className="cal-col" key={c.id}>
            {isToday && nm >= open && nm <= close && (
              <div className={`cal-now ${ci === 0 ? "first" : ""}`} style={{ top: ((nm - open) / SLOT) * ROW }} aria-hidden="true" />
            )}
            {rows.map((m) => (
              <button
                key={m}
                className={`cal-slot ${m % 60 === 0 ? "hour" : ""} ${c.status === "maintenance" ? "off" : ""}`}
                style={{ height: ROW }}
                aria-label={`Book ${c.name} at ${fmtTime(m)}`}
                onClick={() => c.status !== "maintenance" && onSlot(c.id, m)}
              />
            ))}
            {bookings
              .filter((b) => b.courtId === c.id)
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
