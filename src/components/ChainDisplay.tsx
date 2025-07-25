import React from "react";
import { HStack, Image, Text, TextProps } from "@chakra-ui/react";
import { IAChain } from "../services/apiTypes";

interface ChainDisplayProps {
  chain: IAChain;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  textProps?: TextProps;
}

export const ChainDisplay: React.FC<ChainDisplayProps> = ({
  chain,
  size = "md",
  showName = true,
  textProps = {},
}) => {
  const getSize = () => {
    switch (size) {
      case "sm":
        return "16px";
      case "lg":
        return "24px";
      default:
        return "20px";
    }
  };

  return (
    <HStack spacing={2}>
      <Image
        src={chain.logo}
        alt={chain.name}
        boxSize={getSize()}
        borderRadius="full"
        fallbackSrc="/images/token-fallback.png"
      />
      {showName && (
        <Text fontSize="sm" {...textProps}>
          {chain.name}
        </Text>
      )}
    </HStack>
  );
};
