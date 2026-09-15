"use client";

import { useEffect } from "react";

/**
 * Purely cosmetic — prints a branded banner to the browser console once per
 * page load. Renders nothing; it only exists for whoever opens devtools.
 * Also doubles as a standard self-XSS warning, since the console is a common
 * vector for "paste this code to unlock a feature" scams.
 */
export default function ConsoleBanner() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (w.__dazzleConsoleBannerShown) return;
    w.__dazzleConsoleBannerShown = true;

    console.log(
      "%cDAZZLE%c\nBest Mobile, Laptop and Gadget Shop in Bangladesh\ndazzle.com.bd",
      "font-size:28px;font-weight:900;color:#B57908;padding:4px 0;",
      "font-size:12px;color:#888;line-height:1.6;"
    );
    console.log(
      "%c⚠ Stop!%cThis is a browser feature for developers. If someone told you to copy/paste something here to unlock a feature or \"verify\" your account, it's a scam — pasting it could give them access to your account.",
      "font-size:16px;font-weight:bold;color:#e11d48;",
      "font-size:13px;color:#444;"
    );
  }, []);

  return null;
}
