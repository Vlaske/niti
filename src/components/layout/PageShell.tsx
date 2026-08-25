import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

type PageShellProps = {
  children: React.ReactNode;
  headerVariant?: "transparent" | "solid";
  hideFooter?: boolean;
  mainClassName?: string;
};

export function PageShell({
  children,
  headerVariant = "solid",
  hideFooter = false,
  mainClassName = "",
}: PageShellProps) {
  return (
    <>
      <Header variant={headerVariant} />
      <main className={`min-w-0 flex-1 overflow-x-clip ${mainClassName}`}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </>
  );
}
