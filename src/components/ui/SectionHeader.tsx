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
    <div className={cn("flex flex-wrap items-center gap-3 md:gap-6", className)}>
      <h2 className="min-w-0 flex-1 font-serif text-[1.35rem] font-medium leading-tight tracking-tight text-niti-charcoal sm:text-2xl md:flex-none md:shrink-0 md:text-3xl lg:text-4xl">
        {title}
      </h2>
      <div className="hidden h-px flex-1 bg-niti-line sm:block" />
      {actions}
      {viewAllHref && !actions && (
        <Link
          href={viewAllHref}
          className="interactive flex shrink-0 items-center gap-1.5 border border-niti-charcoal/15 px-3 py-1.5 text-xs text-niti-charcoal transition-colors hover:border-niti-charcoal/30 hover:bg-niti-sand/40 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
        >
          <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
