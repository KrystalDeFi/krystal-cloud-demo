"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useFirebaseAnalytics } from "@/hooks/useFirebaseAnalytics";

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const pathname = usePathname();
  const { trackPageView } = useFirebaseAnalytics();

  useEffect(() => {
    // Track page view when pathname changes
    if (pathname) {
      trackPageView();
    }
  }, [pathname, trackPageView]);

  return <>{children}</>;
} 