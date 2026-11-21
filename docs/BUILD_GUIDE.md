# MyPickleball: build guide and handoff

This file explains how MyPickleball was built from an empty folder, how the code is organised, the rules every change must follow, and what is still to do. Read it before starting a new session.

Repo: https://github.com/rnamocot/mypickleball (branch `main`)

---

## 1. What the product is

MyPickleball is a SaaS app for running a pickleball club, written from the point of view of a club owner and organiser who has coaches and front-desk staff. It has three parts that share one data store:

| Area | URL | Who uses it |
|---|---|---|
| Marketing site | `/`, `/features`, `/features/[slug]`, `/pricing`, `/about`, `/contact`, `/signup`, `/privacy`, `/terms` | Prospective clubs |
| Staff dashboard | `/dashboard/*` (12 modules) | Owner, managers, coaches, front desk |
| Player portal | `/play/*` (home, book, open play, clinics, events, me) | Club members and drop-ins |
| TV court board | `/tv` | Wall screen at the facility |

Everything currently runs on **demo data stored in the browser** (localStorage). There is no backend, auth, database, or real payments yet. See section 8.

---

## 2. Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint (flat config)
npm run build      # production build, must pass (39 pages at last check)
```

- Port 3210 was taken on this machine, so use 3000.
- Optional `.env.local` (see `.env.example`): `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`. Without the Resend key, contact and newsletter submissions are only logged on the server.
- To reset demo data: the dashboard Settings page has a reset, or clear the localStorage keys `mypickleball-demo-v1` and `mypickleball-me`.

---

## 3. Stack and versions

- Next.js 16 (App Router, Turbopack), React 19, TypeScript.
- **TypeScript is pinned to `^6`.** typescript-eslint does not support TS 7. Do not upgrade it.
- ESLint 9 flat config (`eslint.config.mjs`) with `eslint-config-next` core-web-vitals + typescript. `next lint` no longer exists in Next 16; use `npm run lint`.
- No UI library and no Tailwind. Plain CSS:
  - `app/globals.css`: design tokens and all marketing styles.
  - `app/dashboard/dashboard.css`: dashboard and shared app UI.
  - `app/play/play.css`: player portal (it also imports `dashboard.css`).
- Font: Inter through `next/font`.
- Photos: Unsplash images stored in `public/images`, imported statically in `lib/images.ts`.

---

## 4. Design rules (from the user, never break these)

1. **No em dashes ("—") anywhere**: copy, titles, metadata or comments shown to users. Use commas, colons, periods or "|". Check with `grep -rn "—" app components lib` before finishing.
2. **No eyebrow labels** above headings and no coloured rounded "pill" badges.
3. **No grid-line backgrounds.** Use motion instead (animated arcs and glows; see `RallyBackground.tsx`).
4. **Dark theme** with neon accents: background `#07090a`, neon `#d4ff3f`, plus court blue and coral. Inter font.
5. **Branded icons** only: `components/Icons.tsx` (1.6 stroke plus a neon "ball" dot). Do not pull in icon libraries.
6. **Elegant, sleek, modern, not "AI slop".** Prefer editorial layouts over generic card grids. Animation should feel like a senior UI/UX designer made it, and respect `prefers-reduced-motion`.
7. **Honest marketing.** No invented stats, testimonials, customers, founders or locations. Only claim features the demo really has; anything else goes under "On the roadmap" (`roadmap` in `lib/site.ts`).
8. **Charts**: multi-series palette `["#3987e5","#d95926","#199e70","#9085e9"]`, validated against the dark surface `#101617`. Use neon only for single-series charts. Thin marks, a legend when there are 2 or more series, and a hover tooltip.

---

## 5. How it was built, step by step

These are the steps in the order they happened. Each matches a commit.

