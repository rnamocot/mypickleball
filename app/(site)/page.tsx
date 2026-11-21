import Image from "next/image";
import Link from "next/link";
import { CourtBoard } from "@/components/CourtBoard";
import { CtaBand } from "@/components/CtaBand";
import { Faq } from "@/components/Faq";
import {
  IconArrow,
  IconCalendar,
  IconCheck,
  IconCourt,
  IconPlayers,
  IconQueue,
  IconTimer,
  IconTrophy,
  IconWallet,
  IconWhistle,
} from "@/components/Icons";
import { Split } from "@/components/Motion";
import { PricingPlans } from "@/components/PricingPlans";
import { RallyBackground } from "@/components/RallyBackground";
import { RoleTabs, type Role } from "@/components/RoleTabs";
import { LogoMark } from "@/components/Logo";
import { img } from "@/lib/images";

export const metadata = {
  alternates: { canonical: "/" },
};

const roles: Role[] = [
  {
    id: "owner",
    name: "Owners",
    summary: "See every court, every dollar and every member from one screen, on Saturday morning or from the beach.",
    points: ["Live court status and revenue today", "Peak and off-peak pricing with member rates", "Court utilization heatmap by hour"],
    image: img.nightCourts,
    alt: "Aerial view of two floodlit pickleball courts at night",
  },
  {
    id: "organizer",
    name: "Organizers",
    summary: "Spin up round robins, ladders and leagues in minutes. Partners rotate and standings update as scores come in.",
    points: ["Round robins with rotating partners", "League and ladder standings", "Score entry from the desk or courtside"],
    image: img.aerialPlay,
    alt: "Aerial view of doubles pickleball games on two blue courts",
  },
  {
    id: "coach",
    name: "Coaches",
    summary: "Publish privates, clinics and camps, manage rosters and see what every session earns.",
    points: ["Privates, clinics and camps", "Rosters with capacity and waitlists", "Payout totals for every session"],
    image: img.duoPlayers,
    alt: "Two players touching pickleball paddles before a match",
  },
  {
    id: "desk",
    name: "Front desk",
    summary: "Fast check-in, a fair open play queue and a court board on the TV. The busiest hour becomes the calmest.",
    points: ["Name or phone check-in, drop-ins charged automatically", "Automatic court rotation with play-time limits", "TV display of who's on and who's next"],
    image: img.playerAction,
    alt: "Pickleball player lunging for a forehand at sunset",
  },
  {
    id: "players",
    name: "Players",
    summary: "Book a court, join open play or grab a clinic spot from any phone.",
    points: ["Book without downloading an app", "Join open play and see your place in line", "Waitlists for full clinics and events"],
    image: img.paddleBalls,
    alt: "Pickleball paddle resting on neon yellow balls by the net",
  },
];

const ticker = [
  { Icon: IconCalendar, b: "Court 3", t: "booked for 6:30 PM" },
  { Icon: IconQueue, b: "Open play", t: "4 players rotated onto Court 2" },
  { Icon: IconWhistle, b: "Dinking clinic", t: "2 spots left tonight" },
  { Icon: IconWallet, b: "$480", t: "in memberships renewed today" },
  { Icon: IconTrophy, b: "Spring ladder", t: "round 4 standings published" },
  { Icon: IconTimer, b: "Court 1", t: "3 minutes left, next group notified" },
  { Icon: IconPlayers, b: "Jamie M.", t: "joined the 6 PM clinic waitlist" },
];

