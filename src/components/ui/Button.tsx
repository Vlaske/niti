import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "dark";

type ButtonProps = {
  variant?: ButtonVariant;
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-niti-charcoal hover:bg-niti-cream shadow-sm",
  secondary:
    "bg-niti-sage text-white hover:bg-niti-sage-dark",
  ghost:
    "border border-white/80 text-white bg-transparent hover:bg-white/10",
  outline:
    "border border-niti-charcoal/20 text-niti-charcoal bg-transparent hover:border-niti-charcoal/40",
  dark:
    "bg-niti-charcoal text-white hover:bg-niti-footer",
};

export function Button({
  variant = "primary",
  href,
  className,
  children,
  onClick,
  type = "button",
  disabled,
}: ButtonProps) {
  const classes = cn(
    "interactive inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300",
    variants[variant],
    disabled && "opacity-50 pointer-events-none",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
