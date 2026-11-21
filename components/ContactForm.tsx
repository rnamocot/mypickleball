"use client";

import { useState } from "react";
import { IconArrow, IconCheck } from "./Icons";

export function ContactForm() {
  const [sent, setSent] = useState<string | null>(null);

  if (sent)
    return (
      <div className="success" role="status">
        <span className="big-check">
          <IconCheck size={30} />
        </span>
        <h2 className="h3">Thanks, {sent}. We&apos;ll be in touch within one business day.</h2>
        <p className="lead" style={{ marginTop: 14, fontSize: 16 }}>
          Someone from our team who has actually run a club desk will reach out to schedule your demo.
        </p>
      </div>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setSent(String(data.get("name") || "").split(" ")[0] || "friend");
      }}
    >
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" required autoComplete="name" placeholder="Jordan Rivera" />
        </div>
        <div className="field">
          <label htmlFor="email">Work email</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="jordan@yourclub.com" />
        </div>
        <div className="field">
          <label htmlFor="club">Club or facility</label>
          <input id="club" name="club" required autoComplete="organization" placeholder="Dink District" />
        </div>
        <div className="field">
          <label htmlFor="courts">Number of courts</label>
          <select id="courts" name="courts" defaultValue="">
            <option value="" disabled>
              Select
            </option>
            <option>1–4</option>
            <option>5–8</option>
            <option>9–16</option>
            <option>17+ or multiple sites</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="role">Your role</label>
          <select id="role" name="role" defaultValue="">
            <option value="" disabled>
              Select
            </option>
            <option>Owner</option>
            <option>Manager</option>
            <option>Organizer</option>
            <option>Coach</option>
            <option>Other</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="phone">Phone (optional)</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+1 555 000 0000" />
        </div>
        <div className="field full">
          <label htmlFor="msg">What would you like to fix first?</label>
          <textarea
            id="msg"
            name="msg"
            placeholder="Open play is chaos on weekends, and our coaches book courts in a shared spreadsheet…"
          />
        </div>
      </div>
      <button type="submit" className="btn btn-primary" style={{ marginTop: 24 }}>
        Request my demo <IconArrow size={18} />
      </button>
    </form>
  );
}
