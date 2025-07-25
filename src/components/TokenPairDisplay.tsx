import React from 'react';
import { HStack, Image, Text, TextProps } from '@chakra-ui/react';
import { IAToken } from '../services/apiTypes';

interface TokenPairDisplayProps {
  token0: IAToken;
  token1: IAToken;
  size?: 'sm' | 'md' | 'lg';
  showSymbols?: boolean;
  textProps?: TextProps;
}

export const TokenPairDisplay: React.FC<TokenPairDisplayProps> = ({ 
  token0, 
  token1, 
  size = 'md', 
  showSymbols = true,
  textProps = {}
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return '16px';
      case 'lg':
        return '32px';
      default:
        return '20px';
    }
  };

  return (
    <HStack spacing={2}>
      <Image
        src={token0.logo}
        alt={token0.symbol}
        boxSize={getSize()}
        borderRadius="full"
        fallbackSrc="/images/token-fallback.png"
      />
      {showSymbols && (
        <Text fontWeight="medium" {...textProps}>
          {token0.symbol}
        </Text>
      )}
      <Text>/</Text>
      <Image
        src={token1.logo}
        alt={token1.symbol}
        boxSize={getSize()}
        borderRadius="full"
        fallbackSrc="/images/token-fallback.png"
      />
      {showSymbols && (
        <Text fontWeight="medium" {...textProps}>
          {token1.symbol}
        </Text>
      )}
    </HStack>
  );
}; 