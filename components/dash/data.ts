/* ------------------------------------------------------------------
   MyPickleball dashboard: types + seeded demo data
   ------------------------------------------------------------------ */

export type CourtStatus = "open" | "play" | "maintenance";
export type GameKind = "open" | "booking" | "lesson";

export type Game = {
  playerIds: string[];
  label: string;
  kind: GameKind;
  startedAt: number; // epoch ms
  durationMin: number;
};

export type Court = {
  id: string;
  name: string;
  surface: "Indoor" | "Outdoor";
  status: CourtStatus;
  lights: boolean;
  game?: Game;
  note?: string;
};

export type Player = {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  planId: string | null;
  renewsOn: string | null; // YYYY-MM-DD
  joined: string;
  lastVisit: string;
  games: number;
  minutes: number;
  balance: number;
  hue: number;
};

export type BookingType = "Court" | "Lesson" | "Clinic" | "League" | "Event";
export type BookingStatus = "confirmed" | "checked-in" | "cancelled" | "no-show";

export type Booking = {
  id: string;
  courtId: string;
  date: string;
  start: number; // minutes from midnight
  duration: number;
  type: BookingType;
  title: string;
  playerId: string | null;
  price: number;
  paid: boolean;
  status: BookingStatus;
};

export type QueueEntry = {
  playerId: string;
  checkedInAt: number;
  waitingSince: number;
  state: "waiting" | "playing";
  sessionMinutes: number;
  sessionGames: number;
};

export type Coach = {
  id: string;
  name: string;
  specialty: string;
  rate: number;
  rating: number;
  bio: string;
  hue: number;
};

export type Lesson = {
  id: string;
  coachId: string;
  title: string;
  kind: "Private" | "Clinic" | "Camp";
  date: string;
  start: number;
  duration: number;
  courtId: string;
  capacity: number;
  enrolled: string[];
  price: number;
  level: string;
};

export type Standing = { name: string; w: number; l: number; pf: number; pa: number };
export type Match = { round: number; court: string; a: string; b: string; score?: string };

export type ClubEvent = {
  id: string;
  name: string;
  kind: "League" | "Ladder" | "Round robin" | "Tournament";
  start: string;
  end: string;
  level: string;
  fee: number;
  capacity: number;
  entrants: number;
  status: "Registering" | "In progress" | "Completed";
  standings: Standing[];
  matches: Match[];
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  perks: string[];
  courtDiscount: number;
};

export type TxCategory = "Court" | "Coaching" | "Membership" | "Event" | "Retail";
export type Transaction = {
  id: string;
  at: number;
  playerId: string | null;
  description: string;
  category: TxCategory;
  amount: number;
  method: "Card" | "Apple Pay" | "Cash" | "Wallet";
  status: "paid" | "refunded";
};

export type StaffRole = "Owner" | "Manager" | "Coach" | "Front desk";
export type Shift = { day: number; start: number; end: number };
export type Staff = {
  id: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  active: boolean;
  shifts: Shift[];
  hue: number;
};

export type Settings = {
  clubName: string;
  address: string;
  timezone: string;
  open: number;
  close: number;
  peakPrice: number;
  offPeakPrice: number;
  peakStart: number;
  peakEnd: number;
  gameLength: number;
  queueMode: "fifo" | "skill";
  dropInFee: number;
  cancelHours: number;
  noShowFee: number;
};

export type Notice = { id: string; at: number; text: string; tone: "info" | "good" | "warn" };

export type State = {
  version: number;
  /** YYYY-MM-DD the demo data was last aligned to */
  seededOn: string;
  /** epoch ms of the last save, used to rebase live timers */
  savedAt: number;
  /** one-step undo snapshot (never persisted) */
  undo?: { noticeId: string; prev: State };
  courts: Court[];
  players: Player[];
  bookings: Booking[];
  queue: QueueEntry[];
  coaches: Coach[];
  lessons: Lesson[];
  events: ClubEvent[];
  plans: Plan[];
  transactions: Transaction[];
  staff: Staff[];
  settings: Settings;
  notices: Notice[];
};

