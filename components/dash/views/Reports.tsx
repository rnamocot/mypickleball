"use client";

import { useMemo, useState } from "react";
import { BarChart, Heatmap, RankBars, StackedChart } from "../charts";
import { CATS, revenueByDay, utilizationGrid } from "../calc";
import { addDays, fmtShortTime, money, ymd } from "../data";
import { useStore } from "../store";
import { Kpi, PageHead, Panel } from "../ui";

export function Reports() {
  const { state } = useStore();
  const [range, setRange] = useState<7 | 14 | 28>(28);
  const [table, setTable] = useState(false);

  const rev = useMemo(() => revenueByDay(state, range), [state, range]);
  const util = useMemo(() => utilizationGrid(state), [state]);
  const from = ymd(addDays(new Date(), -range + 1));
  const today = ymd(new Date());
  const bks = state.bookings.filter((b) => b.date >= from && b.date <= today);
  const total = rev.reduce((a, d) => a + d.total, 0);
  const noShow = bks.filter((b) => b.status === "no-show").length;
  const cancelled = bks.filter((b) => b.status === "cancelled").length;
  const live = bks.filter((b) => b.status !== "cancelled");
  const avgUtil = util.values.flat().reduce((a, v) => a + v, 0) / util.values.flat().length;

  const byHour = useMemo(() => {
    const hrs = Array.from({ length: 16 }, (_, i) => 6 + i);
    return hrs.map((h) => ({
      label: fmtShortTime(h * 60),
      sub: `${fmtShortTime(h * 60)} to ${fmtShortTime((h + 1) * 60)}`,
      value: live.filter((b) => b.start <= h * 60 && b.start + b.duration > h * 60).length,
    }));
  }, [live]);

  const topPlayers = [...state.players].sort((a, b) => b.minutes - a.minutes).slice(0, 6);
  const coaches = state.coaches
    .map((c) => {
      const ls = state.lessons.filter((l) => l.coachId === c.id);
      return { label: c.name, sub: c.specialty, value: ls.reduce((a, l) => a + l.enrolled.length * l.price, 0) };
    })
    .sort((a, b) => b.value - a.value);

  const k = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n)}`);
  const catTotals = CATS.map((_, i) => rev.reduce((a, d) => a + d.byCat[i], 0));

  return (
    <>
      <PageHead title="Reports" sub={`Last ${range} days, ending today`}>
        <div className="seg" role="group" aria-label="Date range">
          {([7, 14, 28] as const).map((r) => (
            <button key={r} aria-pressed={range === r} onClick={() => setRange(r)}>
              {r} days
            </button>
          ))}
        </div>
      </PageHead>

      <div className="grid g-4">
        <Kpi label="Revenue" value={money(total)} hint={`${money(total / range)} per day`} />
        <Kpi label="Avg court utilization" value={`${Math.round(avgUtil)}%`} hint="open hours booked, 28 days" />
        <Kpi label="Bookings" value={live.length} hint={`avg ${money(live.reduce((a, b) => a + b.price, 0) / Math.max(1, live.length))} each`} />
        <Kpi label="No-show rate" value={`${((noShow / Math.max(1, bks.length)) * 100).toFixed(1)}%`} hint={`${cancelled} cancellations`} />
      </div>

      <Panel
        className="mt"
        title={
          <>
            Revenue by source <small>{money(total)}</small>
          </>
        }
        action={
          <button className="link-btn" onClick={() => setTable(!table)} aria-pressed={table}>
            {table ? "Show chart" : "Show table"}
          </button>
        }
      >
        {table ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  {CATS.map((c) => (
                    <th key={c} className="num">
                      {c}
                    </th>
                  ))}
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {[...rev].reverse().map((d) => (
                  <tr key={d.key}>
                    <td>{d.d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</td>
                    {d.byCat.map((v, i) => (
                      <td key={i} className="num muted">
                        {money(v)}
                      </td>
                    ))}
                    <td className="num">{money(d.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <StackedChart
            label={`Revenue by source per day, last ${range} days`}
            keys={CATS.map((c, i) => `${c === "Court" ? "Courts & drop-ins" : c} · ${money(catTotals[i])}`)}
            data={rev.map((d) => ({ label: d.d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }), values: d.byCat }))}
            fmt={k}
          />
        )}
      </Panel>

      <div className="grid g-main mt">
        <Panel
          title={
            <>
              Court utilization <small>weekday × hour, last 28 days</small>
            </>
          }
        >
          <Heatmap label="Court utilization by weekday and hour" rows={util.rows} cols={util.cols} values={util.values} />
        </Panel>
        <Panel
          title={
            <>
              Busiest hours <small>bookings in play</small>
            </>
          }
        >
          <BarChart label="Bookings in play by hour of day" data={byHour} highlightLast={false} height={220} />
        </Panel>
      </div>

      <div className="grid g-2 mt">
        <Panel title="Most active players · play time (30d)">
          <RankBars data={topPlayers.map((p) => ({ label: p.name, sub: `${p.games} games`, value: Math.round(p.minutes / 60) }))} fmt={(n) => `${n} h`} />
        </Panel>
        <Panel title="Coaching revenue booked">
          <RankBars data={coaches} fmt={(n) => money(n)} />
        </Panel>
      </div>
    </>
  );
}
