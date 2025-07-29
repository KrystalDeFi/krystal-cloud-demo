"use client";
import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useCache } from "../hooks/useCache";
import { IEmbedConfig } from "../common/config";

// Chains and Protocols Context
interface ChainsProtocolsContextType {
  chains: any[];
  protocols: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ChainsProtocolsContext = createContext<ChainsProtocolsContextType | undefined>(undefined);

export function ChainsProtocolsProvider({ children }: { children: React.ReactNode }) {
  const { data: chains, loading: chainsLoading, error: chainsError, refetch: refetchChains } = useCache<any[]>("chains", {
    fetchData: async () => {
      const apiKey = process.env.NEXT_PUBLIC_CLOUD_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured");
      }
      const response = await fetch("https://cloud-api.krystal.app/v1/chains", {
        headers: { "X-API-Key": apiKey },
      });
      if (!response.ok) throw new Error("Failed to fetch chains");
      const data = await response.json();
      return data.data || [];
    },
  });

  const { data: protocols, loading: protocolsLoading, error: protocolsError, refetch: refetchProtocols } = useCache<any[]>("protocols", {
    fetchData: async () => {
      const apiKey = process.env.NEXT_PUBLIC_CLOUD_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured");
      }
      const response = await fetch("https://cloud-api.krystal.app/v1/protocols", {
        headers: { "X-API-Key": apiKey },
      });
      if (!response.ok) throw new Error("Failed to fetch protocols");
      const data = await response.json();
      return data.data || [];
    },
  });

  const refetch = useCallback(async () => {
    await Promise.all([refetchChains(), refetchProtocols()]);
  }, [refetchChains, refetchProtocols]);

  const chainsProtocolsValue = useMemo(() => ({
    chains: chains || [],
    protocols: protocols || [],
    loading: chainsLoading || protocolsLoading,
    error: chainsError || protocolsError,
    refetch,
  }), [chains, protocols, chainsLoading, protocolsLoading, chainsError, protocolsError, refetch]);

  return (
    <ChainsProtocolsContext.Provider value={chainsProtocolsValue}>
      {children}
    </ChainsProtocolsContext.Provider>
  );
}

export function useChainsProtocols() {
  const context = useContext(ChainsProtocolsContext);
  if (context === undefined) {
    throw new Error("useChainsProtocols must be used within a ChainsProtocolsProvider");
  }
  return context;
}
