# Services Documentation

## CacheService

A generic localStorage caching service that can handle any data type with automatic expiration and fallback support.

### Features

- **Generic Type Support**: Works with any data type
- **Automatic Expiration**: 24-hour cache duration (configurable)
- **Fallback Support**: Can provide default data when API fails
- **Error Handling**: Graceful error handling with logging
- **SSR Safe**: Works in both client and server environments

### Basic Usage

```typescript
import { CacheService } from './cacheService';

// Get data with fallback
const data = await CacheService.getOrFetch(
  'my_cache_key',
  async () => {
    // Your API call here
    const response = await fetch('/api/data');
    return response.json();
  },
  { defaultValue: 'fallback data' } // Optional
);

// Get data from cache only (no fallback)
const cachedData = CacheService.get('my_cache_key');

// Set data in cache
CacheService.set('my_cache_key', myData);

// Remove specific cache entry
CacheService.remove('my_cache_key');

// Clear all cache entries with a prefix
CacheService.clearByPrefix('krystal_');

// Clear all cache entries
CacheService.clearAll();

// Check if cache exists and is valid
const hasData = CacheService.has('my_cache_key');

// Get cache age in milliseconds
const age = CacheService.getAge('my_cache_key');

// Check if cache is expired
const isExpired = CacheService.isExpired('my_cache_key');
```

### Creating Custom Services

You can create your own services that use the CacheService. Here's an example:

```typescript
import { CacheService } from './cacheService';

interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

export class UserPreferencesService {
  private static CACHE_KEY = 'user_preferences';

  static async getUserPreferences(): Promise<UserPreferences> {
    return CacheService.getOrFetch(
      this.CACHE_KEY,
      async () => {
        // Your API call here
        const response = await fetch('/api/user/preferences');
        return response.json();
      },
      {
        theme: 'light',
        language: 'en',
        notifications: true,
      }
    );
  }

  static saveUserPreferences(preferences: UserPreferences): void {
    CacheService.set(this.CACHE_KEY, preferences);
  }

  static clearUserPreferences(): void {
    CacheService.remove(this.CACHE_KEY);
  }
}
```

### Usage in Components

```typescript
import { UserPreferencesService } from './services/userPreferencesService';

function MyComponent() {
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    const loadPreferences = async () => {
      const prefs = await UserPreferencesService.getUserPreferences();
      setPreferences(prefs);
    };
    loadPreferences();
  }, []);

  const savePreferences = (newPrefs) => {
    UserPreferencesService.saveUserPreferences(newPrefs);
    setPreferences(newPrefs);
  };

  // ... rest of component
}
```

### Cache Keys Convention

Use descriptive, namespaced cache keys to avoid conflicts:

- `krystal_chains_cache`
- `krystal_protocols_cache`
- `user_preferences`
- `app_settings`
- `api_data_${endpoint}`

### Error Handling

The CacheService includes comprehensive error handling:

- **JSON Parse Errors**: Automatically removes corrupted cache entries
- **localStorage Errors**: Graceful fallback when storage is unavailable
- **API Errors**: Falls back to default data when provided
- **SSR Compatibility**: Safe to use in server-side rendering

### Performance Considerations

- **Automatic Cleanup**: Expired cache entries are automatically removed
- **Minimal Storage**: Only stores necessary data with timestamps
- **Efficient Lookups**: Direct localStorage access for cached data
- **Batch Operations**: Use `clearByPrefix()` for bulk cache management

### Available Services

The `/services` directory contains only standalone and functional services:

- **`cacheService.ts`**: Generic localStorage caching service
- **`krystalApi.ts`**: API client for Krystal Cloud endpoints
- **`apiTypes.ts`**: TypeScript interfaces for API data structures

### Context Usage

The application uses React Context for state management, which internally uses the CacheService:

```typescript
import { useChainsProtocols } from '../contexts/ChainsProtocolsContext';

function MyComponent() {
  const { chains, protocols, loading, refreshAll } = useChainsProtocols();
  
  // Use the data...
}
``` 