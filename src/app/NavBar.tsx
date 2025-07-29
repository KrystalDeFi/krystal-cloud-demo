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
import { useSearchParams } from "next/navigation";

export default function NavBar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const searchParams = useSearchParams();

  const isEmbedMode = searchParams.get("embed") === "1";

  return (
    <Box
      as="nav"
      borderBottom="1px"
      borderColor="gray.200"
      _dark={{ borderColor: "gray.700", bg: "blackAlpha.900" }}
      position="sticky"
      top={0}
      zIndex={50}
      backdropFilter="blur(10px)"
      bg="whiteAlpha.900"
    >
      <Container maxW="7xl" py={4}>
        <Flex align="center" justify="space-between">
          {/* Logo and Links */}
          <HStack spacing={8}>
            <Link
              href="https://cloud.krystal.app"
              isExternal
              _hover={{ opacity: 0.8 }}
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
              <Link href="/" fontSize="sm" fontWeight="medium">
                Home
              </Link>

              <Link
                href="https://cloud-api.krystal.app/swagger/index.html"
                isExternal
                fontSize="sm"
                fontWeight="medium"
              >
                Swagger
              </Link>
              <Link
                href="https://krystalapp.gitbook.io/cloud-docs/open-api/api-v1/api-references"
                isExternal
                fontSize="sm"
                fontWeight="medium"
              >
                API Docs
              </Link>
            </HStack>
          </HStack>

          {/* Dark Mode Toggle */}
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="md"
          />
        </Flex>
      </Container>
    </Box>
  );
}
