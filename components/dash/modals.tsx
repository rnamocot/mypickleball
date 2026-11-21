"use client";

import { useMemo, useState } from "react";
import { IconMinus, IconPlus } from "./miniIcons";
import { type Booking, type BookingType, type Transaction, fmtTime, money, uid, ymd } from "./data";
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
  const [courtId, setCourtId] = useState(() => {
    if (preset?.courtId) return preset.courtId;
    const d = preset?.date ?? ymd(new Date());
    const st = preset?.start ?? 18 * 60;
    const free = state.courts.find(
      (c) => c.status !== "maintenance" && !state.bookings.some((b) => b.courtId === c.id && b.date === d && b.status !== "cancelled" && b.start < st + 60 && st < b.start + b.duration),
    );
    return free?.id ?? state.courts[0]?.id;
  });
  const [date, setDate] = useState(preset?.date ?? ymd(new Date()));
  const [start, setStart] = useState(preset?.start ?? 18 * 60);
  const [duration, setDuration] = useState(60);
  const [type, setType] = useState<BookingType>("Court");
  const [playerId, setPlayerId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [paid, setPaid] = useState(true);

  // keep in sync when reopened with a new preset
  const key = `${preset?.courtId}-${preset?.date}-${preset?.start}-${open}`;
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    if (preset?.courtId) setCourtId(preset.courtId);
    if (preset?.date) setDate(preset.date);
    if (preset?.start !== undefined) setStart(preset.start);
  }

  const player = state.players.find((p) => p.id === playerId);
  const plan = state.plans.find((p) => p.id === player?.planId);
  const peak = start >= s.peakStart && start < s.peakEnd;
  const base = type === "Court" ? (peak ? s.peakPrice : s.offPeakPrice) * (duration / 60) : type === "Lesson" ? 80 : type === "Clinic" ? 30 : type === "League" ? 20 : 180;
  const price = Math.round(base * (1 - (type === "Court" && plan ? plan.courtDiscount / 100 : 0)));

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
        <Field label="Title (optional)" full>
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
