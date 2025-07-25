
// ============================================================================
// STATISTICS INTERFACES
// ============================================================================

export interface IPoolsStats {
  totalPools: number;
  totalTvl: number;
  totalVolume24h: number;
  totalFees24h: number;
  averageApr: number;
}

// ============================================================================
// SORTING & FILTERING INTERFACES
// ============================================================================

export type ISortField = "tvl" | "volume24h" | "fees24h" | "apr" | "name" | "createdAt";
export type ISortOrder = "asc" | "desc";

// ============================================================================
// EMBED CONFIGURATION INTERFACES
// ============================================================================

export interface IEmbedConfig {
  theme: "light" | "dark" | "auto";
  primaryColor: string;
  showHeader: boolean;
  showFooter: boolean;
  height: string;
  width: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Sort options for pools API (matching swagger specification)
export const SORT_OPTIONS = {
  APR: 0,        // Sort by APR
  TVL: 1,        // Sort by TVL
  VOLUME_24H: 2, // Sort by Volume 24h
  FEE: 3,        // Sort by Fee
};

// Position status options
export const POSITION_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const; 

export const CHAIN_CONFIGS: Record<any, { dexscreener_key: string }> = {
  1: {
    dexscreener_key: "ethereum",
  },
  137: {
    dexscreener_key: "polygon",
  },
  56: {
    dexscreener_key: "bsc",
  },
  42161: {
    dexscreener_key: "arbitrum",
  },
  10: {
    dexscreener_key: "optimism",
  },
  43114: {
    dexscreener_key: "avalanche",
  },
  250: {
    dexscreener_key: "fantom",
  },
  25: {
    dexscreener_key: "cronos",
  },
  8453: {
    dexscreener_key: "base",
  },
  59144: {
    dexscreener_key: "linea",
  },
}