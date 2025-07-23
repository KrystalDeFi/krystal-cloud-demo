"use client";
import React, { useEffect, useState } from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";

const createTheme = (primaryColor: string = "blue") => {
  const colorSchemes: { [key: string]: any } = {
    blue: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
    green: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },
    purple: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7c3aed",
      800: "#6b21a8",
      900: "#581c87",
    },
    red: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
    orange: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316",
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
    },
  };

  return extendTheme({
    config: {
      initialColorMode: "light",
      useSystemColorMode: true,
    },
    colors: {
      brand: colorSchemes[primaryColor] || colorSchemes.blue,
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
    styles: {
      global: {
        body: {
          bg: "gray.50",
          color: "gray.900",
          _dark: {
            bg: "gray.900",
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
          color: "brand.600",
          _dark: {
            color: "brand.400",
          },
          _hover: {
            color: "brand.700",
            _dark: {
              color: "brand.300",
            },
          },
        },
      },
    },
  });
};

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState(createTheme());

  useEffect(() => {
    const primaryColor = searchParams.get("primaryColor") || "blue";
    const embedTheme = searchParams.get("theme");
    
    // Handle embed theme mode
    if (embedTheme && embedTheme !== "auto") {
      // Force light or dark mode based on embed parameter
      const forcedTheme = createTheme(primaryColor);
      forcedTheme.config.initialColorMode = embedTheme as "light" | "dark";
      forcedTheme.config.useSystemColorMode = false;
      setTheme(forcedTheme);
    } else {
      setTheme(createTheme(primaryColor));
    }
  }, [searchParams]);

  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
} 