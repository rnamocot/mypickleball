import { addDays, type State, type TxCategory, ymd } from "./data";

export const CATS: TxCategory[] = ["Court", "Coaching", "Membership", "Event"];

export function revenueByDay(state: State, days: number) {
  const today = new Date();
  const out = Array.from({ length: days }, (_, i) => {
    const d = addDays(today, i - days + 1);
    return { key: ymd(d), d, total: 0, byCat: [0, 0, 0, 0] };
  });
  const idx = new Map(out.map((o, i) => [o.key, i]));
  for (const t of state.transactions) {
    if (t.status !== "paid") continue;
    const k = ymd(new Date(t.at));
    const i = idx.get(k);
    if (i === undefined) continue;
    out[i].total += t.amount;
    const c = t.category === "Retail" ? 0 : CATS.indexOf(t.category);
    out[i].byCat[c] += t.amount;
  }
  return out;
}

export function sumRange(state: State, fromDaysAgo: number, toDaysAgo = 0) {
  const start = addDays(new Date(), -fromDaysAgo);
  start.setHours(0, 0, 0, 0);
  const end = addDays(new Date(), -toDaysAgo);
  end.setHours(23, 59, 59, 999);
  return state.transactions
    .filter((t) => t.status === "paid" && t.at >= start.getTime() && t.at <= end.getTime())
    .reduce((a, t) => a + t.amount, 0);
}

/** % of open hours booked per court-hour, by weekday x hour (last 28 days). */
export function utilizationGrid(state: State) {
  const hours = Array.from({ length: 16 }, (_, i) => 6 + i); // 6a..9p
  const counts = Array.from({ length: 7 }, () => hours.map(() => 0));
  const daysSeen = Array(7).fill(0);
  const today = new Date();
  for (let d = 1; d <= 28; d++) daysSeen[addDays(today, -d).getDay()]++;
  const from = ymd(addDays(today, -28));
  const to = ymd(addDays(today, -1));
  for (const b of state.bookings) {
    if (b.date < from || b.date > to || b.status === "cancelled") continue;
    const dow = new Date(b.date + "T12:00:00").getDay();
    for (let m = b.start; m < b.start + b.duration; m += 60) {
      const h = Math.floor(m / 60);
      const hi = hours.indexOf(h);
      if (hi >= 0) counts[dow][hi]++;
    }
  }
  const courts = state.courts.length || 1;
  const order = [1, 2, 3, 4, 5, 6, 0];
  return {
    rows: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    cols: hours.map((h) => (h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`)),
    values: order.map((dow) => counts[dow].map((c) => Math.min(100, (c / (courts * Math.max(1, daysSeen[dow]))) * 100))),
  };
}

export function timeLeft(startedAt: number, durationMin: number, now: number) {
  const elapsed = (now - startedAt) / 1000;
  const total = durationMin * 60;
  return { elapsed, total, left: total - elapsed, pct: Math.min(1, elapsed / total) };
}

export const mmss = (s: number) => {
  const neg = s < 0;
  const a = Math.abs(Math.round(s));
  return `${neg ? "+" : ""}${Math.floor(a / 60)}:${String(a % 60).padStart(2, "0")}`;
};
