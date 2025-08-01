"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  FormControl,
  FormLabel,
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
  Switch,
  Spinner,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { IEmbedConfig } from "../common/config";
import { useEmbedConfig } from "../contexts/EmbedConfigContext";
import { useFirebaseAnalytics } from "../hooks/useFirebaseAnalytics";

export default function EmbedButton() {
  const {
    embedConfig,
    setEmbedConfig,
    updateEmbedConfig,
    isEmbedMode: contextIsEmbedMode,
    isConfigDisabled: contextIsConfigDisabled,
  } = useEmbedConfig();
  const { trackButtonClick, trackEmbedInteraction } = useFirebaseAnalytics();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  const [mounted, setMounted] = useState(false);
  const [isValidHex, setIsValidHex] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasLoadedFromUrl, setHasLoadedFromUrl] = useState(false);

  // Determine embed mode and config disabled from URL params
  const isEmbedMode = searchParams.get("embed") === "1";
  const isConfigDisabled = searchParams.get("config") === "disabled";

  console.log("EmbedButton Config State:", {
    embed: searchParams.get("embed"),
    config: searchParams.get("config"),
    isEmbedMode,
    isConfigDisabled,
    willShowButton: !isConfigDisabled && embedConfig,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load embed config from URL params on mount and when search params change
  useEffect(() => {
    if (!mounted || hasLoadedFromUrl) return;

    const primaryColor = searchParams.get("primaryColor");
    const theme = searchParams.get("theme");
    const showNavigation = searchParams.get("showNavigation");
    const showBreadcrumbs = searchParams.get("showBreadcrumbs");

    // Only log in development mode to reduce console noise
    if (process.env.NODE_ENV === "development") {
      console.log("EmbedButton Debug:", {
        urlPrimaryColor: primaryColor,
        urlTheme: theme,
        urlShowNavigation: showNavigation,
        urlShowBreadcrumbs: showBreadcrumbs,
        currentEmbedConfig: embedConfig,
        currentLocalConfig: embedConfig, // Changed from localConfig to embedConfig
        mounted,
        hasLoadedFromUrl,
      });
    }

    // Only update config from URL params if we have URL params and haven't loaded from URL yet
    // This prevents loops by only loading from URL on first load
    if (
      (primaryColor ||
        theme ||
        showNavigation !== null ||
        showBreadcrumbs !== null) &&
      !hasLoadedFromUrl
    ) {
      const newConfig: IEmbedConfig = {
        theme:
          (theme as "light" | "dark" | "auto") || embedConfig?.theme || "auto",
        primaryColor: primaryColor || embedConfig?.primaryColor || "#3b82f6",
        showNavigation:
          showNavigation !== null
            ? showNavigation === "true"
            : (embedConfig?.showNavigation ?? true),
        showBreadcrumbs:
          showBreadcrumbs !== null
            ? showBreadcrumbs === "true"
            : (embedConfig?.showBreadcrumbs ?? true),
      };

      setEmbedConfig(newConfig);
      setHasLoadedFromUrl(true);

      // Track embed config loaded from URL
      trackEmbedInteraction("config_loaded_from_url", "embed_config", {
        has_primary_color: !!primaryColor,
        has_theme: !!theme,
        has_show_navigation: showNavigation !== null,
        has_show_breadcrumbs: showBreadcrumbs !== null,
      });
    }
  }, [
    mounted,
    hasLoadedFromUrl,
    searchParams,
    embedConfig,
    setEmbedConfig,
    trackEmbedInteraction,
  ]);

  // Validate hex color
  const validateHexColor = (color: string) => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  };

  const handleColorPickerChange = (color: string) => {
    const isValid = validateHexColor(color);
    setIsValidHex(isValid);
    if (isValid) {
      handleConfigUpdate("primaryColor", color);
    }
  };

  const handleConfigUpdate = (
    key: keyof IEmbedConfig,
    value: string | boolean
  ) => {
    if (!embedConfig) return;

    // Prevent unnecessary updates
    if (embedConfig[key] === value) return;

    setIsUpdating(true);

    // Update immediate config first for responsive UI
    updateEmbedConfig(key, value);

    // Track the configuration change
    trackEmbedInteraction("config_updated", "embed_config", {
      config_key: key,
      config_value: value,
      page: pathname,
    });

    // Update URL parameters
    const updateUrlParams = () => {
      const params = new URLSearchParams(searchParams.toString());
      if (key === "primaryColor") {
        params.set("primaryColor", value as string);
      } else if (key === "theme") {
        params.set("theme", value as string);
      } else if (key === "showNavigation") {
        params.set("showNavigation", value.toString());
      } else if (key === "showBreadcrumbs") {
        params.set("showBreadcrumbs", value.toString());
      }

      // Use replace to avoid adding to browser history
      router.replace(`${pathname}?${params.toString()}`);
    };

    // Debounce URL updates to prevent excessive calls
    const timeoutId = setTimeout(() => {
      updateUrlParams();
      setIsUpdating(false);
    }, 100);

    return () => clearTimeout(timeoutId);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // Track copy action
      trackButtonClick("copy_embed_config", {
        copy_type: label.toLowerCase().replace(" ", "_"),
        page: pathname,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleOpenEmbedConfig = () => {
    onOpen();
    trackButtonClick("open_embed_config", {
      page: pathname,
      is_embed_mode: isEmbedMode,
    });
  };

  const handleCloseConfig = () => {
    onClose();
    trackButtonClick("close_embed_config", {
      page: pathname,
    });
  };

  const generateShareableLink = () => {
    if (!embedConfig) return "";

    const params = new URLSearchParams();
    params.set("embed", "1");
    params.set("primaryColor", embedConfig.primaryColor);
    params.set("theme", embedConfig.theme);
    params.set("showNavigation", embedConfig.showNavigation.toString());
    params.set("showBreadcrumbs", embedConfig.showBreadcrumbs.toString());
    params.set("config", "disabled");
    params.set("utm_source", "cloudui");

    const shareableUrl = `${window.location.origin}${pathname}?${params.toString()}`;
    return shareableUrl;
  };

  const generateEmbedCode = () => {
    if (!embedConfig) return "";

    const params = new URLSearchParams();
    params.set("embed", "1");
    params.set("primaryColor", embedConfig.primaryColor);
    params.set("theme", embedConfig.theme);
    params.set("showNavigation", embedConfig.showNavigation.toString());
    params.set("showBreadcrumbs", embedConfig.showBreadcrumbs.toString());
    params.set("config", "disabled");
    params.set("utm_source", "cloudui");

    const embedUrl = `${window.location.origin}${pathname}?${params.toString()}`;
    return `<iframe src="${embedUrl}" width="100%" height="600px" frameborder="0"></iframe>`;
  };

  // Don't show embed button when config is disabled
  if (isConfigDisabled) {
    console.log("EmbedButton: Hiding button because config is disabled");
    return null;
  }

  if (!embedConfig) {
    console.log("EmbedButton: Hiding button because no embed config");
    return null;
  }

  console.log(
    "EmbedButton: Showing button - config disabled:",
    isConfigDisabled,
    "embed config:",
    !!embedConfig
  );

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
          Customize & Embed Page
        </Button>
      </Box>

      {/* Embed Configuration Panel */}
      <Box
        position="fixed"
        top={0}
        right={0}
        h="100vh"
        w={isOpen ? "400px" : "0"}
        bg="bg.primary"
        borderLeft="1px"
        borderColor="border.primary"
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
              borderColor="border.primary"
              bg="bg.primary"
              position="sticky"
              top={0}
              zIndex={10}
            >
              <HStack spacing={2}>
                <SettingsIcon />
                <Text fontWeight="medium">Embed Configuration</Text>
                {isUpdating && (
                  <HStack spacing={1}>
                    <Spinner size="sm" color="highlight" />
                    <Text fontSize="xs" color="text.muted">
                      Updating...
                    </Text>
                  </HStack>
                )}
              </HStack>
              <HStack spacing={2}>
                <CloseButton onClick={handleCloseConfig} size="sm" />
              </HStack>
            </Flex>

            {/* Content */}
            <Box p={6} h="calc(100vh - 80px)" overflowY="auto">
              <VStack spacing={6} align="stretch">
                {/* Display Settings */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={3}>
                    Display Settings
                  </Text>
                  <VStack spacing={4} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel fontSize="sm" mb="0">
                        Show Navigation
                      </FormLabel>
                      <HStack spacing={2}>
                        <Switch
                          isChecked={embedConfig?.showNavigation}
                          onChange={e =>
                            handleConfigUpdate(
                              "showNavigation",
                              e.target.checked
                            )
                          }
                          colorScheme="brand"
                          isDisabled={isUpdating}
                        />
                        {isUpdating && <Spinner size="sm" color="highlight" />}
                      </HStack>
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel fontSize="sm" mb="0">
                        Show Breadcrumbs
                      </FormLabel>
                      <HStack spacing={2}>
                        <Switch
                          isChecked={embedConfig?.showBreadcrumbs}
                          onChange={e =>
                            handleConfigUpdate(
                              "showBreadcrumbs",
                              e.target.checked
                            )
                          }
                          colorScheme="brand"
                          isDisabled={isUpdating}
                        />
                        {isUpdating && <Spinner size="sm" color="highlight" />}
                      </HStack>
                    </FormControl>
                  </VStack>
                </Box>

                <Divider />

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
                            embedConfig?.theme === "auto" ? "solid" : "outline"
                          }
                          colorScheme="brand"
                          onClick={() => handleConfigUpdate("theme", "auto")}
                          flex={1}
                          isDisabled={isUpdating}
                        >
                          Auto
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            embedConfig?.theme === "light" ? "solid" : "outline"
                          }
                          colorScheme="brand"
                          onClick={() => handleConfigUpdate("theme", "light")}
                          flex={1}
                          isDisabled={isUpdating}
                        >
                          Light
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            embedConfig?.theme === "dark" ? "solid" : "outline"
                          }
                          colorScheme="brand"
                          onClick={() => handleConfigUpdate("theme", "dark")}
                          flex={1}
                          isDisabled={isUpdating}
                        >
                          Dark
                        </Button>
                      </HStack>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Primary Color</FormLabel>
                      <VStack spacing={2} align="stretch">
                        {/* Color Picker */}
                        <HStack spacing={2}>
                          <Input
                            type="color"
                            value={embedConfig?.primaryColor}
                            onChange={e =>
                              handleColorPickerChange(e.target.value)
                            }
                            size="sm"
                            w="60px"
                            h="40px"
                            p={1}
                            borderRadius="md"
                            cursor="pointer"
                            isDisabled={isUpdating}
                          />
                          <Text fontSize="xs" color="text.muted" flex={1}>
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
                              bg={embedConfig?.primaryColor}
                              border="1px"
                              borderColor="border.primary"
                            />
                          </InputLeftElement>
                          <Input
                            type="text"
                            value={embedConfig?.primaryColor}
                            onChange={e =>
                              handleConfigUpdate("primaryColor", e.target.value)
                            }
                            placeholder="#3b82f6"
                            fontFamily="mono"
                            fontSize="xs"
                            borderColor={
                              isValidHex ? undefined : "status.error"
                            }
                            isDisabled={isUpdating}
                            _focus={{
                              borderColor: isValidHex
                                ? "brand.500"
                                : "status.error",
                              boxShadow: isValidHex
                                ? "0 0 0 1px var(--chakra-colors-brand-500)"
                                : "0 0 0 1px var(--chakra-colors-red-500)",
                            }}
                          />
                        </InputGroup>
                        <Text
                          fontSize="xs"
                          color={isValidHex ? "text.muted" : "status.error"}
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
                      onClick={() =>
                        copyToClipboard(generateEmbedCode(), "Embed code")
                      }
                      colorScheme="brand"
                    >
                      Copy
                    </Button>
                  </HStack>
                  <Box
                    p={3}
                    bg="bg.secondary"
                    borderRadius="md"
                    border="1px"
                    borderColor="border.primary"
                    maxH="200px"
                    overflowY="auto"
                  >
                    <Text fontSize="xs" fontFamily="mono" color="text.muted">
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
                      onClick={() =>
                        copyToClipboard(
                          generateShareableLink(),
                          "Shareable link"
                        )
                      }
                      colorScheme="green"
                    >
                      Copy Link
                    </Button>
                  </HStack>
                  <Box
                    p={3}
                    bg="bg.brand"
                    borderRadius="md"
                    border="1px"
                    borderColor="border.brand"
                  >
                    <Text
                      fontSize="xs"
                      fontFamily="mono"
                      color="status.success"
                    >
                      {generateShareableLink()}
                    </Text>
                  </Box>
                </Box>

                {/* Live Preview Note */}
                <Box p={3} bg="bg.brand" borderRadius="md">
                  <Text fontSize="sm" color="status.info">
                    💡 Changes are applied immediately. Copy the embed code to
                    use this configuration in other applications.
                  </Text>
                </Box>

                {/* Done Button */}
                <Button
                  colorScheme="brand"
                  size="lg"
                  onClick={handleCloseConfig}
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
          onClick={handleCloseConfig}
          display={{ base: "block", md: "none" }}
        />
      )}
    </>
  );
}
