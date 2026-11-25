import type { MetadataRoute } from "next";

// Web app manifest: "Přidat na plochu" opens the game full screen with the crown icon.
// No service worker – the game needs the server (questions, scores), offline mode is not promised.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Český král – Sbírej české panovníky",
    short_name: "Český král",
    description: "Kvízová hra o českých panovnících. Za správné odpovědi získáš sběratelské karty.",
    lang: "cs",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5efe0",
    theme_color: "#14213d",
    categories: ["education", "games"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
