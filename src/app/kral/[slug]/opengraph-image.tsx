import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { connection } from "next/server";
import sharp from "sharp";

import { safeKingImage } from "@/lib/king-image";
import { getKingBySlug, kingInitial } from "@/lib/kings";

// Open Graph preview of one ruler's page: portrait in a gilded frame, name,
// title and an invitation to play. Reign years are left out on purpose –
// they are the answers of "Kdo vládl dřív?".
export const alt = "Český král – hra o kartu panovníka";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#14213d";
const GOLD = "#c9a227";
const PARCHMENT = "#f5efe0";

/** Portraits are webp, which the OG renderer can't read – convert to PNG. */
async function portraitDataUrl(imageUrl: string | null): Promise<string | null> {
  const safe = safeKingImage(imageUrl);
  if (!safe) return null;
  try {
    const file = await readFile(join(process.cwd(), "public", safe));
    const png = await sharp(file).resize({ width: 380, height: 460, fit: "cover", position: "top" }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function KingOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const king = await getKingBySlug(slug);
  const [gothic, inter, portrait] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/GrenzeGotisch-Bold.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Inter-Medium.ttf")),
    portraitDataUrl(king?.imageUrl ?? null),
  ]);
  const name = king?.name ?? "Český král";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: NAVY, padding: 28 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 56,
            padding: "0 64px",
            border: `4px solid ${GOLD}`,
            borderRadius: 24,
            background: `radial-gradient(circle at 30% 40%, #22335c 0%, ${NAVY} 70%)`,
            color: PARCHMENT,
          }}
        >
          {/* portrait (or the crest initial) in a gilded frame */}
          <div
            style={{
              display: "flex",
              padding: 10,
              borderRadius: 22,
              background: `linear-gradient(135deg, #8a6a12, #f3d77a 45%, ${GOLD} 60%, #8a6a12)`,
            }}
          >
            <div
              style={{
                width: 300,
                height: 364,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                overflow: "hidden",
                background: PARCHMENT,
              }}
            >
              {portrait ? (
                <img src={portrait} alt="" width={300} height={364} style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ fontFamily: "Grenze Gotisch", fontSize: 220, color: GOLD }}>
                  {king ? kingInitial(king.name) : "Č"}
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Inter", fontSize: 28, letterSpacing: 6, color: GOLD, textTransform: "uppercase" }}>
              {king ? `${king.title} · hra o kartu` : "Hra o kartu"}
            </div>
            <div
              style={{
                fontFamily: "Grenze Gotisch",
                fontSize: name.length > 18 ? 86 : 110,
                color: GOLD,
                lineHeight: 1.02,
                marginTop: 12,
              }}
            >
              {name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "22px 0" }}>
              <div style={{ width: 120, height: 2, background: GOLD }} />
              <div style={{ width: 14, height: 14, background: GOLD, transform: "rotate(45deg)" }} />
              <div style={{ width: 120, height: 2, background: GOLD }} />
            </div>
            <div style={{ fontFamily: "Inter", fontSize: 34, lineHeight: 1.3, color: PARCHMENT }}>
              Odpověz na 5 otázek a získej kartu do sbírky.
            </div>
            <div style={{ fontFamily: "Grenze Gotisch", fontSize: 44, color: GOLD, marginTop: 18 }}>Český král</div>
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
