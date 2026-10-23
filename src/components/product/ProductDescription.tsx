"use client";

import { cn } from "@/lib/utils";

type ProductDescriptionProps = {
  html?: string;
  plain?: string;
  className?: string;
};

export function ProductDescription({
  html,
  plain,
  className,
}: ProductDescriptionProps) {
  if (html?.trim()) {
    const cleaned = html
      .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
      .replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br><br>");
    return (
      <div
        className={cn(
          "product-prose text-sm leading-relaxed text-niti-muted",
          className
        )}
        dangerouslySetInnerHTML={{ __html: cleaned }}
      />
    );
  }

  if (!plain?.trim()) return null;

  const blocks = plain.split(/\n{2,}/).filter(Boolean);

  return (
    <div
      className={cn(
        "space-y-4 text-sm leading-relaxed text-niti-muted md:text-base",
        className
      )}
    >
      {blocks.map((block, i) => (
        <p key={i}>{block.trim()}</p>
      ))}
    </div>
  );
}
