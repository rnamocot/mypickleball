"use client";

import { useState } from "react";
import { IconArrow } from "./Icons";

export function Newsletter() {
  const [msg, setMsg] = useState("");
  return (
    <>
      <form
        className="newsletter"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          setMsg("You're on the list. One useful email a month, no spam.");
          form.reset();
        }}
      >
        <label htmlFor="nl-email" className="sr-only">
          Email address
        </label>
        <input id="nl-email" type="email" required placeholder="Club owner tips, monthly" autoComplete="email" />
        <button className="btn btn-primary btn-sm" type="submit" aria-label="Subscribe" style={{ height: 46 }}>
          <IconArrow size={18} />
        </button>
      </form>
      <p className="newsletter-msg" role="status">
        {msg}
      </p>
    </>
  );
}
