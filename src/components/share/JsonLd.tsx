/**
 * Renders a JSON-LD document as a <script type="application/ld+json"> tag.
 *
 * This is a Server Component — the schema is emitted directly into the SSR
 * HTML so crawlers see it without executing JavaScript.
 *
 * `id` is REQUIRED and must be unique per page. React 19 treats <script>
 * elements as hoistable resources and will collapse two structurally identical
 * inline scripts into one; without distinct ids the page-level schema was being
 * dropped from the SSR HTML (it only survived inside the streamed RSC payload,
 * which non-JS crawlers never see).
 *
 * XSS note: JSON.stringify output is escaped for `<` so a malicious value in
 * API data (e.g. a product name containing "</script>") cannot break out of
 * the script element.
 */
export default function JsonLd({
  id,
  data,
}: {
  id: string;
  data: object | undefined;
}) {
  if (!data) return null;

  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
