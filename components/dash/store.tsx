"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  type Booking,
  type ClubEvent,
  type Court,
  type GameKind,
  type Lesson,
  type Notice,
  type Plan,
  type Player,
  type Settings,
  type Staff,
  type State,
  type Transaction,
  DATA_VERSION,
  addDays,
  parseYmd,
  seed,
  uid,
  ymd,
} from "./data";

const KEY = "mypickleball-demo-v1";

type Action =
  | { t: "load"; state: State }
  | { t: "reset" }
  | { t: "undo" }
  | { t: "notice"; text: string; tone?: Notice["tone"] }
  | { t: "dismissNotice"; id: string }
  // courts
  | { t: "startGame"; courtId: string; playerIds: string[]; label: string; kind: GameKind; durationMin: number }
  | { t: "endGame"; courtId: string }
  | { t: "extendGame"; courtId: string; minutes: number }
  | { t: "setCourt"; courtId: string; patch: Partial<Court> }
  | { t: "addCourt"; court: Court }
  | { t: "removeCourt"; courtId: string }
  // open play
  | { t: "checkIn"; playerId: string }
  | { t: "checkOut"; playerId: string }
  | { t: "fillCourts" }
  // bookings
  | { t: "addBooking"; booking: Booking }
  | { t: "updateBooking"; id: string; patch: Partial<Booking> }
  // players
  | { t: "addPlayer"; player: Player }
  | { t: "updatePlayer"; id: string; patch: Partial<Player> }
  // coaching
  | { t: "addLesson"; lesson: Lesson }
  | { t: "enroll"; lessonId: string; playerId: string }
  | { t: "unenroll"; lessonId: string; playerId: string }
  // events
  | { t: "addEvent"; event: ClubEvent }
  | { t: "updateEvent"; id: string; patch: Partial<ClubEvent> }
  // memberships
  | { t: "addPlan"; plan: Plan }
  // payments
  | { t: "addTx"; tx: Transaction }
  | { t: "refundTx"; id: string }
  // staff
  | { t: "addStaff"; staff: Staff }
  | { t: "updateStaff"; id: string; patch: Partial<Staff> }
  // settings
  | { t: "settings"; patch: Partial<Settings> };

const isDark = () => {
  const h = new Date().getHours();
  return h >= 17 || h < 7;
};

function notice(state: State, text: string, tone: Notice["tone"] = "info"): State {
  return { ...state, notices: [{ id: uid("n"), at: Date.now(), text, tone }, ...state.notices].slice(0, 30) };
}

