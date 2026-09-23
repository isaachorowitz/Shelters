import { ImageResponse } from "next/og"

export const alt = "Get Shelter - Emergency Bomb Shelter Locator for Israel"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Red glow effect */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Shield icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "#DC2626",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            boxShadow: "0 0 60px rgba(220,38,38,0.4)",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 900,
            color: "white",
            letterSpacing: "-1px",
            marginBottom: "8px",
          }}
        >
          GET SHELTER
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.6)",
            marginBottom: "40px",
          }}
        >
          Emergency Bomb Shelter Locator for Israel
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: "40px",
          }}
        >
          {[
            { value: "2,939", label: "Shelters" },
            { value: "10+", label: "Data Sources" },
            { value: "100%", label: "Free" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: 900,
                  color: "#DC2626",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            fontSize: "16px",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "2px",
          }}
        >
          getshelter.app
        </div>
      </div>
    ),
    { ...size }
  )
}
