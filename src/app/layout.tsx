import type { Metadata } from "next";
import { Outfit, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { getEnrichedNavCategories } from "@/lib/catalog";
import { preferSiteImage } from "@/lib/site-images";
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

/** Clean geometric sans — closer to NITI. wordmark; latin-ext for Serbian */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "https://niti.home"
  ),
  title: {
    default: "NITI. - Premium tekstil za dom",
    template: "%s | NITI.",
  },
  description:
    "Kućni tekstil za spavaću sobu, kupatilo i kuhinju - posteljine, peškiri, stolnjaci i više. NITI.",
  icons: {
    icon: [
      { url: "/brand/niti-favicon.svg", type: "image/svg+xml" },
      { url: "/brand/niti-favicon.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [{ url: "/brand/niti-apple.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "NITI.",
    description: "Premium tekstil za dom u nežnim pastelnim tonovima.",
    type: "website",
    siteName: "NITI.",
    images: [{ url: "/brand/og-template.svg", width: 1200, height: 630 }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navCategories = (await getEnrichedNavCategories()).map((category) => ({
    ...category,
    image: preferSiteImage(`categories/${category.slug}`, category.image),
  }));
  const newsletterImage = preferSiteImage(
    "home/newsletter",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80"
  );

  return (
    <html
      lang="sr"
      className={`${playfair.variable} ${plusJakarta.variable} ${outfit.variable} h-full`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        className="site-shell flex min-h-full flex-col font-sans antialiased"
        suppressHydrationWarning
      >
        <AppProviders
          navCategories={navCategories}
          newsletterImage={newsletterImage}
        >
          {children}
          <FloatingActions />
        </AppProviders>
      </body>
    </html>
  );
}