1. **Marketing foundation** (`e7254b6`)
   - Root layout with Inter and global metadata. An inline script adds a `js` class so animations only hide content once JS is running.
   - Route group `app/(site)` with Header, Footer and `Motion` (scroll reveals and `Split` headline animation; screen readers get an sr-only copy).
   - Home page:
     - hero with `RallyBackground` and an animated `CourtBoard` mock
     - ticker, `RoleTabs`, feature rows
     - pricing (`PricingPlans`), FAQ (`Faq`) and `CtaBand`
   - SEO:
     - per-page metadata with canonical URLs
     - `sitemap.ts`, `robots.ts` (disallows `/dashboard` and `/api/`) and `manifest.ts`
     - `opengraph-image.tsx` built with `next/og`
     - JSON-LD for Organization, SoftwareApplication, FAQPage and BreadcrumbList
   - Logo (`Logo.tsx`, `app/icon.svg`) and the branded icon set.
2. **Dashboard with every module** (`4a2424e`)
   - Client store in `components/dash/store.tsx`: a `useReducer` seeded from `components/dash/data.ts` and saved to localStorage.
   - `DashShell` provides the sidebar, global search, notifications bell, toasts and a skeleton while loading.
   - Modules:
     - Overview and Courts (live timers)
     - Bookings (day, week and list views)
     - Open play: queue, skill-balanced or first-come rotation, fair-play tracker
     - Players, Coaching (lessons and clinics) and Events (leagues and tournaments)
     - Memberships, Payments (with quick sale), Staff, Reports and Settings
3. **Review fixes and polish** (`566697d`)
   - Undo for destructive actions, then global search (`/` or Ctrl+K) with deep links.
   - Booking modal: picks the first free court and time, allows a price override.
   - Modal focus trap.
   - Revenue comparison fixed (it compared a partial day against a full day).
   - ESLint set up and all errors fixed.
4. **Honest marketing and SEO pages** (`0a04869`)
   - Removed invented stats, the testimonial, the founder story and the Austin address.
   - Added an "On the roadmap" section.
   - Added four keyword landing pages from `lib/features.ts`:
     - `pickleball-court-booking-software`
     - `pickleball-open-play-management`
     - `pickleball-coaching-scheduling`
     - `pickleball-league-management`
   - Contact and newsletter forms now post to `app/api/contact/route.ts` (Resend, a honeypot field named `website`, rate limit of 5 per minute per IP, email validation).
5. **Player portal, waitlists, recurring bookings, TV board** (`2e82bd4`)
   - `/play` portal sharing the same store, so player actions appear live in the dashboard.
   - Court waitlist: when a booking is cancelled, the first player waiting for that slot is promoted automatically.
   - Clinic waitlist: when someone unenrolls, the first waitlisted player is promoted.
   - Event registration charges the entry fee.
   - Staff booking modal can repeat weekly for 4, 8 or 12 weeks, skipping conflicts.
   - `/tv` full-screen court board.

---

## 6. Code map

```
app/
  layout.tsx                 root html, Inter, global metadata
  globals.css                tokens + marketing styles
  (site)/                    marketing pages (Header/Footer/Motion layout)
  dashboard/                 noindex layout -> DashShell; one page per module (each wraps its view in Suspense)
  play/                      player portal layout -> PlayShell
  tv/page.tsx                TV board
  api/contact/route.ts       contact + newsletter endpoint
lib/
  site.ts                    site config, nav, plans (Rally 49/39, Club 129/99, Facility 299/239), roadmap, faqs
  features.ts                SEO feature landing pages
  images.ts                  static photo imports
components/
  Icons.tsx, Logo.tsx, Motion.tsx, RallyBackground.tsx, CourtBoard.tsx, ...   marketing
  dash/data.ts               types, seed data, DATA_VERSION, helpers (stamp, money, fmtTime)
  dash/store.tsx             reducer + actions, StoreProvider, useStore, useNow, usePlayerLookup, pickGroup, rebase
  dash/ui.tsx                Avatar, PageHead, Panel, Kpi, Status, Tabs, SearchInput, Field, Modal, Drawer, Empty, Meter, Toggle
  dash/Shell.tsx             dashboard shell
  dash/GlobalSearch.tsx, charts.tsx, calc.ts, CourtViz.tsx, modals.tsx (BookingModal, QuickSale, PlayerPicker)
  dash/views/*.tsx           one view per dashboard module + TvBoard
  play/PlayShell.tsx         portal shell, "me" context (demo player switcher)
  play/views.tsx             PlayHome, PlayBook, PlayOpen, PlayClinics, PlayEvents, PlayMe
```

