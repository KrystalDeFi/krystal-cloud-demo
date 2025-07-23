"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
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
  Badge,
  Link,
  useToast,
  Collapse,
  Flex,
  CloseButton,
} from "@chakra-ui/react";
import { ExternalLinkIcon, SettingsIcon } from "@chakra-ui/icons";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { IEmbedConfig } from "../common/config";

export default function EmbedButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  
  const isEmbedMode = searchParams.get("embed") === "true";
  const [config, setConfig] = useState<IEmbedConfig>({
    theme: "auto",
    primaryColor: "blue",
    showHeader: true,
    showFooter: true,
    height: "600px",
    width: "100%",
  });
  const [mounted, setMounted] = useState(false);

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Load config from URL params
    const theme = searchParams.get("theme") as "light" | "dark" | "auto" || "auto";
    const primaryColor = searchParams.get("primaryColor") || "blue";
    const showHeader = searchParams.get("showHeader") !== "false";
    const showFooter = searchParams.get("showFooter") !== "false";
    const height = searchParams.get("height") || "600px";
    const width = searchParams.get("width") || "100%";

    setConfig({
      theme,
      primaryColor,
      showHeader,
      showFooter,
      height,
      width,
    });
  }, [searchParams]);

  const updateConfig = (key: keyof IEmbedConfig, value: string | boolean) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);

    // Update URL params without page reload
    const params = new URLSearchParams(searchParams.toString());
    params.set(key.toString(), value.toString());
    
    // Use replace to update URL without navigation
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const generateEmbedCode = () => {
    if (!mounted) return "";
    
    const params = new URLSearchParams();
    params.set("embed", "true");
    params.set("theme", config.theme);
    params.set("primaryColor", config.primaryColor);
    params.set("showHeader", config.showHeader.toString());
    params.set("showFooter", config.showFooter.toString());
    params.set("height", config.height);
    params.set("width", config.width);

    const embedUrl = `${window.location.origin}${pathname}?${params.toString()}`;
    
    return `<iframe 
  src="${embedUrl}"
  width="${config.width}"
  height="${config.height}"
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

  if (isEmbedMode) {
    return null; // Don't show embed button in embed mode
  }

  return (
    <>
      {/* Fixed Embed Button */}
      <Box
        position="fixed"
        bottom={4}
        right={4}
        zIndex={998}
      >
        <Button
          onClick={onOpen}
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
              <CloseButton onClick={onClose} size="sm" />
            </Flex>

            {/* Content */}
            <Box p={6}>
              <VStack spacing={6} align="stretch">
                {/* Current Page Info */}
                <Box p={4} bg="gray.50" _dark={{ bg: "gray.700" }} borderRadius="lg">
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Current Page
                  </Text>
                  <Text fontSize="xs" fontFamily="mono" color="gray.600" _dark={{ color: "gray.300" }}>
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
                      <Select
                        value={config.theme}
                        onChange={(e) => updateConfig("theme", e.target.value)}
                        size="sm"
                      >
                        <option value="auto">Auto (System)</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Primary Color</FormLabel>
                      <Select
                        value={config.primaryColor}
                        onChange={(e) => updateConfig("primaryColor", e.target.value)}
                        size="sm"
                      >
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="purple">Purple</option>
                        <option value="red">Red</option>
                        <option value="orange">Orange</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </Box>

                <Divider />

                {/* Display Options */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={3}>
                    Display Options
                  </Text>
                  <VStack spacing={4} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel fontSize="sm" mb="0">
                        Show Header
                      </FormLabel>
                      <Switch
                        isChecked={config.showHeader}
                        onChange={(e) => updateConfig("showHeader", e.target.checked)}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel fontSize="sm" mb="0">
                        Show Footer
                      </FormLabel>
                      <Switch
                        isChecked={config.showFooter}
                        onChange={(e) => updateConfig("showFooter", e.target.checked)}
                      />
                    </FormControl>
                  </VStack>
                </Box>

                <Divider />

                {/* Size Configuration */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={3}>
                    Size Configuration
                  </Text>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="sm">Width</FormLabel>
                      <Input
                        value={config.width}
                        onChange={(e) => updateConfig("width", e.target.value)}
                        size="sm"
                        placeholder="e.g., 100%, 800px"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Height</FormLabel>
                      <Input
                        value={config.height}
                        onChange={(e) => updateConfig("height", e.target.value)}
                        size="sm"
                        placeholder="e.g., 600px, 100vh"
                      />
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
                    <Button size="sm" onClick={copyToClipboard} colorScheme="brand">
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
                    <Text fontSize="xs" fontFamily="mono" color="gray.600" _dark={{ color: "gray.300" }}>
                      {generateEmbedCode()}
                    </Text>
                  </Box>
                </Box>

                {/* Live Preview Note */}
                <Box p={3} bg="blue.50" _dark={{ bg: "blue.900" }} borderRadius="md">
                  <Text fontSize="sm" color="blue.700" _dark={{ color: "blue.200" }}>
                    💡 Changes are applied immediately. Copy the embed code to use this configuration in other applications.
                  </Text>
                </Box>
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
          onClick={onClose}
          display={{ base: "block", md: "none" }}
        />
      )}
    </>
  );
} 