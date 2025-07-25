"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

interface EmbedWrapperProps {
  children: React.ReactNode;
  showInEmbed?: boolean;
}

export function EmbedWrapper({
  children,
  showInEmbed = true,
}: EmbedWrapperProps) {
  const searchParams = useSearchParams();
  const isEmbedMode = searchParams.get("embed") === "1";
  const showHeader = searchParams.get("showHeader") !== "false";

  // In embed mode, only show if explicitly allowed and showHeader is true
  if (isEmbedMode && (!showInEmbed || !showHeader)) {
    return null;
  }

  return <>{children}</>;
}

export default EmbedWrapper;
