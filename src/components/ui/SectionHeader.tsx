import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
  actions?: React.ReactNode;
};

export function SectionHeader({
  title,
  viewAllHref,
  viewAllLabel = "View all",
  className,
  actions,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-4 md:gap-6", className)}>
      <h2 className="shrink-0 text-2xl font-semibold tracking-tight text-niti-charcoal md:text-3xl lg:text-4xl">
        {title}
      </h2>
      <div className="hidden h-px flex-1 bg-niti-line sm:block" />
      {actions}
      {viewAllHref && !actions && (
        <Link
          href={viewAllHref}
          className="interactive flex shrink-0 items-center gap-2 rounded-md border border-niti-charcoal/15 px-4 py-2 text-sm text-niti-charcoal transition-colors hover:border-niti-charcoal/30"
        >
          <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
