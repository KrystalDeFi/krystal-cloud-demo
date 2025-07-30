"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { IEmbedConfig } from "../common/config";

const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CacheData<T> {
  data: T;
  timestamp: number;
}

interface CacheOptions<T> {
  defaultValue?: T;
  paramKey?: string;
  syncParams?: boolean;
  fetchData?: () => Promise<T>;
  duration?: number; // empty = no expiry
}

interface CacheResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
  setData: (data: T) => void;
}

/**
 * Unified cache hook with priority flow:
 * fetchData (if present) > data from paramKey (if present) > data stored in localStorage (if present) > default value
 *
 * If data is present in params or fetch data, it will be stored in localStorage for next time use
 */
export function useCache<T>(
  cacheKey: string,
  options: CacheOptions<T> = {}
): CacheResult<T> {
  const {
    defaultValue,
    paramKey,
    fetchData,
    duration = DEFAULT_CACHE_DURATION,
    syncParams = false,
  } = options;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initializedRef = useRef(false);

  // Get cached data from localStorage
  const getCachedData = useCallback((): T | null => {
    if (typeof window === "undefined") return null;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid (if duration is specified)
      if (duration && now - cacheData.timestamp < duration) {
        console.log(`Using cached data for key: ${cacheKey}`);
        return cacheData.data;
      } else if (!duration) {
        // No expiry specified, use cached data
        console.log(`Using cached data for key: ${cacheKey} (no expiry)`);
        return cacheData.data;
      }

      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
      console.error("Error reading cache:", error);
      localStorage.removeItem(cacheKey);
      return null;
    }
  }, [cacheKey, duration]);

  // Set data in cache (async for better performance)
  const setCachedData = useCallback(
    async (data: T): Promise<void> => {
      if (typeof window === "undefined") return;

      try {
        const cacheData: CacheData<T> = {
          data,
          timestamp: Date.now(),
        };

        // Use requestIdleCallback for better performance if available
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            console.log(`Cached data for key: ${cacheKey}`);
          });
        } else {
          // Fallback to setTimeout for non-blocking operation
          setTimeout(() => {
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            console.log(`Cached data for key: ${cacheKey}`);
          }, 0);
        }
      } catch (error) {
        console.error("Error setting cache:", error);
      }
    },
    [cacheKey]
  );

  // Get data from URL parameter
  const getParamData = useCallback((): T | null => {
    if (!paramKey) return null;

    try {
      const paramValue = searchParams.get(paramKey);
      if (paramValue === null) return null;

      // Try to parse as JSON first, then as primitive
      try {
        const parsed = JSON.parse(paramValue);
        console.log(
          `Using param data for key: ${cacheKey} from param: ${paramKey}`
        );
        return parsed;
      } catch {
        // If not JSON, try to convert to appropriate type based on defaultValue
        if (defaultValue !== undefined) {
          if (typeof defaultValue === "number") {
            return Number(paramValue) as T;
          } else if (typeof defaultValue === "boolean") {
            return (paramValue === "true") as T;
          } else {
            return paramValue as T;
          }
        }
        return paramValue as T;
      }
    } catch (error) {
      console.error("Error reading param data:", error);
      return null;
    }
  }, [paramKey, searchParams, defaultValue]);

  // Debounced URL update to prevent excessive router calls
  const debouncedSetParamData = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (data: T) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (!paramKey || !syncParams) return;

          try {
            const params = new URLSearchParams(searchParams.toString());
            const serializedData =
              typeof data === "object" ? JSON.stringify(data) : String(data);
            params.set(paramKey, serializedData);
            router.replace(`${pathname}?${params.toString()}`, {
              scroll: false,
            });
            console.log(
              `Set param data for key: ${cacheKey} in param: ${paramKey}`
            );
          } catch (error) {
            console.error("Error setting param data:", error);
          }
        }, 100); // 100ms debounce
      };
    })(),
    [paramKey, searchParams, router, pathname, syncParams, cacheKey]
  );

  // Set data in URL parameter (async and debounced)
  const setParamData = useCallback(
    async (data: T): Promise<void> => {
      if (!paramKey || !syncParams) return;

      // Use requestIdleCallback for better performance if available
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          debouncedSetParamData(data);
        });
      } else {
        // Fallback to setTimeout for non-blocking operation
        setTimeout(() => {
          debouncedSetParamData(data);
        }, 0);
      }
    },
    [paramKey, syncParams, debouncedSetParamData]
  );

  // Invalidate cache
  const invalidate = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(cacheKey);
      console.log(`Cache invalidated for key: ${cacheKey}`);
    } catch (error) {
      console.error(`Error invalidating cache for key: ${cacheKey}:`, error);
    }
  }, [cacheKey]);

  // Fetch data and update cache
  const refetch = useCallback(async () => {
    if (!fetchData) return;

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching data for key: ${cacheKey}...`);
      const fetchedData = await fetchData();

      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      console.log(`Fetched data for key: ${cacheKey} successfully`);
      setDataState(fetchedData);

      // Store fetched data in cache and params asynchronously
      setCachedData(fetchedData).catch(error => {
        console.error("Error caching fetched data:", error);
      });
      if (paramKey) {
        setParamData(fetchedData).catch(error => {
          console.error("Error setting param data:", error);
        });
      }
    } catch (err) {
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      console.error(`Error fetching data for key: ${cacheKey}:`, err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);

      // Return default data if provided
      if (defaultValue !== undefined) {
        console.log(`Using default data for key: ${cacheKey}`);
        setDataState(defaultValue);
        setCachedData(defaultValue).catch(error => {
          console.error("Error caching default data:", error);
        });
        if (paramKey) {
          setParamData(defaultValue).catch(error => {
            console.error("Error setting param data:", error);
          });
        }
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [
    cacheKey,
    fetchData,
    defaultValue,
    setCachedData,
    setParamData,
    paramKey,
  ]);

  // Set data manually (useful for optimistic updates)
  const setData = useCallback(
    (newData: T) => {
      // Update state immediately for responsive UI
      setDataState(newData);

      // Store data asynchronously to avoid blocking
      setCachedData(newData).catch(error => {
        console.error("Error caching data:", error);
      });

      setParamData(newData).catch(error => {
        console.error("Error setting param data:", error);
      });
    },
    [setCachedData, setParamData]
  );

  // Initialize data with priority flow
  useEffect(() => {
    if (initializedRef.current) return;

    initializedRef.current = true;
    let finalData: T | null = null;

    // Priority 1: Fetch data (if available)
    if (fetchData) {
      refetch();
      return;
    }

    // Priority 2: Data from paramKey (if present)
    if (paramKey) {
      finalData = getParamData();
      if (finalData !== null) {
        console.log(`Using param data for key: ${cacheKey}`);
        setDataState(finalData);
        setCachedData(finalData).catch(error => {
          console.error("Error caching param data:", error);
        });
        return;
      }
    }

    // Priority 3: Data stored in localStorage (if present)
    finalData = getCachedData();
    if (finalData !== null) {
      console.log(`Using cached data for key: ${cacheKey}`);
      setDataState(finalData);
      return;
    }

    // Priority 4: Default value
    if (defaultValue !== undefined) {
      console.log(`Using default data for key: ${cacheKey}`);
      setDataState(defaultValue);
      setCachedData(defaultValue).catch(error => {
        console.error("Error caching default data:", error);
      });
      if (paramKey) {
        setParamData(defaultValue).catch(error => {
          console.error("Error setting param data:", error);
        });
      }
      return;
    }

    // No data available
    setDataState(null);
  }, [
    cacheKey,
    fetchData,
    paramKey,
    defaultValue,
    getParamData,
    getCachedData,
    setCachedData,
    setParamData,
    refetch,
  ]);

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

// Specialized hook for filter caching with URL parameter synchronization
export function useFilterCache<T extends Record<string, any>>(options: {
  cacheKey: string;
  defaultFilters: T;
  filterToParamMap?: Record<string, string>;
}) {
  const { cacheKey, defaultFilters, filterToParamMap = {} } = options;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get cached filters using the unified useCache hook
  const {
    data: cachedFilters,
    setData: setCachedFilters,
    invalidate: clearCachedFilters,
  } = useCache<T>(cacheKey, { defaultValue: defaultFilters });

  // Track if we've loaded from URL params to prevent loops
  const [hasLoadedFromUrl, setHasLoadedFromUrl] = useState(false);

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
        if (typeof defaultValue === "number") {
          urlFilters[filterKey as keyof T] = parseInt(paramValue) as T[keyof T];
        } else {
          urlFilters[filterKey as keyof T] = paramValue as T[keyof T];
        }
      }
    });

    // If we have URL params, use them; otherwise use cached filters
    const hasUrlParams = Object.keys(urlFilters).length > 0;
    const initialFilters = hasUrlParams
      ? urlFilters
      : cachedFilters || defaultFilters;

    // Mark that we've loaded from URL if we found URL params
    if (hasUrlParams) {
      setHasLoadedFromUrl(true);
    }

    return { ...defaultFilters, ...initialFilters } as T;
  });

  // Memoize the current search params string to prevent unnecessary re-renders
  const searchParamsString = useMemo(
    () => searchParams.toString(),
    [searchParams]
  );

  // Update URL params when filters change (without triggering API calls)
  const updateUrlParams = useCallback(
    (updates: Partial<T>) => {
      const params = new URLSearchParams(searchParamsString);

      Object.entries(updates).forEach(([filterKey, value]) => {
        const paramKey = filterToParamMap[filterKey] || filterKey;

        if (value !== undefined && value !== null && value !== "") {
          params.set(paramKey, value.toString());
        } else {
          params.delete(paramKey);
        }
      });

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParamsString, router, pathname, filterToParamMap]
  );

  // Update filters and cache (this should trigger API call)
  const updateFilters = useCallback(
    (updates: Partial<T>) => {
      const newFilters = { ...filters, ...updates };

      console.log("useFilterCache: updating filters", updates);
      setFiltersState(newFilters);

      // Save to cache
      setCachedFilters(newFilters);

      // Update URL params (this won't trigger API call because we're not syncing back)
      updateUrlParams(updates);
    },
    [filters, setCachedFilters, updateUrlParams]
  );

  // Load from URL params only on first load (not on every URL change)
  useEffect(() => {
    if (hasLoadedFromUrl) return; // Don't reload if we've already loaded from URL

    const urlFilters: Partial<T> = {};
    let hasChanges = false;

    Object.keys(defaultFilters).forEach(filterKey => {
      const paramKey = filterToParamMap[filterKey] || filterKey;
      const paramValue = searchParams.get(paramKey);

      if (paramValue !== null) {
        const defaultValue = defaultFilters[filterKey];
        let convertedValue: T[keyof T];

        if (typeof defaultValue === "number") {
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

    // If URL params have changed and we haven't loaded from URL yet, update filters
    if (hasChanges) {
      const newFilters = { ...filters, ...urlFilters };
      setFiltersState(newFilters);
      setCachedFilters(newFilters);
      setHasLoadedFromUrl(true);
    }
  }, [
    searchParamsString,
    filters,
    defaultFilters,
    filterToParamMap,
    setCachedFilters,
    hasLoadedFromUrl,
  ]);

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
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
          console.log(`Cleared cache entry: ${key}`);
        }
      });
    } catch (error) {
      console.error("Error clearing cache by prefix:", error);
    }
  },

  // Clear all cache entries
  clearAll: (): void => {
    if (typeof window === "undefined") return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes("cache")) {
          localStorage.removeItem(key);
          console.log(`Cleared cache entry: ${key}`);
        }
      });
    } catch (error) {
      console.error("Error clearing all cache:", error);
    }
  },

  // Get cache statistics
  getStats: (): { totalEntries: number; totalSize: number } => {
    if (typeof window === "undefined") return { totalEntries: 0, totalSize: 0 };

    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.includes("cache"));
      const totalSize = cacheKeys.reduce((size, key) => {
        const item = localStorage.getItem(key);
        return size + (item ? item.length : 0);
      }, 0);

      return {
        totalEntries: cacheKeys.length,
        totalSize,
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return { totalEntries: 0, totalSize: 0 };
    }
  },
};
