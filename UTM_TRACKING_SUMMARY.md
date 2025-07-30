# UTM Tracking Implementation Summary

All links to krystal.app and defi.krystal.app have been updated to include `utm_source=CLOUD` for tracking purposes.

## Files Updated

### 1. Navigation Components
- **`src/app/NavBar.tsx`**
  - Logo link: `https://cloud.krystal.app?utm_source=CLOUD`
  - Swagger link: `https://cloud-api.krystal.app/swagger/index.html?utm_source=CLOUD`

- **`src/app/Footer.tsx`**
  - Krystal link: `https://krystal.app?utm_source=CLOUD`

### 2. Error Handling Components
- **`src/components/ErrorDisplay.tsx`**
  - API key links: `https://cloud.krystal.app?utm_source=CLOUD`

- **`src/components/ErrorBoundary.tsx`**
  - API key links: `https://cloud.krystal.app?utm_source=CLOUD`

### 3. Detail Pages
- **`src/app/pools/[chainId]/[poolId]/page.tsx`**
  - Krystal link: `https://defi.krystal.app/pools/detail?...&utm_source=CLOUD`

- **`src/app/positions/[chainId]/[positionId]/page.tsx`**
  - Krystal link: `https://defi.krystal.app/account/...?chainId=...&utm_source=CLOUD`

### 4. Embed Configuration
- **`src/components/EmbedButton.tsx`**
  - Generated shareable links and embed codes now include `utm_source=CLOUD`

### 5. Documentation
- **`README.md`**
  - Updated links to include UTM tracking
  - Added UTM tracking to feature list

- **`test-embed.html`**
  - All embed examples now include `utm_source=CLOUD`

### 6. Utility Function
- **`src/common/config.ts`**
  - Added `addUtmTracking()` utility function for future use

## UTM Parameters Added

All external links now include:
- `utm_source=CLOUD` - Identifies traffic coming from the Cloud UI demo

## Examples

### Before:
```html
<a href="https://cloud.krystal.app">Get API Key</a>
```

### After:
```html
<a href="https://cloud.krystal.app?utm_source=CLOUD">Get API Key</a>
```

### Generated Embed Code:
```html
<iframe src="https://cloud-ui.krystal.app/pools?embed=1&primaryColor=%23ff6b35&theme=dark&showNavigation=false&utm_source=CLOUD" width="100%" height="600px" frameborder="0"></iframe>
```

## Benefits

1. **Analytics Tracking**: All traffic from the Cloud UI demo can be tracked separately
2. **Attribution**: Clear identification of traffic sources
3. **Conversion Tracking**: Measure effectiveness of the demo in driving signups
4. **User Journey**: Track how users move from demo to main products

## Implementation Notes

- UTM parameters are added using URL search parameters
- Existing parameters are preserved and UTM is appended
- All generated embed codes include UTM tracking
- No breaking changes to existing functionality 