export default function Home() {
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-glow g1" />
          <div className="hero-glow g2" />
          <RallyBackground />
        </div>

        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <h1 id="hero-title" className="display">
                <Split text="Run the club." />
                <br />
                <span className="muted-line">
                  <Split text="Not the whiteboard." delay={3} />
                </span>
              </h1>
              <p className="lead fade-up" style={{ ["--d" as string]: ".55s" }}>
                MyPickleball is pickleball club management software for court bookings, open play rotations, coaching,
                memberships and payments. One calm dashboard for owners, organizers, coaches and the front desk.
              </p>
              <div className="hero-actions fade-up" style={{ ["--d" as string]: ".7s" }}>
                <Link href="/signup" className="btn btn-primary">
                  Start free trial <IconArrow size={18} />
                </Link>
                <Link href="/contact" className="btn btn-ghost">
                  Book a demo
                </Link>
              </div>
              <p className="hero-note fade-up" style={{ ["--d" as string]: ".85s" }}>
                <span className="dot" aria-hidden="true" />
                14-day free trial · No credit card · Live the same day
              </p>
            </div>

            <div className="hero-visual">
              <div className="hero-photo">
                <Image
                  src={img.playerAction}
                  alt="Pickleball player reaching for a low forehand with a neon ball in flight"
                  fill
                  priority
                  sizes="(max-width: 980px) 100vw, 46vw"
                  placeholder="blur"
                />
              </div>
              <div className="float-chip" aria-hidden="true">
                <span className="ic">
                  <IconCourt size={20} />
                </span>
                <span>
                  Court 4 booked
                  <small>Paid $32 · 2 min ago</small>
                </span>
              </div>
              <CourtBoard />
            </div>
          </div>

          <div className="hero-stats">
            {[
              { n: "16", s: "", l: "Modules in one dashboard" },
              { n: "0", s: "%", l: "Per-booking fees" },
              { n: "14", s: " days", l: "Free trial, no card" },
              { n: "5", s: " roles", l: "From owner to player" },
            ].map((s, i) => (
              <div key={s.l} data-reveal style={{ ["--d" as string]: `${0.9 + i * 0.08}s` }}>
                <div className="stat-num">
                  <span data-count={s.n}>0</span>
                  <em>{s.s}</em>
                </div>
                <div className="stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- LIVE TICKER ---------- */}
      <div className="ticker" aria-label="Example activity on a club's MyPickleball dashboard">
        <div className="ticker-track">
          {[...ticker, ...ticker].map(({ Icon, b, t }, i) => (
            <span className="ticker-item" key={i} aria-hidden={i >= ticker.length}>
              <Icon size={20} />
              <span>
                <b>{b}</b> {t}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ---------- ROLES ---------- */}
      <section className="section" aria-labelledby="roles-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="roles-title" className="h2" data-reveal>
              Built for everyone who keeps the courts busy.
            </h2>
            <p className="lead" data-reveal style={{ ["--d" as string]: ".1s" }}>
              Every screen is built around a real job on a packed Saturday: the owner watching the numbers, the organizer
              running a ladder, the coach filling a clinic and the desk keeping the line moving.
            </p>
          </div>
          <div data-reveal>
            <RoleTabs roles={roles} />
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="features-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="features-title" className="h2" data-reveal>
              Everything a court needs, from first serve to last light.
            </h2>
            <p className="lead" data-reveal style={{ ["--d" as string]: ".1s" }}>
              Four modules that work as one. Switch on what you need today and grow into the rest.
            </p>
          </div>

          {/* 01 Booking */}
          <div className="feature-row" id="courts">
            <div className="feature-media" data-reveal="clip">
              <Image src={img.ballCourt} alt="Neon pickleball on the corner of a blue court" fill sizes="(max-width: 860px) 100vw, 50vw" placeholder="blur" />
              <div className="mock" aria-hidden="true">
                <div className="mock-title">
                  <b>Thursday</b>
                  <span>4 courts</span>
                </div>
                <div className="slots">
                  <span />
                  {["C1", "C2", "C3", "C4"].map((c) => (
                    <span className="h" key={c}>
                      {c}
                    </span>
                  ))}
                  {[
                    ["5 PM", "b", "b", "", "c"],
                    ["6 PM", "b", "n", "b", "b"],
                    ["7 PM", "", "b", "b", ""],
                  ].map(([t, ...s]) => (
                    <FragmentRow key={t} t={t} s={s} />
                  ))}
                </div>
              </div>
            </div>
            <div className="feature-copy" data-reveal style={{ ["--d" as string]: ".1s" }}>
              <div className="feature-index">01</div>
              <h3>Court booking that fills the 2 PM gap.</h3>
              <p className="lead">
                A real-time court calendar with member pricing, peak rates, recurring reservations and automatic waitlists,
                bookable from any phone.
              </p>
              <ul className="check-list">
                {["Member, guest and drop-in pricing", "Recurring weekly bookings", "Waitlists for full sessions"].map((p) => (
                  <li key={p}>
                    <IconCheck size={18} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <Link href="/features#courts" className="text-link">
                Explore court booking <IconArrow size={18} />
              </Link>
            </div>
          </div>

          {/* 02 Open play */}
          <div className="feature-row flip" id="open-play">
            <div className="feature-media" data-reveal="clip">
              <Image src={img.aerialPlay} alt="Aerial view of doubles pickleball on outdoor courts" fill sizes="(max-width: 860px) 100vw, 50vw" placeholder="blur" />
              <div className="mock" aria-hidden="true">
                <div className="mock-title">
                  <b>Open play queue</b>
                  <span>15-min games</span>
                </div>
                {[
                  { p: "Up", n: "Jordan, Amir, Sofia, Kenji", t: "Court 2 · now", up: true },
                  { p: "2", n: "Rachel, Dev, Tom, Lucia", t: "~ 6 min" },
                  { p: "3", n: "Mia, Owen, Priya, Sam", t: "~ 14 min" },
                ].map((r) => (
                  <div className={`q-row ${r.up ? "up" : ""}`} key={r.p}>
                    <span className="q-pos">{r.p}</span>
                    <span className="q-names">{r.n}</span>
                    <span className="q-tag">{r.t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="feature-copy" data-reveal style={{ ["--d" as string]: ".1s" }}>
              <div className="feature-index">02</div>
              <h3>Open play that feels fair to everyone.</h3>
              <p className="lead">
                Players check in, the queue builds itself and groups rotate onto courts by skill and wait time. Everyone sees
                their play time. No more paddle stacks on the fence.
              </p>
              <ul className="check-list">
                {["Skill-balanced or first-come rotation", "Play-time limits with court-side alerts", "TV court board for the whole facility"].map((p) => (
                  <li key={p}>
                    <IconCheck size={18} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <Link href="/features#open-play" className="text-link">
                See how the queue works <IconArrow size={18} />
              </Link>
            </div>
          </div>

          {/* 03 Coaching */}
          <div className="feature-row" id="coaching">
            <div className="feature-media" data-reveal="clip">
              <Image src={img.duoPlayers} alt="Two players holding pickleball paddles together at sunset" fill sizes="(max-width: 860px) 100vw, 50vw" placeholder="blur" style={{ objectPosition: "center 60%" }} />
              <div className="mock" aria-hidden="true">
                <div className="mock-title">
                  <b>Coach Dana · Today</b>
                  <span>3 sessions</span>
                </div>
                {[
                  { t: "9:00", n: "Private · Alex R.", c: "Court 1 · 60 min", f: 1, s: 1 },
                  { t: "11:00", n: "Third-shot drop clinic", c: "Court 2 · 3.0–3.5", f: 6, s: 8 },
                  { t: "5:30", n: "Beginner bootcamp", c: "Courts 3–4", f: 10, s: 12 },
                ].map((l) => (
                  <div className="lesson" key={l.t}>
                    <time>{l.t}</time>
                    <span>
                      {l.n}
                      <span className="cap" style={{ display: "block" }}>
                        {l.c}
                      </span>
                    </span>
                    <span className="seats">
                      {Array.from({ length: Math.min(l.s, 8) }).map((_, i) => (
                        <i key={i} className={i < Math.round((l.f / l.s) * Math.min(l.s, 8)) ? "f" : ""} />
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="feature-copy" data-reveal style={{ ["--d" as string]: ".1s" }}>
              <div className="feature-index">03</div>
              <h3>Coaching, clinics and camps, fully booked.</h3>
              <p className="lead">
                Coaches publish privates, clinics and camps on their own courts. Players sign up online, rosters fill
                to capacity and everyone can see what each session earns.
              </p>
              <ul className="check-list">
                {["Coach profiles with ratings and specialties", "Privates, clinics and camps", "Payout totals for every session"].map((p) => (
                  <li key={p}>
                    <IconCheck size={18} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <Link href="/features#coaching" className="text-link">
                Tools for coaches <IconArrow size={18} />
              </Link>
            </div>
          </div>

          {/* 04 Revenue */}
          <div className="feature-row flip" id="payments">
            <div className="feature-media" data-reveal="clip">
              <Image src={img.orangeBalls} alt="Two pickleballs resting on a paddle" fill sizes="(max-width: 860px) 100vw, 50vw" placeholder="blur" />
              <div className="mock" aria-hidden="true">
                <div className="mock-kpis">
                  <div>
                    <b>$18,420</b>
                    <span>Revenue · Oct</span>
                  </div>
                  <div>
                    <b>82%</b>
                    <span>Peak utilization</span>
                  </div>
                  <div>
                    <b>214</b>
                    <span>Active members</span>
                  </div>
                </div>
                <div className="bars">
                  {[42, 55, 48, 62, 58, 71, 66, 78, 74, 88, 82, 96].map((h, i) => (
                    <i key={i} className={i === 11 ? "hi" : ""} style={{ ["--h" as string]: `${h}%`, ["--i" as string]: i }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="feature-copy" data-reveal style={{ ["--d" as string]: ".1s" }}>
              <div className="feature-index">04</div>
              <h3>Memberships and payments on autopilot.</h3>
              <p className="lead">
                Sell memberships and drop-ins, take quick sales at the desk and see which hours, courts and programs
                actually make money.
              </p>
              <ul className="check-list">
                {["Membership plans with renewal tracking", "Quick sales, refunds and CSV export", "Revenue and court utilization reports"].map((p) => (
                  <li key={p}>
                    <IconCheck size={18} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <Link href="/features#payments" className="text-link">
                Payments and reporting <IconArrow size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- QUOTE ---------- */}
      <section className="bleed" aria-label="Our promise">
        <div className="bleed-img" data-parallax="0.12">
          <Image src={img.nightCourts} alt="" fill sizes="100vw" placeholder="blur" style={{ objectPosition: "center 40%" }} />
        </div>
        <div className="wrap quote">
          <figure data-reveal>
            <blockquote>
              Open play shouldn&apos;t need a clipboard and a whistle.{" "}
              <span className="q-dim">Players should know when they&apos;re up, coaches should fill their clinics, and owners should get their Saturdays back.</span>
            </blockquote>
            <figcaption>
              <span className="quote-mark" aria-hidden="true" style={{ background: "var(--surface-2)", border: "1px solid var(--line-2)" }}>
                <LogoMark size={26} />
              </span>
              <span className="who">
                <b>The MyPickleball promise</b>
                <span>Why we build every screen the way we do</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ---------- OUTCOMES ---------- */}
      <section className="section" aria-labelledby="outcomes-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="outcomes-title" className="h2" data-reveal>
              A Saturday morning, run by MyPickleball.
            </h2>
            <p className="lead" data-reveal style={{ ["--d" as string]: ".1s" }}>
              Here&apos;s how the busiest morning of the week runs once the queue, the courts and the desk share one system.
            </p>
          </div>
          <div className="outcomes">
            {[
              { n: "7:45", s: "am", p: "Players check in at the desk. Members join the queue for free and drop-ins pay in one tap." },
              { n: "8:00", s: "am", p: "Groups of four head to open courts. Timers start and the TV board shows who's up next." },
              { n: "9:30", s: "am", p: "A clinic spot opens up and the next player on the waitlist gets it. The desk never touches it." },
            ].map((o, i) => (
              <div className="outcome" key={o.p} data-reveal style={{ ["--d" as string]: `${i * 0.1}s` }}>
                <div className="stat-num">
                  {o.n}
                  <em> {o.s}</em>
                </div>
                <p>{o.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PRICING ---------- */}
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="pricing-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="pricing-title" className="h2" data-reveal>
              Simple plans. No per-booking fees.
            </h2>
            <p className="lead" data-reveal style={{ ["--d" as string]: ".1s" }}>
              Pay a flat monthly price for your club. Every plan starts with a 14-day free trial and free data import.
            </p>
          </div>
          <PricingPlans />
          <p style={{ marginTop: 32 }} data-reveal>
            <Link href="/pricing" className="text-link">
              Compare every feature <IconArrow size={18} />
            </Link>
          </p>
        </div>
      </section>

      <Faq />
      <CtaBand />
    </>
  );
}

function FragmentRow({ t, s }: { t: string; s: string[] }) {
  return (
    <>
      <span className="t">{t}</span>
      {s.map((k, i) => (
        <span key={i} className={`slot ${k}`} />
      ))}
    </>
  );
}
