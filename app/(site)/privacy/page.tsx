import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MyPickleball collects, uses and protects club and player data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero crumb="Privacy" path="/privacy" title="Privacy Policy" lead="Last updated November 21, 2026." />
      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="wrap prose">
          <p>
            MyPickleball provides software that pickleball clubs use to manage courts, players and payments. This policy
            explains what information we handle and why.
          </p>
          <h2>Information we collect</h2>
          <ul>
            <li>Account details for club staff, such as name, email and role.</li>
            <li>Player details that clubs add or players provide, such as name, contact details and skill rating.</li>
            <li>Booking, check-in and payment records needed to run the service.</li>
          </ul>
          <h2>How we use it</h2>
          <p>
            We use this information only to operate MyPickleball for your club, provide support, keep the service secure
            and improve the product. We never sell personal data or market other clubs to your players.
          </p>
          <h2>Payments</h2>
          <p>Card payments are processed by PCI-compliant payment providers. We do not store full card numbers.</p>
          <h2>Your choices</h2>
          <p>
            Clubs can export or delete their data at any time. Players can ask their club or contact us at{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> to access or delete their information.
          </p>
        </div>
      </section>
    </>
  );
}
