"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "next/navigation";

const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CacheData<T> {
  data: T;
  timestamp: number;
}

interface CacheOptions {
  duration?: number;
  defaultData?: any;
  enabled?: boolean;
  fetcher?: () => Promise<any>; // Optional fetcher function
}

interface CacheResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
  setData: (data: T) => void;
}

// Unified cache hook for both data fetching and simple key-value caching
export function useCache<T>(
  key: string,
  options: CacheOptions & { fetcher: () => Promise<T> }
): CacheResult<T>;
export function useCache<T>(
  key: string,
  defaultValue?: T
): [T | null, (value: T) => void, () => void];
export function useCache<T>(
  key: string,
  optionsOrFetcher?: CacheOptions & { fetcher: () => Promise<T> } | T
): CacheResult<T> | [T | null, (value: T) => void, () => void] {
  // Determine if this is a fetcher-based cache or simple key-value cache
  const isFetcherMode = optionsOrFetcher && typeof optionsOrFetcher === 'object' && 'fetcher' in optionsOrFetcher;
  
  if (isFetcherMode) {
    // Fetcher-based cache mode
    const options = optionsOrFetcher as CacheOptions & { fetcher: () => Promise<T> };
    return useFetcherCache(key, options);
  } else {
    // Simple key-value cache mode
    const defaultValue = optionsOrFetcher as T;
    return useKeyValueCache(key, defaultValue);
  }
}

