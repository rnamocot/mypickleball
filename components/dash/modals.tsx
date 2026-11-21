"use client";

import { useMemo, useState } from "react";
import { IconMinus, IconPlus } from "./miniIcons";
import { type Booking, type BookingType, type Transaction, addDays, fmtTime, money, parseYmd, uid, ymd } from "./data";
import { useStore } from "./store";
import { Avatar, Field, Modal } from "./ui";

/* ---------------- New booking ---------------- */
export function BookingModal({
  open,
  onClose,
  preset,
}: {
  open: boolean;
  onClose: () => void;
  preset?: { courtId?: string; date?: string; start?: number };
}) {
  const { state, dispatch } = useStore();
  const s = state.settings;
  const isFree = (courtId: string, d: string, st: number) =>
    !state.bookings.some((b) => b.courtId === courtId && b.date === d && b.status !== "cancelled" && b.start < st + 60 && st < b.start + b.duration);

  /** First open court at or after the preferred time (wrapping to earlier in the day if needed). */
  const firstFree = (d: string, preferred: number) => {
    const usable = state.courts.filter((c) => c.status !== "maintenance");
    const slots: number[] = [];
    for (let m = s.open; m <= s.close - 60; m += 30) slots.push(m);
    const ordered = [...slots.filter((m) => m >= preferred), ...slots.filter((m) => m < preferred)];
    for (const m of ordered) {
      const c = usable.find((x) => isFree(x.id, d, m));
      if (c) return { courtId: c.id, start: m };
    }
    return { courtId: state.courts[0]?.id ?? "", start: preferred };
  };

  const initial = () => {
    const d = preset?.date ?? ymd(new Date());
    if (preset?.courtId && preset.start !== undefined) return { courtId: preset.courtId, date: d, start: preset.start };
    const n = new Date();
    const soon = d === ymd(n) ? Math.ceil((n.getHours() * 60 + n.getMinutes()) / 30) * 30 : 18 * 60;
    const pick = firstFree(d, preset?.start ?? Math.max(soon, s.open));
    return { ...pick, date: d };
  };

  const [init] = useState(initial);
  const [courtId, setCourtId] = useState(init.courtId);
  const [date, setDate] = useState(init.date);
  const [start, setStart] = useState(init.start);
  const [duration, setDuration] = useState(60);
  const [type, setType] = useState<BookingType>("Court");
  const [playerId, setPlayerId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [paid, setPaid] = useState(true);
  const [priceText, setPriceText] = useState("");
  const [weeks, setWeeks] = useState(1);

  // Start fresh every time the modal opens (and follow a new slot preset).
  const key = `${preset?.courtId}-${preset?.date}-${preset?.start}-${open}`;
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    if (open) {
      const next = initial();
      setDate(next.date);
      setStart(next.start);
      setCourtId(next.courtId);
      setDuration(60);
      setType("Court");
      setPlayerId("");
      setTitle("");
      setPaid(true);
      setPriceText("");
      setWeeks(1);
    }
  }

  const player = state.players.find((p) => p.id === playerId);
  const plan = state.plans.find((p) => p.id === player?.planId);
  const peak = start >= s.peakStart && start < s.peakEnd;
  const base =
    type === "Court" ? (peak ? s.peakPrice : s.offPeakPrice) * (duration / 60) : type === "Lesson" ? 80 * (duration / 60) : type === "Clinic" ? 30 : type === "League" ? 20 : 180;
  const suggested = Math.round(base * (1 - (type === "Court" && plan ? plan.courtDiscount / 100 : 0)));
  const price = priceText.trim() !== "" && !Number.isNaN(Number(priceText)) ? Math.max(0, Number(priceText)) : suggested;

  const conflict = useMemo(
    () =>
      state.bookings.some(
        (b) => b.courtId === courtId && b.date === date && b.status !== "cancelled" && b.start < start + duration && start < b.start + b.duration,
      ),
    [state.bookings, courtId, date, start, duration],
  );

  const times = [];
  for (let m = s.open; m <= s.close - 30; m += 30) times.push(m);

  const submit = () => {
    if (conflict) return;
    if (weeks > 1) {
      const titleText = title || (player ? `${player.name.split(" ").slice(-1)[0]} weekly` : "Weekly booking");
      const list: Booking[] = [];
      for (let w = 0; w < weeks; w++) {
        const d = ymd(addDays(parseYmd(date), w * 7));
        const clash = state.bookings.some((b) => b.courtId === courtId && b.date === d && b.status !== "cancelled" && b.start < start + duration && start < b.start + b.duration);
        if (clash) continue;
        list.push({ id: uid("b"), courtId, date: d, start, duration, type, title: titleText, playerId: playerId || null, price, paid: w === 0 && paid, status: "confirmed" });
      }
      dispatch({ t: "addBookings", bookings: list });
      if (list.length < weeks) dispatch({ t: "notice", text: `${weeks - list.length} of ${weeks} weeks were skipped because the court was already booked.`, tone: "warn" });
      onClose();
      return;
    }
    const b: Booking = {
      id: uid("b"),
      courtId,
      date,
      start,
      duration,
      type,
      title: title || (player ? `${player.name.split(" ").slice(-1)[0]} ${type === "Court" ? "party" : type.toLowerCase()}` : `${type} booking`),
      playerId: playerId || null,
      price,
      paid,
      status: "confirmed",
    };
    dispatch({ t: "addBooking", booking: b });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New booking"
      footer={
        <>
          <span style={{ marginRight: "auto", alignSelf: "center", color: "var(--muted)" }}>
            Total <b style={{ color: "var(--text)", fontSize: 18, marginLeft: 6 }}>{money(price)}</b>
            {plan && type === "Court" && <small style={{ marginLeft: 8, color: "var(--dim)" }}>{plan.courtDiscount}% member rate</small>}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary btn-sm" onClick={submit} disabled={conflict}>
            Confirm booking
          </button>
        </>
      }
    >
      <div className="form">
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value as BookingType)}>
            {(["Court", "Lesson", "Clinic", "League", "Event"] as BookingType[]).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Court">
          <select value={courtId} onChange={(e) => setCourtId(e.target.value)}>
            {state.courts.map((c) => (
              <option key={c.id} value={c.id} disabled={c.status === "maintenance"}>
                {c.name} · {c.surface}
                {c.status === "maintenance" ? " (maintenance)" : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Start time" hint={peak ? "Peak rate applies" : "Off-peak rate"}>
          <select value={start} onChange={(e) => setStart(Number(e.target.value))}>
            {times.map((m) => (
              <option key={m} value={m}>
                {fmtTime(m)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Duration">
          <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            {[30, 60, 90, 120].map((d) => (
              <option key={d} value={d}>
                {d} min
              </option>
            ))}
          </select>
        </Field>
        <Field label="Player">
          <select value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
            <option value="">Walk-in / guest</option>
            {[...state.players]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.rating.toFixed(2)}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Price" hint={priceText ? `Suggested ${money(suggested)}` : "Suggested from your rates. Type to override."}>
          <input inputMode="decimal" value={priceText} onChange={(e) => setPriceText(e.target.value.replace(/[^\d.]/g, ""))} placeholder={String(suggested)} />
        </Field>
        <Field label="Repeat" hint={weeks > 1 ? "Weeks where the court is taken are skipped." : undefined}>
          <select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}>
            <option value={1}>Does not repeat</option>
            {[4, 8, 12].map((w) => (
              <option key={w} value={w}>
                Every week for {w} weeks
              </option>
            ))}
          </select>
        </Field>
        <Field label="Title (optional)">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Rivera doubles" />
        </Field>
        <label className="switch-row dfield full" style={{ borderBottom: 0, padding: 0 }}>
          <span>
            Collect payment now
            <small>Charges the card on file or records a desk payment.</small>
          </span>
          <button type="button" role="switch" aria-checked={paid} className="switch" onClick={() => setPaid(!paid)} aria-label="Collect payment now" />
        </label>
      </div>
      {conflict && (
        <p style={{ marginTop: 14, color: "var(--coral)", fontSize: 13.5 }}>
          That court is already booked for part of this time. Pick another court or time.
        </p>
      )}
    </Modal>
  );
}

/* ---------------- Quick sale / POS ---------------- */
const ITEMS: { name: string; price: number; cat: Transaction["category"] }[] = [
  { name: "Open play drop-in", price: 12, cat: "Court" },
  { name: "Court hour (off-peak)", price: 24, cat: "Court" },
  { name: "Court hour (peak)", price: 36, cat: "Court" },
  { name: "Guest pass", price: 15, cat: "Court" },
  { name: "Paddle rental", price: 5, cat: "Retail" },
  { name: "Ball sleeve (3)", price: 9, cat: "Retail" },
  { name: "Grip tape", price: 7, cat: "Retail" },
  { name: "Sports drink", price: 4, cat: "Retail" },
];

export function QuickSale({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [playerId, setPlayerId] = useState("");
  const [method, setMethod] = useState<Transaction["method"]>("Card");
  const lines = ITEMS.filter((i) => cart[i.name]);
  const total = lines.reduce((a, i) => a + i.price * cart[i.name], 0);
  const add = (n: string, d: number) => setCart((c) => ({ ...c, [n]: Math.max(0, (c[n] ?? 0) + d) }));

  const charge = () => {
    lines.forEach((i) =>
      dispatch({
        t: "addTx",
        tx: {
          id: uid("t"),
          at: Date.now(),
          playerId: playerId || null,
          description: cart[i.name] > 1 ? `${i.name} x${cart[i.name]}` : i.name,
          category: i.cat,
          amount: i.price * cart[i.name],
          method,
          status: "paid",
        },
      }),
    );
    setCart({});
    setPlayerId("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Quick sale"
      wide
      footer={
        <>
          <span style={{ marginRight: "auto", alignSelf: "center", color: "var(--muted)" }}>
            Total <b style={{ color: "var(--text)", fontSize: 20, marginLeft: 6 }}>{money(total)}</b>
          </span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary btn-sm" onClick={charge} disabled={total === 0}>
            Charge {money(total)}
          </button>
        </>
      }
    >
      <div className="grid g-2" style={{ alignItems: "start" }}>
        <div className="grid g-2" style={{ gap: 8 }}>
          {ITEMS.map((i) => (
            <button key={i.name} className="card" style={{ padding: 14 }} onClick={() => add(i.name, 1)}>
              <b style={{ display: "block", fontWeight: 550 }}>{i.name}</b>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>{money(i.price)}</span>
            </button>
          ))}
        </div>
        <div>
          <div className="form" style={{ gridTemplateColumns: "1fr" }}>
            <Field label="Customer">
              <select value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
                <option value="">Walk-in</option>
                {[...state.players]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Payment method">
              <select value={method} onChange={(e) => setMethod(e.target.value as Transaction["method"])}>
                {(["Card", "Apple Pay", "Cash", "Wallet"] as const).map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="section-title">Cart</div>
          {lines.length === 0 && <p style={{ color: "var(--dim)", fontSize: 13.5 }}>Tap an item to add it.</p>}
          <ul className="rows" style={{ margin: "0 -20px" }}>
            {lines.map((i) => (
              <li key={i.name}>
                <span className="grow">{i.name}</span>
                <button className="icon-btn sm" onClick={() => add(i.name, -1)} aria-label={`Remove one ${i.name}`}>
                  <IconMinus />
                </button>
                <b style={{ minWidth: 18, textAlign: "center" }}>{cart[i.name]}</b>
                <button className="icon-btn sm" onClick={() => add(i.name, 1)} aria-label={`Add one ${i.name}`}>
                  <IconPlus />
                </button>
                <span className="amt" style={{ minWidth: 56, textAlign: "right" }}>
                  {money(i.price * cart[i.name])}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------- Player picker (multi) ---------------- */
export function PlayerPicker({
  selected,
  onToggle,
  max,
  filter,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  max?: number;
  filter?: (id: string) => boolean;
}) {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const list = state.players
    .filter((p) => (filter ? filter(p.id) : true))
    .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div>
      <div className="search" style={{ marginBottom: 10 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players" aria-label="Search players" />
      </div>
      <div className="pick-list">
        {list.map((p) => {
          const on = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(p.id)}
              disabled={!on && max !== undefined && selected.length >= max}
            >
              <Avatar name={p.name} hue={p.hue} size={28} />
              <span className="grow">{p.name}</span>
              <span className="rating">{p.rating.toFixed(2)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
