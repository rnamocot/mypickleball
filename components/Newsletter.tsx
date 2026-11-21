"use client";

import { useState } from "react";
import { IconArrow } from "./Icons";
import { submitLead } from "./submitLead";

export function Newsletter() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <form
        className="newsletter"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
          setBusy(true);
          const err = await submitLead({ ...data, kind: "newsletter" });
          setBusy(false);
          setMsg(err ?? "You're on the list. One useful email a month, no spam.");
          if (!err) form.reset();
        }}
      >
        <label htmlFor="nl-email" className="sr-only">
          Email address
        </label>
        <input id="nl-email" name="email" type="email" required placeholder="Club owner tips, monthly" autoComplete="email" />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
        <button className="btn btn-primary btn-sm" type="submit" aria-label="Subscribe" disabled={busy} style={{ height: 46 }}>
          <IconArrow size={18} />
        </button>
      </form>
      <p className="newsletter-msg" role="status">
        {msg}
      </p>
    </>
  );
}
