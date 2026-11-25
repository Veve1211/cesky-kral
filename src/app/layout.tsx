import { KOFI_URL } from "@/lib/kofi";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Grenze_Gotisch, Inter, Uncial_Antiqua } from "next/font/google";

import { OrnamentDivider } from "@/components/ornaments";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";
import { siteUrl } from "@/lib/site-url";

// Keep preloads, but avoid late font swaps after the page has painted on a slow network.
// latin-ext subset = Czech diacritics (ř, ě, š, č, ů ...)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "optional",
});

// Gothic manuscript-style headings (verified: ř, ě, ů, ť, ď, ň present)
const gothic = Grenze_Gotisch({
  variable: "--font-gothic",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
  display: "optional",
});

// Lombardic-style capitals for illuminated initials and crests
const uncial = Uncial_Antiqua({
  variable: "--font-uncial",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "optional",
});

const SITE_NAME = "Český král";
const SITE_TITLE = `${SITE_NAME} – Sbírej české panovníky`;
const SITE_YEAR = 2026;
const SITE_DESCRIPTION =
  "Kvízová hra o českých panovnících pro žáky, učitele dějepisu i všechny, koho baví dějiny. Za správné odpovědi získáš sběratelské karty.";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  // "Přidat na plochu" on iPhone: full screen, short name under the crown icon (apple-icon.png).
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black",
  },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#14213d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      className={`${inter.variable} ${gothic.variable} ${uncial.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <SiteHeader />
        {/* min-h-dvh: the footer starts below the fold, so client-rendered content never pushes it (CLS). */}
        <main className="mx-auto min-h-dvh w-full max-w-5xl flex-1 px-4 py-8 sm:py-12">
          {children}
        </main>
        <footer className="flex flex-col items-center gap-2 px-4 pt-4 pb-8 text-center text-xs text-muted-foreground">
          <OrnamentDivider className="max-w-[12rem]" />
          <p>
            <span className="font-heading text-sm">Český král</span> ·{" "}
            <Link href="/jak-hrat" className="underline underline-offset-4 hover:text-foreground">
              Jak hrát
            </Link>{" "}
            ·{" "}
            <Link href="/pro-ucitele" className="underline underline-offset-4 hover:text-foreground">
              Pro učitele
            </Link>{" "}
            ·{" "}
            <Link href="/zdroje" className="underline underline-offset-4 hover:text-foreground">
              Zdroje obrázků a písem
            </Link>{" "}
            ·{" "}
            <Link href="/soukromi" className="underline underline-offset-4 hover:text-foreground">
              Soukromí
            </Link>{" "}
            · {SITE_YEAR}
            {KOFI_URL && (
              <>
                {" "}·{" "}
                {/* Small footer link to the groš page, not a groš button (those are at most one per page). */}
                <Link
                  href="/hod-gros"
                  data-testid="kofi-footer-link"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  <span aria-hidden>🪙 </span>Hoď groš
                </Link>
              </>
            )}
          </p>
        </footer>
      </body>
    </html>
  );
}
