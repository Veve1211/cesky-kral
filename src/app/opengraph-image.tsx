import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Open Graph preview (generated at build time).
export const alt = "Český král – kvíz o českých panovnících";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#14213d";
const GOLD = "#c9a227";
const PARCHMENT = "#f5efe0";

export default async function OpenGraphImage() {
  const [gothic, inter] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/GrenzeGotisch-Bold.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Inter-Medium.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: NAVY,
          padding: 28,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: `4px solid ${GOLD}`,
            borderRadius: 24,
            outline: `1px solid ${GOLD}`,
            outlineOffset: -14,
            background: `radial-gradient(circle at 50% 40%, #22335c 0%, ${NAVY} 70%)`,
            color: PARCHMENT,
          }}
        >
          <svg width="120" height="90" viewBox="0 0 48 36">
            <path d="M4 30 L8 10 L17 20 L24 4 L31 20 L40 10 L44 30 Z" fill={GOLD} />
            <rect x="4" y="30" width="40" height="4" rx="1" fill={GOLD} />
            <circle cx="8" cy="9" r="2.5" fill={GOLD} />
            <circle cx="24" cy="4" r="2.5" fill={GOLD} />
            <circle cx="40" cy="9" r="2.5" fill={GOLD} />
            <circle cx="24" cy="23" r="2.2" fill={NAVY} />
          </svg>
          <div
            style={{
              fontFamily: "Grenze Gotisch",
              fontSize: 150,
              color: GOLD,
              lineHeight: 1.05,
              marginTop: 8,
            }}
          >
            Český král
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, margin: "18px 0" }}>
            <div style={{ width: 160, height: 2, background: GOLD }} />
            <div style={{ width: 16, height: 16, background: GOLD, transform: "rotate(45deg)" }} />
            <div style={{ width: 160, height: 2, background: GOLD }} />
          </div>
          <div
            style={{
              fontFamily: "Inter",
              fontSize: 38,
              color: PARCHMENT,
              textAlign: "center",
              maxWidth: 900,
            }}
          >
            Kvíz o českých panovnících. Odpovídej a sbírej krále jako karty.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Grenze Gotisch", data: gothic, style: "normal", weight: 700 },
        { name: "Inter", data: inter, style: "normal", weight: 500 },
      ],
    },
  );
}
