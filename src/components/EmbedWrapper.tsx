"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useEmbedConfig } from "../contexts/EmbedConfigContext";

interface EmbedWrapperProps {
  children: React.ReactNode;
  showInEmbed?: boolean;
  type?: "navigation" | "breadcrumbs";
}

export function EmbedWrapper({
  children,
  showInEmbed = true,
  type,
}: EmbedWrapperProps) {
  const searchParams = useSearchParams();
  const { embedConfig } = useEmbedConfig();

  const isEmbedMode = searchParams.get("embed") === "1";

  // Use cached values from embedConfig, with fallbacks
  // Note: This will be updated immediately when local state changes in EmbedButton
  const showNavigation = embedConfig?.showNavigation ?? false;
  const showBreadcrumbs = embedConfig?.showBreadcrumbs ?? true;

  // Memoize the visibility decision to prevent unnecessary re-renders
  const shouldShow = useMemo(() => {
    // In embed mode, check specific visibility rules
    if (type === "navigation") {
      // Navigation should be hidden when showNavigation is false
      return showNavigation;
    } else if (type === "breadcrumbs") {
      // Breadcrumbs should be hidden when showBreadcrumbs is false
      return showBreadcrumbs;
    } else {
      // For other components, use the general showInEmbed rule
      return showInEmbed;
    }
  }, [isEmbedMode, type, showNavigation, showBreadcrumbs, showInEmbed]);

  // Only log in development mode to reduce console noise
  if (process.env.NODE_ENV === "development") {
    console.log("EmbedWrapper Debug:", {
      isEmbedMode,
      type,
      showNavigation,
      showBreadcrumbs,
      shouldShow,
      embedConfig,
    });
  }

  // Return null if should not show, otherwise return children
  return shouldShow ? <>{children}</> : null;
}

export default EmbedWrapper;
