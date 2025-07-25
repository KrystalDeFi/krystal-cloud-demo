
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
// UTILITY INTERFACES
// ============================================================================

// Chain ID type
export type IChainId = 
  | "ethereum@1"
  | "polygon@137"
  | "bsc@56"
  | "arbitrum@42161"
  | "optimism@10"
  | "avalanche@43114"
  | "fantom@250"
  | "cronos@25"
  | "base@8453"
  | "linea@59144"
  | "unknown"
  | string; // Allow any string for dynamic chain IDs

export interface IChainConfig {
  name: string;
  color: string;
  explorer: string;
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