/** Pick the next 4 players for a court. Skill mode keeps groups within a tight rating band. */
export function pickGroup(state: State): string[] {
  const waiting = state.queue
    .filter((q) => q.state === "waiting")
    .sort((a, b) => a.sessionGames - b.sessionGames || a.waitingSince - b.waitingSince);
  if (waiting.length < 4) return [];
  if (state.settings.queueMode === "fifo") {
    return [...waiting].sort((a, b) => a.waitingSince - b.waitingSince).slice(0, 4).map((q) => q.playerId);
  }
  const rating = (id: string) => state.players.find((p) => p.id === id)?.rating ?? 3;
  const anchor = waiting[0];
  const rest = waiting
    .slice(1)
    .map((q) => ({ q, d: Math.abs(rating(q.playerId) - rating(anchor.playerId)) - (Date.now() - q.waitingSince) / 3.6e6 }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map((x) => x.q.playerId);
  return [anchor.playerId, ...rest];
}

function endGame(state: State, courtId: string): State {
  const court = state.courts.find((c) => c.id === courtId);
  if (!court?.game) return state;
  const g = court.game;
  const mins = Math.max(1, Math.round((Date.now() - g.startedAt) / 60000));
  const now = Date.now();
  const players = state.players.map((p) =>
    g.playerIds.includes(p.id) && g.kind !== "lesson" ? { ...p, games: p.games + 1, minutes: p.minutes + mins, lastVisit: new Date().toISOString().slice(0, 10) } : p,
  );
  const queue = state.queue.map((q) =>
    g.playerIds.includes(q.playerId) && q.state === "playing"
      ? { ...q, state: "waiting" as const, waitingSince: now, sessionMinutes: q.sessionMinutes + mins, sessionGames: q.sessionGames + 1 }
      : q,
  );
  const courts = state.courts.map((c) => (c.id === courtId ? { ...c, status: "open" as const, game: undefined } : c));
  return notice({ ...state, courts, players, queue }, `${court.name} is open. ${g.label} ended after ${mins} min.`, "info");
}

function reducer(state: State, a: Action): State {
  switch (a.t) {
    case "load":
      return a.state;
    case "reset":
      return seed();
    case "undo":
      return state;
    case "notice":
      return notice(state, a.text, a.tone);
    case "dismissNotice":
      return { ...state, notices: state.notices.filter((n) => n.id !== a.id) };

    case "startGame": {
      const courts = state.courts.map((c) =>
        c.id === a.courtId
          ? { ...c, status: "play" as const, lights: c.surface === "Indoor" || isDark() ? true : c.lights, game: { playerIds: a.playerIds, label: a.label, kind: a.kind, startedAt: Date.now(), durationMin: a.durationMin } }
          : c,
      );
      const queue = state.queue.map((q) => (a.playerIds.includes(q.playerId) ? { ...q, state: "playing" as const } : q));
      const name = state.courts.find((c) => c.id === a.courtId)?.name;
      return notice({ ...state, courts, queue }, `${a.label} started on ${name}.`, "good");
    }
    case "endGame":
      return endGame(state, a.courtId);
    case "extendGame":
      return {
        ...state,
        courts: state.courts.map((c) => (c.id === a.courtId && c.game ? { ...c, game: { ...c.game, durationMin: c.game.durationMin + a.minutes } } : c)),
      };
    case "setCourt": {
      let s = state;
      if (a.patch.status && a.patch.status !== "play") {
        const c = state.courts.find((x) => x.id === a.courtId);
        if (c?.game) s = endGame(s, a.courtId);
      }
      return { ...s, courts: s.courts.map((c) => (c.id === a.courtId ? { ...c, ...a.patch, ...(a.patch.status === "open" ? { note: undefined } : {}) } : c)) };
    }
    case "addCourt":
      return notice({ ...state, courts: [...state.courts, a.court] }, `${a.court.name} added.`, "good");
    case "removeCourt":
      const name = state.courts.find((c) => c.id === a.courtId)?.name ?? "Court";
      return notice({ ...state, courts: state.courts.filter((c) => c.id !== a.courtId) }, `${name} removed.`, "info");

    case "checkIn": {
      if (state.queue.some((q) => q.playerId === a.playerId)) return state;
      const now = Date.now();
      const p = state.players.find((x) => x.id === a.playerId);
      let s: State = {
        ...state,
        queue: [...state.queue, { playerId: a.playerId, checkedInAt: now, waitingSince: now, state: "waiting", sessionMinutes: 0, sessionGames: 0 }],
      };
      if (p && !p.planId) {
        s = {
          ...s,
          transactions: [
            { id: uid("t"), at: now, playerId: p.id, description: "Open play drop-in", category: "Court", amount: state.settings.dropInFee, method: "Card", status: "paid" },
            ...s.transactions,
          ],
        };
      }
      return notice(s, `${p?.name ?? "Player"} checked in to open play${p && !p.planId ? ` (drop-in ${"$" + state.settings.dropInFee})` : ""}.`, "good");
    }
    case "checkOut": {
      const q = state.queue.find((x) => x.playerId === a.playerId);
      if (!q) return state;
      const who = state.players.find((p) => p.id === a.playerId)?.name ?? "Player";
      return notice({ ...state, queue: state.queue.filter((x) => x.playerId !== a.playerId) }, `${who} left open play.`, "info");
    }
    case "fillCourts": {
      let s = state;
      let filled = 0;
      for (const c of state.courts) {
        if (c.status !== "open") continue;
        const group = pickGroup(s);
        if (group.length < 4) break;
        s = reducer(s, { t: "startGame", courtId: c.id, playerIds: group, label: "Open play", kind: "open", durationMin: s.settings.gameLength });
        filled++;
      }
      return filled ? s : notice(s, "No open courts or not enough players waiting.", "warn");
    }

    case "addBooking": {
      const court = state.courts.find((c) => c.id === a.booking.courtId)?.name;
      let s: State = { ...state, bookings: [...state.bookings, a.booking] };
      if (a.booking.paid) {
        s = {
          ...s,
          transactions: [
            {
              id: uid("t"),
              at: Date.now(),
              playerId: a.booking.playerId,
              description: `${a.booking.title} · ${court}`,
              category: a.booking.type === "Court" ? "Court" : a.booking.type === "Lesson" || a.booking.type === "Clinic" ? "Coaching" : "Event",
              amount: a.booking.price,
              method: "Card",
              status: "paid",
            },
            ...s.transactions,
          ],
        };
      }
      return notice(s, `New booking: ${a.booking.title} on ${court}.`, "good");
    }
    case "updateBooking": {
      const before = state.bookings.find((b) => b.id === a.id);
      let s: State = { ...state, bookings: state.bookings.map((b) => (b.id === a.id ? { ...b, ...a.patch } : b)) };
      if (before && a.patch.paid && !before.paid) {
        s = {
          ...s,
          transactions: [
            { id: uid("t"), at: Date.now(), playerId: before.playerId, description: before.title, category: before.type === "Court" ? "Court" : "Coaching", amount: before.price, method: "Card", status: "paid" },
            ...s.transactions,
          ],
        };
      }
      if (before && a.patch.status && a.patch.status !== before.status) {
        const label = { confirmed: "restored", "checked-in": "checked in", cancelled: "cancelled", "no-show": "marked as no-show" }[a.patch.status];
        s = notice(s, `${before.title} ${label}.`, a.patch.status === "checked-in" || a.patch.status === "confirmed" ? "good" : "info");
      }
      return s;
    }

    case "addPlayer":
      return notice({ ...state, players: [a.player, ...state.players] }, `${a.player.name} added to players.`, "good");
    case "updatePlayer":
      return { ...state, players: state.players.map((p) => (p.id === a.id ? { ...p, ...a.patch } : p)) };

    case "addLesson":
      return notice({ ...state, lessons: [...state.lessons, a.lesson] }, `${a.lesson.title} scheduled.`, "good");
    case "enroll":
      return {
        ...state,
        lessons: state.lessons.map((l) => (l.id === a.lessonId && !l.enrolled.includes(a.playerId) && l.enrolled.length < l.capacity ? { ...l, enrolled: [...l.enrolled, a.playerId] } : l)),
      };
    case "unenroll":
      return { ...state, lessons: state.lessons.map((l) => (l.id === a.lessonId ? { ...l, enrolled: l.enrolled.filter((x) => x !== a.playerId) } : l)) };

    case "addEvent":
      return notice({ ...state, events: [a.event, ...state.events] }, `${a.event.name} created.`, "good");
    case "updateEvent":
      return { ...state, events: state.events.map((e) => (e.id === a.id ? { ...e, ...a.patch } : e)) };

    case "addPlan":
      return { ...state, plans: [...state.plans, a.plan] };

    case "addTx":
      return notice({ ...state, transactions: [a.tx, ...state.transactions] }, `Payment received: ${a.tx.description}.`, "good");
    case "refundTx":
      return notice({ ...state, transactions: state.transactions.map((t) => (t.id === a.id ? { ...t, status: "refunded" as const } : t)) }, "Refund issued.", "info");

    case "addStaff":
      return notice({ ...state, staff: [...state.staff, a.staff] }, `Invite sent to ${a.staff.name}.`, "good");
    case "updateStaff":
      return { ...state, staff: state.staff.map((s) => (s.id === a.id ? { ...s, ...a.patch } : s)) };

    case "settings":
      return { ...state, settings: { ...state.settings, ...a.patch } };
  }
}

/* ---------------- undo ---------------- */
const UNDOABLE = new Set<Action["t"]>(["endGame", "updateBooking", "refundTx", "checkOut", "removeCourt", "fillCourts"]);

function rootReducer(state: State, a: Action): State {
  if (a.t === "undo") return state.undo ? { ...state.undo.prev, undo: undefined } : state;
  if (a.t === "load" || a.t === "reset") return reducer(state, a);
  const prev = state.undo ? { ...state, undo: undefined } : state;
  const next = reducer(prev, a);
  if (next === prev) return state;
  if (UNDOABLE.has(a.t) && next.notices[0] && next.notices[0] !== prev.notices[0]) {
    return { ...next, undo: { noticeId: next.notices[0].id, prev } };
  }
  return { ...next, undo: undefined };
}

/* ---------------- keep the demo fresh ---------------- */
const shiftYmd = (s: string | null, days: number) => (s ? ymd(addDays(parseYmd(s), days)) : s);

/** Moves every date forward to today and rebases live timers by the time the club was closed. */
export function rebase(s: State): State {
  const today = ymd(new Date());
  const days = Math.round((parseYmd(today).getTime() - parseYmd(s.seededOn).getTime()) / 864e5);
  const away = Math.max(0, Date.now() - s.savedAt);
  if (days <= 0 && away < 60_000) return s;
  const dayMs = days * 864e5;
  return {
    ...s,
    seededOn: today,
    savedAt: Date.now(),
    bookings: days ? s.bookings.map((b) => ({ ...b, date: shiftYmd(b.date, days)! })) : s.bookings,
    lessons: days ? s.lessons.map((l) => ({ ...l, date: shiftYmd(l.date, days)! })) : s.lessons,
    events: days ? s.events.map((e) => ({ ...e, start: shiftYmd(e.start, days)!, end: shiftYmd(e.end, days)! })) : s.events,
    players: days
      ? s.players.map((p) => ({ ...p, joined: shiftYmd(p.joined, days)!, lastVisit: shiftYmd(p.lastVisit, days)!, renewsOn: shiftYmd(p.renewsOn, days) }))
      : s.players,
    transactions: days ? s.transactions.map((t) => ({ ...t, at: t.at + dayMs })) : s.transactions,
    courts: s.courts.map((c) => (c.game ? { ...c, game: { ...c.game, startedAt: c.game.startedAt + away } } : c)),
    queue: s.queue.map((q) => ({ ...q, checkedInAt: q.checkedInAt + away, waitingSince: q.waitingSince + away })),
    notices: s.notices.map((n) => ({ ...n, at: n.at + away })),
  };
}

function readSaved(): State | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as State;
    return s && s.version === DATA_VERSION ? s : null;
  } catch {
    return null;
  }
}

