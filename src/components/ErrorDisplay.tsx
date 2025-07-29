"use client";

import React from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { ExternalLinkIcon, RepeatIcon } from "@chakra-ui/icons";

interface ErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
  title?: string;
  showApiKeyButton?: boolean;
  compact?: boolean;
}

export function ErrorDisplay({
  error,
  onRetry,
  title,
  showApiKeyButton = true,
  compact = false,
}: ErrorDisplayProps) {
  const isApiKeyError =
    error?.includes("API key") ||
    error?.includes("No API key") ||
    error?.includes("API key not found");

  const isNetworkError =
    error?.includes("fetch") ||
    error?.includes("network") ||
    error?.includes("Failed to fetch");

  const getErrorTitle = () => {
    if (title) return title;
    if (isApiKeyError) return "API Key Required";
    if (isNetworkError) return "Connection Error";
    return "Something went wrong";
  };

  const getErrorDescription = () => {
    if (isApiKeyError) {
      return "You need an API key to access this data. Get a free API key from Krystal Cloud.";
    }
    if (isNetworkError) {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }
    return error;
  };

  if (compact) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        <VStack align="start" spacing={2} flex={1}>
          <Heading size="sm">{getErrorTitle()}</Heading>
          <Text fontSize="sm">{getErrorDescription()}</Text>
          {isApiKeyError && showApiKeyButton && (
            <Button
              as="a"
              href="https://cloud.krystal.app"
              target="_blank"
              rel="noopener noreferrer"
              leftIcon={<ExternalLinkIcon />}
              colorScheme="blue"
              size="sm"
            >
              Get Free API Key
            </Button>
          )}
          {onRetry && (
            <Button
              onClick={onRetry}
              leftIcon={<RepeatIcon />}
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
          )}
        </VStack>
      </Alert>
    );
  }

  return (
    <Box
      py={20}
      bg="bg.primary"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Container maxW="md">
        <VStack spacing={6} textAlign="center">
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <Heading size="md">{getErrorTitle()}</Heading>
              <Text fontSize="sm">{getErrorDescription()}</Text>
            </VStack>
          </Alert>

          {isApiKeyError && showApiKeyButton && (
            <VStack spacing={4} w="full">
              <Button
                as="a"
                href="https://cloud.krystal.app"
                target="_blank"
                rel="noopener noreferrer"
                leftIcon={<ExternalLinkIcon />}
                colorScheme="blue"
                size="lg"
                w="full"
              >
                Get Free API Key
              </Button>
              <Text fontSize="xs" color="text.muted">
                Sign up at cloud.krystal.app to get your free API key
              </Text>
            </VStack>
          )}

          {onRetry && (
            <Button
              onClick={onRetry}
              leftIcon={<RepeatIcon />}
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default ErrorDisplay;
