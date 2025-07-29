"use client";
import React, { useEffect, useState } from "react";
import {
  ChakraProvider,
  extendTheme,
  ColorModeScript,
  useColorMode,
} from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";

const createTheme = (primaryColorHex: string = "#3b82f6") => {
  // Generate color palette from hex color
  const generateColorPalette = (hex: string) => {
    // Convert hex to HSL for better color manipulation
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 59, g: 130, b: 246 }; // Default blue
    };

    const rgbToHsl = (r: number, g: number, b: number) => {
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0,
        s = 0,
        l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }
      return { h: h * 360, s: s * 100, l: l * 100 };
    };

    const hslToRgb = (h: number, s: number, l: number) => {
      h /= 360;
      s /= 100;
      l /= 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
      const m = l - c / 2;
      let r = 0,
        g = 0,
        b = 0;

      if (0 <= h && h < 1 / 6) {
        r = c;
        g = x;
        b = 0;
      } else if (1 / 6 <= h && h < 2 / 6) {
        r = x;
        g = c;
        b = 0;
      } else if (2 / 6 <= h && h < 3 / 6) {
        r = 0;
        g = c;
        b = x;
      } else if (3 / 6 <= h && h < 4 / 6) {
        r = 0;
        g = x;
        b = c;
      } else if (4 / 6 <= h && h < 5 / 6) {
        r = x;
        g = 0;
        b = c;
      } else if (5 / 6 <= h && h < 1) {
        r = c;
        g = 0;
        b = x;
      }

      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
      };
    };

    const rgbToHex = (r: number, g: number, b: number) => {
      return (
        "#" +
        [r, g, b]
          .map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
          })
          .join("")
      );
    };

    const baseRgb = hexToRgb(primaryColorHex);
    const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

    // Generate color variations
    const colors = {
      50: rgbToHex(
        hslToRgb(baseHsl.h, baseHsl.s, 95).r,
        hslToRgb(baseHsl.h, baseHsl.s, 95).g,
        hslToRgb(baseHsl.h, baseHsl.s, 95).b
      ),
      100: rgbToHex(
        hslToRgb(baseHsl.h, baseHsl.s, 90).r,
        hslToRgb(baseHsl.h, baseHsl.s, 90).g,
        hslToRgb(baseHsl.h, baseHsl.s, 90).b
      ),
      200: rgbToHex(
        hslToRgb(baseHsl.h, baseHsl.s, 80).r,
        hslToRgb(baseHsl.h, baseHsl.s, 80).g,
        hslToRgb(baseHsl.h, baseHsl.s, 80).b
      ),
      300: rgbToHex(
        hslToRgb(baseHsl.h, baseHsl.s, 70).r,
        hslToRgb(baseHsl.h, baseHsl.s, 70).g,
        hslToRgb(baseHsl.h, baseHsl.s, 70).b
      ),
      400: rgbToHex(
        hslToRgb(baseHsl.h, baseHsl.s, 60).r,
        hslToRgb(baseHsl.h, baseHsl.s, 60).g,
        hslToRgb(baseHsl.h, baseHsl.s, 60).b
      ),
      500: rgbToHex(
        hslToRgb(baseHsl.h, baseHsl.s, 50).r,
        hslToRgb(baseHsl.h, baseHsl.s, 50).g,
        hslToRgb(baseHsl.h, baseHsl.s, 50).b
      ),
      600: rgbToHex(
        hslToRgb(baseHsl.h, baseHsl.s, 40).r,
        hslToRgb(baseHsl.h, baseHsl.s, 40).g,
        hslToRgb(baseHsl.h, baseHsl.s, 40).b
      ),
      700: rgbToHex(
        hslToRgb(baseHsl.h, baseHsl.s, 30).r,
        hslToRgb(baseHsl.h, baseHsl.s, 30).g,
        hslToRgb(baseHsl.h, baseHsl.s, 30).b
      ),
      800: rgbToHex(
        hslToRgb(baseHsl.h, baseHsl.s, 20).r,
        hslToRgb(baseHsl.h, baseHsl.s, 20).g,
        hslToRgb(baseHsl.h, baseHsl.s, 20).b
      ),
      900: rgbToHex(
        hslToRgb(baseHsl.h, baseHsl.s, 10).r,
        hslToRgb(baseHsl.h, baseHsl.s, 10).g,
        hslToRgb(baseHsl.h, baseHsl.s, 10).b
      ),
    };

    return colors;
  };

  const brandColors = generateColorPalette(primaryColorHex);

  // Create blended background colors with different intensities for light/dark
  const createBlendedBackground = (hex: string, isDark: boolean = false) => {
    const rgb = hexToRgb(hex);
    const opacity = isDark ? 0.08 : 0.04; // Higher opacity for dark theme
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  };

  // Create gradient background with primary color blending
  const createGradientBackground = (hex: string, isDark: boolean = false) => {
    const rgb = hexToRgb(hex);
    const opacity1 = isDark ? 0.06 : 0.03;
    const opacity2 = isDark ? 0.03 : 0.01;

    return `linear-gradient(135deg, 
      rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity1}) 0%, 
      rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity2}) 100%)`;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 59, g: 130, b: 246 };
  };

  return extendTheme({
    config: {
      initialColorMode: "light",
      useSystemColorMode: true,
    },
    colors: {
      brand: brandColors,
      gray: {
        50: "#f8fafc",
        100: "#f1f5f9",
        200: "#e2e8f0",
        300: "#cbd5e1",
        400: "#94a3b8",
        500: "#64748b",
        600: "#475569",
        700: "#334155",
        800: "#1e293b",
        900: "#0f172a",
      },
    },
    semanticTokens: {
      colors: {
        // Text colors - semantic naming
        text: {
          // Primary text color
          primary: {
            _light: "gray.900",
            _dark: "gray.100",
          },
          // Secondary/subtle text color
          secondary: {
            _light: "gray.600",
            _dark: "gray.400",
          },
          // Muted/disabled text color
          muted: {
            _light: "gray.500",
            _dark: "gray.500",
          },
          // Common text (default)
          common: {
            _light: "gray.800",
            _dark: "gray.200",
          },
          // Link text color
          link: {
            _light: "brand.600",
            _dark: "brand.400",
          },
        },
        // Heading colors using brand color (important text)
        heading: {
          _light: brandColors[900],
          _dark: brandColors[100],
        },
        // Highlight colors using brand color (important text)
        highlight: {
          _light: brandColors[600],
          _dark: brandColors[300],
        },
        // Key numbers and metrics using brand color
        metrics: {
          _light: brandColors[800],
          _dark: brandColors[200],
        },
        // Title and header text using brand color
        title: {
          _light: brandColors[900],
          _dark: brandColors[100],
        },
        // Legacy tokens for backward compatibility
        "chakra-heading": {
          _light: brandColors[900],
          _dark: brandColors[100],
        },
        "chakra-highlight": {
          _light: brandColors[600],
          _dark: brandColors[300],
        },
        "chakra-metrics": {
          _light: brandColors[800],
          _dark: brandColors[200],
        },
        "chakra-title": {
          _light: brandColors[900],
          _dark: brandColors[100],
        },
      },
    },
    styles: {
      global: {
        body: {
          bg: createGradientBackground(primaryColorHex, false), // Light theme gradient
          color: "gray.900",
          _dark: {
            bg: createGradientBackground(primaryColorHex, true), // Dark theme gradient
            color: "white",
          },
        },
      },
    },
    components: {
      Button: {
        defaultProps: {
          colorScheme: "brand",
        },
      },
      Link: {
        baseStyle: {
          color: "text.link",
          _hover: {
            color: "highlight",
          },
        },
      },
      Text: {
        baseStyle: {
          // Use semantic text color
          color: "text.common",
        },
      },
      Heading: {
        baseStyle: {
          color: "heading",
        },
      },
      Card: {
        baseStyle: {
          bg: createBlendedBackground(primaryColorHex, false),
          _dark: {
            bg: createBlendedBackground(primaryColorHex, true),
          },
        },
      },
      Stat: {
        baseStyle: {
          ".chakra-stat__label": {
            color: "highlight",
          },
          ".chakra-stat__number": {
            color: "metrics",
          },
        },
      },
      Badge: {
        baseStyle: {
          bg: "brand.100",
          color: "brand.800",
          _dark: {
            bg: "brand.900",
            color: "brand.200",
          },
        },
      },
    },
  });
};

