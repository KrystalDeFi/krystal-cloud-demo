import React from "react";
import { HStack, Text, Tooltip, IconButton, Link } from "@chakra-ui/react";
import { CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";

type AddressProps = {
  address: string;
  explorerBaseUrl?: string;
  [key: string]: any;
};

function formatAddress(address: string) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const Address: React.FC<AddressProps> = ({
  address,
  explorerBaseUrl = "https://etherscan.io/address/",
  ...props
}) => {
  const handleCopy = async () => {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(address);
    }
  };

  return (
    <HStack spacing={0} fontSize={"sm"} {...props}>
      <Tooltip label={address} hasArrow>
        <Text fontFamily="mono" whiteSpace="nowrap">
          {formatAddress(address)}
        </Text>
      </Tooltip>
      <IconButton
        aria-label="Copy address"
        icon={<CopyIcon />}
        size="xs"
        variant="ghost"
        onClick={handleCopy}
        title={"Copy"}
        colorScheme="gray"
      />
      <Link
        href={`${explorerBaseUrl}${address}`}
        isExternal
        aria-label="View on explorer"
      >
        <IconButton
          icon={<ExternalLinkIcon />}
          aria-label="View on explorer"
          size="xs"
          variant="ghost"
          colorScheme="gray"
        />
      </Link>
    </HStack>
  );
};
