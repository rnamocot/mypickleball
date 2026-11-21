import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import {
  IconArrow,
  IconBell,
  IconCalendar,
  IconChart,
  IconCheck,
  IconCourt,
  IconGlobe,
  IconLight,
  IconMembership,
  IconMessage,
  IconPaddle,
  IconPlayers,
  IconQR,
  IconQueue,
  IconShield,
  IconStaff,
  IconTimer,
  IconTrophy,
  IconWallet,
  IconWhistle,
} from "@/components/Icons";
import { PageHero } from "@/components/PageHero";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Features: Court Booking, Open Play, Coaching & Leagues",
  description:
    "Every tool a pickleball club needs: court booking, open play queues with play-time tracking, coach scheduling, memberships, leagues, tournaments, staff roles and payments.",
  alternates: { canonical: "/features" },
  openGraph: { url: "/features", title: "MyPickleball Features" },
};

const modules = [
  { Icon: IconCourt, t: "Court management", d: "Courts, surfaces, indoor/outdoor, lighting and maintenance blocks in one live view." },
  { Icon: IconCalendar, t: "Online booking", d: "Real-time reservations with member pricing, peak rates, recurring slots and waitlists." },
  { Icon: IconQueue, t: "Open play queue", d: "Self check-in, skill-balanced rotation and a fair, visible line for every session." },
  { Icon: IconTimer, t: "Play-time tracking", d: "Game timers, court-side alerts and per-player minutes so nobody hogs a court." },
  { Icon: IconPlayers, t: "Player profiles", d: "Skill ratings, partner finder, match history and household accounts." },
  { Icon: IconWhistle, t: "Coaching", d: "Coach availability, privates, clinics, camps, lesson packs and payouts." },
  { Icon: IconTrophy, t: "Leagues & tournaments", d: "Round robins, ladders, leagues and brackets with auto-standings and live scores." },
  { Icon: IconMembership, t: "Memberships & passes", d: "Tiered memberships, punch passes, drop-ins and family plans that renew themselves." },
  { Icon: IconWallet, t: "Payments & POS", d: "Card on file, tap-to-pay at the desk, refunds, credits and paddle rentals." },
  { Icon: IconStaff, t: "Staff & roles", d: "Owner, manager, coach and desk roles with permissions and shift schedules." },
  { Icon: IconQR, t: "Check-in", d: "QR and name search check-in, waivers and guest passes in one tap." },
  { Icon: IconChart, t: "Reports", d: "Revenue, utilization heatmaps, retention and coach performance at a glance." },
  { Icon: IconBell, t: "Reminders", d: "Email, SMS and push reminders that cut no-shows and fill late cancellations." },
  { Icon: IconMessage, t: "Member messaging", d: "Announcements, session chats and targeted campaigns to the right players." },
  { Icon: IconLight, t: "Lights & access", d: "Turn court lights and door access on with bookings and off when the court is empty." },
  { Icon: IconGlobe, t: "Branded booking site", d: "Your logo, colors and domain on every booking page and receipt." },
];

