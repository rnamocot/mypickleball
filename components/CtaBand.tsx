import Image from "next/image";
import Link from "next/link";
import { img } from "@/lib/images";
import { IconArrow } from "./Icons";

export function CtaBand({
  title = "Your courts are full. Your desk shouldn't be.",
  text = "Start a 14-day free trial and take your first online booking today. No card, no setup fee, no contract.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="wrap" aria-labelledby="cta-title">
      <div className="cta" data-reveal="scale">
        <div className="cta-img">
          <Image src={img.duskCourt} alt="Floodlit outdoor pickleball courts at dusk" fill sizes="100vw" placeholder="blur" />
        </div>
        <h2 id="cta-title" className="h2">
          {title}
        </h2>
        <p className="lead">{text}</p>
        <div className="hero-actions">
          <Link href="/signup" className="btn btn-primary">
            Start free trial <IconArrow size={18} />
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            Book a 20-min demo
          </Link>
        </div>
      </div>
    </section>
  );
}
