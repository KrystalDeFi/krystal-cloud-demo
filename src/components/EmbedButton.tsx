"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Input,
  useColorModeValue,
  useDisclosure,
  Divider,
  useToast,
  Collapse,
  Flex,
  CloseButton,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { ExternalLinkIcon, SettingsIcon } from "@chakra-ui/icons";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { IEmbedConfig, CLOUD_API_KEY, DOMAIN } from "../common/config";

export default function EmbedButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  const isEmbedMode = searchParams.get("embed") === "1";
  const isConfigMode = searchParams.get("config") === "1";
  const [config, setConfig] = useState<IEmbedConfig>({
    theme: "auto",
    primaryColor: "#3b82f6", // Default blue
  });
  const [mounted, setMounted] = useState(false);
  const [isValidHex, setIsValidHex] = useState(true);

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Load config from URL params
    const theme =
      (searchParams.get("theme") as "light" | "dark" | "auto") || "auto";
    const primaryColor = searchParams.get("primaryColor") || "#3b82f6";

    setConfig({
      theme,
      primaryColor,
    });

    // Validate hex color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    setIsValidHex(hexRegex.test(primaryColor));

    // Auto-open config panel if we're in config mode
    if (isConfigMode && !isOpen) {
      onOpen();
    }
  }, [searchParams, isConfigMode, isOpen, onOpen]);

  const updateConfig = (key: keyof IEmbedConfig, value: string) => {
    // Validate hex color format for primaryColor
    if (key === "primaryColor") {
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      const isValid = hexRegex.test(value);
      setIsValidHex(isValid);

      if (!isValid) {
        // If invalid hex, don't update the config
        return;
      }
    }

    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);

    // Update URL params without page reload
    const params = new URLSearchParams(searchParams.toString());
    params.set(key.toString(), value.toString());
    params.set("embed", "1"); // Always add embed=1 when updating config

    // Use replace to update URL without navigation
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleColorPickerChange = (color: string) => {
    // Convert color picker value to hex format
    const hexColor = color.startsWith("#") ? color : `#${color}`;
    updateConfig("primaryColor", hexColor);
  };

  const handleOpenEmbedConfig = () => {
    // Add embed=1 and config=1 to URL and open config panel
    const params = new URLSearchParams(searchParams.toString());
    params.set("embed", "1");
    params.set("config", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    onOpen();
  };

  const generateEmbedCode = () => {
    if (!mounted) return "";

    const params = new URLSearchParams();
    params.set("embed", "1");
    params.set("theme", config.theme);
    params.set("primaryColor", config.primaryColor);

    const embedUrl = `${DOMAIN}/${pathname}?${params.toString()}`;

    return `<iframe 
  src="${embedUrl}"
  width="100%"
  height="600px"
  frameborder="0"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
></iframe>`;
  };

  const copyToClipboard = async () => {
    const embedCode = generateEmbedCode();
    try {
      await navigator.clipboard.writeText(embedCode);
      toast({
        title: "Embed code copied!",
        description: "The embed code has been copied to your clipboard.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Don't show embed button in embed mode unless we're in config mode
  if (isEmbedMode && !isConfigMode) {
    return null;
  }

  return (
    <>
      {/* Fixed Embed Button */}
      <Box position="fixed" bottom={4} right={4} zIndex={998}>
        <Button
          onClick={handleOpenEmbedConfig}
          colorScheme="gray"
          size="sm"
          borderRadius="md"
          boxShadow="md"
        >
          Embed this page
        </Button>
      </Box>

      {/* Embed Configuration Panel */}
      <Box
        position="fixed"
        top={0}
        right={0}
        h="100vh"
        w={isOpen ? "400px" : "0"}
        bg={bg}
        borderLeft="1px"
        borderColor={borderColor}
        boxShadow="xl"
        zIndex={999}
        transition="width 0.3s ease-in-out"
        overflow="hidden"
      >
        <Collapse in={isOpen} animateOpacity>
          <Box h="100%" overflowY="auto">
            {/* Header */}
            <Flex
              justify="space-between"
              align="center"
              p={4}
              borderBottom="1px"
              borderColor={borderColor}
              bg={bg}
              position="sticky"
              top={0}
              zIndex={10}
            >
              <HStack spacing={2}>
                <SettingsIcon />
                <Text fontWeight="medium">Embed Configuration</Text>
              </HStack>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Remove all embed-related params to exit embed mode
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("embed");
                    params.delete("config");
                    params.delete("theme");
                    params.delete("primaryColor");
                    router.replace(`${pathname}?${params.toString()}`, {
                      scroll: false,
                    });
                  }}
                >
                  Exit Embed Mode
                </Button>
                <CloseButton
                  onClick={() => {
                    onClose();
                    // Remove config=1 from URL when closing
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("config");
                    router.replace(`${pathname}?${params.toString()}`, {
                      scroll: false,
                    });
                  }}
                  size="sm"
                />
              </HStack>
            </Flex>

            {/* Content */}
            <Box p={6} h="calc(100vh - 80px)" overflowY="auto">
              <VStack spacing={6} align="stretch">
                {/* Current Page Info */}
                <Box
                  p={4}
                  bg="gray.50"
                  _dark={{ bg: "gray.700" }}
                  borderRadius="lg"
                >
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Current Page
                  </Text>
                  <Text
                    fontSize="xs"
                    fontFamily="mono"
                    color="gray.600"
                    _dark={{ color: "gray.300" }}
                  >
                    {pathname}
                  </Text>
                </Box>

                {/* Theme Configuration */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={3}>
                    Theme Settings
                  </Text>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="sm">Theme</FormLabel>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant={
                            config.theme === "auto" ? "solid" : "outline"
                          }
                          colorScheme="brand"
                          onClick={() => updateConfig("theme", "auto")}
                          flex={1}
                        >
                          Auto
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            config.theme === "light" ? "solid" : "outline"
                          }
                          colorScheme="brand"
                          onClick={() => updateConfig("theme", "light")}
                          flex={1}
                        >
                          Light
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            config.theme === "dark" ? "solid" : "outline"
                          }
                          colorScheme="brand"
                          onClick={() => updateConfig("theme", "dark")}
                          flex={1}
                        >
                          Dark
                        </Button>
                      </HStack>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Current:{" "}
                        {config.theme === "auto" ? "System" : config.theme}
                      </Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Primary Color</FormLabel>
                      <VStack spacing={2} align="stretch">
                        {/* Color Picker */}
                        <HStack spacing={2}>
                          <Input
                            type="color"
                            value={config.primaryColor}
                            onChange={e =>
                              handleColorPickerChange(e.target.value)
                            }
                            size="sm"
                            w="60px"
                            h="40px"
                            p={1}
                            borderRadius="md"
                            cursor="pointer"
                          />
                          <Text fontSize="xs" color="gray.500" flex={1}>
                            Click to pick a color
                          </Text>
                        </HStack>

                        {/* Hex Input */}
                        <InputGroup size="sm">
                          <InputLeftElement>
                            <Box
                              w="4"
                              h="4"
                              borderRadius="sm"
                              bg={config.primaryColor}
                              border="1px"
                              borderColor="gray.300"
                              _dark={{ borderColor: "gray.600" }}
                            />
                          </InputLeftElement>
                          <Input
                            type="text"
                            value={config.primaryColor}
                            onChange={e =>
                              updateConfig("primaryColor", e.target.value)
                            }
                            placeholder="#3b82f6"
                            fontFamily="mono"
                            fontSize="xs"
                            borderColor={isValidHex ? undefined : "red.500"}
                            _focus={{
                              borderColor: isValidHex ? "brand.500" : "red.500",
                              boxShadow: isValidHex
                                ? "0 0 0 1px var(--chakra-colors-brand-500)"
                                : "0 0 0 1px var(--chakra-colors-red-500)",
                            }}
                          />
                        </InputGroup>
                        <Text
                          fontSize="xs"
                          color={isValidHex ? "gray.500" : "red.500"}
                          mt={1}
                        >
                          {isValidHex
                            ? "Use the color picker above or enter a hex color manually (e.g., #3b82f6)"
                            : "Invalid hex color format. Please use # followed by 3 or 6 characters (e.g., #3b82f6)"}
                        </Text>
                      </VStack>
                    </FormControl>
                  </VStack>
                </Box>

                <Divider />

                {/* Embed Code */}
                <Box>
                  <HStack justify="space-between" mb={3}>
                    <Text fontSize="md" fontWeight="medium">
                      Embed Code
                    </Text>
                    <Button
                      size="sm"
                      onClick={copyToClipboard}
                      colorScheme="brand"
                    >
                      Copy
                    </Button>
                  </HStack>
                  <Box
                    p={3}
                    bg="gray.50"
                    _dark={{ bg: "gray.700" }}
                    borderRadius="md"
                    border="1px"
                    borderColor={borderColor}
                    maxH="200px"
                    overflowY="auto"
                  >
                    <Text
                      fontSize="xs"
                      fontFamily="mono"
                      color="gray.600"
                      _dark={{ color: "gray.300" }}
                    >
                      {generateEmbedCode()}
                    </Text>
                  </Box>
                </Box>

                {/* Shareable Link */}
                <Box>
                  <HStack justify="space-between" mb={3}>
                    <Text fontSize="md" fontWeight="medium">
                      Shareable Link
                    </Text>
                    <Button
                      size="sm"
                      onClick={async () => {
                        const params = new URLSearchParams();
                        params.set("embed", "1");
                        params.set("theme", config.theme);
                        params.set("primaryColor", config.primaryColor);
                        // Include API key in shareable link (now from config)
                        params.set("apiKey", CLOUD_API_KEY);
                        const shareableUrl = `${window.location.origin}${pathname}?${params.toString()}`;
                        try {
                          await navigator.clipboard.writeText(shareableUrl);
                          toast({
                            title: "Link copied!",
                            description:
                              "The shareable link has been copied to your clipboard.",
                            status: "success",
                            duration: 3000,
                            isClosable: true,
                          });
                        } catch (err) {
                          toast({
                            title: "Failed to copy",
                            description: "Please copy the link manually.",
                            status: "error",
                            duration: 3000,
                            isClosable: true,
                          });
                        }
                      }}
                      colorScheme="green"
                    >
                      Copy Link
                    </Button>
                  </HStack>
                  <Box
                    p={3}
                    bg="green.50"
                    _dark={{ bg: "green.900", borderColor: "green.700" }}
                    borderRadius="md"
                    border="1px"
                    borderColor="green.200"
                  >
                    <Text
                      fontSize="xs"
                      fontFamily="mono"
                      color="green.700"
                      _dark={{ color: "green.200" }}
                    >
                      {(() => {
                        const params = new URLSearchParams();
                        params.set("embed", "1");
                        params.set("theme", config.theme);
                        params.set("primaryColor", config.primaryColor);
                        // Include API key in shareable link display (now from config)
                        params.set("apiKey", CLOUD_API_KEY);
                        return window
                          ? `${window.location.origin}${pathname}?${params.toString()}`
                          : "";
                      })()}
                    </Text>
                  </Box>
                </Box>

                {/* Live Preview Note */}
                <Box
                  p={3}
                  bg="blue.50"
                  _dark={{ bg: "blue.900" }}
                  borderRadius="md"
                >
                  <Text
                    fontSize="sm"
                    color="blue.700"
                    _dark={{ color: "blue.200" }}
                  >
                    💡 Changes are applied immediately. Copy the embed code to
                    use this configuration in other applications.
                  </Text>
                </Box>

                {/* Done Button */}
                <Button
                  colorScheme="brand"
                  size="lg"
                  onClick={() => {
                    onClose();
                    // Remove config=1 from URL when closing
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("config");
                    router.replace(`${pathname}?${params.toString()}`, {
                      scroll: false,
                    });
                  }}
                >
                  Done
                </Button>
              </VStack>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Backdrop for mobile */}
      {isOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.300"
          zIndex={998}
          onClick={() => {
            onClose();
            // Remove config=1 from URL when closing
            const params = new URLSearchParams(searchParams.toString());
            params.delete("config");
            router.replace(`${pathname}?${params.toString()}`, {
              scroll: false,
            });
          }}
          display={{ base: "block", md: "none" }}
        />
      )}
    </>
  );
}
