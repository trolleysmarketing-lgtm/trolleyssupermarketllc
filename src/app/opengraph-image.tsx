import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Trolleys Supermarket UAE";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0e76bc 0%, #064a7a 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background pattern */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        {/* Logo placeholder */}
        <div style={{ width: 120, height: 120, borderRadius: 24, background: "white", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32, fontSize: 48 }}>
          🛒
        </div>

        <div style={{ fontSize: 56, fontWeight: 800, color: "white", marginBottom: 16, letterSpacing: "-2px" }}>
          Trolleys Supermarket
        </div>

        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", marginBottom: 32 }}>
          Fresh Groceries & Weekly Offers
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["Dubai", "Sharjah", "Ajman"].map(city => (
            <div key={city} style={{ background: "rgba(255,255,255,0.15)", padding: "10px 24px", borderRadius: 50, color: "white", fontSize: 20, fontWeight: 600 }}>
              {city}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}