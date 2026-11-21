import type { SVGProps } from "react";

/**
 * MyPickleball branded icon set.
 * Every glyph shares one 24px grid, a 1.6 stroke with round joins,
 * and a signature neon "ball" accent (fill: var(--neon)).
 */
type P = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 24, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

const Ball = ({ cx, cy, r = 2.2 }: { cx: number; cy: number; r?: number }) => (
  <circle cx={cx} cy={cy} r={r} fill="var(--neon)" stroke="none" />
);

export const IconCourt = (p: P) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 12h18M12 4v5.5M12 14.5V20M3 9.5h18M3 14.5h18" opacity=".55" />
    <Ball cx={16.5} cy={7} r={1.8} />
  </Base>
);

export const IconCalendar = (p: P) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <path d="M7 14h3M7 17.5h5" opacity=".55" />
    <Ball cx={16.5} cy={16} />
  </Base>
);

export const IconPlayers = (p: P) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 19.5c.6-3.4 3-5.3 6-5.3s5.4 1.9 6 5.3" />
    <path d="M15.5 5.2a3 3 0 0 1 0 5.8M17.5 14.5c1.8.6 3 2.3 3.4 5" opacity=".55" />
    <Ball cx={19} cy={5.5} r={1.7} />
  </Base>
);

export const IconTimer = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M10 2.5h4M12 2.5v3.5M18.5 6.5l1.4-1.4" />
    <path d="M12 13.5V9.5" />
    <Ball cx={12} cy={13.5} r={1.9} />
  </Base>
);

export const IconQueue = (p: P) => (
  <Base {...p}>
    <path d="M4 6h11M4 12h11M4 18h7" />
    <path d="M18 9v9m0 0-2.5-2.5M18 18l2.5-2.5" opacity=".55" />
    <Ball cx={19} cy={5.5} r={2} />
  </Base>
);

export const IconWhistle = (p: P) => (
  <Base {...p}>
    <path d="M14 9H8.5a5.5 5.5 0 1 0 5.4 6.6L20 13.5V9h-6Z" />
    <path d="M14 9V5.5M17 9V7" opacity=".55" />
    <Ball cx={8.5} cy={14.5} r={2} />
  </Base>
);

export const IconTrophy = (p: P) => (
  <Base {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H4.5a2.5 2.5 0 0 0 2.6 3.5M17 6h2.5a2.5 2.5 0 0 1-2.6 3.5" opacity=".55" />
    <path d="M12 14v3.5M8.5 20.5h7M9.5 17.5h5" />
    <Ball cx={12} cy={8} r={1.7} />
  </Base>
);

export const IconWallet = (p: P) => (
  <Base {...p}>
    <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
    <rect x="3.5" y="8" width="17" height="11.5" rx="2.5" />
    <path d="M20.5 12h-4a1.75 1.75 0 0 0 0 3.5h4" opacity=".55" />
    <Ball cx={16.6} cy={13.75} r={1.5} />
  </Base>
);

export const IconChart = (p: P) => (
  <Base {...p}>
    <path d="M4 4v16h16" />
    <path d="M7.5 15.5l3.5-4 3 2.5 4.5-6" />
    <Ball cx={18.5} cy={8} r={1.9} />
  </Base>
);

export const IconMembership = (p: P) => (
  <Base {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="M7 14.5h5M7 11h3" opacity=".55" />
    <Ball cx={16.5} cy={12} r={2.4} />
  </Base>
);

export const IconStaff = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M5 20c.8-4 3.6-6 7-6s6.2 2 7 6" />
    <path d="M10 14.3 12 17l2-2.7" opacity=".55" />
    <Ball cx={18.5} cy={5} r={1.7} />
  </Base>
);

export const IconQR = (p: P) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.2" />
    <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.2" />
    <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.2" />
    <path d="M14 14h2.5M20.5 14v2.5M14 18v2.5h2.5" opacity=".55" />
    <Ball cx={18.6} cy={18.6} r={1.9} />
  </Base>
);

