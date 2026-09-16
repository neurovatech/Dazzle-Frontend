import Script from "next/script";

/**
 * Tawk.to live chat widget.
 */
export default function TawkToChat() {
  return (
    <Script
      id="tawkto-script"
      // lazyOnload — loads during browser idle time instead of right after
      // hydration. Nobody clicks a chat widget in the first second on the
      // page, so there's no reason for it to compete with the main thread
      // during the window that matters for INP (Interaction to Next Paint).
      strategy="lazyOnload"
      src="https://embed.tawk.to/66f3e0d7e5982d6c7bb4053c/1i8kacjh4"
      crossOrigin="anonymous"
    />
  );
}
