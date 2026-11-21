/** Posts a demo request or newsletter sign-up to /api/contact. Returns an error message, or null on success. */
export async function submitLead(data: Record<string, string>): Promise<string | null> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    return res.ok && json.ok ? null : json.error || "Something went wrong. Please try again.";
  } catch {
    return "You seem to be offline. Please try again.";
  }
}
