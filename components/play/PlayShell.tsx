"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { IconCalendar, IconHome, IconPlayers, IconQueue, IconTrophy, IconWhistle } from "../Icons";
import { LogoMark } from "../Logo";
import type { Player } from "../dash/data";
import { StoreProvider, useStore } from "../dash/store";
import { Avatar } from "../dash/ui";

const ME_KEY = "mypickleball-me";

const tabs = [
  { href: "/play", label: "Home", Icon: IconHome },
  { href: "/play/book", label: "Book", Icon: IconCalendar },
  { href: "/play/open-play", label: "Open play", Icon: IconQueue },
  { href: "/play/clinics", label: "Clinics", Icon: IconWhistle },
  { href: "/play/events", label: "Events", Icon: IconTrophy },
  { href: "/play/me", label: "Me", Icon: IconPlayers },
];

type MeCtx = { me: Player; setMe: (id: string) => void };
const Me = createContext<MeCtx | null>(null);

export function useMe() {
  const c = useContext(Me);
  if (!c) throw new Error("useMe outside PlayShell");
  return c;
}

export function PlayShell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider fallback={<div className="play-loading" aria-busy="true" />}>
      <Frame>{children}</Frame>
    </StoreProvider>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const { state } = useStore();
  const pathname = usePathname();
  const [meId, setMeId] = useState<string | null>(null);

  useEffect(() => {
    // Restore which demo player is "signed in" (browser-only).
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(ME_KEY);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from browser storage
    setMeId(saved);
  }, []);

  const fallback =
    state.players.find((p) => p.planId && !state.queue.some((q) => q.playerId === p.id) && !state.courts.some((c) => c.game?.playerIds.includes(p.id))) ?? state.players[0];
  const me = state.players.find((p) => p.id === meId) ?? fallback;
  const setMe = (id: string) => {
    setMeId(id);
    try {
      localStorage.setItem(ME_KEY, id);
    } catch {
      /* ignore */
    }
  };
  const active = (href: string) => (href === "/play" ? pathname === href : pathname.startsWith(href));

  return (
    <Me.Provider value={{ me, setMe }}>
      <div className="play">
        <header className="play-top">
          <div className="play-wrap play-top-inner">
            <Link href="/play" className="play-brand">
              <LogoMark size={30} />
              <span>
                <b>{state.settings.clubName}</b>
                <small>Player booking</small>
              </span>
            </Link>
            <nav className="play-nav" aria-label="Player">
              {tabs.map((t) => (
                <Link key={t.href} href={t.href} aria-current={active(t.href) ? "page" : undefined}>
                  {t.label}
                </Link>
              ))}
            </nav>
            <label className="play-me">
              <Avatar name={me.name} hue={me.hue} size={32} />
              <span className="sr-only">Playing as</span>
              <select value={me.id} onChange={(e) => setMe(e.target.value)} aria-label="Demo: choose which player you are">
                {[...state.players]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>
        </header>

        <div className="play-demo-note">
          Demo club. Everything you do here shows up live in the{" "}
          <Link href="/dashboard" target="_blank">
            staff dashboard
          </Link>
          .
        </div>

        <main className="play-wrap play-main" id="main">
          {children}
        </main>

        <footer className="play-foot play-wrap">
          <span>
            {state.settings.clubName} · {state.settings.address}
          </span>
          <Link href="/">Powered by MyPickleball</Link>
        </footer>

        <nav className="play-tabbar" aria-label="Player sections">
          {tabs.map(({ href, label, Icon }) => (
            <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}>
              <Icon size={21} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <PlayToast />
      </div>
    </Me.Provider>
  );
}

/** Pops up the result of a player's own action. */
function PlayToast() {
  const { state } = useStore();
  const top = state.notices[0];
  const [seenAt, setSeenAt] = useState(top?.at ?? 0);
  const [shown, setShown] = useState<string | null>(null);
  if (top && top.at > seenAt) {
    setSeenAt(top.at);
    setShown(top.id);
  }
  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => setShown(null), 3500);
    return () => clearTimeout(t);
  }, [shown]);
  if (!top || shown !== top.id) return null;
  return (
    <div className={`toast play-toast n-${top.tone}`} role="status" aria-live="polite">
      <i aria-hidden="true" />
      {top.text}
    </div>
  );
}
