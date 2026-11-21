import Link from "next/link";

export function LogoMark({ size = 30 }: { size?: number }) {
  const holes = [0, 60, 120, 180, 240, 300].map((a) => {
    const r = (a * Math.PI) / 180;
    return { x: 17 + Math.cos(r) * 5.6, y: 15 + Math.sin(r) * 5.6 };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo-mark">
      <path
        d="M3.5 27.5C5 21 9 17.5 13 16"
        fill="none"
        stroke="var(--neon)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity=".45"
      />
      <path d="M2.5 22.5c1.2-2.6 2.8-4.4 4.8-5.6" fill="none" stroke="var(--neon)" strokeWidth="2.2" strokeLinecap="round" opacity=".22" />
      <circle cx="17" cy="15" r="11" fill="var(--neon)" />
      <circle cx="17" cy="15" r="1.7" fill="var(--bg)" />
      {holes.map((h, i) => (
        <circle key={i} cx={h.x} cy={h.y} r="1.45" fill="var(--bg)" />
      ))}
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`logo ${className}`} aria-label="MyPickleball home">
      <LogoMark />
      <span className="logo-word">
        <span className="logo-my">My</span>Pickleball
      </span>
    </Link>
  );
}
