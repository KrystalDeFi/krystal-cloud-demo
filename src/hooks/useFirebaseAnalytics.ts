import { useEffect, useCallback } from "react";
import { logEvent } from "firebase/analytics";
import { analytics } from "@/lib/firebase";

export const useFirebaseAnalytics = () => {
  const trackEvent = useCallback(
    (eventName: string, eventParameters?: Record<string, any>) => {
      if (analytics) {
        try {
          logEvent(analytics, eventName, eventParameters);
        } catch (error) {
          console.warn("Failed to track event:", error);
        }
      } else {
        // Log to console in development when analytics is not available
        if (process.env.NODE_ENV === "development") {
          console.log("Analytics event (analytics not available):", {
            eventName,
            eventParameters,
          });
        }
      }
    },
    []
  );

  const trackPageView = useCallback(
    (pageTitle?: string, pageLocation?: string) => {
      trackEvent("page_view", {
        page_title: pageTitle || document.title,
        page_location: pageLocation || window.location.href,
      });
    },
    [trackEvent]
  );

  const trackButtonClick = useCallback(
    (buttonName: string, additionalParams?: Record<string, any>) => {
      trackEvent("button_click", {
        button_name: buttonName,
        ...additionalParams,
      });
    },
    [trackEvent]
  );

  const trackNavigation = useCallback(
    (from: string, to: string, method: string = "click") => {
      trackEvent("navigation", {
        from,
        to,
        method,
      });
    },
    [trackEvent]
  );

  const trackEmbedInteraction = useCallback(
    (
      action: string,
      embedType: string,
      additionalParams?: Record<string, any>
    ) => {
      trackEvent("embed_interaction", {
        action,
        embed_type: embedType,
        ...additionalParams,
      });
    },
    [trackEvent]
  );

  const trackError = useCallback(
    (
      errorType: string,
      errorMessage: string,
      additionalParams?: Record<string, any>
    ) => {
      trackEvent("error", {
        error_type: errorType,
        error_message: errorMessage,
        ...additionalParams,
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackNavigation,
    trackEmbedInteraction,
    trackError,
  };
};
