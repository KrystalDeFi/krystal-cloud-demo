"use client";
import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useCache } from "../hooks/useCache";
import { CLOUD_API_KEY, IEmbedConfig } from "../common/config";
import { KrystalApi } from "../services/krystalApi";
import { IAChain, IAProtocol } from "@/services/apiTypes";

// Chains and Protocols Context
interface ChainsProtocolsContextType {
  chains: IAChain[];
  protocols: IAProtocol[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ChainsProtocolsContext = createContext<
  ChainsProtocolsContextType | undefined
>(undefined);

export function ChainsProtocolsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: chains,
    loading: chainsLoading,
    error: chainsError,
    refetch: refetchChains,
  } = useCache<IAChain[]>("chains", {
    fetchData: async () => {
      const response = await KrystalApi.chains.getAll(CLOUD_API_KEY);
      return response || [];
    },
  });

  const {
    data: protocols,
    loading: protocolsLoading,
    error: protocolsError,
    refetch: refetchProtocols,
  } = useCache<IAProtocol[]>("protocols", {
    fetchData: async () => {
      const response = await KrystalApi.protocols.getAll(CLOUD_API_KEY);
      // Convert from Record<string, IAProtocol> to array format
      // The response is an object where keys are protocol keys and values are protocol objects
      return Object.entries(response || {}).map(([key, protocol]) => ({
        ...protocol,
        key: key, // Ensure the key is included in the protocol object
      }));
    },
  });

  const refetch = useCallback(async () => {
    await Promise.all([refetchChains(), refetchProtocols()]);
  }, [refetchChains, refetchProtocols]);

  const chainsProtocolsValue = useMemo(
    () => ({
      chains: chains || [],
      protocols: protocols || [],
      loading: chainsLoading || protocolsLoading,
      error: chainsError || protocolsError,
      refetch,
    }),
    [
      chains,
      protocols,
      chainsLoading,
      protocolsLoading,
      chainsError,
      protocolsError,
      refetch,
    ]
  );

  return (
    <ChainsProtocolsContext.Provider value={chainsProtocolsValue}>
      {children}
    </ChainsProtocolsContext.Provider>
  );
}

export function useChainsProtocols() {
  const context = useContext(ChainsProtocolsContext);
  if (context === undefined) {
    throw new Error(
      "useChainsProtocols must be used within a ChainsProtocolsProvider"
    );
  }
  return context;
}
