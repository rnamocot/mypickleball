"use client";

import { useMemo, useState } from "react";
import { IconDownload, IconRefund, IconWallet } from "../../Icons";
import { sumRange } from "../calc";
import { type TxCategory, money } from "../data";
import { QuickSale } from "../modals";
import { usePlayerLookup, useStore } from "../store";
import { Empty, Kpi, Modal, PageHead, Panel, SearchInput, Status, Tabs } from "../ui";

type Cat = "all" | TxCategory | "refunded";

export function Payments() {
  const { state, dispatch } = useStore();
  const P = usePlayerLookup();
  const [cat, setCat] = useState<Cat>("all");
  const [q, setQ] = useState("");
  const [range, setRange] = useState(30);
  const [sale, setSale] = useState(false);
  const [refund, setRefund] = useState<string | null>(null);
  const [limit, setLimit] = useState(60);

  const since = Date.now() - range * 864e5;
  const list = useMemo(() => {
    let l = state.transactions.filter((t) => t.at >= since);
    if (cat === "refunded") l = l.filter((t) => t.status === "refunded");
    else if (cat !== "all") l = l.filter((t) => t.category === cat);
    if (q) {
      const s = q.toLowerCase();
      l = l.filter((t) => t.description.toLowerCase().includes(s) || P(t.playerId)?.name.toLowerCase().includes(s));
    }
    return l;
  }, [state.transactions, cat, q, since, P]);

  const refunds30 = state.transactions.filter((t) => t.status === "refunded" && t.at >= Date.now() - 30 * 864e5);
  const filteredTotal = list.filter((t) => t.status === "paid").reduce((a, t) => a + t.amount, 0);
  const tx = state.transactions.find((t) => t.id === refund);

  const exportCsv = () => {
    const rows = [["Date", "Customer", "Description", "Category", "Method", "Status", "Amount"]].concat(
      list.map((t) => [new Date(t.at).toISOString(), P(t.playerId)?.name ?? "Walk-in", t.description, t.category, t.method, t.status, t.amount.toFixed(2)]),
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")], { type: "text/csv" }));
    a.download = `payments-${range}d.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <PageHead title="Payments" sub="Every booking, membership, lesson and desk sale in one ledger">
        <button className="btn btn-ghost btn-sm" onClick={exportCsv}>
          <IconDownload size={16} /> Export
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => setSale(true)}>
          <IconWallet size={16} /> Quick sale
        </button>
      </PageHead>

      <div className="grid g-4">
        <Kpi label="Today" value={money(sumRange(state, 0))} hint={`${state.transactions.filter((t) => new Date(t.at).toDateString() === new Date().toDateString()).length} payments`} />
        <Kpi label="Last 7 days" value={money(sumRange(state, 6))} delta={((sumRange(state, 6) - sumRange(state, 13, 7)) / Math.max(1, sumRange(state, 13, 7))) * 100} hint="vs prior 7 days" />
        <Kpi label="Last 30 days" value={money(sumRange(state, 29))} hint="gross, before card fees" />
        <Kpi label="Refunds (30d)" value={money(refunds30.reduce((a, t) => a + t.amount, 0))} hint={`${refunds30.length} refunds`} />
      </div>

      <Panel className="mt" pad={false}>
        <div style={{ padding: "8px 20px 0", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Tabs
            label="Category"
            value={cat}
            onChange={setCat}
            items={[
              { value: "all", label: "All" },
              { value: "Court", label: "Courts" },
              { value: "Coaching", label: "Coaching" },
              { value: "Membership", label: "Memberships" },
              { value: "Event", label: "Events" },
              { value: "Retail", label: "Retail" },
              { value: "refunded", label: "Refunds" },
            ]}
          />
          <div style={{ display: "flex", gap: 8, paddingBottom: 8, flexWrap: "wrap", maxWidth: "100%" }}>
            <SearchInput value={q} onChange={setQ} placeholder="Search payments" />
            <select className="select" value={range} onChange={(e) => setRange(Number(e.target.value))} aria-label="Date range">
              <option value={1}>Today</option>
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
        </div>
        <p style={{ padding: "4px 20px 12px", fontSize: 13, color: "var(--muted)" }}>
          {list.length} payments · <b style={{ color: "var(--text)" }}>{money(filteredTotal)}</b> collected
        </p>
        {list.length === 0 ? (
          <Empty title="No payments match" text="Change the filter or date range." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th className="num">Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.slice(0, limit).map((t) => (
                  <tr key={t.id}>
                    <td className="muted">{new Date(t.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</td>
                    <td>{P(t.playerId)?.name ?? <span className="muted">Walk-in</span>}</td>
                    <td>{t.description}</td>
                    <td className="muted">{t.category}</td>
                    <td className="muted">{t.method}</td>
                    <td>{t.status === "paid" ? <Status tone="good">Paid</Status> : <Status tone="idle">Refunded</Status>}</td>
                    <td className={`num ${t.status === "refunded" ? "strike" : ""}`}>{money(t.amount)}</td>
                    <td className="num">
                      {t.status === "paid" && (
                        <button className="icon-btn sm" title="Refund" aria-label={`Refund ${t.description}`} onClick={() => setRefund(t.id)}>
                          <IconRefund size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length > limit && (
              <div style={{ padding: 16, textAlign: "center" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setLimit((l) => l + 60)}>
                  Show more ({list.length - limit} left)
                </button>
              </div>
            )}
          </div>
        )}
      </Panel>

      <QuickSale open={sale} onClose={() => setSale(false)} />
      <Modal
        open={!!tx}
        onClose={() => setRefund(null)}
        title="Issue refund"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setRefund(null)}>
              Keep payment
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (tx) dispatch({ t: "refundTx", id: tx.id });
                setRefund(null);
              }}
            >
              Refund {tx ? money(tx.amount) : ""}
            </button>
          </>
        }
      >
        {tx && (
          <p style={{ color: "var(--muted)" }}>
            Refund <b style={{ color: "var(--text)" }}>{money(tx.amount)}</b> for “{tx.description}” to {P(tx.playerId)?.name ?? "the walk-in customer"}&apos;s {tx.method.toLowerCase()}. Card refunds
            take 5 to 10 business days to appear.
          </p>
        )}
      </Modal>
    </>
  );
}
