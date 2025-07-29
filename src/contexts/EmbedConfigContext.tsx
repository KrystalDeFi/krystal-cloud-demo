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

const EmbedConfigContext = createContext<EmbedConfigContextType | undefined>(undefined);

export function EmbedConfigProvider({ children }: { children: React.ReactNode }) {
  const { data: embedConfig, setData: setEmbedConfig } = useCache<IEmbedConfig>("embed_config", {
    defaultValue: {
      theme: "auto",
      primaryColor: "#3b82f6",
      showNavigation: false,
      showBreadcrumbs: true,
    },
    // Don't sync with URL params - we want to prioritize cached data
    syncParams: false,
  });

  const updateEmbedConfig = useCallback((key: keyof IEmbedConfig, value: string | boolean) => {
    if (!embedConfig) return;
    
    // Prevent unnecessary updates if value hasn't changed
    if (embedConfig[key] === value) return;
    
    const newConfig = { ...embedConfig, [key]: value };
    setEmbedConfig(newConfig);
  }, [embedConfig, setEmbedConfig]);

  // Note: isEmbedMode and isConfigDisabled will be determined by URL params in individual components
  // since this provider doesn't have access to useSearchParams
  const embedConfigValue = useMemo(() => ({
    embedConfig,
    setEmbedConfig,
    updateEmbedConfig,
    isEmbedMode: false, // This will be determined by URL params in components
    isConfigDisabled: false, // This will be determined by URL params in components
  }), [embedConfig, setEmbedConfig, updateEmbedConfig]);

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