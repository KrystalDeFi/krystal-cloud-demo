"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { IAChain, IAProtocol } from "../services/apiTypes";
import { KrystalApi } from "../services/krystalApi";
import { CacheService } from "../services/cacheService";

const CHAINS_CACHE_KEY = "krystal_chains_cache";
const PROTOCOLS_CACHE_KEY = "krystal_protocols_cache";

// Default chains data (fallback when API is not available)
const DEFAULT_CHAINS: IAChain[] = [
  {
    name: "Optimism",
    id: 10,
    logo: "https://files.krystal.app/DesignAssets/chains/optimism.png",
    explorer: "https://optimistic.etherscan.io",
    supportedProtocols: [
      "uniswapv2",
      "sushiv2",
      "uniswapv3",
      "sushiv3",
      "uniswapv4",
    ],
  },
  {
    name: "Polygon",
    id: 137,
    logo: "https://files.krystal.app/DesignAssets/chains/polygon.png",
    explorer: "https://polygonscan.com",
    supportedProtocols: [
      "uniswapv2",
      "sushiv2",
      "quickswapv2",
      "uniswapv3",
      "sushiv3",
      "quickswapv3",
      "uniswapv4",
    ],
  },
  {
    name: "Base",
    id: 8453,
    logo: "https://files.krystal.app/DesignAssets/chains/base.png",
    explorer: "https://basescan.org",
    supportedProtocols: [
      "uniswapv3",
      "sushiv3",
      "aerodromecl",
      "uniswapv4",
      "uniswapv2",
      "sushiv2",
      "pancakev3",
    ],
  },
  {
    name: "Avalanche",
    id: 43114,
    logo: "https://files.krystal.app/DesignAssets/chains/avalanche.png",
    explorer: "https://snowtrace.io",
    supportedProtocols: ["uniswapv4", "uniswapv2", "uniswapv3"],
  },
  {
    name: "Sonic",
    id: 146,
    logo: "https://files.krystal.app/DesignAssets/chains/sonic.png",
    explorer: "https://sonicscan.org",
    supportedProtocols: ["wagmiv3", "shadowcl", "swapxcl"],
  },
  {
    name: "Berachain",
    id: 80094,
    logo: "https://files.krystal.app/DesignAssets/chains/berachain.png",
    explorer: "https://berascan.org",
    supportedProtocols: ["kodiakcl"],
  },
  {
    name: "Ronin",
    id: 2020,
    logo: "https://files.krystal.app/DesignAssets/chains/ronin.png",
    explorer: "https://app.roninchain.com/explorer",
    supportedProtocols: ["katanav3", "katanav2"],
  },
  {
    name: "UniChain",
    id: 130,
    logo: "https://files.krystal.app/DesignAssets/chains/unichain.png",
    explorer: "https://uniscan.xyz/",
    supportedProtocols: ["uniswapv2", "uniswapv3", "uniswapv4"],
  },
  {
    name: "Arbitrum",
    id: 42161,
    logo: "https://files.krystal.app/DesignAssets/chains/arbitrum.png",
    explorer: "https://arbiscan.io",
    supportedProtocols: [
      "sushiv2",
      "uniswapv3",
      "sushiv3",
      "uniswapv2",
      "pancakev2",
      "camelotv2",
      "pancakev3",
      "camelotv3",
      "uniswapv4",
    ],
  },
  {
    name: "Ethereum",
    id: 1,
    logo: "https://files.krystal.app/DesignAssets/chains/ethereum.png",
    explorer: "https://etherscan.io",
    supportedProtocols: [
      "uniswapv2",
      "sushiv2",
      "pancakev2",
      "uniswapv3",
      "sushiv3",
      "pancakev3",
      "uniswapv4",
    ],
  },
  {
    name: "Binance Smart Chain",
    id: 56,
    logo: "https://files.krystal.app/DesignAssets/chains/bsc.png",
    explorer: "https://bscscan.com",
    supportedProtocols: [
      "pancakev2",
      "sushiv2",
      "pancakev3",
      "uniswapv3",
      "pancakev4",
      "uniswapv2",
      "sushiv3",
      "uniswapv4",
      "thena",
    ],
  },
];

