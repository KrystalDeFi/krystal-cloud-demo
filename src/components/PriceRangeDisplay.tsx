import React from "react";
import { VStack, HStack, Text, Box } from "@chakra-ui/react";
import { Formatter } from "../common/formatter";

interface PriceRangeDisplayProps {
  minPrice: number;
  maxPrice: number;
  currentPrice?: number;
  showPercentages?: boolean;
  showVisual?: boolean;
}

export const PriceRangeDisplay: React.FC<PriceRangeDisplayProps> = ({
  minPrice,
  maxPrice,
  currentPrice,
  showPercentages = true,
  showVisual = true,
}) => {
  const calculatePercentage = (price: number, basePrice: number) => {
    return ((price - basePrice) / basePrice) * 100;
  };

  const getCurrentPricePosition = () => {
    if (!currentPrice) return 50; // Default to middle if no current price
    const range = maxPrice - minPrice;
    if (range === 0) return 50;
    const position = ((currentPrice - minPrice) / range) * 100;
    return Math.max(0, Math.min(100, position));
  };

  return (
    <VStack align="start" spacing={1}>
      <HStack spacing={1} w="100%" justify={"space-between"}>
        <Text fontSize="xs">{Formatter.formatPrice(minPrice)}</Text>
        {showVisual && (
          <Box w="40px" h="2px" bg="gray.300" position="relative">
            <Box
              position="absolute"
              left={`${getCurrentPricePosition()}%`}
              top="-2px"
              w="4px"
              h="6px"
              bg="yellow.400"
              borderRadius="sm"
            />
          </Box>
        )}
        <Text fontSize="xs">{Formatter.formatPrice(maxPrice)}</Text>
      </HStack>
      {showPercentages && currentPrice && (
        <HStack spacing={2} justify={"space-between"} w="100%">
          <Text fontSize="xs">
            {Formatter.formatPercentage(
              calculatePercentage(minPrice, currentPrice)
            )}
          </Text>
          <Text fontSize="xs">
            {Formatter.formatPercentage(
              calculatePercentage(maxPrice, currentPrice)
            )}
          </Text>
        </HStack>
      )}
    </VStack>
  );
};
