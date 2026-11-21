"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { IconArrow, IconCheck } from "./Icons";

export type Role = {
  id: string;
  name: string;
  summary: string;
  points: string[];
  image: StaticImageData;
  alt: string;
};

const DURATION = 7000;

export function RoleTabs({ roles }: { roles: Role[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % roles.length), DURATION);
    return () => clearTimeout(t);
  }, [active, paused, visible, roles.length]);

  const role = roles[active];

  return (
    <div
      ref={ref}
      className={`roles ${paused || !visible ? "is-paused" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ul className="role-list" role="tablist" aria-label="Who MyPickleball is for">
        {roles.map((r, i) => (
          <li key={r.id}>
            <button
              role="tab"
              id={`tab-${r.id}`}
              aria-selected={i === active}
              aria-controls="role-panel"
              className="role-btn"
              style={{ ["--dur" as string]: `${DURATION}ms` }}
              onClick={() => setActive(i)}
            >
              <span className="role-name">{r.name}</span>
              <IconArrow className="role-ic" size={22} />
              <span className="role-progress" key={`${r.id}-${active}`} />
            </button>
          </li>
        ))}
      </ul>

      <div className="role-panel" id="role-panel" role="tabpanel" aria-labelledby={`tab-${role.id}`}>
        <div className="role-media">
          {roles.map((r, i) => (
            <Image
              key={r.id}
              src={r.image}
              alt={r.alt}
              fill
              sizes="(max-width: 920px) 100vw, 55vw"
              className={i === active ? "is-active" : ""}
              placeholder="blur"
            />
          ))}
        </div>
        <div className="role-copy swap" key={role.id}>
          <p>{role.summary}</p>
          <ul className="check-list">
            {role.points.map((p) => (
              <li key={p}>
                <IconCheck size={18} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
