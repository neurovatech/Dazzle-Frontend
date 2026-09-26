"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
const FALLBACK_DELAY_MS = 2000;
export default function DeferredScript({
  delayMs = FALLBACK_DELAY_MS,
  ...scriptProps
}: React.ComponentProps<typeof Script> & {
  delayMs?: number;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    let done = false;

    const mark = () => {
      if (done) return;
      done = true;
      cleanup();
      const load = () => setReady(true);
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(load, { timeout: 1500 });
      } else {
        setTimeout(load, 200);
      }
    };

    const timer = window.setTimeout(mark, delayMs);
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
  return <Script {...scriptProps} />;
}
