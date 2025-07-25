"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { KrystalApi } from "../services/krystalApi";

export default function ApiKeyHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const apiKey = searchParams.get("apiKey");
    
    if (apiKey) {
      // Store the API key in localStorage
      KrystalApi.setApiKey(apiKey);
      
      // Remove the apiKey parameter from the URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("apiKey");
      
      // Construct the new URL
      const newUrl = newSearchParams.toString() 
        ? `${pathname}?${newSearchParams.toString()}`
        : pathname;
      
      // Replace the current URL without the apiKey parameter
      router.replace(newUrl);
    }
  }, [searchParams, router, pathname]);

  // This component doesn't render anything
  return null;
} 