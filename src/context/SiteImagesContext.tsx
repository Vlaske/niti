"use client";

import { createContext, useContext, type ReactNode } from "react";

const NEWSLETTER_FALLBACK =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80";

const NewsletterImageContext = createContext(NEWSLETTER_FALLBACK);

export function NewsletterImageProvider({
  image,
  children,
}: {
  image: string;
  children: ReactNode;
}) {
  return (
    <NewsletterImageContext.Provider value={image}>
      {children}
    </NewsletterImageContext.Provider>
  );
}

export function useNewsletterImage() {
  return useContext(NewsletterImageContext);
}
