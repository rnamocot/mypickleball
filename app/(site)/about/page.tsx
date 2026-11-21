import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { IconArrow } from "@/components/Icons";
import { PageHero } from "@/components/PageHero";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Our Story: Software Built Around How Pickleball Clubs Run",
  description:
    "Why MyPickleball exists, what we believe about running a pickleball club, and how we decide what to build next.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: "The story behind MyPickleball" },
};

const values = [
  { t: "Built around the court", d: "Doubles, rotations, skill levels and the kitchen-line culture are the starting point, not an afterthought." },
  { t: "Fair play, by design", d: "Queues, rotations and waitlists should feel fair to the newest player and the 5.0 alike." },
  { t: "Calm software", d: "Fewer clicks at the desk, fewer pings for players, and no clutter for owners." },
  { t: "Your players, your data", d: "No marketplace poaching and no per-booking fees. Export everything, any time." },
];

const who = [
  { t: "Owners", d: "Revenue, utilization and the whole facility on one screen." },
  { t: "Organizers", d: "Round robins, ladders and leagues without the spreadsheet." },
  { t: "Coaches", d: "Clinics that fill, rosters that stay current, payouts you can see." },
  { t: "Front desk", d: "Check-in, the queue and quick sales in a few taps." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumb="Our story"
        path="/about"
        title="Pickleball grew fast."
        dim="Club software didn't keep up."
        lead="MyPickleball exists because running a pickleball club means juggling courts, queues, coaches and members, and the tools most clubs use were built for something else."
      />

      <section className="section-tight" aria-labelledby="story-title">
        <div className="wrap story">
          <div className="story-media" data-reveal="clip">
            <Image src={img.duoPlayers} alt="Two players touching paddles before a game" fill sizes="(max-width: 920px) 100vw, 42vw" placeholder="blur" />
          </div>
          <div className="story-body">
            <h2 id="story-title" className="h2" data-reveal style={{ marginBottom: 40 }}>
              From clipboard to court board.
            </h2>
            <p data-reveal>
              Most clubs start the same way: a booking spreadsheet, a group chat for open play and a payment app for
              everything else. It works until it doesn&apos;t, usually on a packed Saturday morning with
              <strong> paddles stacked on the fence and nobody sure who&apos;s next.</strong>
            </p>
            <p data-reveal>
              General booking tools treat a pickleball court like a meeting room. They don&apos;t understand
              <strong> doubles, rotations, skill levels, or a community that wants to play rather than wait.</strong>
            </p>
            <p data-reveal>
              So we&apos;re building one system for the whole club: courts, open play, coaching, leagues, memberships,
              payments and staff, sharing one player list. <strong>Every screen starts from a real job</strong> someone
              does at a club, and we ship features in the order clubs ask for them.
            </p>

            <div className="values">
              {values.map((v, i) => (
                <div className="value" key={v.t} data-reveal style={{ ["--d" as string]: `${(i % 2) * 0.08}s` }}>
                  <h3>{v.t}</h3>
                  <p>{v.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="who-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="who-title" className="h2" data-reveal>
              Made for everyone who keeps a club running.
            </h2>
            <p className="lead" data-reveal style={{ ["--d" as string]: ".1s" }}>
              Each role gets the screens it needs, and nothing it doesn&apos;t.
            </p>
          </div>
          <div className="team">
            {who.map((m, i) => (
              <div className="member" key={m.t} data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <b style={{ marginTop: 0, fontSize: 18 }}>{m.t}</b>
                <span style={{ display: "block", marginTop: 8 }}>{m.d}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 40 }} data-reveal>
            <Link href="/dashboard" className="text-link">
              Explore the live demo <IconArrow size={18} />
            </Link>
          </p>
        </div>
      </section>

      <CtaBand title="Bring MyPickleball to your courts." />
    </>
  );
}
