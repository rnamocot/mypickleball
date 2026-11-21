import Link from "next/link";
import { site } from "@/lib/site";
import { JsonLd } from "./JsonLd";
import { Split } from "./Motion";
import { RallyBackground } from "./RallyBackground";

export function PageHero({
  crumb,
  path,
  title,
  dim,
  lead,
  children,
  parent,
}: {
  parent?: { label: string; href: string };
  crumb: string;
  path: string;
  title: string;
  dim?: string;
  lead: string;
  children?: React.ReactNode;
}) {
  const n = title.split(" ").length;
  return (
    <section className="page-hero">
      <div className="hero-bg" aria-hidden="true" style={{ opacity: 0.6 }}>
        <div className="hero-glow g1" />
        <RallyBackground />
      </div>
      <div className="wrap">
        <nav className="crumbs fade-up" style={{ ["--d" as string]: "0s" }} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          {parent && (
            <>
              <Link href={parent.href}>{parent.label}</Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span aria-current="page" style={{ color: "var(--muted)" }}>
            {crumb}
          </span>
        </nav>
        <h1 className="display" style={{ maxWidth: "13em" }}>
          <Split text={title} />
          {dim && (
            <>
              {" "}
              <span className="muted-line">
                <Split text={dim} delay={n} />
              </span>
            </>
          )}
        </h1>
        <p className="lead fade-up" style={{ ["--d" as string]: ".5s" }}>
          {lead}
        </p>
        {children}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.url },
            ...(parent ? [{ "@type": "ListItem", position: 2, name: parent.label, item: `${site.url}${parent.href}` }] : []),
            { "@type": "ListItem", position: parent ? 3 : 2, name: crumb, item: `${site.url}${path}` },
          ],
        }}
      />
    </section>
  );
}
