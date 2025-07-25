import React, { useState } from "react";
import { Image } from "@chakra-ui/react";

type FallbackImgProps = {
  src: string;
  alt?: string;
  fallbackSrc?: string;
  [key: string]: any;
};

const DEFAULT_FALLBACK = "/images/token-fallback.png";

export const FallbackImg: React.FC<FallbackImgProps> = ({
  src,
  alt = "Token",
  fallbackSrc = DEFAULT_FALLBACK,
  ...props
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      fallbackSrc={fallbackSrc}
      boxSize="20px"
      borderRadius="md"
      {...props}
    />
  );
};
