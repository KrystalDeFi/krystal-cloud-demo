# Firebase Analytics Setup

This project has been configured with Firebase Analytics to track user interactions and provide insights into how the application is being used.

## Configuration

### Files Added/Modified:

1. **`src/lib/firebase.ts`** - Firebase configuration and initialization
2. **`src/hooks/useFirebaseAnalytics.ts`** - Custom hook for analytics tracking
3. **`src/components/FirebaseProvider.tsx`** - Provider component for analytics
4. **`src/app/layout.tsx`** - Updated to include Firebase provider
5. **`src/components/EmbedButton.tsx`** - Added tracking for embed interactions
6. **`src/app/NavBar.tsx`** - Added tracking for navigation and theme toggle
7. **`src/components/ErrorDisplay.tsx`** - Added error tracking

### Dependencies Added:

```bash
npm install firebase
```

## Analytics Events Tracked

### Page Views
- Automatic page view tracking when routes change
- Tracks page title and URL

### Embed Configuration
- `embed_interaction` - Config loaded from URL, config updates
- `button_click` - Copy embed config, open/close embed panel
- Parameters: `action`, `embed_type`, `config_key`, `config_value`

### Navigation
- `navigation` - Navbar link clicks
- `button_click` - Theme toggle
- Parameters: `from`, `to`, `method`, `new_theme`

### Errors
- `error` - API key errors, network errors, general errors
- `button_click` - Error retry, get API key
- Parameters: `error_type`, `error_message`, `page`

## Usage

### Basic Tracking

```typescript
import { useFirebaseAnalytics } from "@/hooks/useFirebaseAnalytics";

function MyComponent() {
  const { trackEvent, trackButtonClick, trackPageView } = useFirebaseAnalytics();

  const handleClick = () => {
    trackButtonClick("my_button", { page: "/my-page" });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Available Tracking Functions

- `trackEvent(eventName, parameters)` - Custom event tracking
- `trackPageView(pageTitle?, pageLocation?)` - Page view tracking
- `trackButtonClick(buttonName, additionalParams?)` - Button click tracking
- `trackNavigation(from, to, method?)` - Navigation tracking
- `trackEmbedInteraction(action, embedType, additionalParams?)` - Embed-specific tracking
- `trackError(errorType, errorMessage, additionalParams?)` - Error tracking

## Firebase Configuration

The Firebase configuration is set up with:
- **Project ID**: `krystal-cloud-ui`
- **Measurement ID**: `G-5PGHRL7M5D`
- **Analytics**: Enabled with automatic page view tracking
- **Client-side only**: Analytics only initializes on the client side to avoid SSR issues

## Privacy & Compliance

- Analytics only tracks user interactions, not personal data
- No user identification or personal information is collected
- All tracking is anonymous and aggregated
- Users can opt out via browser settings or ad blockers

## Development vs Production

- In development mode, analytics events are logged to console for debugging
- In production, events are sent to Firebase Analytics
- Error handling prevents analytics failures from breaking the app

## Viewing Analytics Data

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the `krystal-cloud-ui` project
3. Navigate to Analytics > Dashboard
4. View real-time and historical data

## Custom Events

You can add custom tracking by importing the hook:

```typescript
import { useFirebaseAnalytics } from "@/hooks/useFirebaseAnalytics";

const { trackEvent } = useFirebaseAnalytics();

// Track custom event
trackEvent("custom_action", {
  action_type: "download",
  file_type: "pdf",
  user_segment: "premium"
});
``` 