// Default protocols data (fallback when API is not available)
const DEFAULT_PROTOCOLS: Record<string, IAProtocol> = {
  aerodromecl: {
    key: "aerodromecl",
    name: "Aerodrome Concentrated",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/aerodrome.png",
  },
  camelotv2: {
    key: "camelotv2",
    name: "Camelot V2",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/camelot.png",
  },
  camelotv3: {
    key: "camelotv3",
    name: "Camelot V3",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/camelot.png",
  },
  katanav2: {
    key: "katanav2",
    name: "Katana V2",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/katana.jpg",
  },
  katanav3: {
    key: "katanav3",
    name: "Katana V3",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/katana.jpg",
  },
  kodiakcl: {
    key: "kodiakcl",
    name: "Kodiak Concentrated",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/kodiak.png",
  },
  pancakev2: {
    key: "pancakev2",
    name: "PancakeSwap V2",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/pancake.png",
  },
  pancakev3: {
    key: "pancakev3",
    name: "PancakeSwap V3",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/pancake.png",
  },
  pancakev4: {
    key: "pancakev4",
    name: "PancakeSwap Infinity",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/pancake.png",
  },
  quickswapv2: {
    key: "quickswapv2",
    name: "QuickSwap V2",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/quickswap.png",
  },
  quickswapv3: {
    key: "quickswapv3",
    name: "QuickSwap V3",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/quickswap.png",
  },
  shadowcl: {
    key: "shadowcl",
    name: "Shadow Concentrated",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/shadow.png",
  },
  sushiv2: {
    key: "sushiv2",
    name: "SushiSwap V2",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/sushiswap.png",
  },
  sushiv3: {
    key: "sushiv3",
    name: "SushiSwap V3",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/sushiswap.png",
  },
  swapxcl: {
    key: "swapxcl",
    name: "SwapX Concentrated",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/swapx.png",
  },
  thena: {
    key: "thena",
    name: "THENA",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/thena.png",
  },
  uniswapv2: {
    key: "uniswapv2",
    name: "Uniswap V2",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/uniswap.png",
  },
  uniswapv3: {
    key: "uniswapv3",
    name: "Uniswap V3",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/uniswap.png",
  },
  uniswapv4: {
    key: "uniswapv4",
    name: "Uniswap V4",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/uniswap.png",
  },
  wagmiv3: {
    key: "wagmiv3",
    name: "Wagmi V3",
    logo: "https://files.krystal.app/DesignAssets/platformIcons/wagmi.png",
  },
};

interface ChainsProtocolsContextType {
  chains: IAChain[];
  protocols: IAProtocol[];
  loading: boolean;
  error: string | null;
}

const ChainsProtocolsContext = createContext<
  ChainsProtocolsContextType | undefined
>(undefined);

interface ChainsProtocolsProviderProps {
  children: ReactNode;
}

export const ChainsProtocolsProvider: React.FC<
  ChainsProtocolsProviderProps
> = ({ children }) => {
  const [chains, setChains] = useState<IAChain[]>(
    CacheService.get(CHAINS_CACHE_KEY) || DEFAULT_CHAINS
  );
  const [protocols, setProtocols] = useState<IAProtocol[]>(
    CacheService.get(PROTOCOLS_CACHE_KEY) || Object.values(DEFAULT_PROTOCOLS)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper functions for fetching chains and protocols
  const fetchChains = async (): Promise<IAChain[]> => {
    const apiKey = KrystalApi.getApiKey();
    const response = await KrystalApi.chains.getAll(apiKey);
    if (!apiKey) {
      throw new Error("No API key available");
    }
    if (response && response.length > 0) {
      return response;
    } else {
      throw new Error("API returned empty chains data");
    }
  };

  const fetchProtocols = async (): Promise<IAProtocol[]> => {
    const apiKey = KrystalApi.getApiKey();
    const response = await KrystalApi.protocols.getAll(apiKey);
    if (!apiKey) {
      throw new Error("No API key available");
    }
    if (response && Object.keys(response).length > 0) {
      return Object.values(response);
    } else {
      throw new Error("API returned empty protocols data");
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Loading initial chains and protocols data...");
        const [chainsData, protocolsData] = await Promise.all([
          fetchChains(),
          fetchProtocols(),
        ]);

        setChains(chainsData);
        setProtocols(protocolsData);
        console.log("Initial data loaded successfully");
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load chains and protocols"
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const value: ChainsProtocolsContextType = {
    chains,
    protocols,
    loading,
    error,
  };

  return (
    <ChainsProtocolsContext.Provider value={value}>
      {children}
    </ChainsProtocolsContext.Provider>
  );
};

export const useChainsProtocols = (): ChainsProtocolsContextType => {
  const context = useContext(ChainsProtocolsContext);
  if (context === undefined) {
    throw new Error(
      "useChainsProtocols must be used within a ChainsProtocolsProvider"
    );
  }
  return context;
};
