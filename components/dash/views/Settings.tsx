"use client";

import { useState } from "react";
import { type Settings as S, fmtTime, money } from "../data";
import { useStore } from "../store";
import { Field, Modal, PageHead, Panel } from "../ui";

type TimeKey = "open" | "close" | "peakStart" | "peakEnd";
const TIMES = Array.from({ length: 49 }, (_, i) => i * 30);

function TimeSel({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
      {TIMES.map((m) => (
        <option key={m} value={m}>
          {m === 24 * 60 ? "Midnight" : fmtTime(m)}
        </option>
      ))}
    </select>
  );
}

export function Settings() {
  const { state, dispatch } = useStore();
  const [draft, setDraft] = useState<S>(state.settings);
  // When saved settings change (save, reset demo, or the open play page), start the form from them.
  const [base, setBase] = useState(state.settings);
  if (state.settings !== base) {
    setBase(state.settings);
    setDraft(state.settings);
  }
  const [resetting, setResetting] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(state.settings);
  const set = <K extends keyof S>(k: K, v: S[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const time = (k: TimeKey) => <TimeSel value={draft[k]} onChange={(v) => set(k, v)} />;

  return (
    <>
      <PageHead title="Settings" sub="Club profile, hours, pricing and rules">
        <button className="btn btn-ghost btn-sm" disabled={!dirty} onClick={() => setDraft(state.settings)}>
          Discard
        </button>
        <button
          className="btn btn-primary btn-sm"
          disabled={!dirty}
          onClick={() => {
            dispatch({ t: "settings", patch: draft });
            dispatch({ t: "notice", text: "Settings saved.", tone: "good" });
          }}
        >
          Save changes
        </button>
      </PageHead>

      <div className="settings-grid">
        <nav className="settings-nav" aria-label="Settings sections">
          <a href="#club">Club profile</a>
          <a href="#hours">Hours & pricing</a>
          <a href="#rules">Open play & policies</a>
          <a href="#courts">Courts</a>
          <a href="#data">Demo data</a>
        </nav>
        <div className="stack">
          <Panel title="Club profile">
            <div className="form" id="club">
              <Field label="Club name">
                <input value={draft.clubName} onChange={(e) => set("clubName", e.target.value)} />
              </Field>
              <Field label="Address">
                <input value={draft.address} onChange={(e) => set("address", e.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel title="Hours & pricing">
            <div className="form" id="hours">
              <Field label="Opens">
                {time("open")}
              </Field>
              <Field label="Closes">
                {time("close")}
              </Field>
              <Field label="Peak starts">
                {time("peakStart")}
              </Field>
              <Field label="Peak ends">
                {time("peakEnd")}
              </Field>
              <Field label="Peak court rate (per hour)">
                <input type="number" min={0} value={draft.peakPrice} onChange={(e) => set("peakPrice", Number(e.target.value))} />
              </Field>
              <Field label="Off-peak court rate (per hour)">
                <input type="number" min={0} value={draft.offPeakPrice} onChange={(e) => set("offPeakPrice", Number(e.target.value))} />
              </Field>
              <Field label="Open play drop-in fee">
                <input type="number" min={0} value={draft.dropInFee} onChange={(e) => set("dropInFee", Number(e.target.value))} />
              </Field>
            </div>
            <p style={{ marginTop: 14, fontSize: 13, color: "var(--dim)" }}>
              Members get their plan discount automatically. Peak hour: {money(draft.peakPrice)}, off-peak: {money(draft.offPeakPrice)}.
            </p>
          </Panel>

          <Panel title="Open play & policies">
            <div className="form" id="rules">
              <Field label="Game length">
                <select value={draft.gameLength} onChange={(e) => set("gameLength", Number(e.target.value))}>
                  {[10, 12, 15, 20, 25].map((m) => (
                    <option key={m} value={m}>
                      {m} minutes
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Rotation">
                <select value={draft.queueMode} onChange={(e) => set("queueMode", e.target.value as S["queueMode"])}>
                  <option value="skill">Skill balanced</option>
                  <option value="fifo">First come, first served</option>
                </select>
              </Field>
              <Field label="Free cancellation window (hours)">
                <input type="number" min={0} value={draft.cancelHours} onChange={(e) => set("cancelHours", Number(e.target.value))} />
              </Field>
              <Field label="No-show fee">
                <input type="number" min={0} value={draft.noShowFee} onChange={(e) => set("noShowFee", Number(e.target.value))} />
              </Field>
            </div>
          </Panel>

          <Panel title="Courts" pad={false}>
            <ul className="rows" id="courts">
              {state.courts.map((c) => (
                <li key={c.id}>
                  <input
                    className="select"
                    style={{ backgroundImage: "none", maxWidth: 200 }}
                    value={c.name}
                    aria-label={`${c.name} name`}
                    onChange={(e) => dispatch({ t: "setCourt", courtId: c.id, patch: { name: e.target.value } })}
                  />
                  <select className="select" value={c.surface} aria-label={`${c.name} surface`} onChange={(e) => dispatch({ t: "setCourt", courtId: c.id, patch: { surface: e.target.value as typeof c.surface } })}>
                    <option>Indoor</option>
                    <option>Outdoor</option>
                  </select>
                  <span className="grow" />
                  <button className="link-btn" disabled={state.courts.length <= 1 || c.status === "play"} onClick={() => dispatch({ t: "removeCourt", courtId: c.id })}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Demo data">
            <div id="data" className="switch-row" style={{ borderBottom: 0, padding: 0 }}>
              <span>
                Reset the demo club
                <small>Restores courts, players, bookings and payments to the original sample data.</small>
              </span>
              <button className="btn btn-danger btn-sm" onClick={() => setResetting(true)}>
                Reset demo
              </button>
            </div>
          </Panel>
        </div>
      </div>

      <Modal
        open={resetting}
        onClose={() => setResetting(false)}
        title="Reset demo data?"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setResetting(false)}>
              Cancel
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                dispatch({ t: "reset" });
                setResetting(false);
              }}
            >
              Reset everything
            </button>
          </>
        }
      >
        <p style={{ color: "var(--muted)" }}>Everything you changed in this demo will be replaced with the original sample club. This can&apos;t be undone.</p>
      </Modal>
    </>
  );
}
