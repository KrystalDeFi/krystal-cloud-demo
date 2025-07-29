"use client";

import React from "react";
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
  const showNavigation = embedConfig?.showNavigation ?? false;
  const showBreadcrumbs = embedConfig?.showBreadcrumbs ?? true;

  // If not in embed mode, always show
  if (!isEmbedMode) {
    return <>{children}</>;
  }

  // In embed mode, check specific visibility rules
  if (type === "navigation") {
    // Navigation should be hidden when showNavigation is false
    if (!showNavigation) {
      return null;
    }
  } else if (type === "breadcrumbs") {
    // Breadcrumbs should be hidden when showBreadcrumbs is false
    if (!showBreadcrumbs) {
      return null;
    }
  } else {
    // For other components, use the general showInEmbed rule
    if (!showInEmbed) {
      return null;
    }
  }

  return <>{children}</>;
}

export default EmbedWrapper;
