import { ImageResponse } from "next/og";

export const alt = "MyPickleball | Pickleball club management software";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  const holes = [0, 60, 120, 180, 240, 300].map((a) => {
    const r = (a * Math.PI) / 180;
    return { x: 50 + Math.cos(r) * 17, y: 50 + Math.sin(r) * 17 };
  });
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 85% 20%, #1c2a10 0%, #07090a 55%)",
          color: "#eef3ea",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="64" height="64" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="34" fill="#d4ff3f" />
            <circle cx="50" cy="50" r="5" fill="#07090a" />
            {holes.map((h, i) => (
              <circle key={i} cx={h.x} cy={h.y} r="4.4" fill="#07090a" />
            ))}
          </svg>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.5, display: "flex" }}>
            <span style={{ color: "#8f9b94", fontWeight: 500 }}>My</span>Pickleball
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>Run the club.</div>
          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1, color: "#5f6b66" }}>
            Not the whiteboard.
          </div>
          <div style={{ marginTop: 32, fontSize: 30, color: "#8f9b94" }}>
            Court booking · Open play · Coaching · Leagues · Payments
          </div>
        </div>
      </div>
    ),
    size,
  );
}
