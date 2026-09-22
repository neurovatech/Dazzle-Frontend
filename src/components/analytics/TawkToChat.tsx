import DeferredScript from "./DeferredScript";

/**
 * Tawk.to live chat widget.
 */
export default function TawkToChat() {
  return (
    // DeferredScript — loads on the visitor's first interaction (or after a
    // few seconds if they never interact) instead of during browser idle
    // time. Nobody clicks a chat widget in the first second on the page, so
    // there's no reason for it to compete with the main thread during the
    // window that matters for INP (Interaction to Next Paint) — see
    // DeferredScript for why lazyOnload alone wasn't enough.
    <DeferredScript
      id="tawkto-script"
      src="https://embed.tawk.to/66f3e0d7e5982d6c7bb4053c/1i8kacjh4"
      crossOrigin="anonymous"
    />
  );
}
