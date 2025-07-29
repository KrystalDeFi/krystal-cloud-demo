# Cache Hooks

This module provides a unified caching solution for React applications with automatic URL parameter synchronization and localStorage persistence.

## Unified `useCache` Hook

The `useCache` hook provides a single, unified interface for caching data with the following priority flow:

1. **fetchData** (if present) - Fetches fresh data from API
2. **paramKey** (if present) - Gets data from URL parameter
3. **localStorage** (if present) - Gets cached data from browser storage
4. **defaultValue** (if provided) - Uses fallback default value

### API

```typescript
function useCache<T>(
  cacheKey: string,
  options: CacheOptions<T> = {}
): CacheResult<T>;

interface CacheOptions<T> {
  defaultValue?: T;
  paramKey?: string;
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
```

### Usage Examples

#### Simple Caching with Default Value

```typescript
const { data, setData, invalidate } = useCache("user_preferences", {
  defaultValue: { theme: "light", language: "en" },
});
```

#### Caching with URL Parameter Sync

```typescript
const { data, setData } = useCache("selected_chain", {
  defaultValue: "ethereum",
  paramKey: "chain",
});
// URL: /pools?chain=polygon -> data = 'polygon'
```

#### Caching with API Fetch

```typescript
const { data, loading, error, refetch } = useCache("chains", {
  defaultValue: [],
  fetchData: async () => {
    const response = await fetch("/api/chains");
    return response.json();
  },
});
```

#### Complete Example with All Features

```typescript
const { data, loading, error, refetch, setData } = useCache("user_settings", {
  defaultValue: { theme: "light" },
  paramKey: "settings",
  fetchData: async () => {
    const response = await fetch("/api/user/settings");
    return response.json();
  },
  duration: 3600000, // 1 hour expiry
});
```

### Priority Flow

1. **fetchData**: If provided, this takes highest priority and will fetch fresh data
2. **paramKey**: If no fetchData, checks URL parameter for data
3. **localStorage**: If no param data, checks browser cache
4. **defaultValue**: If no cached data, uses the default value

### Automatic Storage

When data is obtained from `fetchData` or `paramKey`, it's automatically stored in localStorage for future use.

## Specialized Hooks

### `useFilterCache`

A specialized hook for managing filter state with URL synchronization:

```typescript
const { filters, updateFilters, resetFilters, clearFilters } = useFilterCache({
  cacheKey: "pools_filters",
  defaultFilters: {
    token: undefined,
    chainId: undefined,
    protocol: undefined,
    minTvl: undefined,
    minVolume24h: undefined,
    sortBy: "tvl",
    limit: 50,
    offset: 0,
  },
  paramToFilterMap: {
    token: "token",
    chainId: "chain",
    protocol: "protocol",
  },
  filterToParamMap: {
    token: "token",
    chainId: "chain",
    protocol: "protocol",
  },
});
```

## Utility Functions

### `cacheUtils`

```typescript
// Clear cache entries with specific prefix
cacheUtils.clearByPrefix("user_");

// Clear all cache entries
cacheUtils.clearAll();

// Check if cache exists and is valid
const hasCache = cacheUtils.has("user_preferences");

// Get cache age in milliseconds
const age = cacheUtils.getAge("user_preferences");
```

## Migration Guide

### From Old API

**Before:**

```typescript
// Simple key-value cache
const [data, setData, clearData] = useCache("key", defaultValue);

// Fetcher-based cache
const { data, loading, error, refetch } = useCache("key", {
  fetcher: fetchData,
  defaultData: defaultValue,
});
```

**After:**

```typescript
// Unified API
const { data, setData, invalidate } = useCache("key", {
  defaultValue: defaultValue,
});

// With fetch
const { data, loading, error, refetch } = useCache("key", {
  defaultValue: defaultValue,
  fetchData: fetchData,
});
```

## Features

- **Unified API**: Single hook for all caching needs
- **Priority Flow**: Intelligent data source selection
- **URL Sync**: Automatic URL parameter synchronization
- **Type Safety**: Full TypeScript support
- **Error Handling**: Built-in error states and retry mechanisms
- **Performance**: Efficient caching with configurable expiry
- **Flexibility**: Support for complex data types and custom serialization
