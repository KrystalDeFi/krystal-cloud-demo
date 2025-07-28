import { Flex, Image, Link } from "@chakra-ui/react";

export const Footer = () => {
  return (
    // {/* Footer */}
    <Flex align="center" justify="center" mt={8} fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} py={4}>
      Powered by <Link href="https://krystal.app" isExternal>
        <Image src="/images/krystal_logo.svg" alt="Krystal Logo" h="10" />
      </Link>
    </Flex>
  );
};