export const IconBell = (p: P) => (
  <Base {...p}>
    <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2H4.5l1.5-2Z" />
    <path d="M10 21h4" opacity=".55" />
    <Ball cx={18} cy={5} r={2} />
  </Base>
);

export const IconLight = (p: P) => (
  <Base {...p}>
    <path d="M9 18h6M10 21h4" />
    <path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.8.7-1 1.5-1 2.3V18h-5v-1.2c0-.8-.2-1.6-1-2.3Z" />
    <Ball cx={12} cy={9.5} r={1.9} />
  </Base>
);

export const IconShield = (p: P) => (
  <Base {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6L12 3Z" />
    <path d="m9 12 2.2 2.2L15.5 10" opacity=".55" />
  </Base>
);

export const IconPaddle = (p: P) => (
  <Base {...p}>
    <path d="M14.8 3.6a5.4 5.4 0 0 1 5.6 5.6c0 2-1 3.6-2.6 5.2-1.7 1.7-3.7 2.6-5.8 2.4l-3.6 3.6a1.5 1.5 0 0 1-2.1-2.1L9.9 14.7c-.2-2.1.7-4.1 2.4-5.8 1.6-1.6 3.2-2.6 5.2-2.6" />
    <Ball cx={5.5} cy={6} r={2.2} />
  </Base>
);

export const IconMessage = (p: P) => (
  <Base {...p}>
    <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12Z" />
    <path d="M8.5 11h7M8.5 14h4" opacity=".55" />
  </Base>
);

export const IconGlobe = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5Z" opacity=".55" />
  </Base>
);

export const IconArrow = (p: P) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const IconCheck = (p: P) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Base>
);

export const IconPlus = (p: P) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const IconMenu = (p: P) => (
  <Base {...p}>
    <path d="M4 8h16M4 16h16" />
  </Base>
);

export const IconClose = (p: P) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const IconMail = (p: P) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </Base>
);

export const IconPhone = (p: P) => (
  <Base {...p}>
    <path d="M5 4h3.5l1.5 4.5-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.6A1.5 1.5 0 0 1 5 4Z" />
  </Base>
);

export const IconPin = (p: P) => (
  <Base {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <Ball cx={12} cy={10} r={2.2} />
  </Base>
);

/* ---------- Social brand marks (filled) ---------- */
type S = SVGProps<SVGSVGElement> & { size?: number };
const Social = ({ size = 18, children, ...rest }: S & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
    {children}
  </svg>
);

export const BrandInstagram = (p: S) => (
  <Social {...p}>
    <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2ZM17 5.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z" />
    <path d="M12 2.5c-2.6 0-2.9 0-3.9.1-3.5.2-5.4 2-5.6 5.6-.1 1-.1 1.3-.1 3.8s0 2.9.1 3.9c.2 3.5 2.1 5.4 5.6 5.6 1 0 1.3.1 3.9.1s2.9 0 3.9-.1c3.5-.2 5.4-2.1 5.6-5.6.1-1 .1-1.3.1-3.9s0-2.8-.1-3.8c-.2-3.5-2.1-5.4-5.6-5.6-1-.1-1.3-.1-3.9-.1Zm0 1.7c2.5 0 2.8 0 3.8.1 2.6.1 3.7 1.3 3.9 3.9v7.6c-.1 2.5-1.3 3.7-3.9 3.9-1 0-1.3.1-3.8.1s-2.8 0-3.8-.1c-2.6-.1-3.7-1.4-3.9-3.9V8.2c.1-2.6 1.3-3.7 3.9-3.9 1-.1 1.3-.1 3.8-.1Z" />
  </Social>
);

export const BrandFacebook = (p: S) => (
  <Social {...p}>
    <path d="M13.5 21.5v-8h2.7l.4-3.2h-3.1V8.3c0-.9.3-1.5 1.6-1.5h1.6V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.3H7.6v3.2h2.7v8h3.2Z" />
  </Social>
);

export const BrandX = (p: S) => (
  <Social {...p}>
    <path d="M17.6 3.5h3l-6.6 7.5 7.7 10.2h-6l-4.7-6.2-5.4 6.2h-3l7-8L2.3 3.5h6.2l4.3 5.7 4.8-5.7Zm-1 15.9h1.6L7.4 5.2H5.6l11 14.2Z" />
  </Social>
);

export const BrandYouTube = (p: S) => (
  <Social {...p}>
    <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
  </Social>
);

export const BrandTikTok = (p: S) => (
  <Social {...p}>
    <path d="M16.6 3h-3.1v12.3a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V9.5a5.8 5.8 0 1 0 5 5.8V9.1a7.3 7.3 0 0 0 4.2 1.3V7.3a4.3 4.3 0 0 1-4.2-4.3Z" />
  </Social>
);

export const BrandLinkedIn = (p: S) => (
  <Social {...p}>
    <path d="M6.9 8.8H3.6V20h3.3V8.8ZM5.2 3.5a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM20.4 13.6c0-3-1.6-5-4.3-5-1.4 0-2.5.8-3 1.6V8.8H9.9V20h3.3v-5.9c0-1.5.5-2.9 2.2-2.9s1.8 1.6 1.8 3V20h3.2v-6.4Z" />
  </Social>
);

/* ---------- Dashboard extras ---------- */
export const IconHome = (p: P) => (
  <Base {...p}>
    <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19v-8.5Z" />
    <Ball cx={12} cy={10.5} r={1.7} />
  </Base>
);

export const IconSearch = (p: P) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Base>
);

