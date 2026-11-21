import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { Faq } from "@/components/Faq";
import { IconCheck } from "@/components/Icons";
import { PageHero } from "@/components/PageHero";
import { PricingPlans } from "@/components/PricingPlans";

export const metadata: Metadata = {
  title: "Pricing: Plans for Pickleball Clubs & Facilities",
  description:
    "Flat monthly pricing for pickleball club software. Rally from $39/mo, Club from $99/mo, Facility from $239/mo billed yearly. No per-booking fees, 14-day free trial.",
  alternates: { canonical: "/pricing" },
  openGraph: { url: "/pricing", title: "MyPickleball Pricing" },
};

type Cell = boolean | string;
const rows: { group: string; items: [string, Cell, Cell, Cell][] }[] = [
  {
    group: "Courts & booking",
    items: [
      ["Courts", "Up to 4", "Up to 12", "Unlimited"],
      ["Day & week court calendar", true, true, true],
      ["Online booking & waitlists", true, true, true],
      ["Peak / off-peak pricing", true, true, true],
      ["Recurring weekly bookings", true, true, true],
    ],
  },
  {
    group: "Open play",
    items: [
      ["Check-in & live queue", true, true, true],
      ["Play-time tracking & timers", true, true, true],
      ["TV court board", true, true, true],
      ["Skill-balanced rotation", true, true, true],
    ],
  },
  {
    group: "Programs",
    items: [
      ["Coach scheduling & lessons", false, true, true],
      ["Clinics, camps & waitlists", false, true, true],
      ["Leagues, ladders & round robins", false, true, true],
      ["Online event registration", false, true, true],
    ],
  },
  {
    group: "Business",
    items: [
      ["Quick sale, refunds & CSV export", true, true, true],
      ["Memberships & renewals", false, true, true],
      ["Staff roles", "2 seats", "15 seats", "Unlimited"],
      ["Reports", "Revenue", "Full", "Full"],
      ["Court light controls", false, false, true],
      ["Support", "Email", "Email + chat", "Named success lead"],
    ],
  },
];

function C({ v }: { v: Cell }) {
  if (v === true)
    return (
      <>
        <IconCheck size={18} />
        <span className="sr-only">Included</span>
      </>
    );
  if (v === false)
    return (
      <span className="no" aria-label="Not included">
        <span style={{ display: "inline-block", width: 12, height: 1.5, background: "currentColor", verticalAlign: "middle" }} />
      </span>
    );
  return <>{v}</>;
}

export default function PricingPage() {
  return (
    <>
      <PageHero
        crumb="Pricing"
        path="/pricing"
        title="One flat price."
        dim="Every booking is yours."
        lead="No per-booking fees, no setup costs, no long contracts. Pick the plan that fits your courts and upgrade when the waitlist grows."
      />

      <section className="section-tight" style={{ paddingTop: 0 }} aria-label="Plans">
        <div className="wrap">
          <PricingPlans />
        </div>
      </section>

      <section className="section" aria-labelledby="compare-title">
        <div className="wrap">
          <h2 id="compare-title" className="h2" data-reveal>
            Compare plans
          </h2>
          <div className="compare-wrap" data-reveal style={{ ["--d" as string]: ".1s" }}>
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Feature</span>
                  </th>
                  <th scope="col">Rally</th>
                  <th scope="col">Club</th>
                  <th scope="col">Facility</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((g) => (
                  <FragmentGroup key={g.group} g={g} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Faq title="Pricing questions" />
      <CtaBand title="Try every feature free for 14 days." />
    </>
  );
}

function FragmentGroup({ g }: { g: (typeof rows)[number] }) {
  return (
    <>
      <tr className="grp">
        <td colSpan={4}>{g.group}</td>
      </tr>
      {g.items.map(([label, a, b, c]) => (
        <tr key={label}>
          <th scope="row" style={{ fontWeight: 400, textAlign: "left", paddingLeft: 0, color: "var(--muted)" }}>
            {label}
          </th>
          <td>
            <C v={a} />
          </td>
          <td>
            <C v={b} />
          </td>
          <td>
            <C v={c} />
          </td>
        </tr>
      ))}
    </>
  );
}
