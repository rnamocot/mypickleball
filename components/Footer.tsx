import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { Newsletter } from "./Newsletter";
import {
  BrandFacebook,
  BrandInstagram,
  BrandLinkedIn,
  BrandTikTok,
  BrandX,
  BrandYouTube,
  IconMail,
  IconPhone,
} from "./Icons";

const cols = [
  {
    title: "Product",
    links: [
      { href: "/features#courts", label: "Court booking" },
      { href: "/features#open-play", label: "Open play queue" },
      { href: "/features#coaching", label: "Coaching & clinics" },
      { href: "/features#leagues", label: "Leagues & tournaments" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/contact", label: "Book a demo" },
      { href: "/dashboard", label: "Live demo" },
      { href: "/signup", label: "Start free trial" },
    ],
  },
];

const socials = [
  { href: site.social.instagram, label: "Instagram", Icon: BrandInstagram },
  { href: site.social.facebook, label: "Facebook", Icon: BrandFacebook },
  { href: site.social.x, label: "X", Icon: BrandX },
  { href: site.social.youtube, label: "YouTube", Icon: BrandYouTube },
  { href: site.social.tiktok, label: "TikTok", Icon: BrandTikTok },
  { href: site.social.linkedin, label: "LinkedIn", Icon: BrandLinkedIn },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p>Court booking, open play, coaching and payments for pickleball clubs, made by people who run courts.</p>
            <Newsletter />
            <div className="socials">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href} aria-label={`MyPickleball on ${label}`} target="_blank" rel="noopener noreferrer">
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div className="footer-col" key={c.title}>
              <h3>{c.title}</h3>
              <ul>
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer-col">
            <h3>Talk to us</h3>
            <ul>
              <li>
                <a href={`mailto:${site.email}`}>
                  <IconMail size={18} /> {site.email}
                </a>
              </li>
              <li>
                <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}>
                  <IconPhone size={18} /> {site.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-word" aria-hidden="true">
        MyPickleball
      </div>

      <div className="wrap">
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} MyPickleball. All rights reserved.</span>
          <nav aria-label="Legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="/sitemap.xml">Sitemap</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