export const IconSettings = (p: P) => (
  <Base {...p}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
    <Ball cx={15} cy={7} r={1.1} />
  </Base>
);

export const IconChevron = (p: P) => (
  <Base {...p}>
    <path d="m9 6 6 6-6 6" />
  </Base>
);

export const IconChevronLeft = (p: P) => (
  <Base {...p}>
    <path d="m15 6-6 6 6 6" />
  </Base>
);

export const IconLogout = (p: P) => (
  <Base {...p}>
    <path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10" />
    <path d="M15 8l4 4-4 4M19 12H9" />
  </Base>
);

export const IconPlay = (p: P) => (
  <Base {...p}>
    <path d="M8 5.5v13l10-6.5-10-6.5Z" />
  </Base>
);

export const IconStop = (p: P) => (
  <Base {...p}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
  </Base>
);

export const IconWrench = (p: P) => (
  <Base {...p}>
    <path d="M14.5 6.5a4 4 0 0 0 5 5L13 18a2.1 2.1 0 0 1-3-3l6.5-6.5a4 4 0 0 1-2-2Z" />
    <path d="M10 15 5 20" />
  </Base>
);

export const IconUserPlus = (p: P) => (
  <Base {...p}>
    <circle cx="10" cy="8" r="3.5" />
    <path d="M3.5 20c.7-3.7 3.3-5.7 6.5-5.7 1.6 0 3 .4 4.2 1.3" />
    <path d="M18 14v6M15 17h6" />
  </Base>
);

export const IconRefund = (p: P) => (
  <Base {...p}>
    <path d="M4 9h11a5 5 0 0 1 0 10H9" />
    <path d="M8 5 4 9l4 4" />
  </Base>
);

export const IconDownload = (p: P) => (
  <Base {...p}>
    <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19.5h14" />
  </Base>
);

export const IconShuffle = (p: P) => (
  <Base {...p}>
    <path d="M4 7h3.5c4 0 5 10 9 10H20M4 17h3.5c1.5 0 2.6-1.4 3.5-3.2M13 10.2c.9-1.8 2-3.2 3.5-3.2H20" />
    <path d="m18 5 2 2-2 2M18 15l2 2-2 2" />
  </Base>
);

export const IconExternal = (p: P) => (
  <Base {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
  </Base>
);
