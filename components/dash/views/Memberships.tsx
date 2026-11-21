"use client";

import { useMemo, useState } from "react";
import { IconCheck, IconMembership, IconPlus, IconWallet } from "../../Icons";
import { type Plan, addDays, fmtDate, money, parseYmd, uid, ymd } from "../data";
import { useStore } from "../store";
import { Avatar, Field, Kpi, Modal, PageHead, Panel, Status, Tabs, type Tone } from "../ui";

type F = "all" | "soon" | "due";

export function Memberships() {
  const { state, dispatch } = useStore();
  const [f, setF] = useState<F>("all");
  const [adding, setAdding] = useState(false);
  const today = ymd(new Date());
  const in7 = ymd(addDays(new Date(), 7));

  const members = state.players.filter((p) => p.planId);
  const monthly = (pl: Plan) => (pl.interval === "month" ? pl.price : pl.price / 12);
  const mrr = members.reduce((a, p) => {
    const pl = state.plans.find((x) => x.id === p.planId);
    return a + (pl ? monthly(pl) : 0);
  }, 0);
  const state_ = (renews: string | null): [Tone, string] =>
    !renews ? ["idle", "None"] : renews < today ? ["bad", "Past due"] : renews <= in7 ? ["warn", "Renews soon"] : ["good", "Active"];

  const list = useMemo(() => {
    let l = members;
    if (f === "soon") l = l.filter((p) => p.renewsOn! >= today && p.renewsOn! <= in7);
    if (f === "due") l = l.filter((p) => p.renewsOn! < today);
    return [...l].sort((a, b) => (a.renewsOn ?? "").localeCompare(b.renewsOn ?? ""));
  }, [members, f, today, in7]);

  const renew = (pid: string) => {
    const p = state.players.find((x) => x.id === pid)!;
    const pl = state.plans.find((x) => x.id === p.planId)!;
    const base = p.renewsOn && p.renewsOn > today ? parseYmd(p.renewsOn) : new Date();
    dispatch({ t: "addTx", tx: { id: uid("t"), at: Date.now(), playerId: p.id, description: `${pl.name} membership`, category: "Membership", amount: pl.price, method: "Card", status: "paid" } });
    dispatch({ t: "updatePlayer", id: p.id, patch: { renewsOn: ymd(addDays(base, pl.interval === "month" ? 30 : 365)) } });
  };

  const due = members.filter((p) => p.renewsOn! < today);
  const soon = members.filter((p) => p.renewsOn! >= today && p.renewsOn! <= in7);

  return (
    <>
      <PageHead title="Memberships" sub="Plans, renewals and recurring revenue">
        <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
          <IconPlus size={16} /> New plan
        </button>
      </PageHead>

      <div className="grid g-4">
        <Kpi label="Active members" value={members.length} hint={`${Math.round((members.length / state.players.length) * 100)}% of players`} icon={<IconMembership size={20} />} />
        <Kpi label="Monthly recurring" value={money(mrr)} hint="annual plans prorated" icon={<IconWallet size={20} />} />
        <Kpi label="Renewing this week" value={soon.length} hint={money(soon.reduce((a, p) => a + (state.plans.find((x) => x.id === p.planId)?.price ?? 0), 0))} />
        <Kpi label="Past due" value={due.length} hint={due.length ? "retry cards or reach out" : "all caught up"} />
      </div>

      <div className="grid g-4 mt">
        {state.plans.map((pl, i) => {
          const count = members.filter((p) => p.planId === pl.id).length;
          return (
            <div className="card" key={pl.id} style={{ animationDelay: `${i * 50}ms` }}>
              <div className="card-top">
                <h3>{pl.name}</h3>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{count} members</span>
              </div>
              <div className="price-big">
                {money(pl.price)} <small>/ {pl.interval}</small>
              </div>
              <ul className="perks">
                {pl.perks.map((x) => (
                  <li key={x}>
                    <IconCheck size={15} />
                    {x}
                  </li>
                ))}
                <li>
                  <IconCheck size={15} />
                  {pl.courtDiscount}% off court bookings
                </li>
              </ul>
              <p style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)", fontSize: 13, color: "var(--muted)" }}>
                {money(count * monthly(pl))} / month recurring
              </p>
            </div>
          );
        })}
      </div>

      <Panel className="mt" pad={false}>
        <div style={{ padding: "8px 20px 0" }}>
          <Tabs
            label="Member filter"
            value={f}
            onChange={setF}
            items={[
              { value: "all", label: "All members", count: members.length },
              { value: "soon", label: "Renewing in 7 days", count: soon.length },
              { value: "due", label: "Past due", count: due.length },
            ]}
          />
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Renews</th>
                <th className="num">Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const pl = state.plans.find((x) => x.id === p.planId)!;
                const [t, label] = state_(p.renewsOn);
                return (
                  <tr key={p.id}>
                    <td>
                      <span className="who">
                        <Avatar name={p.name} hue={p.hue} size={28} />
                        <b>{p.name}</b>
                      </span>
                    </td>
                    <td>{pl.name}</td>
                    <td>
                      <Status tone={t}>{label}</Status>
                    </td>
                    <td className="muted">{p.renewsOn ? fmtDate(p.renewsOn, { month: "short", day: "numeric", year: "numeric" }) : "-"}</td>
                    <td className="num">
                      {money(pl.price)}/{pl.interval === "month" ? "mo" : "yr"}
                    </td>
                    <td className="num">
                      {t !== "good" && (
                        <button className="btn btn-ghost btn-xs" onClick={() => renew(p.id)}>
                          Charge renewal
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <NewPlan open={adding} onClose={() => setAdding(false)} />
    </>
  );
}

function NewPlan({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useStore();
  const [f, setF] = useState({ name: "", price: 59, interval: "month" as Plan["interval"], courtDiscount: 20, perks: "Open play access\nMember court rates" });
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New membership plan"
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            disabled={!f.name.trim()}
            onClick={() => {
              dispatch({ t: "addPlan", plan: { id: uid("plan"), name: f.name.trim(), price: f.price, interval: f.interval, courtDiscount: f.courtDiscount, perks: f.perks.split("\n").map((x) => x.trim()).filter(Boolean) } });
              dispatch({ t: "notice", text: `${f.name} plan is live on your booking site.`, tone: "good" });
              onClose();
            }}
          >
            Create plan
          </button>
        </>
      }
    >
      <div className="form">
        <Field label="Plan name" full>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Early Bird" />
        </Field>
        <Field label="Price">
          <input type="number" min={0} value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} />
        </Field>
        <Field label="Billing">
          <select value={f.interval} onChange={(e) => setF({ ...f, interval: e.target.value as Plan["interval"] })}>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </Field>
        <Field label="Court discount %">
          <input type="number" min={0} max={100} value={f.courtDiscount} onChange={(e) => setF({ ...f, courtDiscount: Number(e.target.value) })} />
        </Field>
        <Field label="Perks (one per line)" full>
          <textarea value={f.perks} onChange={(e) => setF({ ...f, perks: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}
