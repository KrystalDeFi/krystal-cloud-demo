# Cache Hooks

This directory contains React hooks for caching data with localStorage persistence and React integration.

## Unified Cache Hook

### `useCache<T>`

A unified React hook that can handle both data fetching and simple key-value caching with automatic localStorage persistence.

#### Data Fetching Mode

```typescript
const { data, loading, error, refetch, invalidate, setData } = useCache<T>(
  key: string,
  options: CacheOptions & { fetcher: () => Promise<T> }
);
```

**Parameters:**
- `key`: Unique cache key for localStorage
- `options`: Configuration object
  - `fetcher`: Async function that fetches the data
  - `duration`: Cache duration in milliseconds (default: 24 hours)
  - `defaultData`: Fallback data if fetch fails
  - `enabled`: Whether the hook is enabled (default: true)

**Returns:**
- `data`: Cached data or null
- `loading`: Loading state
- `error`: Error message if fetch failed
- `refetch`: Function to manually refetch data
- `invalidate`: Function to clear cache
- `setData`: Function to manually set data (useful for optimistic updates)

**Example:**
```typescript
const { data: chains, loading, error } = useCache(
  'chains',
  {
    fetcher: () => KrystalApi.chains.getAll(apiKey),
    defaultData: DEFAULT_CHAINS
  }
);
```

#### Simple Key-Value Mode

```typescript
const [value, setValue, clearValue] = useCache<T>(
  key: string,
  defaultValue?: T
);
```

**Parameters:**
- `key`: Unique cache key for localStorage
- `defaultValue`: Default value if no cached data exists

**Returns:**
- `value`: Cached value or null
- `setValue`: Function to set and cache a value
- `clearValue`: Function to clear the cached value

**Example:**
```typescript
const [userPreferences, setUserPreferences, clearPreferences] = useCache(
  'user_preferences',
  { theme: 'light', language: 'en' }
);
```

### `useFilterCache<T>`

A specialized hook for managing filter options with URL parameter synchronization.

```typescript
const { filters, updateFilters, resetFilters, clearFilters, cachedFilters } = useFilterCache<T>(
  options: UseFilterCacheOptions
);
```

**Flow:**
1. Default filter options are from URL params, then localStorage cache
2. If URL params differ from cache, the cache is updated
3. When user changes filters, both URL params and cache are updated

**Parameters:**
- `cacheKey`: Unique cache key for localStorage
- `defaultFilters`: Default filter values
- `paramToFilterMap`: Optional mapping from URL param names to filter names
- `filterToParamMap`: Optional mapping from filter names to URL param names

**Returns:**
- `filters`: Current filter state
- `updateFilters`: Function to update filters
- `resetFilters`: Function to reset to defaults
- `clearFilters`: Function to clear all filters
- `cachedFilters`: Raw cached filter data

**Example:**
```typescript
const { filters, updateFilters } = useFilterCache({
  cacheKey: 'pools_filters',
  defaultFilters: {
    token: undefined,
    chainId: undefined,
    sortBy: SORT_OPTIONS.TVL,
    limit: 50,
    offset: 0,
  }
});
```

## Usage Patterns

### Data Fetching with Cache
```typescript
// For API data that needs to be fetched and cached
const { data, loading, error, refetch } = useCache('api_data', {
  fetcher: () => fetchDataFromAPI(),
  defaultData: fallbackData,
  duration: 30 * 60 * 1000 // 30 minutes
});
```

### Simple Key-Value Storage
```typescript
// For user preferences, settings, etc.
const [theme, setTheme, clearTheme] = useCache('user_theme', 'light');
```

### Filter State Management
```typescript
// For complex filter states with URL sync
const { filters, updateFilters } = useFilterCache({
  cacheKey: 'search_filters',
  defaultFilters: { query: '', category: 'all', sort: 'newest' }
});
```

## Utility Functions

### `cacheUtils`

Utility functions for cache management:

- `clearByPrefix(prefix)`: Clear all cache entries with a specific prefix
- `clearAll()`: Clear all cache entries
- `has(key)`: Check if cache exists and is valid
- `getAge(key)`: Get cache age in milliseconds

## Migration from CacheService

The old `CacheService` class is deprecated. Here's how to migrate:

**Before:**
```typescript
const data = await CacheService.getOrFetch('key', fetchData);
CacheService.set('key', data);
CacheService.remove('key');
```

**After (Data Fetching):**
```typescript
const { data, setData, invalidate } = useCache('key', {
  fetcher: fetchData
});
setData(newData);
invalidate();
```

**After (Simple Storage):**
```typescript
const [value, setValue, clearValue] = useCache('key', defaultValue);
setValue(newValue);
clearValue();
```

## Benefits

1. **Unified API**: Single hook for both data fetching and simple caching
2. **React Integration**: Automatic re-renders when cache changes
3. **Loading States**: Built-in loading and error states for data fetching
4. **TypeScript Support**: Better type inference and generic support
5. **SSR Support**: Proper handling of server-side rendering
6. **Abort Controller**: Automatic request cancellation on unmount
7. **Optimistic Updates**: Manual data setting for immediate UI updates
8. **Flexible**: Choose between data fetching or simple key-value mode 