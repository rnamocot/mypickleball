"use client";

import { useState } from "react";
import { IconLight, IconPlay, IconPlus, IconStop, IconWrench } from "../../Icons";
import { Ring } from "../charts";
import { mmss, timeLeft } from "../calc";
import { CourtViz } from "../CourtViz";
import { type Court, type GameKind, fmtTime, nowMinutes, uid, ymd } from "../data";
import { PlayerPicker } from "../modals";
import { pickGroup, useNow, usePlayerLookup, useStore } from "../store";
import { Field, Modal, PageHead, Status } from "../ui";

export function Courts() {
  const { state, dispatch } = useStore();
  const now = useNow(1000);
  const P = usePlayerLookup();
  const [filter, setFilter] = useState<"all" | "Indoor" | "Outdoor">("all");
  const [startFor, setStartFor] = useState<Court | null>(null);
  const [maintFor, setMaintFor] = useState<Court | null>(null);
  const [adding, setAdding] = useState(false);

  const list = state.courts.filter((c) => filter === "all" || c.surface === filter);
  const nextGroup = pickGroup(state);
  const today = ymd(new Date());
  const nm = nowMinutes();
  const nextBooking = (courtId: string) =>
    state.bookings
      .filter((b) => b.courtId === courtId && b.date === today && b.start > nm && b.status !== "cancelled")
      .sort((a, b) => a.start - b.start)[0];

  const counts = {
    play: state.courts.filter((c) => c.status === "play").length,
    open: state.courts.filter((c) => c.status === "open").length,
    maint: state.courts.filter((c) => c.status === "maintenance").length,
  };

  return (
    <>
      <PageHead title="Courts" sub={`${counts.play} in play · ${counts.open} open · ${counts.maint} maintenance`}>
        <div className="seg" role="group" aria-label="Filter courts">
          {(["all", "Indoor", "Outdoor"] as const).map((f) => (
            <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ t: "fillCourts" })} disabled={nextGroup.length < 4 || counts.open === 0}>
          Auto-fill from queue
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
          <IconPlus size={16} /> Add court
        </button>
      </PageHead>

      <div className="courts-grid">
        {list.map((c, i) => {
          const g = c.game;
          const t = g ? timeLeft(g.startedAt, g.durationMin, now) : null;
          const over = !!t && t.left < 0;
          const soon = !!t && t.left >= 0 && t.left < 120;
          const nb = nextBooking(c.id);
          return (
            <article
              key={c.id}
              className={`court-card ${over ? "is-over" : ""} ${c.status === "open" ? "is-open" : ""}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="cc-head">
                <div>
                  <b>{c.name}</b>
                  <small>
                    {c.surface} · lights {c.lights ? "on" : "off"}
                  </small>
                </div>
                {c.status === "play" ? (
                  <Status tone={over ? "bad" : soon ? "warn" : "good"}>{over ? "Over time" : soon ? "Ending soon" : "In play"}</Status>
                ) : c.status === "maintenance" ? (
                  <Status tone="warn">Maintenance</Status>
                ) : (
                  <Status tone="neon">Open</Status>
                )}
              </div>
              <div className="cc-viz">
                <CourtViz court={c} players={g?.playerIds.map(P) ?? []} />
              </div>
              <div className="cc-body">
                {g && t ? (
                  <div className="cc-game">
                    <Ring pct={t.pct} size={52} tone={over ? "bad" : soon ? "warn" : g.kind === "lesson" ? "blue" : "neon"}>
                      {Math.round(t.pct * 100)}%
                    </Ring>
                    <div className="grow">
                      <b>{g.label}</b>
                      <small>
                        {g.kind === "lesson" ? "Coaching session" : g.playerIds.map((id) => P(id)?.name.split(" ")[0]).join(" · ")}
                      </small>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 600, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em", color: over ? "var(--coral)" : undefined }}>
                        {mmss(t.left)}
                      </div>
                      <small style={{ color: "var(--dim)", fontSize: 12 }}>{over ? "over" : "left"}</small>
                    </div>
                  </div>
                ) : c.status === "maintenance" ? (
                  <p className="cc-next">{c.note ?? "Blocked for maintenance."}</p>
                ) : (
                  <p className="cc-next">
                    {nb ? `Next booking ${fmtTime(nb.start)}: ${nb.title}` : "No more bookings today."}
                  </p>
                )}

                <div className="cc-actions">
                  {c.status === "play" && (
                    <>
                      <button className="btn btn-primary btn-xs" onClick={() => dispatch({ t: "endGame", courtId: c.id })}>
                        <IconStop size={14} /> End game
                      </button>
                      <button className="btn btn-ghost btn-xs" onClick={() => dispatch({ t: "extendGame", courtId: c.id, minutes: 5 })}>
                        +5 min
                      </button>
                    </>
                  )}
                  {c.status === "open" && (
                    <>
                      <button
                        className="btn btn-primary btn-xs"
                        disabled={nextGroup.length < 4}
                        onClick={() =>
                          dispatch({ t: "startGame", courtId: c.id, playerIds: nextGroup, label: "Open play", kind: "open", durationMin: state.settings.gameLength })
                        }
                      >
                        <IconPlay size={14} /> Next group
                      </button>
                      <button className="btn btn-ghost btn-xs" onClick={() => setStartFor(c)}>
                        Start custom
                      </button>
                    </>
                  )}
                  {c.status === "maintenance" ? (
                    <button className="btn btn-ghost btn-xs" onClick={() => dispatch({ t: "setCourt", courtId: c.id, patch: { status: "open" } })}>
                      Reopen court
                    </button>
                  ) : (
                    <button className="icon-btn sm" aria-label={`Mark ${c.name} for maintenance`} title="Maintenance" onClick={() => setMaintFor(c)}>
                      <IconWrench size={16} />
                    </button>
                  )}
                  <button
                    className="icon-btn sm"
                    aria-label={`Turn ${c.name} lights ${c.lights ? "off" : "on"}`}
                    aria-pressed={c.lights}
                    title="Lights"
                    style={c.lights ? { color: "var(--neon)", borderColor: "rgba(212,255,63,.35)" } : undefined}
                    onClick={() => dispatch({ t: "setCourt", courtId: c.id, patch: { lights: !c.lights } })}
                  >
                    <IconLight size={16} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <StartGameModal court={startFor} onClose={() => setStartFor(null)} />
      <MaintenanceModal court={maintFor} onClose={() => setMaintFor(null)} />
      <AddCourtModal open={adding} onClose={() => setAdding(false)} />
    </>
  );
}

function StartGameModal({ court, onClose }: { court: Court | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [sel, setSel] = useState<string[]>([]);
  const [kind, setKind] = useState<GameKind>("booking");
  const [label, setLabel] = useState("");
  const [mins, setMins] = useState(60);
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const close = () => {
    setSel([]);
    setLabel("");
    onClose();
  };
  return (
    <Modal
      open={!!court}
      onClose={close}
      title={`Start on ${court?.name ?? ""}`}
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={close}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            disabled={sel.length === 0}
            onClick={() => {
              if (!court) return;
              dispatch({
                t: "startGame",
                courtId: court.id,
                playerIds: sel,
                kind,
                durationMin: mins,
                label: label || (kind === "open" ? "Open play" : kind === "lesson" ? "Coaching session" : `Booking: ${sel.map((id) => state.players.find((p) => p.id === id)?.name.split(" ")[1]).join(" / ")}`),
              });
              close();
            }}
          >
            Start timer
          </button>
        </>
      }
    >
      <div className="form" style={{ marginBottom: 16 }}>
        <Field label="Type">
          <select value={kind} onChange={(e) => setKind(e.target.value as GameKind)}>
            <option value="booking">Court booking</option>
            <option value="open">Open play</option>
            <option value="lesson">Lesson / clinic</option>
          </select>
        </Field>
        <Field label="Length">
          <select value={mins} onChange={(e) => setMins(Number(e.target.value))}>
            {[11, 15, 20, 30, 45, 60, 90, 120].map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
        </Field>
        <Field label="Label (optional)" full>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Challenge court" />
        </Field>
      </div>
      <div className="section-title" style={{ marginTop: 0 }}>
        Players · {sel.length} selected
      </div>
      <PlayerPicker selected={sel} onToggle={toggle} max={kind === "lesson" ? 12 : 4} />
    </Modal>
  );
}

function MaintenanceModal({ court, onClose }: { court: Court | null; onClose: () => void }) {
  const { dispatch } = useStore();
  const [note, setNote] = useState("Resurfacing");
  return (
    <Modal
      open={!!court}
      onClose={onClose}
      title={`Block ${court?.name ?? ""}`}
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (court) {
                dispatch({ t: "setCourt", courtId: court.id, patch: { status: "maintenance", note } });
                dispatch({ t: "notice", text: `${court.name} blocked: ${note}.`, tone: "warn" });
              }
              onClose();
            }}
          >
            Block court
          </button>
        </>
      }
    >
      <p style={{ color: "var(--muted)", marginBottom: 16 }}>
        Any game in progress ends, and players can&apos;t book this court until you reopen it.
      </p>
      <div className="form" style={{ gridTemplateColumns: "1fr" }}>
        <Field label="Reason">
          <select value={note} onChange={(e) => setNote(e.target.value)}>
            {["Resurfacing", "Net strap replacement", "Wet court", "Lighting repair", "Private event"].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </Field>
      </div>
    </Modal>
  );
}

function AddCourtModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [name, setName] = useState("");
  const [surface, setSurface] = useState<Court["surface"]>("Indoor");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a court"
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              dispatch({ t: "addCourt", court: { id: uid("c"), name: name || `Court ${state.courts.length + 1}`, surface, status: "open", lights: false } });
              setName("");
              onClose();
            }}
          >
            Add court
          </button>
        </>
      }
    >
      <div className="form">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={`Court ${state.courts.length + 1}`} />
        </Field>
        <Field label="Surface">
          <select value={surface} onChange={(e) => setSurface(e.target.value as Court["surface"])}>
            <option>Indoor</option>
            <option>Outdoor</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}
