"use client";
import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useCache } from "../hooks/useCache";
import { IEmbedConfig } from "../common/config";

// Embed Configuration Context
interface EmbedConfigContextType {
  embedConfig: IEmbedConfig | null;
  setEmbedConfig: (config: IEmbedConfig) => void;
  updateEmbedConfig: (key: keyof IEmbedConfig, value: string | boolean) => void;
  isEmbedMode: boolean;
  isConfigDisabled: boolean;
}

const EmbedConfigContext = createContext<EmbedConfigContextType | undefined>(
  undefined
);

export function EmbedConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: embedConfig, setData: setEmbedConfig } = useCache<IEmbedConfig>(
    "embed_config",
    {
      defaultValue: {
        theme: "auto",
        primaryColor: "#3b82f6",
        showNavigation: true,
        showBreadcrumbs: true,
      },
      // Disable URL param sync to avoid loops - we'll handle URL params manually
      syncParams: false,
    }
  );

  // Local state for immediate UI updates to prevent blinking
  const [immediateConfig, setImmediateConfig] = React.useState(embedConfig);

  // Sync immediate config with embed config when it changes
  React.useEffect(() => {
    if (embedConfig) {
      setImmediateConfig(embedConfig);
    }
  }, [embedConfig]);

  // Only log in development mode to reduce console noise
  if (process.env.NODE_ENV === "development") {
    console.log("EmbedConfigContext Debug:", {
      embedConfig,
      immediateConfig,
      showNavigation: immediateConfig?.showNavigation,
      showBreadcrumbs: immediateConfig?.showBreadcrumbs,
    });
  }

  const updateEmbedConfig = useCallback(
    (key: keyof IEmbedConfig, value: string | boolean) => {
      if (!embedConfig) return;

      // Prevent unnecessary updates if value hasn't changed
      if (embedConfig[key] === value) return;

      const newConfig = { ...embedConfig, [key]: value };
      console.log("EmbedConfigContext: Updating config:", {
        key,
        value,
        newConfig,
      });

      // Update immediate config first for instant UI feedback
      setImmediateConfig(newConfig);

      // Then update the cached config
      setEmbedConfig(newConfig);
    },
    [embedConfig, setEmbedConfig]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const embedConfigValue = useMemo(
    () => ({
      embedConfig: immediateConfig, // Use immediate config for instant updates
      setEmbedConfig,
      updateEmbedConfig,
      isEmbedMode: false, // This will be determined by URL params in components
      isConfigDisabled: false, // This will be determined by URL params in components
    }),
    [immediateConfig, setEmbedConfig, updateEmbedConfig]
  );

  return (
    <EmbedConfigContext.Provider value={embedConfigValue}>
      {children}
    </EmbedConfigContext.Provider>
  );
}

export function useEmbedConfig() {
  const context = useContext(EmbedConfigContext);
  if (context === undefined) {
    // Return default values when context is not available (during SSR or before provider is mounted)
    return {
      embedConfig: {
        theme: "auto",
        primaryColor: "#3b82f6",
        showNavigation: false,
        showBreadcrumbs: true,
      },
      setEmbedConfig: () => {},
      updateEmbedConfig: () => {},
      isEmbedMode: false,
      isConfigDisabled: false,
    };
  }
  return context;
}
