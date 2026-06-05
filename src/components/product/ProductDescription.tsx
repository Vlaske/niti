"use client";

type ProductDescriptionProps = {
  html?: string;
  plain?: string;
};

export function ProductDescription({ html, plain }: ProductDescriptionProps) {
  if (html?.trim()) {
    return (
      <div
        className="product-prose text-sm leading-relaxed text-niti-muted md:text-base"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (!plain?.trim()) return null;

  const blocks = plain.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="space-y-4 text-sm leading-relaxed text-niti-muted md:text-base">
      {blocks.map((block, i) => (
        <p key={i}>{block.trim()}</p>
      ))}
    </div>
  );
}
