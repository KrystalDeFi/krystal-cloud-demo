const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CacheData<T> {
  data: T;
  timestamp: number;
}

// Generic cache service for localStorage
export class CacheService {
  private static getCachedData<T>(key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - cacheData.timestamp < CACHE_DURATION) {
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
  }

  private static setCachedData<T>(key: string, data: T): void {
    if (typeof window === "undefined") return;

    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  }

  // Get data from cache or execute fallback function
  static async getOrFetch<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    defaultData?: T
  ): Promise<T> {
    // Try to get from cache first
    const cachedData = this.getCachedData<T>(key);
    if (cachedData !== null) {
      console.log(`Using cached data for key: ${key}`);
      return cachedData;
    }

    try {
      // Try to fetch from fallback function
      console.log(`Fetching data for key: ${key}...`);
      const data = await fallbackFn();
      console.log(`Fetched data for key: ${key} successfully`);
      this.setCachedData(key, data);
      return data;
    } catch (error) {
      console.error(`Error fetching data for key: ${key}:`, error);

      // Return default data if provided
      if (defaultData !== undefined) {
        console.log(`Using default data for key: ${key}`);
        this.setCachedData(key, defaultData);
        return defaultData;
      }

      throw error;
    }
  }

  // Get data from cache only (no fallback)
  static get<T>(key: string): T | null {
    return this.getCachedData<T>(key);
  }

  // Set data in cache
  static set<T>(key: string, data: T): void {
    this.setCachedData(key, data);
  }

  // Remove specific cache entry
  static remove(key: string): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(key);
      console.log(`Cache removed for key: ${key}`);
    } catch (error) {
      console.error(`Error removing cache for key: ${key}:`, error);
    }
  }

  // Clear all cache entries with a specific prefix
  static clearByPrefix(prefix: string): void {
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
  }

  // Clear all cache entries
  static clearAll(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.clear();
      console.log("All cache entries cleared");
    } catch (error) {
      console.error("Error clearing all cache:", error);
    }
  }

  // Check if cache exists and is valid
  static has(key: string): boolean {
    return this.getCachedData(key) !== null;
  }

  // Get cache age in milliseconds
  static getAge(key: string): number | null {
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
  }

  // Check if cache is expired
  static isExpired(key: string): boolean {
    const age = this.getAge(key);
    return age === null || age >= CACHE_DURATION;
  }
}
