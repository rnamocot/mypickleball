"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  IconBell,
  IconCalendar,
  IconChart,
  IconCourt,
  IconExternal,
  IconHome,
  IconLogout,
  IconMembership,
  IconMenu,
  IconClose,
  IconPlayers,
  IconQueue,
  IconSettings,
  IconStaff,
  IconTrophy,
  IconWallet,
  IconWhistle,
} from "../Icons";
import { LogoMark } from "../Logo";
import { GlobalSearch } from "./GlobalSearch";
import { StoreProvider, useNow, useStore } from "./store";
import { Avatar } from "./ui";

const groups = [
  { label: null, items: [{ href: "/dashboard", label: "Overview", Icon: IconHome }] },
  {
    label: "Operate",
    items: [
      { href: "/dashboard/courts", label: "Courts", Icon: IconCourt },
      { href: "/dashboard/bookings", label: "Bookings", Icon: IconCalendar },
      { href: "/dashboard/open-play", label: "Open play", Icon: IconQueue },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/dashboard/players", label: "Players", Icon: IconPlayers },
      { href: "/dashboard/coaching", label: "Coaching", Icon: IconWhistle },
      { href: "/dashboard/staff", label: "Staff", Icon: IconStaff },
    ],
  },
  {
    label: "Programs",
    items: [
      { href: "/dashboard/events", label: "Leagues & events", Icon: IconTrophy },
      { href: "/dashboard/memberships", label: "Memberships", Icon: IconMembership },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/dashboard/payments", label: "Payments", Icon: IconWallet },
      { href: "/dashboard/reports", label: "Reports", Icon: IconChart },
      { href: "/dashboard/settings", label: "Settings", Icon: IconSettings },
    ],
  },
];

export function DashShell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider fallback={<Skeleton />}>
      <Frame>{children}</Frame>
    </StoreProvider>
  );
}

