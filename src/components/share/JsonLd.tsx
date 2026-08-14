/**
 * Renders a JSON-LD document as a <script type="application/ld+json"> tag.
 *
 * This is a Server Component — the schema is emitted directly into the SSR
 * HTML so crawlers see it without executing JavaScript.
 *
 * XSS note: JSON.stringify output is escaped for `<` so a malicious value in
 * API data (e.g. a product name containing "</script>") cannot break out of
 * the script element.
 */
export default function JsonLd({ data }: { data: object | undefined }) {
  if (!data) return null;

  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
