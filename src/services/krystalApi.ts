import { CLOUD_API_KEY } from "../common/config";

const BASE_URL =
  process.env.NEXT_PUBLIC_KRYSTAL_API_URL || "https://cloud-api.krystal.app";

// Import types from centralized apiObjects file
import {
  IAChain,
  IAPool,
  IAProtocol,
  IAPoolDetails,
  IAPosition,
  IAPositionDetails,
  IAPoolHistorical,
} from "./apiTypes";

// ============================================================================
// API REQUEST PARAMETERS
// ============================================================================

// Pools API parameters
export interface IPoolsParams {
  chainId?: number; // Chain ID (e.g., 1, 137, 56)
  factoryAddress?: string; // Factory address to filter pools
  protocol?: string; // Protocol name (e.g., uniswapv2, uniswapv3, etc.)
  token?: string; // Token address to filter pools
  sortBy?: number; // Sort by criteria (0: APR, 1: TVL, 2: Volume 24h, 3: Fee)
  minTvl?: number; // Minimum TVL filter in USD
  minVolume24h?: number; // Minimum 24h volume filter in USD
  limit?: number; // Number of results to return (max 5000)
  offset?: number; // Number of results to skip
  withIncentives?: boolean; // Include incentive data
}

// Pool detail API parameters
export interface IPoolDetailParams {
  chainId: string;
  poolAddress: string;
  factoryAddress?: string;
  withIncentives?: boolean;
}

// Pool historical data API parameters
export interface IPoolHistoricalParams {
  chainId: string;
  poolAddress: string;
  factoryAddress?: string;
  startTime?: number;
  endTime?: number;
}

// Positions API parameters
export interface IPositionsParams {
  wallet: string;
  chainId?: string;
  positionStatus?: "OPEN" | "CLOSED";
  protocols?: string[];
}

// Position detail API parameters
export interface IPositionDetailParams {
  chainId: string;
  positionId: string;
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

// Base API response wrapper
export interface IApiResponse<T> {
  data: T[];
  total?: number;
  limit?: number;
  offset?: number;
  success: boolean;
  message?: string;
}

// API error response
export interface IApiError {
  message: string;
  status: number;
  code?: string;
}

// Helper function to get API key from config
const getApiKey = (): string => {
  return CLOUD_API_KEY;
};

// Helper function to set API key (no longer needed, kept for compatibility)
const setApiKey = (key: string): void => {
  // API key is now configured in config.ts, no longer stored in localStorage
  console.warn(
    "setApiKey is deprecated. API key is now configured in config.ts"
  );
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  apiKey: string,

  params?: Record<string, any>
): Promise<T> => {
  const url = new URL(`${BASE_URL}${endpoint}`);

  // Add query parameters if provided
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle array parameters (e.g., protocols)
          value.forEach(v => url.searchParams.append(key, v));
        } else {
          url.searchParams.append(key, value.toString());
        }
      }
    });
  }

  console.log("Making API request to:", url.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "KC-APIKey": apiKey,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  console.log("API Response status:", response.status, response.statusText);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("API Error:", errorData);
    throw new Error(
      errorData.message ||
        `API error: ${response.status} - ${response.statusText}`
    );
  }

  const data = await response.json();
  console.log("API Response data:", data);
  return data;
};

// Chains API
const chainsApi = {
  getAll: async (apiKey: string): Promise<IAChain[]> => {
    const response = await apiRequest<IAChain[]>("/v1/chains", apiKey);
    return response;
  },
};

// Protocols API
const protocolsApi = {
  getAll: async (apiKey: string): Promise<Record<string, IAProtocol>> => {
    const response = await apiRequest<Record<string, IAProtocol>>(
      "/v1/protocols",
      apiKey
    );
    return response;
  },
};

// Pools API
const poolsApi = {
  // Get pools with filtering and pagination
  getAll: async (
    apiKey: string,
    params: IPoolsParams = {}
  ): Promise<IApiResponse<IAPool>> => {
    const response = await apiRequest<any>("/v1/pools", apiKey, params);

    // Handle different response formats
    if (response && response.data && Array.isArray(response.data)) {
      // Standard wrapped response
      return response as IApiResponse<IAPool>;
    } else if (Array.isArray(response)) {
      // Direct array response
      return {
        data: response,
        total: response.length,
        success: true,
      } as IApiResponse<IAPool>;
    } else if (response && response.pools && Array.isArray(response.pools)) {
      // Alternative wrapped response
      return {
        data: response.pools,
        total: response.total || response.pools.length,
        success: true,
      } as IApiResponse<IAPool>;
    } else {
      console.error("Unexpected pools response format:", response);
      throw new Error("Unexpected API response format for pools");
    }
  },

  // Get specific pool details
  getById: async (
    apiKey: string,
    params: IPoolDetailParams
  ): Promise<IAPoolDetails> => {
    const { chainId, poolAddress, ...queryParams } = params;
    const response = await apiRequest<IAPoolDetails>(
      `/v1/pools/${chainId}/${poolAddress}`,
      apiKey,
      queryParams
    );
    return response;
  },

  // Get pool historical data
  getHistorical: async (
    apiKey: string,
    params: IPoolHistoricalParams
  ): Promise<IAPoolHistorical[]> => {
    const { chainId, poolAddress, ...queryParams } = params;
    const response = await apiRequest<IAPoolHistorical[]>(
      `/v1/pools/${chainId}/${poolAddress}/historical`,
      apiKey,
      queryParams
    );
    return response;
  },
};

// Positions API
const positionsApi = {
  // Get all positions for a wallet
  getAll: async (
    apiKey: string,
    params: IPositionsParams
  ): Promise<IAPosition[]> => {
    const response = await apiRequest<IAPosition[]>(
      "/v1/positions",
      apiKey,
      params
    );
    return response;
  },

  // Get specific position details
  getById: async (
    apiKey: string,
    params: IPositionDetailParams
  ): Promise<IAPositionDetails> => {
    const { chainId, positionId } = params;
    const response = await apiRequest<IAPositionDetails>(
      `/v1/positions/${chainId}/${positionId}`,
      apiKey
    );
    return response;
  },
};

// Main API service
export const KrystalApi = {
  chains: chainsApi,
  protocols: protocolsApi,
  pools: poolsApi,
  positions: positionsApi,
  getApiKey,
  setApiKey,
};
