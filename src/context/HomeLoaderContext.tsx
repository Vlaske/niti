"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BrandEntranceLoader } from "@/components/ui/BrandEntranceLoader";
import { entranceLoaderConfig } from "@/config/entrance-loader";

type LoaderPhase = "loading" | "fade" | "done";

type HomeLoaderContextValue = {
  markHeroReady: () => void;
};

const HomeLoaderContext = createContext<HomeLoaderContextValue | null>(null);

const SESSION_KEY = "niti-entrance-done";

export function HomeLoaderProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<LoaderPhase>("loading");
  const heroReady = useRef(false);
  const minElapsed = useRef(false);
  const dismissed = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    setPhase("fade");
    if (entranceLoaderConfig.oncePerSession) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
    }
    window.setTimeout(() => setPhase("done"), 520);
  }, []);

  const tryDismiss = useCallback(() => {
    if (heroReady.current && minElapsed.current) dismiss();
  }, [dismiss]);

  const markHeroReady = useCallback(() => {
    heroReady.current = true;
    tryDismiss();
  }, [tryDismiss]);

  useEffect(() => {
    if (!entranceLoaderConfig.enabled) {
      setPhase("done");
      return;
    }

    if (entranceLoaderConfig.oncePerSession) {
      try {
        if (sessionStorage.getItem(SESSION_KEY)) {
          setPhase("done");
          return;
        }
      } catch {
        /* ignore */
      }
    }

    document.body.style.overflow = "hidden";
    const minTimer = window.setTimeout(() => {
      minElapsed.current = true;
      tryDismiss();
    }, entranceLoaderConfig.minDurationMs);
    const maxTimer = window.setTimeout(dismiss, entranceLoaderConfig.maxDurationMs);

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      document.body.style.overflow = "";
    };
  }, [dismiss, tryDismiss]);

  useEffect(() => {
    if (phase === "done") {
      document.body.style.overflow = "";
    }
  }, [phase]);

  return (
    <HomeLoaderContext.Provider value={{ markHeroReady }}>
      {phase !== "done" && <BrandEntranceLoader phase={phase} />}
      {children}
    </HomeLoaderContext.Provider>
  );
}

export function useHomeLoader() {
  const ctx = useContext(HomeLoaderContext);
  if (!ctx) {
    return { markHeroReady: () => {} };
  }
  return ctx;
}
