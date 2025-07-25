import React from "react";
import { Box, Tooltip } from "@chakra-ui/react";

interface DotIndicatorProps {
  status: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export const DotIndicator: React.FC<DotIndicatorProps> = ({
  status,
  size = "md",
  showTooltip = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_RANGE":
        return "green.400";
      case "OUT_OF_RANGE":
        return "orange.400";
      case "CLOSED":
        return "red.400";
      default:
        return "gray.400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "IN_RANGE":
        return "In Range";
      case "OUT_OF_RANGE":
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
