import { useState, useCallback } from "react";
import { KrystalApi } from "../services/krystalApi";

interface UseApiErrorReturn {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  handleApiError: (error: unknown) => void;
  isApiKeyError: boolean;
  isNetworkError: boolean;
}

export function useApiError(): UseApiErrorReturn {
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleApiError = useCallback((error: unknown) => {
    console.error("API Error:", error);

    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    setError(errorMessage);
  }, []);

  const isApiKeyError = Boolean(
    error?.includes("API key") ||
      error?.includes("No API key") ||
      error?.includes("API key not found")
  );

  const isNetworkError = Boolean(
    error?.includes("fetch") ||
      error?.includes("network") ||
      error?.includes("Failed to fetch")
  );

  return {
    error,
    setError,
    clearError,
    handleApiError,
    isApiKeyError,
    isNetworkError,
  };
}

export function useApiKeyValidation() {
  const validateApiKey = useCallback(() => {
    const apiKey = KrystalApi.getApiKey();
    if (!apiKey) {
      throw new Error(
        "API key not configured. Please check the CLOUD_API_KEY in config.ts."
      );
    }
    return apiKey;
  }, []);

  return { validateApiKey };
}