// Internal hook for fetcher-based caching
function useFetcherCache<T>(
  key: string,
  options: CacheOptions & { fetcher: () => Promise<T> }
): CacheResult<T> {
  const {
    duration = DEFAULT_CACHE_DURATION,
    defaultData,
    enabled = true,
    fetcher,
  } = options;

  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initializedRef = useRef(false);

  // Get cached data from localStorage
  const getCachedData = useCallback((): T | null => {
    if (typeof window === "undefined") return null;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - cacheData.timestamp < duration) {
        console.log(`Using cached data for key: ${key}`);
        return cacheData.data;
      }

      // Cache expired, remove it
      localStorage.removeItem(key);
      return null;
    } catch (error) {
      console.error("Error reading cache:", error);
      localStorage.removeItem(key);
      return null;
    }
  }, [key, duration]);

  // Set data in cache
  const setCachedData = useCallback((data: T): void => {
    if (typeof window === "undefined") return;

    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
      console.log(`Cached data for key: ${key}`);
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  }, [key]);

  // Invalidate cache
  const invalidate = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(key);
      console.log(`Cache invalidated for key: ${key}`);
    } catch (error) {
      console.error(`Error invalidating cache for key: ${key}:`, error);
    }
  }, [key]);

  // Fetch data and update cache
  const refetch = useCallback(async () => {
    if (!enabled) return;

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching data for key: ${key}...`);
      const fetchedData = await fetcher();
      
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      console.log(`Fetched data for key: ${key} successfully`);
      setDataState(fetchedData);
      setCachedData(fetchedData);
    } catch (err) {
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      console.error(`Error fetching data for key: ${key}:`, err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);

      // Return default data if provided
      if (defaultData !== undefined) {
        console.log(`Using default data for key: ${key}`);
        setDataState(defaultData);
        setCachedData(defaultData);
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [key, fetcher, enabled, defaultData, setCachedData]);

  // Set data manually (useful for optimistic updates)
  const setData = useCallback((newData: T) => {
    setDataState(newData);
    setCachedData(newData);
  }, [setCachedData]);

  // Initialize data from cache or fetch (only once)
  useEffect(() => {
    if (!enabled || initializedRef.current) return;

    initializedRef.current = true;

    // Try to get from cache first
    const cachedData = getCachedData();
    if (cachedData !== null) {
      setDataState(cachedData);
      setLoading(false);
      return;
    }

    // If no cached data, fetch it
    refetch();
  }, [enabled, getCachedData, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    setData,
  };
}

// Internal hook for simple key-value caching
function useKeyValueCache<T>(
  key: string,
  defaultValue?: T
): [T | null, (value: T) => void, () => void] {
  const [data, setDataState] = useState<T | null>(() => {
    if (typeof window === "undefined") return defaultValue || null;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return defaultValue || null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid (24 hours)
      if (now - cacheData.timestamp < DEFAULT_CACHE_DURATION) {
        return cacheData.data;
      }

      // Cache expired, remove it
      localStorage.removeItem(key);
      return defaultValue || null;
    } catch (error) {
      console.error("Error reading cache:", error);
      localStorage.removeItem(key);
      return defaultValue || null;
    }
  });

  const setValue = useCallback((value: T) => {
    setDataState(value);
    
    if (typeof window === "undefined") return;

    try {
      const cacheData: CacheData<T> = {
        data: value,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  }, [key]);

  const clearValue = useCallback(() => {
    setDataState(null);
    
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }, [key]);

  return [data, setValue, clearValue];
}

// Specialized hook for filter caching with URL parameter synchronization
export function useFilterCache<T extends Record<string, any>>(
  options: {
    cacheKey: string;
    defaultFilters: T;
    paramToFilterMap?: Record<string, string>;
    filterToParamMap?: Record<string, string>;
  }
) {
  const { cacheKey, defaultFilters, paramToFilterMap = {}, filterToParamMap = {} } = options;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get cached filters using the unified useCache hook
  const [cachedFilters, setCachedFilters, clearCachedFilters] = useCache<T>(
    cacheKey,
    defaultFilters
  );

  // Initialize filters state
  const [filters, setFiltersState] = useState<T>(() => {
    // Priority: URL params -> cached filters -> default filters
    const urlFilters: Partial<T> = {};
    
    // Extract filters from URL params
    Object.keys(defaultFilters).forEach(filterKey => {
      const paramKey = filterToParamMap[filterKey] || filterKey;
      const paramValue = searchParams.get(paramKey);
      
      if (paramValue !== null) {
        // Convert string values to appropriate types
        const defaultValue = defaultFilters[filterKey];
        if (typeof defaultValue === 'number') {
          urlFilters[filterKey as keyof T] = parseInt(paramValue) as T[keyof T];
        } else {
          urlFilters[filterKey as keyof T] = paramValue as T[keyof T];
        }
      }
    });

    // If we have URL params, use them; otherwise use cached filters
    const hasUrlParams = Object.keys(urlFilters).length > 0;
    const initialFilters = hasUrlParams ? urlFilters : (cachedFilters || defaultFilters);
    
    return { ...defaultFilters, ...initialFilters } as T;
  });

  // Memoize the current search params string to prevent unnecessary re-renders
  const searchParamsString = useMemo(() => searchParams.toString(), [searchParams]);

  // Update URL params when filters change
  const updateUrlParams = useCallback((updates: Partial<T>) => {
    const params = new URLSearchParams(searchParamsString);
    
    Object.entries(updates).forEach(([filterKey, value]) => {
      const paramKey = filterToParamMap[filterKey] || filterKey;
      
      if (value !== undefined && value !== null && value !== '') {
        params.set(paramKey, value.toString());
      } else {
        params.delete(paramKey);
      }
    });

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParamsString, router, pathname, filterToParamMap]);

  // Update filters and cache
  const updateFilters = useCallback((updates: Partial<T>) => {
    const newFilters = { ...filters, ...updates };
    setFiltersState(newFilters);
    
    // Save to cache
    setCachedFilters(newFilters);
    
    // Update URL params
    updateUrlParams(updates);
  }, [filters, setCachedFilters, updateUrlParams]);

  // Sync with URL params when they change
  useEffect(() => {
    const urlFilters: Partial<T> = {};
    let hasChanges = false;
    
    Object.keys(defaultFilters).forEach(filterKey => {
      const paramKey = filterToParamMap[filterKey] || filterKey;
      const paramValue = searchParams.get(paramKey);
      
      if (paramValue !== null) {
        const defaultValue = defaultFilters[filterKey];
        let convertedValue: T[keyof T];
        
        if (typeof defaultValue === 'number') {
          convertedValue = parseInt(paramValue) as T[keyof T];
        } else {
          convertedValue = paramValue as T[keyof T];
        }
        
        if (filters[filterKey as keyof T] !== convertedValue) {
          urlFilters[filterKey as keyof T] = convertedValue;
          hasChanges = true;
        }
      }
    });
    
    // If URL params have changed, update filters and cache
    if (hasChanges) {
      const newFilters = { ...filters, ...urlFilters };
      setFiltersState(newFilters);
      setCachedFilters(newFilters);
    }
  }, [searchParamsString, filters, defaultFilters, filterToParamMap, setCachedFilters]);

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    setCachedFilters(defaultFilters);
    updateUrlParams(defaultFilters as Partial<T>);
  }, [defaultFilters, setCachedFilters, updateUrlParams]);

  // Clear all filters and cache
  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    clearCachedFilters();
    updateUrlParams(defaultFilters as Partial<T>);
  }, [defaultFilters, clearCachedFilters, updateUrlParams]);

  return {
    filters,
    updateFilters,
    resetFilters,
    clearFilters,
    cachedFilters,
  };
}

// Utility functions for cache management
export const cacheUtils = {
  // Clear all cache entries with a specific prefix
  clearByPrefix: (prefix: string): void => {
    if (typeof window === "undefined") return;

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(
        `Cleared ${keysToRemove.length} cache entries with prefix: ${prefix}`
      );
    } catch (error) {
      console.error(`Error clearing cache with prefix ${prefix}:`, error);
    }
  },

  // Clear all cache entries
  clearAll: (): void => {
    if (typeof window === "undefined") return;

    try {
      localStorage.clear();
      console.log("All cache entries cleared");
    } catch (error) {
      console.error("Error clearing all cache:", error);
    }
  },

  // Check if cache exists and is valid
  has: (key: string): boolean => {
    if (typeof window === "undefined") return false;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return false;

      const cacheData: CacheData<any> = JSON.parse(cached);
      const now = Date.now();

      return now - cacheData.timestamp < DEFAULT_CACHE_DURATION;
    } catch (error) {
      console.error("Error checking cache:", error);
      return false;
    }
  },

  // Get cache age in milliseconds
  getAge: (key: string): number | null => {
    if (typeof window === "undefined") return null;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData: CacheData<any> = JSON.parse(cached);
      return Date.now() - cacheData.timestamp;
    } catch (error) {
      console.error("Error getting cache age:", error);
      return null;
    }
  },
}; 