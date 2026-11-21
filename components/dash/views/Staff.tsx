"use client";

import { useState } from "react";
import { IconCheck, IconUserPlus } from "../../Icons";
import { type Staff as StaffT, type StaffRole, fmtShortTime, nowMinutes, uid } from "../data";
import { useStore } from "../store";
import { Avatar, Field, Modal, PageHead, Panel, Status } from "../ui";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const ROLES: StaffRole[] = ["Owner", "Manager", "Coach", "Front desk"];

const PERMS: [string, boolean[]][] = [
  ["Check in players & run the queue", [true, true, true, true]],
  ["Create and edit bookings", [true, true, true, true]],
  ["Take payments at the desk", [true, true, false, true]],
  ["Manage own lessons & availability", [true, true, true, false]],
  ["Issue refunds", [true, true, false, false]],
  ["Edit prices, memberships & courts", [true, true, false, false]],
  ["View revenue reports", [true, true, false, false]],
  ["Manage staff & payouts", [true, false, false, false]],
];

export function Staff() {
  const { state, dispatch } = useStore();
  const [inviting, setInviting] = useState(false);
  const today = new Date().getDay();
  const nm = nowMinutes();
  const onShift = (s: StaffT) => s.active && s.shifts.some((x) => x.day === today && x.start <= nm && x.end > nm);
  const hours = (s: StaffT) => s.shifts.reduce((a, x) => a + (x.end - x.start) / 60, 0);

  return (
    <>
      <PageHead title="Staff" sub={`${state.staff.filter((s) => s.active).length} active · ${state.staff.filter(onShift).length} on shift now`}>
        <button className="btn btn-primary btn-sm" onClick={() => setInviting(true)}>
          <IconUserPlus size={16} /> Invite staff
        </button>
      </PageHead>

      <Panel pad={false}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Now</th>
                <th>Contact</th>
                <th className="num">Hours / week</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {state.staff.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="who">
                      <Avatar name={s.name} hue={s.hue} size={32} />
                      <span>
                        <b>{s.name}</b>
                        <small>{s.email}</small>
                      </span>
                    </span>
                  </td>
                  <td>
                    {s.role === "Owner" ? (
                      "Owner"
                    ) : (
                      <select className="select" style={{ height: 34 }} value={s.role} aria-label={`${s.name} role`} onChange={(e) => dispatch({ t: "updateStaff", id: s.id, patch: { role: e.target.value as StaffRole } })}>
                        {ROLES.filter((r) => r !== "Owner").map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>{!s.active ? <Status tone="idle">Deactivated</Status> : onShift(s) ? <Status tone="neon">On shift</Status> : <Status tone="idle">Off</Status>}</td>
                  <td className="muted">{s.phone}</td>
                  <td className="num">{hours(s)}</td>
                  <td>
                    {s.role !== "Owner" && (
                      <button className="link-btn" onClick={() => dispatch({ t: "updateStaff", id: s.id, patch: { active: !s.active } })}>
                        {s.active ? "Deactivate" : "Reactivate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel className="mt" title="This week's shifts" pad={false}>
        <div className="table-wrap">
          <div className="week">
            <div className="wh wn">Staff</div>
            {ORDER.map((d) => (
              <div key={d} className={`wh ${d === today ? "today" : ""}`}>
                {DAYS[d]}
              </div>
            ))}
            {state.staff
              .filter((s) => s.active)
              .map((s) => (
                <Row key={s.id} s={s} />
              ))}
          </div>
        </div>
      </Panel>

      <Panel className="mt" title="Role permissions" pad={false}>
        <div className="table-wrap">
          <table className="table perm">
            <thead>
              <tr>
                <th>Permission</th>
                {ROLES.map((r) => (
                  <th key={r}>{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMS.map(([label, on]) => (
                <tr key={label}>
                  <td>{label}</td>
                  {on.map((v, i) => (
                    <td key={i}>
                      {v ? (
                        <>
                          <IconCheck size={18} />
                          <span className="sr-only">Allowed</span>
                        </>
                      ) : (
                        <span style={{ color: "var(--dim)" }} aria-label="Not allowed">
                          ·
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Invite open={inviting} onClose={() => setInviting(false)} />
    </>
  );
}

function Row({ s }: { s: StaffT }) {
  return (
    <>
      <div className="wn">
        <span className="who">
          <Avatar name={s.name} hue={s.hue} size={26} />
          <span>
            <b style={{ fontSize: 13 }}>{s.name.split(" ")[0]}</b>
            <small>{s.role}</small>
          </span>
        </span>
      </div>
      {ORDER.map((d) => {
        const sh = s.shifts.filter((x) => x.day === d);
        return (
          <div key={d}>
            {sh.map((x, i) => (
              <span key={i} className={`shift r-${s.role.replace(" ", "")}`}>
                {fmtShortTime(x.start)}–{fmtShortTime(x.end)}
              </span>
            ))}
          </div>
        );
      })}
    </>
  );
}

function Invite({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useStore();
  const [f, setF] = useState({ name: "", email: "", role: "Front desk" as StaffRole });
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite staff"
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            disabled={!f.name.trim() || !f.email.includes("@")}
            onClick={() => {
              dispatch({ t: "addStaff", staff: { id: uid("s"), name: f.name.trim(), email: f.email, role: f.role, phone: "", active: true, shifts: [], hue: Math.floor(Math.random() * 360) } });
              setF({ name: "", email: "", role: "Front desk" });
              onClose();
            }}
          >
            Send invite
          </button>
        </>
      }
    >
      <div className="form">
        <Field label="Name" full>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Sam Lee" />
        </Field>
        <Field label="Email">
          <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="sam@yourclub.com" />
        </Field>
        <Field label="Role">
          <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as StaffRole })}>
            {ROLES.filter((r) => r !== "Owner").map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
      </div>
      <p style={{ marginTop: 14, fontSize: 13, color: "var(--dim)" }}>They&apos;ll get an email to set a password and download the staff app.</p>
    </Modal>
  );
}
