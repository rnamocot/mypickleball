import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
import { IconArrow, IconCheck, IconPlus } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { featurePages, getFeaturePage } from "@/lib/features";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return featurePages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getFeaturePage((await params).slug);
  if (!p) return {};
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    alternates: { canonical: `/features/${p.slug}` },
    openGraph: { url: `/features/${p.slug}`, title: `${p.metaTitle} | MyPickleball`, description: p.metaDescription },
  };
}

export default async function FeatureDetail({ params }: Props) {
  const p = getFeaturePage((await params).slug);
  if (!p) notFound();
  const others = featurePages.filter((x) => x.slug !== p.slug);

  return (
    <>
      <PageHero parent={{ label: "Features", href: "/features" }} crumb={p.short} path={`/features/${p.slug}`} title={p.title} dim={p.dim} lead={p.lead}>
        <div className="hero-actions fade-up" style={{ ["--d" as string]: ".65s" }}>
          <Link href="/signup" className="btn btn-primary">
            Start free trial <IconArrow size={18} />
          </Link>
          <Link href="/dashboard" className="btn btn-ghost">
            Try the live demo
          </Link>
        </div>
      </PageHero>

      <section className="wrap" aria-label={p.alt}>
        <div className="feature-media" data-reveal="clip" style={{ aspectRatio: "21 / 9" }}>
          <Image src={p.image} alt={p.alt} fill priority sizes="100vw" placeholder="blur" />
        </div>
      </section>

      <section className="section" aria-labelledby="problem-title">
        <div className="wrap section-head" style={{ marginBottom: 0 }}>
          <h2 id="problem-title" className="h2" data-reveal>
            {p.problem.h}
          </h2>
          <p className="lead" data-reveal style={{ ["--d" as string]: ".1s" }}>
            {p.problem.p}
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="points-title">
        <div className="wrap">
          <h2 id="points-title" className="sr-only">
            What you get
          </h2>
          <div className="modules">
            {p.points.map((pt, i) => (
              <div className="module" key={pt.t} data-reveal style={{ ["--d" as string]: `${(i % 3) * 0.08}s` }}>
                <IconCheck size={26} style={{ color: "var(--neon)" }} />
                <h3>{pt.t}</h3>
                <p>{pt.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="steps-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="steps-title" className="h2" data-reveal>
              Set up in three steps.
            </h2>
            <p className="lead" data-reveal style={{ ["--d" as string]: ".1s" }}>
              No hardware, no install. Everything runs in the browser.
            </p>
          </div>
          <div className="outcomes">
            {p.steps.map((s, i) => (
              <div className="outcome" key={s.t} data-reveal style={{ ["--d" as string]: `${i * 0.1}s` }}>
                <div className="stat-num">
                  0{i + 1}
                  <em>.</em>
                </div>
                <h3 className="h3" style={{ marginTop: 20 }}>
                  {s.t}
                </h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="ffaq-title">
        <div className="wrap faq">
          <div data-reveal>
            <h2 id="ffaq-title" className="h2">
              Common questions
            </h2>
          </div>
          <div className="faq-list" data-reveal>
            {p.faqs.map((f, i) => (
              <details className="faq-item" key={f.q} open={i === 0}>
                <summary>
                  {f.q}
                  <IconPlus size={20} />
                </summary>
                <div className="faq-body">
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="more-title">
        <div className="wrap">
          <h2 id="more-title" className="h3" style={{ marginBottom: 24 }} data-reveal>
            More from MyPickleball
          </h2>
          <div className="modules">
            {others.map((o) => (
              <Link href={`/features/${o.slug}`} className="module" key={o.slug} data-reveal>
                <h3 style={{ marginTop: 0 }}>{o.short}</h3>
                <p>{o.card}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title={`See ${p.short.toLowerCase()} running on your courts.`} />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: p.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </>
  );
}
