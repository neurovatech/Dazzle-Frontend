import Script from "next/script";

/**
 * Tawk.to live chat widget.
 */
export default function TawkToChat() {
  return (
    <Script
      id="tawkto-script"
      strategy="afterInteractive"
      src="https://embed.tawk.to/66f3e0d7e5982d6c7bb4053c/1i8kacjh4"
      crossOrigin="anonymous"
    />
  );
}
