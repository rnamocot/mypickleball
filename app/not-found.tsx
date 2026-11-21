import Link from "next/link";
import { IconArrow } from "@/components/Icons";
import { RallyBackground } from "@/components/RallyBackground";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <>
    <Header />
    <main id="main">
    <section className="page-hero" style={{ minHeight: "80svh" }}>
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-glow g1" />
        <RallyBackground />
      </div>
      <div className="wrap">
        <h1 className="display">
          Out of bounds.
          <br />
          <span className="muted-line">That page didn&apos;t land.</span>
        </h1>
        <p className="lead" style={{ marginTop: 28 }}>
          The page you&apos;re looking for has moved or never existed. Let&apos;s get you back on the court.
        </p>
        <div className="hero-actions">
          <Link href="/" className="btn btn-primary">
            Back to home <IconArrow size={18} />
          </Link>
        </div>
      </div>
    </section>
    </main>
    <Footer />
    </>
  );
}
