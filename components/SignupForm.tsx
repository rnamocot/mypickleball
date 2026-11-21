"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconArrow, IconCheck } from "./Icons";

export function SignupForm({ signin, plan }: { signin: boolean; plan?: string }) {
  const [done, setDone] = useState(false);
  const router = useRouter();

  if (done)
    return (
      <div className="success" role="status">
        <span className="big-check">
          <IconCheck size={30} />
        </span>
        <h2 className="h3">{signin ? "Welcome back." : "Your club is warming up."}</h2>
        <p className="lead" style={{ marginTop: 14, fontSize: 16 }}>
          Opening your club dashboard. We loaded a sample club so you can try every feature.
        </p>
      </div>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
        setTimeout(() => router.push("/dashboard"), 1200);
      }}
      style={{ display: "grid", gap: 16 }}
    >
      {!signin && (
        <>
          <div className="field">
            <label htmlFor="su-name">Your name</label>
            <input id="su-name" required autoComplete="name" placeholder="Jordan Rivera" />
          </div>
          <div className="field">
            <label htmlFor="su-club">Club name</label>
            <input id="su-club" required autoComplete="organization" placeholder="Dink District" />
          </div>
        </>
      )}
      <div className="field">
        <label htmlFor="su-email">Email</label>
        <input id="su-email" type="email" required autoComplete="email" placeholder="you@yourclub.com" />
      </div>
      <div className="field">
        <label htmlFor="su-pass">Password</label>
        <input
          id="su-pass"
          type="password"
          required
          minLength={8}
          autoComplete={signin ? "current-password" : "new-password"}
          placeholder="At least 8 characters"
        />
      </div>
      {plan && !signin && <input type="hidden" name="plan" value={plan} />}
      <button className="btn btn-primary btn-block" type="submit" style={{ marginTop: 8 }}>
        {signin ? "Sign in" : "Create my club"} <IconArrow size={18} />
      </button>
      <p className="auth-small">
        {signin ? (
          <>
            New to MyPickleball? <Link href="/signup">Start a free trial</Link>
          </>
        ) : (
          <>
            Already have an account? <Link href="/signup?mode=signin">Sign in</Link>. By continuing you agree to our{" "}
            <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
          </>
        )}
      </p>
    </form>
  );
}
