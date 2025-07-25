import React from "react";
import { HStack, Image, Text, TextProps } from "@chakra-ui/react";
import { IAProtocol } from "../services/apiTypes";

interface ProtocolDisplayProps {
  protocol: IAProtocol;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  textProps?: TextProps;
}

export const ProtocolDisplay: React.FC<ProtocolDisplayProps> = ({
  protocol,
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
        src={protocol.logo}
        alt={protocol.name}
        boxSize={getSize()}
        borderRadius="full"
        fallbackSrc="/images/token-fallback.png"
      />
      {showName && (
        <Text fontSize="sm" {...textProps}>
          {protocol.name}
        </Text>
      )}
    </HStack>
  );
};
