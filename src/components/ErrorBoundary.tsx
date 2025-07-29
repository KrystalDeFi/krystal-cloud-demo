"use client";

import React, { Component, ReactNode } from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  useColorModeValue,
} from "@chakra-ui/react";
import { ExternalLinkIcon, RepeatIcon } from "@chakra-ui/icons";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {

  const isApiKeyError =
    error?.message?.includes("API key") ||
    error?.message?.includes("No API key") ||
    error?.message?.includes("API key not found");

  const isNetworkError =
    error?.message?.includes("fetch") ||
    error?.message?.includes("network") ||
    error?.message?.includes("Failed to fetch");

  const getErrorTitle = () => {
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
    return error?.message || "An unexpected error occurred. Please try again.";
  };

  return (
    <Box
      minH="100vh"
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

          {isApiKeyError && (
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
              size="lg"
            >
              Try Again
            </Button>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default ErrorBoundary;
