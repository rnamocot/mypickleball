import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { Motion } from "@/components/Motion";
import { plans, site } from "@/lib/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Motion />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: site.name,
            url: site.url,
            logo: `${site.url}/icon.svg`,
            email: site.email,
            sameAs: Object.values(site.social),
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: site.name,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web, iOS, Android",
            description: site.description,
            url: site.url,
            offers: plans.map((p) => ({
              "@type": "Offer",
              name: p.name,
              price: p.monthly,
              priceCurrency: "USD",
              url: `${site.url}/pricing`,
            })),
          },
        ]}
      />
    </>
  );
}
