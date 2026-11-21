import { faqs } from "@/lib/site";
import { IconPlus } from "./Icons";
import { JsonLd } from "./JsonLd";

export function Faq({ title = "Questions club owners ask us" }: { title?: string }) {
  return (
    <section className="section" aria-labelledby="faq-title">
      <div className="wrap faq">
        <div data-reveal>
          <h2 id="faq-title" className="h2">
            {title}
          </h2>
          <p className="lead" style={{ marginTop: 24 }}>
            Still unsure? Ask us anything, or open the live demo and try it yourself.
          </p>
        </div>
        <div className="faq-list" data-reveal style={{ ["--d" as string]: ".1s" }}>
          {faqs.map((f, i) => (
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
    </section>
  );
}
