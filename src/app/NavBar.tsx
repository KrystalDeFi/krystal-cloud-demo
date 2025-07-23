"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Input,
  Button,
  IconButton,
  Link,
  useColorMode,
  Container,
  HStack,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { useSearchParams } from "next/navigation";
import { KrystalApi } from "../services/krystalApi";

export default function NavBar() {
  const [apiKey, setApiKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const { colorMode, toggleColorMode } = useColorMode();
  const searchParams = useSearchParams();

  const isEmbedMode = searchParams.get("embed") === "true";
  const showHeader = searchParams.get("showHeader") !== "false";

  useEffect(() => {
    const stored = KrystalApi.getApiKey();
    setApiKey(stored);
    setInputValue(stored);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSave = () => {
    setApiKey(inputValue);
    KrystalApi.setApiKey(inputValue);
  };

  const handleClear = () => {
    setApiKey("");
    setInputValue("");
    localStorage.removeItem(KrystalApi.API_KEY_STORAGE);
  };

  // Don't render navbar in embed mode if showHeader is false
  if (isEmbedMode && !showHeader) {
    return null;
  }

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
              fontSize="2xl"
              fontWeight="bold"
              bgGradient="linear(to-r, brand.400, purple.500)"
              bgClip="text"
              _hover={{ opacity: 0.8 }}
            >
              cloud.krystal.app
            </Link>
            <HStack spacing={6}>
              <Link
                href="/"
                fontSize="sm"
                fontWeight="medium"
              >
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

          {/* API Key Input and Controls */}
          <HStack spacing={3}>
            <Box position="relative">
              <Input
                placeholder="Enter your API key"
                value={inputValue}
                onChange={handleInputChange}
                w="280px"
                pr={10}
              />
              {inputValue && (
                <Box
                  position="absolute"
                  right={3}
                  top="50%"
                  transform="translateY(-50%)"
                  w={2}
                  h={2}
                  bg="green.500"
                  borderRadius="full"
                />
              )}
            </Box>

            <Button
              onClick={handleSave}
              isDisabled={inputValue === apiKey}
              size="md"
              colorScheme="brand"
            >
              Save
            </Button>

            {apiKey && (
              <Button
                onClick={handleClear}
                size="md"
                colorScheme="red"
                variant="outline"
              >
                Clear
              </Button>
            )}
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