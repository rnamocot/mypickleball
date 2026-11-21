import type { Metadata } from "next";
import Image from "next/image";
import { IconCheck } from "@/components/Icons";
import { SignupForm } from "@/components/SignupForm";
import { img } from "@/lib/images";
import { plans } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start Your Free Trial",
  description: "Create your MyPickleball club in minutes. 14-day free trial, no credit card required.",
  alternates: { canonical: "/signup" },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; plan?: string }>;
}) {
  const sp = await searchParams;
  const signin = sp.mode === "signin";
  const plan = plans.find((p) => p.id === sp.plan);

  return (
    <section className="page-hero" style={{ paddingBottom: 0 }}>
      <div className="wrap contact">
        <div className="fade-up" style={{ ["--d" as string]: "0s" }}>
          <h1 className="h2">{signin ? "Welcome back to the court." : "Open your club in ten minutes."}</h1>
          <p className="lead" style={{ marginTop: 20 }}>
            {signin
              ? "Sign in to manage bookings, the queue and your members."
              : plan
                ? `You're starting the ${plan.name} plan, free for 14 days, no card required.`
                : "14 days free with every feature. No credit card, no setup fee."}
          </p>
          {!signin && (
            <ul className="check-list" style={{ marginTop: 32 }}>
              {["Add courts, hours and prices", "Share your booking link the same day", "Free member import from any tool"].map(
                (p) => (
                  <li key={p}>
                    <IconCheck size={18} />
                    <span>{p}</span>
                  </li>
                ),
              )}
            </ul>
          )}
          <div className="feature-media" style={{ marginTop: 40, aspectRatio: "16/10" }}>
            <Image
              src={img.paddleBalls}
              alt="Pickleball paddle with neon balls on a blue court"
              fill
              sizes="(max-width: 920px) 100vw, 40vw"
              placeholder="blur"
            />
          </div>
        </div>
        <div className="contact-card fade-up" style={{ ["--d" as string]: ".15s" }}>
          <SignupForm signin={signin} plan={plan?.id} />
        </div>
      </div>
    </section>
  );
}
