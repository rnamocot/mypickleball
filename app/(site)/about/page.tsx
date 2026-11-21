import type { Metadata } from "next";
import Image from "next/image";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Our Story: Built by Pickleball Club Owners",
  description:
    "MyPickleball was built inside a real 10-court pickleball club by its owner, organizers, coaches and desk staff. Here's why we made it and what we believe.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: "The story behind MyPickleball" },
};

const values = [
  { t: "Court-tested first", d: "Every feature runs at our own club for a month before it ships to yours." },
  { t: "Fair play, by design", d: "Queues, rotations and waitlists should feel fair to the newest player and the 5.0." },
  { t: "Calm software", d: "Fewer clicks at the desk, fewer notifications for players, no clutter for owners." },
  { t: "Your players, your data", d: "No marketplace poaching, no per-booking fees. Export everything, any time." },
];

const team = [
  { i: "MV", n: "Marisol Vega", r: "Founder · Club owner" },
  { i: "TB", n: "Theo Brooks", r: "Head of product · League organizer" },
  { i: "DK", n: "Dana Kim", r: "Coaching lead · PPR certified" },
  { i: "AR", n: "Andre Reyes", r: "Engineering · Desk volunteer" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumb="Our story"
        path="/about"
        title="We built it because"
        dim="we needed it."
        lead="MyPickleball started at the front desk of our own club: 10 courts, 600 members and a whiteboard that couldn't keep up."
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
              In 2021 we turned an old warehouse into an indoor pickleball club. Within six months we had
              <strong> a waitlist for open play, three coaches sharing one spreadsheet, and four different apps</strong> for
              booking, payments, leagues and messaging.
            </p>
            <p data-reveal>
              Saturday mornings were chaos. Paddles stacked on the fence, players arguing about who was next, coaches
              double-booked on Court 2. Nothing we tried was made for how pickleball actually works:
              <strong> doubles, rotations, skill levels and a community that wants to play, not wait.</strong>
            </p>
            <p data-reveal>
              So our desk volunteer, who happened to be a software engineer, started building. Today MyPickleball runs
              <strong> more than 1,200 clubs</strong>, from two-court community parks to multi-site facilities hosting
              national tournaments. We still run our own club on it every single day.
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

      <section className="section" aria-labelledby="team-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="team-title" className="h2" data-reveal>
              Owners, organizers, coaches and engineers.
            </h2>
            <p className="lead" data-reveal style={{ ["--d" as string]: ".1s" }}>
              Everyone on our team has worked a shift at the desk. It shows in the product.
            </p>
          </div>
          <div className="team">
            {team.map((m, i) => (
              <div className="member" key={m.n} data-reveal style={{ ["--d" as string]: `${i * 0.08}s` }}>
                <span className="av" aria-hidden="true">
                  {m.i}
                </span>
                <b>{m.n}</b>
                <span>{m.r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Come play on our courts, or bring us to yours." />
    </>
  );
}
