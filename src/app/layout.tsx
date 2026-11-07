import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// latin-ext subset = Czech diacritics (ř, ě, š, č, ů ...)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "Český král – kvíz o českých panovnících",
    template: "%s | Český král",
  },
  description:
    "Odpovídej na otázky o českých panovnících a sbírej je jako sběratelské karty.",
};

export const viewport: Viewport = {
  themeColor: "#14213d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-12">
          {children}
        </main>
        <footer className="border-t border-gold/20 py-6 text-center text-xs text-muted-foreground">
          Český král · ukázkový projekt
        </footer>
      </body>
    </html>
  );
}
