"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site";
import { Logo } from "./Logo";
import { IconArrow, IconClose, IconMenu } from "./Icons";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setHidden(y > 400 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className={`header ${scrolled || open ? "is-scrolled" : ""} ${hidden && !open ? "is-hidden" : ""}`}>
        <div className="wrap header-inner">
          <Logo />
          <nav className="nav" aria-label="Main">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="header-cta">
            <Link href="/signup?mode=signin" className="signin">
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Start free trial <IconArrow size={16} />
            </Link>
            <button
              className="menu-btn"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <IconClose size={20} /> : <IconMenu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-menu" className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        {[{ href: "/", label: "Home" }, ...nav].map((n, i) => (
          <Link
            key={n.href}
            href={n.href}
            className="m-link"
            style={{ ["--i" as string]: i }}
            tabIndex={open ? 0 : -1}
          >
            {n.label}
          </Link>
        ))}
        <div className="m-actions">
          <Link href="/signup" className="btn btn-primary btn-block" tabIndex={open ? 0 : -1}>
            Start free trial <IconArrow size={16} />
          </Link>
          <Link href="/signup?mode=signin" className="btn btn-ghost btn-block" tabIndex={open ? 0 : -1}>
            Sign in
          </Link>
        </div>
      </div>
    </>
  );
}