const deep = [
  {
    id: "courts",
    title: "Court booking",
    text: "Your courts, your rules. Set opening hours, booking windows, member-only times and peak pricing per court. Players see live availability and book in seconds.",
    points: ["Drag-and-drop court calendar", "Recurring, block and event bookings", "Cancellation windows and fees", "Automatic waitlist fills"],
    image: img.ballCourt,
    alt: "Pickleball resting on court lines",
  },
  {
    id: "open-play",
    title: "Open play & play time",
    text: "Run sessions with 40 players and four courts without a whiteboard. MyPickleball tracks who's waiting, how long they've played and who's up next.",
    points: ["Skill brackets and mixed sessions", "Configurable game length and stacking rules", "Court-side timers and TV display", "Fair-play minutes per player"],
    image: img.aerialPlay,
    alt: "Aerial view of open play doubles",
  },
  {
    id: "coaching",
    title: "Coaching & clinics",
    text: "Give every coach a storefront. They manage their own calendar while the club keeps control of courts, pricing and commission.",
    points: ["Privates, semi-privates and clinics", "Multi-week programs and camps", "Lesson packs with automatic redemption", "Coach payouts and commission splits"],
    image: img.duoPlayers,
    alt: "Two players with pickleball paddles",
  },
  {
    id: "leagues",
    title: "Leagues & tournaments",
    text: "From Tuesday-night ladders to a 128-team weekend tournament, schedules, partners, scores and standings stay in sync automatically.",
    points: ["Round robin and ladder generators", "Team and individual leagues", "Single, double and pool-play brackets", "Live scoring from any phone"],
    image: img.outdoorCourts,
    alt: "Outdoor pickleball courts surrounded by trees",
  },
  {
    id: "payments",
    title: "Memberships & payments",
    text: "Recurring revenue without the chasing. Memberships renew, passes decrement and every payment lands in one clean ledger.",
    points: ["Tiered and family memberships", "Punch passes and credits", "Front-desk POS and rentals", "Payouts to your bank in 2 days"],
    image: img.orangeBalls,
    alt: "Pickleballs on a paddle",
  },
  {
    id: "staff",
    title: "Staff & front desk",
    text: "Give every person the right screen. Desk staff get check-in and the queue; managers get schedules and refunds; owners see everything.",
    points: ["Role-based permissions", "Shift scheduling and hand-off notes", "Front-desk mode for tablets", "Activity log for every change"],
    image: img.paddleBalls,
    alt: "Pickleball paddle and balls near the net",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        crumb="Features"
        path="/features"
        title="Every tool your court needs."
        dim="Nothing it doesn't."
        lead="Sixteen modules built around how pickleball clubs actually run: bookings, open play, coaching, leagues, staff and money, all sharing one player database."
      />

      <section className="section-tight" aria-labelledby="modules-title">
        <div className="wrap">
          <h2 id="modules-title" className="sr-only">
            All modules
          </h2>
          <div className="modules">
            {modules.map(({ Icon, t, d }, i) => (
              <div className="module" key={t} data-reveal style={{ ["--d" as string]: `${(i % 3) * 0.08}s` }}>
                <Icon size={30} />
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-label="Module details">
        <div className="wrap">
          {deep.map((f, i) => (
            <div className={`feature-row ${i % 2 ? "flip" : ""}`} id={f.id} key={f.id}>
              <div className="feature-media" data-reveal="clip">
                <Image src={f.image} alt={f.alt} fill sizes="(max-width: 860px) 100vw, 50vw" placeholder="blur" />
              </div>
              <div className="feature-copy" data-reveal style={{ ["--d" as string]: ".1s" }}>
                <div className="feature-index">{String(i + 1).padStart(2, "0")}</div>
                <h2 className="h3" style={{ fontSize: "clamp(30px, 3.6vw, 48px)", letterSpacing: "-0.042em" }}>
                  {f.title}
                </h2>
                <p className="lead">{f.text}</p>
                <ul className="check-list">
                  {f.points.map((p) => (
                    <li key={p}>
                      <IconCheck size={18} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="trust-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="trust-title" className="h2" data-reveal>
              Reliable on the busiest Saturday.
            </h2>
            <p className="lead" data-reveal style={{ ["--d" as string]: ".1s" }}>
              Built to stay fast when 60 players check in at 8:00 AM.
            </p>
          </div>
          <div className="outcomes">
            {[
              { Icon: IconShield, t: "Secure payments", d: "PCI-compliant processing. Card details never touch your servers." },
              { Icon: IconPaddle, t: "Made for pickleball", d: "Skill ratings, doubles partners, stacking and kitchen-line culture built in." },
              { Icon: IconGlobe, t: "Works everywhere", d: "Any phone, tablet or TV. Offline-tolerant check-in for spotty Wi-Fi." },
            ].map(({ Icon, t, d }, i) => (
              <div className="outcome" key={t} data-reveal style={{ ["--d" as string]: `${i * 0.1}s` }}>
                <Icon size={34} />
                <h3 className="h3" style={{ marginTop: 24 }}>
                  {t}
                </h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 48 }} data-reveal>
            <Link href="/pricing" className="text-link">
              See plans and pricing <IconArrow size={18} />
            </Link>
          </p>
        </div>
      </section>

      <CtaBand title="See it running on your own courts." />
    </>
  );
}
