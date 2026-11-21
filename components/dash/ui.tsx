"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { IconClose, IconSearch } from "../Icons";
import { initials } from "./data";

export function Avatar({ name, hue = 82, size = 32 }: { name: string; hue?: number; size?: number }) {
  return (
    <span
      className="avatar"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.36),
        background: `oklch(0.86 0.12 ${hue})`,
      }}
    >
      {initials(name)}
    </span>
  );
}

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <header className="d-head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="d-head-actions">{children}</div>}
    </header>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
  pad = true,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <div className="panel-head">
          {title && <h2>{title}</h2>}
          {action}
        </div>
      )}
      <div className={pad ? "panel-body" : ""}>{children}</div>
    </section>
  );
}

export function Kpi({
  label,
  value,
  delta,
  hint,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  delta?: number;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="kpi">
      <div className="kpi-top">
        <span>{label}</span>
        {icon}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">
        {delta !== undefined && (
          <span className={delta >= 0 ? "up" : "down"}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(0)}%
          </span>
        )}
        {hint && <span className="kpi-hint">{hint}</span>}
      </div>
    </div>
  );
}

export type Tone = "good" | "warn" | "bad" | "info" | "idle" | "neon";
/** Status = dot + text. Color never carries meaning alone. */
export function Status({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`status s-${tone}`}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string; count?: number }[];
  label: string;
}) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((it) => (
        <button key={it.value} role="tab" aria-selected={value === it.value} onClick={() => onChange(it.value)}>
          {it.label}
          {it.count !== undefined && <span className="tab-count">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="search">
      <IconSearch size={18} />
      <span className="sr-only">{placeholder}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function Field({
  label,
  children,
  full,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className={`dfield ${full ? "full" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <FieldIdContext id={id}>{children}</FieldIdContext>
      {hint && <small>{hint}</small>}
    </div>
  );
}

/* attaches the generated id to the first form control child */
function FieldIdContext({ id, children }: { id: string; children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current?.querySelector("input,select,textarea");
    if (el && !el.id) el.id = id;
  }, [id]);
  return (
    <span ref={ref} style={{ display: "contents" }}>
      {children}
    </span>
  );
}

function useLockAndEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, onClose]);
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useLockAndEscape(open, onClose);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) setTimeout(() => box.current?.querySelector<HTMLElement>("input,select,textarea,button")?.focus(), 30);
  }, [open]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title} ref={box}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useLockAndEscape(open, onClose);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="overlay overlay-right" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </aside>
    </div>,
    document.body,
  );
}

export function Empty({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="empty">
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r="20" fill="none" stroke="var(--line-2)" strokeWidth="1.5" strokeDasharray="3 5" />
        <circle cx="28" cy="28" r="7" fill="var(--neon)" />
      </svg>
      <b>{title}</b>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

export function Meter({ value, max, tone = "neon" }: { value: number; max: number; tone?: "neon" | "blue" | "warn" | "bad" }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <span className={`meter m-${tone}`} role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <i style={{ width: `${pct}%` }} />
    </span>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)} />
  );
}