/** Bump when the sample data changes so saved demos are replaced. */
export const DATA_VERSION = 5;

/* ---------------- helpers ---------------- */

export const pad = (n: number) => String(n).padStart(2, "0");
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const parseYmd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const fmtTime = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
};
export const fmtShortTime = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const h12 = ((h + 11) % 12) + 1;
  return m ? `${h12}:${pad(m)}` : `${h12}${h < 12 ? "a" : "p"}`;
};
export const money = (n: number, cents = false) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
export const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
/** Current time for records created in event handlers. */
export const stamp = () => Date.now();
export const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`;
export const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};
export const fmtDate = (s: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) =>
  parseYmd(s).toLocaleDateString("en-US", opts);

/* deterministic PRNG so the demo looks the same every reset */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const FIRST = [
  "Jordan", "Amir", "Sofia", "Kenji", "Rachel", "Dev", "Tom", "Lucia", "Mia", "Owen", "Priya", "Sam",
  "Alex", "Grace", "Marcus", "Nina", "Leo", "Hana", "Isaac", "Chloe", "Diego", "Ava", "Ben", "Zara",
  "Caleb", "Maya", "Ethan", "Lena", "Noah", "Ivy", "Ryan", "Tess", "Omar", "Ruby", "Felix", "Jade",
  "Victor", "Elena", "Luke", "Nora",
];
const LAST = [
  "Rivera", "Chen", "Park", "Ali", "Okafor", "Lee", "Brooks", "Kim", "Patel", "Nguyen", "Garcia", "Walsh",
  "Moreno", "Hughes", "Sato", "Diaz", "Fischer", "Khan", "Russo", "Silva", "Bennett", "Cole", "Ortiz", "Reyes",
];

export const PLANS: Plan[] = [
  { id: "basic", name: "Social", price: 39, interval: "month", perks: ["Open play access", "Member court rates", "Book 3 days ahead"], courtDiscount: 15 },
  { id: "plus", name: "Competitive", price: 79, interval: "month", perks: ["Unlimited open play", "2 free court hours / mo", "Book 7 days ahead", "League discounts"], courtDiscount: 30 },
  { id: "family", name: "Family", price: 129, interval: "month", perks: ["Up to 4 players", "Unlimited open play", "Junior clinics 20% off"], courtDiscount: 25 },
  { id: "annual", name: "Annual Pro", price: 790, interval: "year", perks: ["Everything in Competitive", "Guest passes x10", "Priority tournament entry"], courtDiscount: 35 },
];

export function seed(): State {
  const r = rng(42);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const now = Date.now();
  const today = new Date();
  const T = ymd(today);
  const nm = nowMinutes();

  /* players */
  const used = new Set<string>();
  const players: Player[] = Array.from({ length: 48 }, (_, i) => {
    let name = "";
    do name = `${pick(FIRST)} ${pick(LAST)}`;
    while (used.has(name));
    used.add(name);
    const planRoll = r();
    const planId = planRoll < 0.28 ? "basic" : planRoll < 0.55 ? "plus" : planRoll < 0.65 ? "family" : planRoll < 0.72 ? "annual" : null;
    const renew = planId ? ymd(addDays(today, Math.floor(r() * 34) - 4)) : null;
    const games = Math.floor(r() * 46);
    return {
      id: `p${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@mail.com`,
      phone: `(512) 555-${String(1000 + Math.floor(r() * 8999))}`,
      rating: Math.round((2.5 + r() * 2.5) * 4) / 4,
      planId,
      renewsOn: renew,
      joined: ymd(addDays(today, -Math.floor(30 + r() * 700))),
      lastVisit: ymd(addDays(today, -Math.floor(r() * 20))),
      games,
      minutes: games * (12 + Math.floor(r() * 6)),
      balance: r() < 0.12 ? Math.round(r() * 60) : 0,
      hue: Math.floor(r() * 360),
    };
  });

  const pid = (i: number) => players[i].id;

  /* courts */
  const courts: Court[] = [
    { id: "c1", name: "Court 1", surface: "Indoor", status: "play", lights: true, game: { playerIds: [pid(0), pid(1), pid(2), pid(3)], label: "Open play", kind: "open", startedAt: now - 9 * 60000, durationMin: 15 } },
    { id: "c2", name: "Court 2", surface: "Indoor", status: "play", lights: true, game: { playerIds: [pid(4)], label: "Third-shot drop clinic", kind: "lesson", startedAt: now - 24 * 60000, durationMin: 60 } },
    { id: "c3", name: "Court 3", surface: "Indoor", status: "play", lights: true, game: { playerIds: [pid(5), pid(6), pid(7), pid(8)], label: "Open play", kind: "open", startedAt: now - 13 * 60000, durationMin: 15 } },
    { id: "c4", name: "Court 4", surface: "Indoor", status: "open", lights: true },
    { id: "c5", name: "Court 5", surface: "Outdoor", status: "play", lights: false, game: { playerIds: [pid(9), pid(10)], label: "Booking: Park / Ali", kind: "booking", startedAt: now - 38 * 60000, durationMin: 60 } },
    { id: "c6", name: "Court 6", surface: "Outdoor", status: "open", lights: false },
    { id: "c7", name: "Court 7", surface: "Outdoor", status: "maintenance", lights: false, note: "Net strap replacement" },
    { id: "c8", name: "Court 8", surface: "Outdoor", status: "open", lights: false },
  ];

  /* open play queue */
  const queue: QueueEntry[] = [
    ...[0, 1, 2, 3, 5, 6, 7, 8].map((i, k) => ({
      playerId: pid(i),
      checkedInAt: now - (40 + k * 3) * 60000,
      waitingSince: now - 10 * 60000,
      state: "playing" as const,
      sessionMinutes: 15 + (k % 3) * 15,
      sessionGames: 1 + (k % 3),
    })),
    ...[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map((i, k) => ({
      playerId: pid(i),
      checkedInAt: now - (30 - k * 2) * 60000,
      waitingSince: now - (14 - k) * 60000,
      state: "waiting" as const,
      sessionMinutes: k < 5 ? 15 : 0,
      sessionGames: k < 5 ? 1 : 0,
    })),
  ];

  /* bookings: last 28 days + next 7 days */
  const bookings: Booking[] = [];
  const titles: [BookingType, string][] = [
    ["Court", "Court rental"],
    ["Court", "Doubles match"],
    ["Lesson", "Private lesson"],
    ["Clinic", "Dinking clinic"],
    ["League", "Tuesday league"],
    ["Event", "Corporate social"],
  ];
  for (let d = -28; d <= 7; d++) {
    const date = ymd(addDays(today, d));
    const dow = addDays(today, d).getDay();
    const busy = dow === 0 || dow === 6 ? 0.62 : 0.42;
    courts.forEach((c) => {
      for (let start = 7 * 60; start < 21 * 60; start += 60) {
        const peak = start >= 17 * 60 || start < 9 * 60 || dow === 0 || dow === 6;
        if (r() > busy + (peak ? 0.2 : -0.1)) continue;
        if (c.id === "c7" && d >= -2) continue;
        const [type, title] = r() < 0.7 ? titles[Math.floor(r() * 2)] : pick(titles.slice(2));
        const duration = r() < 0.75 ? 60 : 90;
        if (start + duration > 22 * 60) continue;
        const player = pick(players);
        const price = type === "Court" ? (peak ? 36 : 24) : type === "Lesson" ? 75 : type === "Clinic" ? 30 : type === "League" ? 20 : 180;
        let status: BookingStatus = "confirmed";
        if (d < 0 || (d === 0 && start + duration < nm)) status = r() < 0.06 ? "no-show" : r() < 0.05 ? "cancelled" : "checked-in";
        if (d === 0 && start <= nm && start + duration > nm) status = "checked-in";
        bookings.push({
          id: `b${bookings.length + 1}`,
          courtId: c.id,
          date,
          start,
          duration,
          type,
          title: type === "Court" ? `${player.name.split(" ")[1]} party` : title,
          playerId: player.id,
          price,
          paid: status !== "confirmed" || r() < 0.9,
          status,
        });
        start += duration - 60;
      }
    });
  }
  // keep today's live courts free of conflicting bookings
  const liveIds = courts.filter((c) => c.status !== "open").map((c) => c.id);
  const clean = bookings.filter(
    (b) => !(b.date === T && liveIds.includes(b.courtId) && b.start <= nm + 30 && b.start + b.duration > nm - 30),
  );

  /* coaches + lessons */
  const coaches: Coach[] = [
    { id: "k1", name: "Dana Kim", specialty: "Third-shot & soft game", rate: 80, rating: 4.9, bio: "PPR certified, former D1 tennis.", hue: 82 },
    { id: "k2", name: "Marcus Hughes", specialty: "Beginner bootcamps", rate: 60, rating: 4.8, bio: "Taught 1,200+ first-time players.", hue: 210 },
    { id: "k3", name: "Elena Moreno", specialty: "Tournament strategy", rate: 95, rating: 5.0, bio: "5.0 pro, APP tour finalist.", hue: 15 },
    { id: "k4", name: "Leo Sato", specialty: "Juniors & drills", rate: 55, rating: 4.7, bio: "Runs the junior academy.", hue: 160 },
  ];
  const lessonTpl: Omit<Lesson, "id" | "date" | "enrolled">[] = [
    { coachId: "k1", title: "Third-shot drop clinic", kind: "Clinic", start: 18 * 60, duration: 60, courtId: "c2", capacity: 8, price: 30, level: "3.0–3.5" },
    { coachId: "k2", title: "Beginner bootcamp", kind: "Clinic", start: 9 * 60, duration: 90, courtId: "c4", capacity: 12, price: 25, level: "2.0–2.5" },
    { coachId: "k3", title: "Private lesson", kind: "Private", start: 11 * 60, duration: 60, courtId: "c1", capacity: 1, price: 95, level: "4.0+" },
    { coachId: "k4", title: "Junior academy", kind: "Camp", start: 16 * 60, duration: 90, courtId: "c6", capacity: 10, price: 35, level: "Juniors" },
    { coachId: "k1", title: "Private lesson", kind: "Private", start: 13 * 60, duration: 60, courtId: "c3", capacity: 1, price: 80, level: "3.5" },
    { coachId: "k3", title: "Stacking & poaching", kind: "Clinic", start: 19 * 60 + 30, duration: 60, courtId: "c1", capacity: 8, price: 40, level: "4.0+" },
  ];
  const lessons: Lesson[] = [];
  for (let d = -1; d <= 6; d++) {
    lessonTpl.forEach((t, i) => {
      if ((d + i) % 3 === 2) return;
      const n = Math.min(t.capacity, Math.floor(r() * (t.capacity + 1)) + (t.capacity > 1 ? 2 : 0));
      const enrolled = Array.from(new Set(Array.from({ length: n }, () => pick(players).id))).slice(0, t.capacity);
      lessons.push({ ...t, id: `l${lessons.length + 1}`, date: ymd(addDays(today, d)), enrolled });
    });
  }

  /* events */
  const names = players.slice(0, 16).map((p) => p.name);
  const events: ClubEvent[] = [
    {
      id: "e1",
      name: "Spring Doubles League",
      kind: "League",
      start: ymd(addDays(today, -21)),
      end: ymd(addDays(today, 35)),
      level: "3.5",
      fee: 60,
      capacity: 16,
      entrants: 16,
      status: "In progress",
      standings: [
        ["Rivera / Chen", 7, 1, 88, 61],
        ["Park / Ali", 6, 2, 84, 70],
        ["Okafor / Lee", 5, 3, 80, 72],
        ["Brooks / Kim", 4, 4, 77, 76],
        ["Patel / Nguyen", 3, 5, 70, 79],
        ["Garcia / Walsh", 2, 6, 66, 83],
        ["Moreno / Diaz", 2, 6, 63, 82],
        ["Sato / Khan", 1, 7, 58, 86],
      ].map(([name, w, l, pf, pa]) => ({ name: name as string, w: w as number, l: l as number, pf: pf as number, pa: pa as number })),
      matches: [
        { round: 9, court: "Court 1", a: "Rivera / Chen", b: "Brooks / Kim" },
        { round: 9, court: "Court 2", a: "Park / Ali", b: "Sato / Khan" },
        { round: 9, court: "Court 3", a: "Okafor / Lee", b: "Garcia / Walsh" },
        { round: 9, court: "Court 4", a: "Patel / Nguyen", b: "Moreno / Diaz" },
      ],
    },
    {
      id: "e2",
      name: "Tuesday Night Ladder",
      kind: "Ladder",
      start: ymd(addDays(today, -42)),
      end: ymd(addDays(today, 14)),
      level: "3.0–4.0",
      fee: 15,
      capacity: 24,
      entrants: 22,
      status: "In progress",
      standings: names.slice(0, 10).map((n, i) => ({ name: n, w: 12 - i, l: 2 + i, pf: 140 - i * 6, pa: 90 + i * 5 })),
      matches: [],
    },
    {
      id: "e3",
      name: "Fall Classic Tournament",
      kind: "Tournament",
      start: ymd(addDays(today, 12)),
      end: ymd(addDays(today, 13)),
      level: "All levels",
      fee: 45,
      capacity: 64,
      entrants: 41,
      status: "Registering",
      standings: [],
      matches: [],
    },
    {
      id: "e4",
      name: "Friday Mixer Round Robin",
      kind: "Round robin",
      start: ymd(addDays(today, 3)),
      end: ymd(addDays(today, 3)),
      level: "2.5–3.5",
      fee: 10,
      capacity: 16,
      entrants: 9,
      status: "Registering",
      standings: [],
      matches: [],
    },
  ];

  /* transactions: derived from paid bookings + memberships + retail */
  const transactions: Transaction[] = [];
  const methods: Transaction["method"][] = ["Card", "Card", "Card", "Apple Pay", "Wallet", "Cash"];
  clean.forEach((b) => {
    if (!b.paid || b.status === "cancelled") return;
    const paidAt = new Date(parseYmd(b.date).getTime() + (b.start - 60 * (1 + Math.floor(r() * 30))) * 60000);
    if (paidAt.getHours() < 7 || paidAt.getHours() > 21) paidAt.setHours(7 + Math.floor(r() * 14));
    const at = paidAt.getTime();
    if (at > now) return;
    transactions.push({
      id: `t${transactions.length + 1}`,
      at,
      playerId: b.playerId,
      description: `${b.title} · ${courts.find((c) => c.id === b.courtId)?.name}`,
      category: b.type === "Court" ? "Court" : b.type === "Lesson" || b.type === "Clinic" ? "Coaching" : "Event",
      amount: b.price,
      method: pick(methods),
      status: r() < 0.02 ? "refunded" : "paid",
    });
  });
  players.forEach((p) => {
    if (!p.planId || !p.renewsOn) return;
    const plan = PLANS.find((x) => x.id === p.planId)!;
    const paidOn = addDays(parseYmd(p.renewsOn), plan.interval === "month" ? -30 : -365);
    if (paidOn > today || paidOn < addDays(today, -28)) return;
    transactions.push({
      id: `t${transactions.length + 1}`,
      at: paidOn.getTime() + 8 * 3600000,
      playerId: p.id,
      description: `${plan.name} membership`,
      category: "Membership",
      amount: plan.price,
      method: "Card",
      status: "paid",
    });
  });
  for (let d = -28; d <= 0; d++) {
    const n = 3 + Math.floor(r() * 7);
    for (let i = 0; i < n; i++) {
      const at = addDays(today, d).setHours(8 + Math.floor(r() * 12), Math.floor(r() * 60));
      if (at > now) continue;
      const item = pick([
        ["Open play drop-in", 12, "Court"],
        ["Paddle rental", 5, "Retail"],
        ["Ball sleeve (3)", 9, "Retail"],
        ["Guest pass", 15, "Court"],
        ["Grip tape", 7, "Retail"],
      ] as [string, number, TxCategory][]);
      transactions.push({
        id: `t${transactions.length + 1}`,
        at,
        playerId: r() < 0.6 ? pick(players).id : null,
        description: item[0],
        category: item[2],
        amount: item[1],
        method: pick(methods),
        status: "paid",
      });
    }
  }
  transactions.sort((a, b) => b.at - a.at);

  /* staff */
  const staff: Staff[] = [
    { id: "s1", name: "Marisol Vega", role: "Owner", email: "marisol@dinkdistrict.com", phone: "(512) 555-0101", active: true, hue: 82, shifts: [1, 2, 3, 4, 5].map((day) => ({ day, start: 9 * 60, end: 17 * 60 })) },
    { id: "s2", name: "Theo Brooks", role: "Manager", email: "theo@dinkdistrict.com", phone: "(512) 555-0102", active: true, hue: 200, shifts: [2, 3, 4, 5, 6].map((day) => ({ day, start: 12 * 60, end: 21 * 60 })) },
    { id: "s3", name: "Dana Kim", role: "Coach", email: "dana@dinkdistrict.com", phone: "(512) 555-0103", active: true, hue: 82, shifts: [1, 3, 5].map((day) => ({ day, start: 16 * 60, end: 21 * 60 })) },
    { id: "s4", name: "Andre Reyes", role: "Front desk", email: "andre@dinkdistrict.com", phone: "(512) 555-0104", active: true, hue: 300, shifts: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, start: 6 * 60, end: 14 * 60 })) },
    { id: "s5", name: "Priya Shah", role: "Front desk", email: "priya@dinkdistrict.com", phone: "(512) 555-0105", active: true, hue: 20, shifts: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, start: 14 * 60, end: 22 * 60 })) },
    { id: "s6", name: "Marcus Hughes", role: "Coach", email: "marcus@dinkdistrict.com", phone: "(512) 555-0106", active: true, hue: 210, shifts: [0, 6].map((day) => ({ day, start: 8 * 60, end: 13 * 60 })) },
    { id: "s7", name: "Leo Sato", role: "Coach", email: "leo@dinkdistrict.com", phone: "(512) 555-0107", active: false, hue: 160, shifts: [] },
  ];

  return {
    version: DATA_VERSION,
    seededOn: T,
    savedAt: now,
    courts,
    players,
    bookings: clean,
    queue,
    coaches,
    lessons,
    events,
    plans: PLANS,
    transactions,
    staff,
    settings: {
      clubName: "Dink District",
      address: "2400 E Cesar Chavez St, Austin, TX",
      timezone: "America/Chicago",
      open: 6 * 60,
      close: 22 * 60,
      peakPrice: 36,
      offPeakPrice: 24,
      peakStart: 17 * 60,
      peakEnd: 21 * 60,
      gameLength: 15,
      queueMode: "skill",
      dropInFee: 12,
      cancelHours: 24,
      noShowFee: 15,
    },
    notices: [
      { id: "n1", at: now - 4 * 60000, text: "Court 3 game ends in 2 minutes. Next group notified.", tone: "warn" },
      { id: "n2", at: now - 22 * 60000, text: "Rachel Park renewed Competitive membership ($79).", tone: "good" },
      { id: "n3", at: now - 55 * 60000, text: "Court 7 marked for maintenance by Theo.", tone: "info" },
    ],
  };
}
