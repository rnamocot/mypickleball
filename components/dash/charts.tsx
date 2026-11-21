"use client";

import { useState } from "react";

/* Validated categorical order for the dark surface (#101617):
   blue, orange, aqua, violet. Neon is reserved for single-series + highlights. */
export const SERIES = ["#3987e5", "#d95926", "#199e70", "#9085e9"];

const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
};

type Fmt = (n: number) => string;

function Axis({ max, fmt }: { max: number; fmt: Fmt }) {
  return (
    <div className="ch-axis" aria-hidden="true">
      {[1, 0.5, 0].map((f) => (
        <span key={f} style={{ bottom: `${f * 100}%` }}>
          <em>{fmt(max * f)}</em>
        </span>
      ))}
    </div>
  );
}

/** Single-series column chart with per-bar hover tooltip. */
export function BarChart({
  data,
  fmt = (n) => String(Math.round(n)),
  height = 200,
  highlightLast = true,
  label,
}: {
  data: { label: string; value: number; sub?: string }[];
  fmt?: Fmt;
  height?: number;
  highlightLast?: boolean;
  label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const every = Math.ceil(data.length / 8);
  return (
    <figure className="chart" aria-label={label}>
      <div className="ch-plot" style={{ height }}>
        <Axis max={max} fmt={fmt} />
        <div className="ch-bars" onMouseLeave={() => setHover(null)}>
          {data.map((d, i) => (
            <div
              key={i}
              className={`ch-col ${hover === i ? "is-hover" : ""}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              tabIndex={0}
              aria-label={`${d.label}: ${fmt(d.value)}`}
            >
              <i
                className={highlightLast && i === data.length - 1 ? "hi" : ""}
                style={{ height: `${(d.value / max) * 100}%`, ["--i" as string]: i }}
              />
              {hover === i && (
                <span className={`ch-tip ${i > data.length * 0.7 ? "left" : ""}`}>
                  <b>{fmt(d.value)}</b>
                  {d.sub ?? d.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="ch-x" aria-hidden="true">
        {data.map((d, i) => (
          <span key={i}>{i % every === 0 || i === data.length - 1 ? d.label : ""}</span>
        ))}
      </div>
    </figure>
  );
}

/** Stacked columns for up to 4 fixed-order categories, legend + tooltip. */
export function StackedChart({
  data,
  keys,
  fmt = (n) => String(Math.round(n)),
  height = 240,
  label,
}: {
  data: { label: string; values: number[] }[];
  keys: string[];
  fmt?: Fmt;
  height?: number;
  label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.values.reduce((a, b) => a + b, 0))));
  const every = Math.ceil(data.length / 8);
  return (
    <figure className="chart" aria-label={label}>
      <div className="ch-legend">
        {keys.map((k, i) => (
          <span key={k}>
            <i style={{ background: SERIES[i] }} />
            {k}
          </span>
        ))}
      </div>
      <div className="ch-plot" style={{ height }}>
        <Axis max={max} fmt={fmt} />
        <div className="ch-bars" onMouseLeave={() => setHover(null)}>
          {data.map((d, i) => {
            const total = d.values.reduce((a, b) => a + b, 0);
            return (
              <div
                key={i}
                className={`ch-col ${hover === i ? "is-hover" : ""}`}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                tabIndex={0}
                aria-label={`${d.label}: ${keys.map((k, j) => `${k} ${fmt(d.values[j])}`).join(", ")}`}
              >
                <span className="ch-stack" style={{ height: `${(total / max) * 100}%` }}>
                  {d.values.map((v, j) =>
                    v > 0 ? <i key={j} style={{ flexGrow: v, background: SERIES[j] }} /> : null,
                  )}
                </span>
                {hover === i && (
                  <span className={`ch-tip ${i > data.length * 0.7 ? "left" : ""}`}>
                    <b>{d.label}</b>
                    {keys.map((k, j) => (
                      <span className="tip-row" key={k}>
                        <i style={{ background: SERIES[j] }} />
                        {k}
                        <em>{fmt(d.values[j])}</em>
                      </span>
                    ))}
                    <span className="tip-row total">
                      Total<em>{fmt(total)}</em>
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="ch-x" aria-hidden="true">
        {data.map((d, i) => (
          <span key={i}>{i % every === 0 || i === data.length - 1 ? d.label : ""}</span>
        ))}
      </div>
    </figure>
  );
}

/** Sequential single-hue heatmap (neon, dim → bright). */
export function Heatmap({
  rows,
  cols,
  values,
  fmt = (n) => `${Math.round(n)}%`,
  label,
}: {
  rows: string[];
  cols: string[];
  values: number[][];
  fmt?: Fmt;
  label: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...values.flat());
  return (
    <figure className="chart heat" aria-label={label}>
      <div className="heat-grid" style={{ gridTemplateColumns: `44px repeat(${cols.length}, 1fr)` }}>
        <span />
        {cols.map((c, i) => (
          <span key={c} className="heat-x">
            {i % 2 === 0 ? c : ""}
          </span>
        ))}
        {rows.map((r, ri) => (
          <Row key={r} r={r} ri={ri} cols={cols} values={values} max={max} fmt={fmt} hover={hover} setHover={setHover} />
        ))}
      </div>
      <div className="heat-scale" aria-hidden="true">
        <span>Quiet</span>
        {[0.08, 0.25, 0.45, 0.7, 1].map((a) => (
          <i key={a} style={{ background: `rgba(212,255,63,${a})` }} />
        ))}
        <span>Full</span>
      </div>
    </figure>
  );
}

function Row({
  r,
  ri,
  cols,
  values,
  max,
  fmt,
  hover,
  setHover,
}: {
  r: string;
  ri: number;
  cols: string[];
  values: number[][];
  max: number;
  fmt: Fmt;
  hover: string | null;
  setHover: (s: string | null) => void;
}) {
  return (
    <>
      <span className="heat-y">{r}</span>
      {cols.map((c, ci) => {
        const v = values[ri][ci];
        const key = `${ri}-${ci}`;
        return (
          <span
            key={c}
            className="heat-cell"
            tabIndex={0}
            aria-label={`${r} ${c}: ${fmt(v)}`}
            onMouseEnter={() => setHover(key)}
            onMouseLeave={() => setHover(null)}
            style={{ background: `rgba(212,255,63,${0.05 + (v / max) * 0.92})` }}
          >
            {hover === key && (
              <span className={`ch-tip ${ci > cols.length * 0.6 ? "left" : ""}`}>
                <b>{fmt(v)}</b>
                {r} · {c}
              </span>
            )}
          </span>
        );
      })}
    </>
  );
}

/** Ranked horizontal bars with direct value labels (single series). */
export function RankBars({
  data,
  fmt = (n) => String(n),
}: {
  data: { label: string; value: number; sub?: string }[];
  fmt?: Fmt;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="rank">
      {data.map((d) => (
        <li key={d.label}>
          <div className="rank-top">
            <span>
              {d.label}
              {d.sub && <small>{d.sub}</small>}
            </span>
            <b>{fmt(d.value)}</b>
          </div>
          <span className="rank-track">
            <i style={{ width: `${(d.value / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Circular play-time ring for court timers. */
export function Ring({ pct, size = 56, tone = "neon", children }: { pct: number; size?: number; tone?: "neon" | "warn" | "bad" | "blue"; children?: React.ReactNode }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const color = tone === "neon" ? "var(--neon)" : tone === "warn" ? "#e0a100" : tone === "bad" ? "var(--coral)" : "#3987e5";
  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-2)" strokeWidth="3" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, pct)))}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <span className="ring-in">{children}</span>
    </span>
  );
}