### The data store, which matters most

- Storage key `mypickleball-demo-v1`. **Bump `DATA_VERSION` in `components/dash/data.ts` whenever the seed or the `State` shape changes**, or old browsers will load stale data. It is currently 6.
- `rebase()` moves seeded dates to today and shifts live game timers by the time the tab was away. `savedAt` is refreshed every 30 seconds and when the page is hidden.
- `rootReducer` keeps a one-step undo for the actions listed in `UNDOABLE`. Add new destructive actions to it.
- Waitlist logic lives in the reducer:
  - `updateBooking` (on cancel) promotes the court waitlist.
  - `unenroll` promotes the lesson waitlist.
  - `enroll` puts the player on the waitlist when the session is full.

### React rules the lint enforces

- Do not call `Date.now()` during render. Use `useNow(ms)` or the `stamp()` helper.
- Do not set state inside effects to react to a prop or URL change. Use the "during render" pattern (`if (key !== lastKey) { setLastKey(key); ... }`). Effects are fine for one-time localStorage hydration (with an eslint-disable comment explaining why).
- `Modal` and `Drawer` keep `onClose` in a ref so the focus trap does not reset on every keystroke.

---

## 7. Checklist before every commit

1. `npm run lint`: no errors.
2. `npm run build`: passes.
3. `grep -rn "—" app components lib`: no matches.
4. Check the change in a browser on desktop and at a 390px phone width.
5. Commit with a clear message and push to `main`.

---

## 8. What is pending

Roughly in order of priority. Nothing below has been started.

### A. Make it a real product (backend)
- [ ] Database and API, for example Postgres with Prisma or Drizzle, or Supabase. Move the reducer actions in `store.tsx` to server actions and API routes. Keep the `State` types in `data.ts` as the schema starting point.
- [ ] Auth with roles (owner, manager, coach, front desk, player). Protect `/dashboard` and the player "me" pages. Replace the demo player switcher in `PlayShell`.
- [ ] Multi-tenant clubs (each signup creates a club; `/signup` currently just redirects to the demo).
- [ ] Stripe: SaaS subscriptions for the plans in `lib/site.ts`, plus Stripe Connect for clubs charging players (bookings, drop-ins, event fees, memberships). The Payments module currently records demo transactions only.
- [ ] Real-time updates across devices (front desk, TV board and player phones). Today they only stay in sync within one browser.

### B. Roadmap features (listed publicly under "On the roadmap")
- [ ] Email and SMS reminders (booking confirmations, waitlist promotions, clinic reminders).
- [ ] QR check-in and digital waivers.
- [ ] Tournament brackets (round robin and single or double elimination) inside Events.
- [ ] Passes and packages (10-visit punch cards, lesson packs).
- [ ] Multi-location support.
- [ ] Integrations (calendar sync, accounting export, DUPR ratings).
When one ships, move it from `roadmap` to the real features list and update the Features, Pricing and FAQ copy.

### C. Marketing site loose ends
- [ ] Replace the placeholder contact email, phone and social links in `lib/site.ts` and the Footer.
- [ ] Set `NEXT_PUBLIC_SITE_URL` and the Resend keys in production; deploy (Vercel works well).
- [ ] Add real testimonials, logos and stats only once real clubs use it.
- [ ] Consider a blog or guides section for SEO (open play formats, court booking tips).
- [ ] Have a lawyer review Privacy and Terms.

### D. Nice to have
- [ ] Tests (Vitest for reducer logic, especially waitlist promotion, overlaps and pricing; Playwright for the main flows).
- [ ] PWA install for the player portal.
- [ ] Light theme toggle for the dashboard (the marketing site stays dark).

---

## 9. How to resume in a new session

Tell Claude: "Read `docs/BUILD_GUIDE.md` and continue with pending item X." It will follow the rules in section 4, use the checklist in section 7, and tick items off in section 8 as they ship.
