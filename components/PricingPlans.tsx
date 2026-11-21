"use client";

import Link from "next/link";
import { useState } from "react";
import { plans } from "@/lib/site";
import { IconArrow, IconCheck } from "./Icons";

export function PricingPlans() {
  const [yearly, setYearly] = useState(true);

  return (
    <div>
      <div className="billing-toggle" data-reveal>
        <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)}>
          Monthly
        </button>
        <button
          type="button"
          role="switch"
          className="switch"
          aria-checked={yearly}
          aria-label="Bill yearly"
          onClick={() => setYearly((y) => !y)}
        />
        <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)}>
          Yearly
        </button>
        <span className="save-note">Save 20%</span>
      </div>

      <div className="plans">
        {plans.map((p, i) => {
          const price = yearly ? p.yearly : p.monthly;
          return (
            <article
              key={p.id}
              className={`plan ${p.featured ? "featured" : ""}`}
              data-reveal
              style={{ ["--d" as string]: `${i * 0.1}s` }}
            >
              <div className="plan-top">
                <h3 className="plan-name">{p.name}</h3>
                {p.featured && <span className="plan-flag">Most clubs pick this</span>}
              </div>
              <p className="plan-blurb">{p.blurb}</p>
              <div className="plan-price">
                <span className="amt">
                  $<span className="amt-roll" key={price}>{price}</span>
                </span>
                <span className="per">/ month</span>
              </div>
              <p className="plan-courts">
                {p.courts}
                <span style={{ color: "var(--dim)" }}>{yearly ? " · billed yearly" : " · billed monthly"}</span>
              </p>
              <Link
                href={p.id === "facility" ? "/contact" : `/signup?plan=${p.id}`}
                className={`btn btn-block ${p.featured ? "btn-primary" : "btn-ghost"}`}
              >
                {p.cta} <IconArrow size={18} />
              </Link>
              <ul className="check-list">
                {p.features.map((f) => (
                  <li key={f}>
                    <IconCheck size={18} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