/** Placeholder shown for the instant before the club data loads from the browser. */
function Skeleton() {
  return (
    <div className="dash" aria-busy="true" aria-label="Loading dashboard">
      <aside className="side">
        <div className="sk" style={{ height: 36, width: 170, margin: "4px 8px 22px" }} />
        {Array.from({ length: 11 }, (_, i) => (
          <div key={i} className="sk" style={{ height: 22, width: 120 + ((i * 37) % 60), margin: "10px 12px" }} />
        ))}
      </aside>
      <div className="dmain">
        <div className="topbar">
          <div className="sk" style={{ height: 40, width: 380 }} />
        </div>
        <div className="dcontent">
          <div className="sk" style={{ height: 116, borderRadius: 20, marginBottom: 16 }} />
          <div className="grid g-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="sk" style={{ height: 124, borderRadius: 16 }} />
            ))}
          </div>
          <div className="grid g-main mt">
            <div className="sk" style={{ height: 420, borderRadius: 16 }} />
            <div className="sk" style={{ height: 420, borderRadius: 16 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const now = useNow(30000);

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const waiting = state.queue.filter((x) => x.state === "waiting").length;
  const live = state.courts.filter((c) => c.status === "play").length;
  const active = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));
  const owner = state.staff.find((s) => s.role === "Owner");

  return (
    <div className={`dash ${open ? "nav-open" : ""}`}>
      <aside className="side" aria-label="Dashboard navigation">
        <div className="side-top">
          <Link href="/dashboard" className="side-brand">
            <LogoMark size={28} />
            <span>
              <b>{state.settings.clubName}</b>
              <small>MyPickleball · Club plan</small>
            </span>
          </Link>
          <button className="icon-btn side-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <IconClose size={18} />
          </button>
        </div>

        <nav className="side-nav">
          {groups.map((g, gi) => (
            <div key={gi} className="side-group">
              {g.label && <span className="side-label">{g.label}</span>}
              {g.items.map(({ href, label, Icon }) => (
                <Link key={href} href={href} className="side-link" aria-current={active(href) ? "page" : undefined}>
                  <Icon size={19} />
                  <span>{label}</span>
                  {href === "/dashboard/open-play" && waiting > 0 && <em className="side-count">{waiting}</em>}
                  {href === "/dashboard/courts" && <em className="side-count dim">{live}/{state.courts.length}</em>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="side-foot">
          <a href="/play" className="side-link" target="_blank" rel="noopener">
            <IconExternal size={19} />
            <span>Player booking page</span>
          </a>
          <a href="/tv" className="side-link" target="_blank" rel="noopener">
            <IconExternal size={19} />
            <span>TV court board</span>
          </a>
          <Link href="/" className="side-link">
            <IconLogout size={19} />
            <span>Sign out</span>
          </Link>
        </div>
      </aside>

      <div className="scrim" onClick={() => setOpen(false)} aria-hidden="true" />

      <div className="dmain">
        <header className="topbar">
          <button className="icon-btn menu-toggle" onClick={() => setOpen(true)} aria-label="Open menu">
            <IconMenu size={20} />
          </button>
          <GlobalSearch />

          <div className="top-right">
            <span className="top-clock" suppressHydrationWarning>
              <i className="live-dot" aria-hidden="true" />
              {new Date(now).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              <span className="dim">· {live} courts live</span>
            </span>
            <Link href="/dashboard/bookings?new=1" className="btn btn-primary btn-sm">
              New booking
            </Link>
            <Bell open={bell} setOpen={setBell} />
            <Link href="/dashboard/settings" className="top-user" aria-label="Account settings">
              <Avatar name={owner?.name ?? "Owner"} hue={owner?.hue} size={34} />
            </Link>
          </div>
        </header>

        <main className="dcontent" id="main">
          {children}
        </main>
      </div>
      <Toasts />
    </div>
  );
}

function Bell({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const { state, dispatch } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);
  const n = state.notices.length;
  return (
    <div className="bell" ref={ref}>
      <button className="icon-btn" aria-label={`Notifications (${n})`} aria-expanded={open} onClick={() => setOpen(!open)}>
        <IconBell size={20} />
        {n > 0 && <span className="bell-dot" aria-hidden="true" />}
      </button>
      {open && (
        <div className="pop" role="dialog" aria-label="Notifications">
          <div className="pop-head">
            <b>Activity</b>
            {n > 0 && (
              <button className="link-btn" onClick={() => state.notices.forEach((x) => dispatch({ t: "dismissNotice", id: x.id }))}>
                Clear all
              </button>
            )}
          </div>
          {n === 0 && <p className="pop-empty">You&apos;re all caught up.</p>}
          <ul>
            {state.notices.slice(0, 12).map((x) => (
              <li key={x.id} className={`notice n-${x.tone}`}>
                <i aria-hidden="true" />
                <span>
                  {x.text}
                  <small>{ago(x.at)}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Toasts() {
  const { state, dispatch } = useStore();
  const top = state.notices[0];
  const [seenAt, setSeenAt] = useState(top?.at ?? 0);
  const [shown, setShown] = useState<string | null>(null);
  // Only brand-new notices pop up (an undo brings back an older one, which stays quiet).
  if (top && top.at > seenAt) {
    setSeenAt(top.at);
    setShown(top.id);
  }
  const canUndo = !!top && state.undo?.noticeId === top.id;
  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => setShown(null), canUndo ? 7000 : 3800);
    return () => clearTimeout(t);
  }, [shown, canUndo]);
  if (!top || shown !== top.id) return null;
  return (
    <div className={`toast n-${top.tone}`} role="status" aria-live="polite">
      <i aria-hidden="true" />
      <span style={{ flex: 1 }}>{top.text}</span>
      {canUndo && (
        <button
          className="link-btn toast-undo"
          onClick={() => {
            dispatch({ t: "undo" });
            setShown(null);
          }}
        >
          Undo
        </button>
      )}
    </div>
  );
}

export function ago(at: number) {
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}
