import Script from "next/script";

import { PRODUCTION_DOMAIN } from "@/lib/site-url";

export function UmamiAnalytics({
  scriptUrl,
  websiteId,
  publicPaths,
}: {
  scriptUrl: string;
  websiteId: string;
  publicPaths: string[];
}) {
  const paths = JSON.stringify(publicPaths).replaceAll("<", "\\u003c");
  const beforeSend = `
    (() => {
      const publicPaths = new Set(${paths});
      window.ceskyKralUmamiBeforeSend = (type, payload) => {
        if (type !== "event" || payload.name) return false;
        const url = new URL(payload.url, window.location.origin);
        if (url.origin !== window.location.origin || !publicPaths.has(url.pathname)) return false;
        return {
          website: payload.website,
          hostname: payload.hostname,
          screen: payload.screen,
          language: payload.language,
          title: payload.title,
          url: url.pathname,
          referrer: "",
        };
      };
    })();
  `;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: beforeSend }} />
      <Script
        src={scriptUrl}
        strategy="lazyOnload"
        data-website-id={websiteId}
        data-domains={PRODUCTION_DOMAIN}
        data-do-not-track="true"
        data-exclude-search="true"
        data-exclude-hash="true"
        data-before-send="ceskyKralUmamiBeforeSend"
      />
    </>
  );
}
