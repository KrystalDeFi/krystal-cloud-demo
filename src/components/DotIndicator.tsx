import React from "react";
import { Box, Tooltip } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

interface DotIndicatorProps {
  status: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

// Define the pulsing animation
const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

export const DotIndicator: React.FC<DotIndicatorProps> = ({
  status,
  size = "md",
  showTooltip = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_RANGE":
      case "OPEN":
        return "green.400";
      case "OUT_OF_RANGE":
      case "OUT_RANGE":
        return "red.400";
      case "CLOSED":
        return "gray.400";
      default:
        return "gray.400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "IN_RANGE":
      case "OPEN":
        return "In Range";
      case "OUT_OF_RANGE":
      case "OUT_RANGE":
        return "Out of Range";
      case "CLOSED":
        return "Closed";
      default:
        return status;
    }
  };

  const getSize = () => {
    switch (size) {
      case "sm":
        return "8px";
      case "lg":
        return "16px";
      default:
        return "12px";
    }
  };

  const dot = (
    <Box
      w={getSize()}
      h={getSize()}
      borderRadius="full"
      bg={getStatusColor(status)}
      display="inline-block"
      animation={status === "IN_RANGE" ? `${pulse} 2s ease-in-out infinite` : undefined}
    />
  );

  if (showTooltip) {
    return (
      <Tooltip label={getStatusText(status)} placement="top">
        {dot}
      </Tooltip>
    );
  }

  return dot;
};
