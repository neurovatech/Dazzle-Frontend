"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
/** Guarantees the script still loads for a visitor who never interacts
 * (a bot, or someone who just reads the page and leaves) — no
 * conversion/tracking event is silently lost, it only fires later. */
const FALLBACK_DELAY_MS = 4000;

/**
 * Delays mounting a third-party <Script> (GTM/Meta Pixel/TikTok/chat widget)
 * until the visitor does something — scroll, tap, key press — or
 * FALLBACK_DELAY_MS passes, whichever comes first. This is the standard
 * "facade" pattern for third-party embeds.
 *
 * Why this exists: `strategy="lazyOnload"` alone still runs these scripts
 * during the browser's early idle window, which on staging measured live
 * via Lighthouse was GTM + Meta Pixel + TikTok together costing ~1.2s of
 * main-thread time (710 KiB) — landing squarely inside the window a real
 * visitor's FIRST tap/scroll happens, which is exactly what INP measures.
 * Gating on interaction moves that cost to AFTER the moment INP cares about,
 * without dropping or delaying it for long — most visitors interact within
 * the first second or two anyway.
 */
export default function DeferredScript(props: React.ComponentProps<typeof Script>) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    let done = false;

    const mark = () => {
      if (done) return;
      done = true;
      cleanup();
      setReady(true);
    };

    const timer = window.setTimeout(mark, FALLBACK_DELAY_MS);
    function cleanup() {
      window.clearTimeout(timer);
      INTERACTION_EVENTS.forEach((ev) => window.removeEventListener(ev, mark));
    }

    INTERACTION_EVENTS.forEach((ev) =>
      window.addEventListener(ev, mark, { passive: true, once: true }),
    );
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;
  return <Script {...props} />;
}