function persist(s: State) {
  try {
    const { undo: _undo, ...rest } = s;
    void _undo;
    localStorage.setItem(KEY, JSON.stringify({ ...rest, savedAt: Date.now() }));
  } catch {
    /* storage full or blocked: the demo keeps working in memory */
  }
}

type Ctx = { state: State; dispatch: (a: Action) => void };
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [state, dispatch] = useReducer(rootReducer, null as unknown as State);
  const latest = useRef<State | null>(null);

  useEffect(() => {
    // Hydrate from browser storage once on mount (unavailable during server render).
    const saved = readSaved();
    dispatch({ t: "load", state: saved ? rebase(saved) : seed() });
  }, []);

  useEffect(() => {
    if (!state) return;
    latest.current = state;
    persist(state);
  }, [state]);

  useEffect(() => {
    // Keep savedAt current while the tab is open so timers are not rewound on reload.
    const save = () => latest.current && persist(latest.current);
    const id = setInterval(save, 30_000);
    window.addEventListener("pagehide", save);
    return () => {
      clearInterval(id);
      window.removeEventListener("pagehide", save);
    };
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  if (!state) return <>{fallback ?? <div className="dash-loading" aria-busy="true" />}</>;
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

/** Current time, re-rendered every `ms` (for live timers). */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export function usePlayerLookup() {
  const { state } = useStore();
  const map = useMemo(() => new Map(state.players.map((p) => [p.id, p])), [state.players]);
  return useCallback((id: string | null | undefined) => (id ? map.get(id) : undefined), [map]);
}
