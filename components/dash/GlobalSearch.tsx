"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { IconCalendar, IconPlayers, IconSearch, IconTrophy, IconWallet } from "../Icons";
import { fmtDate, fmtTime, money, ymd } from "./data";
import { useStore } from "./store";

type Hit = { key: string; group: string; title: string; sub: string; href: string; Icon: typeof IconSearch };

/** Top-bar search across players, bookings, events and payments. "/" or Ctrl+K focuses it. */
export function GlobalSearch() {
  const { state } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.("input,textarea,select,[contenteditable]");
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
    };
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  const hits = useMemo<Hit[]>(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    const today = ymd(new Date());
    const players = state.players
      .filter((p) => p.name.toLowerCase().includes(s) || p.email.includes(s) || p.phone.includes(s))
      .slice(0, 4)
      .map((p) => ({
        key: p.id,
        group: "Players",
        title: p.name,
        sub: `${p.rating.toFixed(2)} · ${state.plans.find((x) => x.id === p.planId)?.name ?? "Drop-in"}`,
        href: `/dashboard/players?q=${encodeURIComponent(p.name)}`,
        Icon: IconPlayers,
      }));
    const name = (id: string | null) => state.players.find((p) => p.id === id)?.name ?? "";
    const bookings = state.bookings
      .filter((b) => b.status !== "cancelled" && (b.title.toLowerCase().includes(s) || name(b.playerId).toLowerCase().includes(s)))
      .sort((a, b) => Number(b.date >= today) - Number(a.date >= today) || (a.date >= today ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)) || a.start - b.start)
      .slice(0, 3)
      .map((b) => ({
        key: b.id,
        group: "Bookings",
        title: b.title,
        sub: `${fmtDate(b.date, { weekday: "short", month: "short", day: "numeric" })} · ${fmtTime(b.start)} · ${state.courts.find((c) => c.id === b.courtId)?.name ?? ""}`,
        href: `/dashboard/bookings?date=${b.date}&open=${b.id}`,
        Icon: IconCalendar,
      }));
    const events = state.events
      .filter((e) => e.name.toLowerCase().includes(s) || e.kind.toLowerCase().includes(s))
      .slice(0, 2)
      .map((e) => ({ key: e.id, group: "Events", title: e.name, sub: `${e.kind} · ${e.status}`, href: `/dashboard/events?id=${e.id}`, Icon: IconTrophy }));
    const payments = state.transactions
      .filter((t) => t.description.toLowerCase().includes(s))
      .slice(0, 3)
      .map((t) => ({
        key: t.id,
        group: "Payments",
        title: `${t.description} · ${money(t.amount)}`,
        sub: new Date(t.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
        href: `/dashboard/payments?q=${encodeURIComponent(t.description)}`,
        Icon: IconWallet,
      }));
    return [...players, ...bookings, ...events, ...payments];
  }, [q, state]);

  const go = (h: Hit) => {
    setOpen(false);
    setQ("");
    input.current?.blur();
    router.push(h.href);
  };

  return (
    <div className="gsearch" ref={wrap}>
      <form
        className="top-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (hits[active]) go(hits[active]);
          else if (q.trim()) router.push(`/dashboard/players?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <IconSearch size={18} />
        <label htmlFor="global-search" className="sr-only">
          Search players, bookings, events and payments
        </label>
        <input
          ref={input}
          id="global-search"
          value={q}
          autoComplete="off"
          role="combobox"
          aria-expanded={open && hits.length > 0}
          aria-controls="gsearch-list"
          aria-activedescendant={open && hits[active] ? `gs-${hits[active].key}` : undefined}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(hits.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            } else if (e.key === "Escape") {
              setOpen(false);
              input.current?.blur();
            }
          }}
          placeholder="Search players, bookings, events"
        />
        <kbd aria-hidden="true">/</kbd>
      </form>
      {open && q.trim().length >= 2 && (
        <div className="pop gpop" id="gsearch-list" role="listbox" aria-label="Search results">
          {hits.length === 0 && <p className="pop-empty">No matches for “{q}”.</p>}
          {hits.map((h, i) => (
            <div key={h.key}>
              {(i === 0 || hits[i - 1].group !== h.group) && <div className="g-group">{h.group}</div>}
              <button
                id={`gs-${h.key}`}
                role="option"
                aria-selected={i === active}
                className="g-hit"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(h)}
              >
                <h.Icon size={18} />
                <span>
                  <b>{h.title}</b>
                  <small>{h.sub}</small>
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
