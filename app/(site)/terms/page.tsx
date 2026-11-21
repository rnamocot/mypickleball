import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern use of MyPickleball club management software.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <PageHero crumb="Terms" path="/terms" title="Terms of Service" lead="Last updated November 21, 2026." />
      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="wrap prose">
          <p>By creating a MyPickleball account you agree to these terms on behalf of yourself and your club.</p>
          <h2>Subscriptions</h2>
          <p>
            Plans are billed monthly or yearly in advance after a 14-day free trial. You can cancel at any time; access
            continues until the end of the paid period.
          </p>
          <h2>Your data</h2>
          <p>
            Your club owns its data. You can export it at any time, and we delete it within 30 days of account closure
            unless the law requires otherwise.
          </p>
          <h2>Acceptable use</h2>
          <p>Don&apos;t misuse the service, attempt to access other clubs&apos; data, or use it for unlawful activity.</p>
          <h2>Contact</h2>
          <p>
            Questions about these terms? Email <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
