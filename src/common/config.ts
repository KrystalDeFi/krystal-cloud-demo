
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
// PAGINATION INTERFACES
// ============================================================================

export interface IPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showFirstLastButtons?: boolean;
}

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

// Chain configurations
export const CHAIN_CONFIGS: Record<IChainId, IChainConfig> = {
  "ethereum@1": {
    name: "Ethereum",
    color: "blue",
    explorer: "https://etherscan.io",
  },
  "polygon@137": {
    name: "Polygon",
    color: "purple",
    explorer: "https://polygonscan.com",
  },
  "bsc@56": {
    name: "BSC",
    color: "yellow",
    explorer: "https://bscscan.com",
  },
  "arbitrum@42161": {
    name: "Arbitrum",
    color: "cyan",
    explorer: "https://arbiscan.io",
  },
  "optimism@10": {
    name: "Optimism",
    color: "red",
    explorer: "https://optimistic.etherscan.io",
  },
  "avalanche@43114": {
    name: "Avalanche",
    color: "orange",
    explorer: "https://snowtrace.io",
  },
  "fantom@250": {
    name: "Fantom",
    color: "teal",
    explorer: "https://ftmscan.com",
  },
  "cronos@25": {
    name: "Cronos",
    color: "green",
    explorer: "https://cronoscan.com",
  },
  "base@8453": {
    name: "Base",
    color: "blue",
    explorer: "https://basescan.org",
  },
  "linea@59144": {
    name: "Linea",
    color: "purple",
    explorer: "https://lineascan.build",
  },
  // Fallback for unknown chains
  "unknown": {
    name: "Unknown",
    color: "gray",
    explorer: "#",
  },
};

// Sort options for pools API (matching swagger specification)
export const SORT_OPTIONS = {
  APR: 0,        // Sort by APR
  TVL: 1,        // Sort by TVL
  VOLUME_24H: 2, // Sort by Volume 24h
  FEE: 3,        // Sort by Fee
} as const;

// Position status options
export const POSITION_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const; 