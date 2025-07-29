"use client";
import React, { useEffect, useState } from "react";
import {
  ChakraProvider,
  extendTheme,
  ColorModeScript,
  useColorMode,
} from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useEmbedConfig } from "../contexts/EmbedConfigContext";

const createTheme = (primaryColorHex: string = "#3b82f6") => {
  // Generate color palette from primary color with better contrast
  const primaryColor = primaryColorHex;
  
  // Create a more vibrant version for dark mode
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

  const rgb = hexToRgb(primaryColor);
  const brightenColor = (r: number, g: number, b: number, factor: number) => {
    return `#${Math.round(Math.min(255, r + (255 - r) * factor))
      .toString(16).padStart(2, '0')}${Math.round(Math.min(255, g + (255 - g) * factor))
      .toString(16).padStart(2, '0')}${Math.round(Math.min(255, b + (255 - b) * factor))
      .toString(16).padStart(2, '0')}`;
  };

  // Create a darker version for light mode buttons
  const darkenColor = (r: number, g: number, b: number, factor: number) => {
    return `#${Math.round(r * (1 - factor))
      .toString(16).padStart(2, '0')}${Math.round(g * (1 - factor))
      .toString(16).padStart(2, '0')}${Math.round(b * (1 - factor))
      .toString(16).padStart(2, '0')}`;
  };

  const brandColors = {
    50: `${primaryColor}0a`, // 4% opacity
    100: `${primaryColor}1a`, // 10% opacity
    200: `${primaryColor}33`, // 20% opacity
    300: `${primaryColor}4d`, // 30% opacity
    400: `${primaryColor}66`, // 40% opacity
    500: primaryColor,
    600: primaryColor, // Same as 500 for now
    700: primaryColor, // Same as 500 for now
    800: primaryColor, // Same as 500 for now
    900: primaryColor, // Same as 500 for now
  };

  // Create brighter and darker versions for different themes
  const brightPrimary = brightenColor(rgb.r, rgb.g, rgb.b, 0.3);
  const darkPrimary = darkenColor(rgb.r, rgb.g, rgb.b, 0.2);

  return extendTheme({
    config: {
      initialColorMode: "light",
      useSystemColorMode: true,
    },
    colors: {
      brand: brandColors,
    },
    semanticTokens: {
      colors: {
        // Text colors - blended with primary color
        text: {
          primary: { _light: "gray.900", _dark: "white" },
          secondary: { _light: "gray.600", _dark: "gray.300" },
          muted: { _light: "gray.500", _dark: "gray.300" },
          common: { _light: "gray.800", _dark: "gray.100" },
          link: { _light: "brand.500", _dark: brightPrimary },
        },
        // Status colors - more vibrant in dark mode
        status: {
          success: { _light: "green.600", _dark: "green.400" },
          error: { _light: "red.600", _dark: "red.400" },
          warning: { _light: "orange.600", _dark: "orange.400" },
          info: { _light: "blue.600", _dark: "blue.400" },
        },
        // Background colors - blended with primary color
        bg: {
          primary: { _light: "white", _dark: "gray.900" },
          secondary: { _light: "gray.50", _dark: "gray.800" },
          muted: { _light: "gray.100", _dark: "gray.700" },
          brand: { _light: "brand.50", _dark: `${primaryColor}0a` }, // 4% opacity in dark
        },
        // Border colors - blended with primary color
        border: {
          primary: { _light: "gray.200", _dark: "gray.600" },
          secondary: { _light: "gray.300", _dark: "gray.500" },
          brand: { _light: "brand.200", _dark: `${primaryColor}33` }, // 20% opacity in dark
        },
        // Heading colors - blended with primary color
        heading: { _light: "brand.500", _dark: "brand.500" },
        // Highlight colors - more vibrant and prominent
        highlight: { _light: "brand.500", _dark: brightPrimary },
        // Metrics colors - blended with primary color
        metrics: { _light: "gray.900", _dark: "white" },
        // Title colors - blended with primary color
        title: { _light: "gray.900", _dark: "white" },
      },
    },
    styles: {
      global: (props: any) => ({
        body: {
          bg: props.colorMode === "dark" ? "gray.900" : "white",
          color: props.colorMode === "dark" ? "white" : "gray.900",
        },
      }),
    },
    components: {
      Button: {
        baseStyle: {
          _focus: {
            boxShadow: "0 0 0 3px var(--chakra-colors-brand-500)",
          },
        },
        variants: {
          solid: {
            bg: "brand.500",
            color: "white",
            _hover: {
              bg: "brand.600",
            },
            _active: {
              bg: "brand.700",
            },
          },
          outline: {
            borderColor: "brand.500",
            color: "brand.500",
            _hover: {
              bg: "brand.50",
              _dark: {
                bg: `${primaryColor}0a`, // 4% opacity
              },
            },
          },
          ghost: {
            color: "brand.500",
            _hover: {
              bg: "brand.50",
              _dark: {
                bg: `${primaryColor}0a`, // 4% opacity
              },
            },
          },
        },
      },
      Text: {
        baseStyle: {
          color: "text.common",
        },
      },
      Heading: {
        baseStyle: {
          color: "heading",
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
      Stat: {
        baseStyle: {
          label: {
            color: "text.secondary",
          },
          number: {
            color: "brand.500",
          },
          helpText: {
            color: "text.muted",
          },
        },
      },
      Card: {
        baseStyle: {
          bg: "bg.primary",
          borderColor: "border.primary",
        },
      },
      Badge: {
        baseStyle: {
          bg: "bg.muted",
          color: "text.common",
        },
      },
      Input: {
        baseStyle: {
          field: {
            bg: "bg.primary",
            borderColor: "border.primary",
            _focus: {
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
            },
          },
        },
      },
      Select: {
        baseStyle: {
          field: {
            bg: "bg.primary",
            borderColor: "border.primary",
            _focus: {
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
            },
          },
        },
      },
      Switch: {
        baseStyle: {
          track: {
            bg: "gray.200",
            _checked: {
              bg: "brand.500",
            },
          },
          thumb: {
            bg: "white",
          },
        },
      },
      Spinner: {
        baseStyle: {
          color: "highlight",
        },
      },
      Icon: {
        baseStyle: {
          color: "text.common",
        },
      },
    },
  });
};

// Component to handle color mode changes
function ColorModeManager() {
  const { setColorMode, colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Only run on client side

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
      if (typeof window !== "undefined") {
        localStorage.setItem("chakra-ui-color-mode", embedTheme);
      }
      setColorMode(embedTheme as "light" | "dark");
    }
  }, [searchParams, setColorMode, colorMode, mounted]);

  return null;
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const { embedConfig } = useEmbedConfig();
  const [theme, setTheme] = useState(() => {
    // Create a consistent initial theme to prevent hydration mismatches
    const initialTheme = createTheme("#3b82f6");
    initialTheme.config.useSystemColorMode = true;
    initialTheme.config.initialColorMode = "light";
    return initialTheme;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Don't update theme until client is mounted

    // Get primary color from embed config or URL params
    const primaryColor = embedConfig?.primaryColor || searchParams.get("primaryColor") || "#3b82f6";
    const embedTheme = embedConfig?.theme || searchParams.get("theme");
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
  }, [searchParams, mounted, embedConfig]);

  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        {mounted && <ColorModeManager />}
        {children}
      </ChakraProvider>
    </>
  );
}
