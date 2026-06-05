import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { getEnrichedNavCategories } from "@/lib/catalog";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  title: {
    default: "NITI. — Premium tekstil za dom",
    template: "%s | NITI.",
  },
  description:
    "Pastelni tonovi, premium posteljina, peškiri i tekstil za dom. Skandinavski komfor za moderno življenje.",
  openGraph: {
    title: "NITI.",
    description: "Premium tekstil za dom u nežnim pastelnim tonovima.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navCategories = await getEnrichedNavCategories();

  return (
    <html
      lang="sr"
      className={`${playfair.variable} ${plusJakarta.variable} h-full`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col font-sans antialiased">
        <AppProviders navCategories={navCategories}>
          {children}
          <FloatingActions />
        </AppProviders>
      </body>
    </html>
  );
}
