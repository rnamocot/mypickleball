"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Site-wide motion layer:
 *  - reveals [data-reveal] elements when they enter the viewport
 *  - counts up [data-count] numbers
 *  - parallax for [data-parallax]
 *  - scroll progress bar + soft cursor glow
 */
export function Motion() {
  const pathname = usePathname();
  const bar = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const countUp = (el: HTMLElement) => {
      const target = parseFloat(el.dataset.count || "0");
      const decimals = (el.dataset.count || "").split(".")[1]?.length ?? 0;
      if (reduce) {
        el.textContent = target.toLocaleString(undefined, { minimumFractionDigits: decimals });
        return;
      }
      const dur = 1800;
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = (target * e).toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target as HTMLElement;
          el.classList.add("is-in");
          el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
          if (el.dataset.count) countUp(el);
          io.unobserve(el);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      if (!el.closest("[data-reveal]")) io.observe(el);
    });

    const para = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
        if (reduce) return;
        const vh = window.innerHeight;
        para.forEach((el) => {
          const r = el.parentElement!.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          const speed = parseFloat(el.dataset.parallax || "0.12");
          const offset = (r.top + r.height / 2 - vh / 2) * -speed;
          el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        });
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onMove = (e: PointerEvent) => {
      if (glow.current) glow.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const mod = (e.target as HTMLElement)?.closest?.(".module") as HTMLElement | null;
      if (mod) {
        const r = mod.getBoundingClientRect();
        mod.style.setProperty("--mx", `${e.clientX - r.left}px`);
        mod.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return (
    <>
      <div ref={bar} className="scroll-progress" aria-hidden="true" />
      <div ref={glow} className="cursor-glow" aria-hidden="true" />
    </>
  );
}

/** Splits a headline into masked words that rise in on load. */
export function Split({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ");
  // Screen readers get the plain sentence; the animated word masks are visual only.
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="split" aria-hidden="true">
        {words.map((w, i) => (
          <span className="w" key={i}>
            <span style={{ ["--i" as string]: i + delay }}>{w}</span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </>
  );
}
