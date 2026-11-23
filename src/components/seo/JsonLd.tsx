export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  // Escape < so product HTML/text from Shopify cannot break out of the script tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
