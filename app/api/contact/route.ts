import { NextResponse } from "next/server";

/**
 * Receives demo requests and newsletter sign-ups.
 * Sends an email through Resend when RESEND_API_KEY and CONTACT_TO are set;
 * otherwise the submission is logged on the server so nothing is lost in development.
 */

type Body = {
  kind?: "demo" | "newsletter";
  name?: string;
  email?: string;
  club?: string;
  courts?: string;
  role?: string;
  phone?: string;
  message?: string;
  website?: string; // honeypot: real people leave this empty
};

const hits = new Map<string, number[]>();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "Too many requests. Try again in a minute." }, { status: 429 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (clean(body.website)) return NextResponse.json({ ok: true }); // bot: pretend success

  const kind = body.kind === "newsletter" ? "newsletter" : "demo";
  const email = clean(body.email, 200);
  const name = clean(body.name, 120);
  if (!EMAIL.test(email)) return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  if (kind === "demo" && !name) return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });

  const fields: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Club", clean(body.club, 160)],
    ["Courts", clean(body.courts, 40)],
    ["Role", clean(body.role, 40)],
    ["Phone", clean(body.phone, 40)],
    ["Message", clean(body.message)],
  ].filter(([, v]) => v) as [string, string][];

  const subject = kind === "newsletter" ? `Newsletter sign-up: ${email}` : `Demo request: ${name}${body.club ? ` (${clean(body.club, 160)})` : ""}`;
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;

  if (!key || !to) {
    console.info(`[contact] ${subject}`, Object.fromEntries(fields));
    return NextResponse.json({ ok: true, delivered: false });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || "MyPickleball <onboarding@resend.dev>",
      to: to.split(",").map((s) => s.trim()),
      reply_to: email,
      subject,
      text: fields.map(([k, v]) => `${k}: ${v}`).join("\n"),
      html: `<table>${fields.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>`,
    }),
  });

  if (!res.ok) {
    console.error("[contact] Resend error", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ ok: false, error: "We couldn't send that right now. Please email us instead." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, delivered: true });
}
