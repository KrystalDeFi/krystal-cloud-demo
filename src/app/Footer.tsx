import {
  Box,
  Container,
  Text,
  Flex,
  Image,
  Link,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";

export function Footer() {
  const logoColor = useColorModeValue("black", "white");

  return (
    <Box
      as="footer"
      py={8}
      mt={12}
      borderTop="1px"
      borderColor="border.primary"
    >
      <Container maxW="7xl">
        <HStack align="center" justify="center" spacing={4}>
          <Text fontSize="sm" color="text.muted">
            Powered by{" "}
          </Text>
          <Link href="https://krystal.app" isExternal>
            <Image
              src={
                logoColor === "black"
                  ? "/images/krystal_logo.svg"
                  : "/images/krystal_logo_white.svg"
              }
              alt="Krystal Logo"
              h="8"
            />
          </Link>
        </HStack>
      </Container>
    </Box>
  );
}
