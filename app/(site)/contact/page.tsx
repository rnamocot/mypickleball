import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { IconMail, IconPhone, IconPin } from "@/components/Icons";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Book a Demo",
  description:
    "Book a 20-minute MyPickleball demo or talk to our team about court booking, open play and club management for your pickleball facility.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact", title: "Book a MyPickleball demo" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumb="Contact"
        path="/contact"
        title="Let's talk courts."
        lead="Book a 20-minute walkthrough tailored to your club, or just ask a question. We reply within one business day."
      />
      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="wrap contact">
          <div data-reveal>
            <h2 className="h3">What you get in a demo</h2>
            <p className="lead" style={{ marginTop: 14, fontSize: 17 }}>
              We&apos;ll set up your actual courts, run a mock open play session and show the dashboard your desk will use
              on day one.
            </p>
            <div className="contact-lines">
              <a href={`mailto:${site.email}`}>
                <IconMail />
                <span>
                  <small>Email</small>
                  {site.email}
                </span>
              </a>
              <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}>
                <IconPhone />
                <span>
                  <small>Phone · Mon–Sat, 7am–7pm</small>
                  {site.phone}
                </span>
              </a>
              <div>
                <IconPin />
                <span>
                  <small>Home court</small>
                  Austin, Texas
                </span>
              </div>
            </div>
          </div>
          <div className="contact-card" data-reveal style={{ ["--d" as string]: ".1s" }}>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
