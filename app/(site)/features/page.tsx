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
import { featurePages } from "@/lib/features";
import { img } from "@/lib/images";
import { roadmap } from "@/lib/site";

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
  { Icon: IconPlayers, t: "Player profiles", d: "Skill ratings, membership, play time, bookings and payment history." },
  { Icon: IconWhistle, t: "Coaching", d: "Privates, clinics and camps with rosters, capacity and payout totals." },
  { Icon: IconTrophy, t: "Leagues & events", d: "Round robins, ladders and leagues with score entry and live standings." },
  { Icon: IconMembership, t: "Memberships", d: "Monthly, yearly and family plans with member court rates and renewal tracking." },
  { Icon: IconWallet, t: "Payments & POS", d: "Quick sales at the desk, paddle rentals, refunds and a full payment ledger." },
  { Icon: IconStaff, t: "Staff & roles", d: "Owner, manager, coach and desk roles with a weekly shift schedule." },
  { Icon: IconQR, t: "Check-in", d: "Find a player by name or phone. Members are free, drop-ins are charged automatically." },
  { Icon: IconChart, t: "Reports", d: "Revenue by source, utilization heatmaps, busiest hours and coach revenue." },
  { Icon: IconBell, t: "Activity feed", d: "Every booking, payment, check-in and court change in one live feed, with undo." },
  { Icon: IconMessage, t: "TV court board", d: "A full-screen board for the facility TV: who's on, time left and who's next." },
  { Icon: IconLight, t: "Court lights", d: "Switch lights per court, with outdoor lights turned on automatically after dark." },
  { Icon: IconGlobe, t: "Player booking page", d: "Players book courts, join open play and sign up for clinics from any phone." },
];

const deep = [
  {
    id: "courts",
    title: "Court booking",
    text: "Your courts, your rules. Set opening hours, booking windows, member-only times and peak pricing per court. Players see live availability and book in seconds.",
    points: ["Day and week court calendar", "Recurring weekly bookings", "Cancellation window and no-show fee", "Waitlists for full sessions"],
    image: img.ballCourt,
    alt: "Pickleball resting on court lines",
  },
  {
    id: "open-play",
    title: "Open play & play time",
    text: "Run sessions with 40 players and four courts without a whiteboard. MyPickleball tracks who's waiting, how long they've played and who's up next.",
    points: ["Skill-balanced or first-come rotation", "Game length you choose", "Court-side timers and TV display", "Fair-play minutes per player"],
    image: img.aerialPlay,
    alt: "Aerial view of open play doubles",
  },
  {
    id: "coaching",
    title: "Coaching & clinics",
    text: "Publish privates, clinics and camps on the courts you choose. Players sign up online, rosters fill to capacity and you see what each session earns.",
    points: ["Privates, clinics and camps", "Rosters with capacity limits", "Waitlists when a session is full", "Payout totals per session"],
    image: img.duoPlayers,
    alt: "Two players with pickleball paddles",
  },
  {
    id: "leagues",
    title: "Leagues & tournaments",
    text: "From Tuesday-night ladders to weekend round robins, schedules, partners, scores and standings stay in sync.",
    points: ["Round robin generator with rotating partners", "Team and individual standings", "Score entry with instant standings", "Online event registration"],
    image: img.outdoorCourts,
    alt: "Outdoor pickleball courts surrounded by trees",
  },
  {
    id: "payments",
    title: "Memberships & payments",
    text: "Memberships, drop-ins, lessons and desk sales all land in one clean ledger you can filter, refund from and export.",
    points: ["Monthly, yearly and family plans", "Renewal tracking and past-due list", "Front-desk quick sale and rentals", "CSV export for your accountant"],
    image: img.orangeBalls,
    alt: "Pickleballs on a paddle",
  },
  {
    id: "staff",
    title: "Staff & front desk",
    text: "Give every person the right screen. Desk staff get check-in and the queue; managers get schedules and refunds; owners see everything.",
    points: ["Owner, manager, coach and desk roles", "Weekly shift schedule", "Works on a desk tablet", "Live activity feed with undo"],
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
        lead="Sixteen modules built around how pickleball clubs actually run: bookings, open play, coaching, leagues, staff and money, all sharing one player database. Try every one of them in the live demo."
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
              Built for the busiest Saturday.
            </h2>
            <p className="lead" data-reveal style={{ ["--d" as string]: ".1s" }}>
              Fast screens, big touch targets and nothing extra to install.
            </p>
          </div>
          <div className="outcomes">
            {[
              { Icon: IconShield, t: "Your data stays yours", d: "Export players, bookings and payments to CSV any time. No lock-in." },
              { Icon: IconPaddle, t: "Made for pickleball", d: "Skill ratings, doubles partners, stacking and kitchen-line culture built in." },
              { Icon: IconGlobe, t: "Works everywhere", d: "Runs in the browser on any phone, tablet, laptop or facility TV." },
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
          <p style={{ marginTop: 48, display: "flex", gap: 32, flexWrap: "wrap" }} data-reveal>
            <Link href="/dashboard" className="text-link">
              Open the live demo <IconArrow size={18} />
            </Link>
            <Link href="/pricing" className="text-link">
              See plans and pricing <IconArrow size={18} />
            </Link>
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="guides-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="guides-title" className="h2" data-reveal>
              Go deeper on each part of the club.
            </h2>
            <p className="lead" data-reveal style={{ ["--d" as string]: ".1s" }}>
              How MyPickleball handles the four jobs that take up most of a club&apos;s week.
            </p>
          </div>
          <div className="modules">
            {featurePages.map((p, i) => (
              <Link href={`/features/${p.slug}`} className="module" key={p.slug} data-reveal style={{ ["--d" as string]: `${(i % 3) * 0.08}s` }}>
                <h3 style={{ marginTop: 0 }}>{p.short}</h3>
                <p>{p.card}</p>
                <span className="text-link" style={{ marginTop: 20 }}>
                  Read more <IconArrow size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="roadmap-title">
        <div className="wrap faq">
          <div data-reveal>
            <h2 id="roadmap-title" className="h2">
              On the roadmap.
            </h2>
            <p className="lead" style={{ marginTop: 24 }}>
              What we&apos;re building next. Facility customers get each one first, and every plan gets them at no extra cost.
            </p>
          </div>
          <div className="values" style={{ marginTop: 0 }} data-reveal>
            {roadmap.map((r) => (
              <div className="value" key={r.t}>
                <h3>{r.t}</h3>
                <p>{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="See it running on your own courts." />
    </>
  );
}
