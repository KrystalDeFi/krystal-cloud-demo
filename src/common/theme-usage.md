# Semantic Theme Usage Guide

This document shows how to use the new semantic color tokens instead of hardcoded colors.

## Available Semantic Tokens

### Text Colors
- `color="text.primary"` - Primary text (dark gray in light, light gray in dark)
- `color="text.secondary"` - Secondary/subtle text (medium gray)
- `color="text.muted"` - Muted/disabled text (light gray)
- `color="text.common"` - Default text color (used by Text component by default)
- `color="text.link"` - Link text color (brand color)

### Brand Colors (Important Text)
- `color="heading"` - Headings and titles
- `color="title"` - Page titles and important headers
- `color="highlight"` - Highlighted text and labels
- `color="metrics"` - Numbers, stats, and key metrics

## Before vs After Examples

### Before (Hardcoded colors)
```tsx
<Text color="gray.600" _dark={{ color: "gray.300" }}>
  Secondary text
</Text>

<Text color="gray.500" _dark={{ color: "gray.400" }}>
  Muted text
</Text>

<Heading color="brand.900" _dark={{ color: "brand.100" }}>
  Page Title
</Heading>
```

### After (Semantic tokens)
```tsx
<Text color="text.secondary">
  Secondary text
</Text>

<Text color="text.muted">
  Muted text
</Text>

<Heading color="title">
  Page Title
</Heading>
```

## Benefits

1. **Consistency**: All text uses the same semantic meaning across the app
2. **Maintainability**: Change colors in one place (ThemeProvider)
3. **Theme Support**: Automatically adapts to light/dark themes
4. **Readability**: Code is more semantic and self-documenting
5. **Brand Integration**: Important text automatically uses brand colors

## Migration Guide

Replace these patterns:
- `color="gray.600" _dark={{ color: "gray.300" }}` → `color="text.secondary"`
- `color="gray.500" _dark={{ color: "gray.400" }}` → `color="text.muted"`
- `color="gray.800" _dark={{ color: "gray.200" }}` → `color="text.common"`
- `color="brand.900" _dark={{ color: "brand.100" }}` → `color="title"`
- `color="brand.600" _dark={{ color: "brand.400" }}` → `color="text.link"`

## Legacy Support

The old `chakra-*` tokens are still available for backward compatibility:
- `chakra-heading` → `heading`
- `chakra-highlight` → `highlight`
- `chakra-metrics` → `metrics`
- `chakra-title` → `title` 