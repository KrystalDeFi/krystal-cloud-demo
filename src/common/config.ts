export const CLOUD_API_KEY = "5434932e2240f3d895f79061090361aa5f987604";
export const DOMAIN = "https://cloud-ui.krystal.app";

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

export type ISortField =
  | "tvl"
  | "volume24h"
  | "fees24h"
  | "apr"
  | "name"
  | "createdAt";
export type ISortOrder = "asc" | "desc";

// ============================================================================
// EMBED CONFIGURATION INTERFACES
// ============================================================================

export interface IEmbedConfig {
  theme: "light" | "dark" | "auto";
  primaryColor: string; // Hex color for primary color
  showNavigation: boolean; // Show/hide navigation
  showBreadcrumbs: boolean; // Show/hide breadcrumbs
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Sort options for pools API (matching swagger specification)
export const SORT_OPTIONS = {
  APR: 0, // Sort by APR
  TVL: 1, // Sort by TVL
  VOLUME_24H: 2, // Sort by Volume 24h
  FEE: 3, // Sort by Fee
};

// Position status options
export const POSITION_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
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
  130: {
    dexscreener_key: "unichain",
  },
  324: {
    dexscreener_key: "zksync",
  },
  1313161554: {
    dexscreener_key: "aurora",
  },
  1284: {
    dexscreener_key: "moonbeam",
  },
  1285: {
    dexscreener_key: "moonriver",
  },
  42220: {
    dexscreener_key: "celo",
  },
  100: {
    dexscreener_key: "gnosis",
  },
  40: {
    dexscreener_key: "telos",
  },
  106: {
    dexscreener_key: "velas",
  },
  66: {
    dexscreener_key: "okc",
  },
  122: {
    dexscreener_key: "fuse",
  },
  7700: {
    dexscreener_key: "canto",
  },
  288: {
    dexscreener_key: "boba",
  },
  128: {
    dexscreener_key: "heco",
  },
  9001: {
    dexscreener_key: "evmos",
  },
  8217: {
    dexscreener_key: "klaytn",
  },
  42262: {
    dexscreener_key: "oasis",
  },
  1666600000: {
    dexscreener_key: "harmony",
  },
  11297108109: {
    dexscreener_key: "palm",
  },
  2222: {
    dexscreener_key: "kava",
  },
  5000: {
    dexscreener_key: "mantle",
  },
  84531: {
    dexscreener_key: "base-testnet",
  },
  534352: {
    dexscreener_key: "scroll",
  },
  204: {
    dexscreener_key: "opbnb",
  },
  196: {
    dexscreener_key: "x1",
  },
  1101: {
    dexscreener_key: "polygon-zkevm",
  },
  5001: {
    dexscreener_key: "mantle-testnet",
  },
  84532: {
    dexscreener_key: "base-sepolia",
  },
  11155111: {
    dexscreener_key: "sepolia",
  },
  97: {
    dexscreener_key: "bsc-testnet",
  },
  80001: {
    dexscreener_key: "mumbai",
  },
  421613: {
    dexscreener_key: "arbitrum-goerli",
  },
  420: {
    dexscreener_key: "optimism-goerli",
  },
  43113: {
    dexscreener_key: "avalanche-fuji",
  },
  44787: {
    dexscreener_key: "celo-alfajores",
  },
  4002: {
    dexscreener_key: "fantom-testnet",
  },
  15551: {
    dexscreener_key: "tenet",
  },
};
