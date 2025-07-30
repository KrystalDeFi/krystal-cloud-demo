"use client";
import React from "react";

export const dynamic = "force-dynamic";
import {
  Box,
  Flex,
  IconButton,
  Link,
  useColorMode,
  Container,
  HStack,
  Image,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { useFirebaseAnalytics } from "../hooks/useFirebaseAnalytics";

export default function NavBar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { trackButtonClick, trackNavigation } = useFirebaseAnalytics();

  const handleThemeToggle = () => {
    toggleColorMode();
    trackButtonClick("theme_toggle", {
      new_theme: colorMode === "light" ? "dark" : "light",
    });
  };

  const handleNavigationClick = (linkName: string, url: string) => {
    trackNavigation("navbar", linkName, "click");
  };

  return (
    <Box
      as="nav"
      borderBottom="1px"
      borderColor="border.primary"
      bg="bg.primary"
      position="sticky"
      top={0}
      zIndex={50}
      backdropFilter="blur(10px)"
    >
      <Container maxW="7xl" py={4}>
        <Flex align="center" justify="space-between">
          {/* Logo and Links */}
          <HStack spacing={8}>
            <Link
              href="https://cloud.krystal.app?utm_source=cloudui"
              isExternal
              _hover={{ opacity: 0.8 }}
              onClick={() => handleNavigationClick("logo", "https://cloud.krystal.app?utm_source=cloudui")}
            >
              <Image
                src={
                  colorMode === "light"
                    ? "/images/krystal_cloud_black.svg"
                    : "/images/krystal_cloud_white.svg"
                }
                alt="Krystal Cloud"
                h="40px"
                w="auto"
              />
            </Link>
            <HStack spacing={6}>
              <Link
                href="/"
                fontSize="sm"
                fontWeight="medium"
                color="text.common"
                _hover={{ color: "text.primary" }}
                onClick={() => handleNavigationClick("home", "/")}
              >
                Home
              </Link>

              <Link
                href="https://cloud-api.krystal.app/swagger/index.html"
                isExternal
                fontSize="sm"
                fontWeight="medium"
                color="text.common"
                _hover={{ color: "text.primary" }}
                onClick={() => handleNavigationClick("swagger", "https://cloud-api.krystal.app/swagger/index.html")}
              >
                Swagger
              </Link>
              <Link
                href="https://krystalapp.gitbook.io/cloud-docs/open-api/api-v1/api-references"
                isExternal
                fontSize="sm"
                fontWeight="medium"
                color="text.common"
                _hover={{ color: "text.primary" }}
                onClick={() => handleNavigationClick("api_docs", "https://krystalapp.gitbook.io/cloud-docs/open-api/api-v1/api-references")}
              >
                API Docs
              </Link>
            </HStack>
          </HStack>

          {/* Dark Mode Toggle */}
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={handleThemeToggle}
            variant="ghost"
            size="md"
            color="text.common"
            _hover={{
              bg: "bg.muted",
              color: "text.primary",
            }}
          />
        </Flex>
      </Container>
    </Box>
  );
}