// Component to handle color mode changes
function ColorModeManager() {
  const { setColorMode, colorMode } = useColorMode();
  const searchParams = useSearchParams();

  useEffect(() => {
    const embedTheme = searchParams.get("theme");
    console.log(
      "ColorModeManager: embedTheme =",
      embedTheme,
      "current colorMode =",
      colorMode
    );

    if (embedTheme && embedTheme !== "auto") {
      console.log("Setting color mode to:", embedTheme);
      // Force the color mode change by updating localStorage and then setting
      localStorage.setItem("chakra-ui-color-mode", embedTheme);
      setColorMode(embedTheme as "light" | "dark");
    }
  }, [searchParams, setColorMode, colorMode]);

  return null;
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState(createTheme());

  useEffect(() => {
    const primaryColor = searchParams.get("primaryColor") || "#3b82f6";
    const embedTheme = searchParams.get("theme");
    const apiKey = searchParams.get("apiKey");

    console.log(
      "ThemeProvider: primaryColor =",
      primaryColor,
      "embedTheme =",
      embedTheme
    );

    // API key is now configured in config.ts, no longer stored in localStorage
    if (apiKey) {
      console.warn(
        "API key from URL is deprecated. API key is now configured in config.ts"
      );
    }

    // Create theme with primary color
    const newTheme = createTheme(primaryColor);

    // Handle embed theme mode
    if (embedTheme && embedTheme !== "auto") {
      // Force light or dark mode based on embed parameter
      newTheme.config.initialColorMode = embedTheme as "light" | "dark";
      newTheme.config.useSystemColorMode = false;
      console.log(
        "ThemeProvider: Setting theme config to",
        embedTheme,
        "useSystemColorMode = false"
      );
    } else {
      // Use system color mode if theme is auto or not specified
      newTheme.config.useSystemColorMode = true;
      console.log("ThemeProvider: Using system color mode");
    }

    setTheme(newTheme);
  }, [searchParams]);

  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <ColorModeManager />
        {children}
      </ChakraProvider>
    </>
  );
}
