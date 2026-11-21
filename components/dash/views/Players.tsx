"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { IconDownload, IconUserPlus } from "../../Icons";
import { type Player, fmtDate, fmtTime, money, stamp, uid, ymd } from "../data";
import { useStore } from "../store";
import { Avatar, Drawer, Empty, Field, Modal, PageHead, Panel, SearchInput, Status, Tabs } from "../ui";

type Filter = "all" | "members" | "dropin" | "balance";
type Sort = "name" | "rating" | "games" | "recent";

export function Players() {
  const { state } = useStore();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [filter, setFilter] = useState<Filter>((params.get("filter") as Filter) || "all");
  const [sort, setSort] = useState<Sort>("recent");
  const [sel, setSel] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Follow ?q= links from the top bar search.
  const urlQ = params.get("q") ?? "";
  const [lastQ, setLastQ] = useState(urlQ);
  if (urlQ !== lastQ) {
    setLastQ(urlQ);
    setQ(urlQ);
  }

  const plan = (id: string | null) => state.plans.find((p) => p.id === id);
  const list = useMemo(() => {
    let l = state.players;
    if (filter === "members") l = l.filter((p) => p.planId);
    if (filter === "dropin") l = l.filter((p) => !p.planId);
    if (filter === "balance") l = l.filter((p) => p.balance > 0);
    if (q) {
      const s = q.toLowerCase();
      l = l.filter((p) => p.name.toLowerCase().includes(s) || p.email.includes(s) || p.phone.includes(s));
    }
    const sorters: Record<Sort, (a: Player, b: Player) => number> = {
      name: (a, b) => a.name.localeCompare(b.name),
      rating: (a, b) => b.rating - a.rating,
      games: (a, b) => b.games - a.games,
      recent: (a, b) => b.lastVisit.localeCompare(a.lastVisit),
    };
    return [...l].sort(sorters[sort]);
  }, [state.players, filter, q, sort]);

  const exportCsv = () => {
    const rows = [["Name", "Email", "Phone", "Rating", "Membership", "Games", "Minutes", "Last visit"]].concat(
      list.map((p) => [p.name, p.email, p.phone, p.rating.toFixed(2), plan(p.planId)?.name ?? "Drop-in", String(p.games), String(p.minutes), p.lastVisit]),
    );
    const blob = new Blob([rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "players.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <PageHead title="Players" sub={`${state.players.length} players · ${state.players.filter((p) => p.planId).length} members`}>
        <button className="btn btn-ghost btn-sm" onClick={exportCsv}>
          <IconDownload size={16} /> Export CSV
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
          <IconUserPlus size={16} /> Add player
        </button>
      </PageHead>

      <Panel pad={false}>
        <div style={{ padding: "8px 20px 0", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Tabs
            label="Player filter"
            value={filter}
            onChange={setFilter}
            items={[
              { value: "all", label: "All", count: state.players.length },
              { value: "members", label: "Members", count: state.players.filter((p) => p.planId).length },
              { value: "dropin", label: "Drop-in", count: state.players.filter((p) => !p.planId).length },
              { value: "balance", label: "Owes balance", count: state.players.filter((p) => p.balance > 0).length },
            ]}
          />
          <div style={{ display: "flex", gap: 8, paddingBottom: 8, flexWrap: "wrap", maxWidth: "100%" }}>
            <SearchInput value={q} onChange={setQ} placeholder="Search name, email, phone" />
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort players">
              <option value="recent">Recent visit</option>
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="games">Games played</option>
            </select>
          </div>
        </div>
        {list.length === 0 ? (
          <Empty title="No players found" text="Try another search or filter." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Rating</th>
                  <th>Membership</th>
                  <th className="num">Games (30d)</th>
                  <th className="num">Play time</th>
                  <th>Last visit</th>
                  <th className="num">Balance</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="click" onClick={() => setSel(p.id)}>
                    <td>
                      <span className="who">
                        <Avatar name={p.name} hue={p.hue} size={32} />
                        <span>
                          <b>{p.name}</b>
                          <small>{p.email}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className="rating" style={{ color: "var(--text)" }}>
                        {p.rating.toFixed(2)}
                      </span>
                    </td>
                    <td>{p.planId ? <Status tone="good">{plan(p.planId)?.name}</Status> : <Status tone="idle">Drop-in</Status>}</td>
                    <td className="num">{p.games}</td>
                    <td className="num muted">{Math.round(p.minutes / 60)} h</td>
                    <td className="muted">{p.lastVisit === ymd(new Date()) ? "Today" : fmtDate(p.lastVisit)}</td>
                    <td className="num">{p.balance > 0 ? <span style={{ color: "var(--warn)" }}>{money(p.balance)}</span> : <span className="muted">$0</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <PlayerDrawer id={sel} onClose={() => setSel(null)} />
      <AddPlayer open={adding} onClose={() => setAdding(false)} />
    </>
  );
}

function PlayerDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const p = state.players.find((x) => x.id === id);
  if (!p) return null;
  const today = ymd(new Date());
  const upcoming = state.bookings.filter((b) => b.playerId === p.id && b.date >= today && b.status === "confirmed").sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
  const txs = state.transactions.filter((t) => t.playerId === p.id).slice(0, 6);
  const spent = state.transactions.filter((t) => t.playerId === p.id && t.status === "paid").reduce((a, t) => a + t.amount, 0);
  const lessons = state.lessons.filter((l) => l.enrolled.includes(p.id) && l.date >= today);
  const queued = state.queue.some((q) => q.playerId === p.id);

  return (
    <Drawer
      open
      onClose={onClose}
      title="Player profile"
      footer={
        <>
          {p.balance > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                dispatch({ t: "addTx", tx: { id: uid("t"), at: stamp(), playerId: p.id, description: "Balance payment", category: "Court", amount: p.balance, method: "Card", status: "paid" } });
                dispatch({ t: "updatePlayer", id: p.id, patch: { balance: 0 } });
              }}
            >
              Collect {money(p.balance)}
            </button>
          )}
          <button className="btn btn-primary btn-sm" disabled={queued} onClick={() => dispatch({ t: "checkIn", playerId: p.id })}>
            {queued ? "In open play" : "Check in to open play"}
          </button>
        </>
      }
    >
      <div className="who" style={{ gap: 14 }}>
        <Avatar name={p.name} hue={p.hue} size={56} />
        <span>
          <b style={{ fontSize: 20, letterSpacing: "-0.03em" }}>{p.name}</b>
          <small>
            Member since {fmtDate(p.joined, { month: "short", year: "numeric" })}
          </small>
        </span>
      </div>

      <div className="card-stats" style={{ borderTop: 0, marginTop: 20, paddingTop: 0 }}>
        <div>
          <b>{p.rating.toFixed(2)}</b>
          <span>Rating</span>
        </div>
        <div>
          <b>{p.games}</b>
          <span>Games · 30d</span>
        </div>
        <div>
          <b>{money(spent)}</b>
          <span>Spent · 30d</span>
        </div>
      </div>

      <div className="section-title">Details</div>
      <div className="form">
        <Field label="Skill rating">
          <select value={p.rating} onChange={(e) => dispatch({ t: "updatePlayer", id: p.id, patch: { rating: Number(e.target.value) } })}>
            {Array.from({ length: 13 }, (_, i) => 2 + i * 0.25).map((r) => (
              <option key={r} value={r}>
                {r.toFixed(2)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Membership">
          <select
            value={p.planId ?? ""}
            onChange={(e) =>
              dispatch({
                t: "updatePlayer",
                id: p.id,
                patch: { planId: e.target.value || null, renewsOn: e.target.value ? ymd(new Date(Date.now() + 30 * 864e5)) : null },
              })
            }
          >
            <option value="">Drop-in (no plan)</option>
            {state.plans.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.name} · {money(pl.price)}/{pl.interval === "month" ? "mo" : "yr"}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <dl className="dl" style={{ marginTop: 16 }}>
        <dt>Email</dt>
        <dd>{p.email}</dd>
        <dt>Phone</dt>
        <dd>{p.phone}</dd>
        {p.renewsOn && (
          <>
            <dt>Renews</dt>
            <dd>{fmtDate(p.renewsOn, { month: "long", day: "numeric" })}</dd>
          </>
        )}
        <dt>Play time</dt>
        <dd>{Math.round(p.minutes / 60)} hours in the last 30 days</dd>
      </dl>

      <div className="section-title">Upcoming</div>
      {upcoming.length + lessons.length === 0 && <p style={{ color: "var(--dim)", fontSize: 13.5 }}>No upcoming bookings.</p>}
      <ul className="rows" style={{ margin: "0 -20px" }}>
        {upcoming.slice(0, 4).map((b) => (
          <li key={b.id}>
            <span className="t">{fmtDate(b.date)}</span>
            <span className="grow">
              {b.title} · {fmtTime(b.start)}
            </span>
          </li>
        ))}
        {lessons.slice(0, 3).map((l) => (
          <li key={l.id}>
            <span className="t">{fmtDate(l.date)}</span>
            <span className="grow">
              {l.title} · {fmtTime(l.start)}
            </span>
          </li>
        ))}
      </ul>

      <div className="section-title">Recent payments</div>
      {txs.length === 0 && <p style={{ color: "var(--dim)", fontSize: 13.5 }}>No payments yet.</p>}
      <ul className="rows" style={{ margin: "0 -20px" }}>
        {txs.map((t) => (
          <li key={t.id}>
            <span className="t">{new Date(t.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            <span className="grow">{t.description}</span>
            <span className={`amt ${t.status === "refunded" ? "strike" : ""}`}>{money(t.amount)}</span>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}

function AddPlayer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [f, setF] = useState({ name: "", email: "", phone: "", rating: 3, planId: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: k === "rating" ? Number(e.target.value) : e.target.value });
  const save = () => {
    if (!f.name.trim()) return;
    const today = ymd(new Date());
    dispatch({
      t: "addPlayer",
      player: {
        id: uid("p"),
        name: f.name.trim(),
        email: f.email,
        phone: f.phone,
        rating: f.rating,
        planId: f.planId || null,
        renewsOn: f.planId ? ymd(new Date(Date.now() + 30 * 864e5)) : null,
        joined: today,
        lastVisit: today,
        games: 0,
        minutes: 0,
        balance: 0,
        hue: Math.floor(Math.random() * 360),
      },
    });
    setF({ name: "", email: "", phone: "", rating: 3, planId: "" });
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add player"
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={!f.name.trim()}>
            Add player
          </button>
        </>
      }
    >
      <div className="form">
        <Field label="Full name" full>
          <input value={f.name} onChange={set("name")} placeholder="Jordan Rivera" />
        </Field>
        <Field label="Email">
          <input type="email" value={f.email} onChange={set("email")} placeholder="jordan@mail.com" />
        </Field>
        <Field label="Phone">
          <input value={f.phone} onChange={set("phone")} placeholder="(512) 555-0100" />
        </Field>
        <Field label="Skill rating">
          <select value={f.rating} onChange={set("rating")}>
            {Array.from({ length: 13 }, (_, i) => 2 + i * 0.25).map((r) => (
              <option key={r} value={r}>
                {r.toFixed(2)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Membership">
          <select value={f.planId} onChange={set("planId")}>
            <option value="">Drop-in</option>
            {state.plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </Modal>
  );
}
