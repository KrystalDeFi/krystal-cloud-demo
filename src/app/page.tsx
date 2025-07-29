"use client";
import React from "react";

export const dynamic = "force-dynamic";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";
import { SearchIcon, ViewIcon, InfoIcon } from "@chakra-ui/icons";
import { useSearchParams, useRouter } from "next/navigation";
import ErrorBoundary from "../components/ErrorBoundary";
import { Footer } from "./Footer";

const pages = [
  {
    title: "Pools",
    description: "Browse and filter DeFi pools across different chains",
    defaultLink: "/pools",
    icon: SearchIcon,
  },
  {
    title: "Pool Details",
    description: "View detailed information about a specific pool",
    defaultLink: "/pools/1/0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
    icon: InfoIcon,
  },
  {
    title: "Wallet Positions",
    description: "View all positions for a specific wallet address",
    defaultLink:
      "/wallets/0x01b31dd0714678f2b4c26f2113be1528ed005340/positions",
    icon: ViewIcon,
  },
  {
    title: "Position Details",
    description: "View detailed information about a specific position",
    defaultLink:
      "/positions/1/0xc36442b4a4522e871399cd717abdd847ab11fe88-1041224",
    icon: InfoIcon,
  },
];

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const isEmbedMode = searchParams.get("embed") === "1";

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  return (
    <ErrorBoundary>
      <Box
        minH="100vh"
        bgGradient="linear(to-br, gray.50, brand.50, purple.50)"
        _dark={{
          bgGradient: "linear(to-br, gray.900, brand.900, purple.900)",
        }}
      >
        <Container maxW="7xl" py={6}>
          {!isEmbedMode && (
            <Box
              bgGradient="linear(to-br, bg.secondary, bg.brand, bg.secondary)"
              borderRadius="xl"
              p={8}
              mb={8}
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgGradient="linear(to-br, bg.secondary, bg.brand, bg.secondary)"
                opacity={0.1}
              />
              <Heading size="md" mb={4}>
                Welcome Buidlers 👋
              </Heading>
              <VStack align="start" spacing={3}>
                <Text fontWeight="medium">DeFi Pools</Text>
                <Text>You can easily customize and embed any page in your application.</Text>
                <Text>Leave us a message on{" "}
                  <Link href="https://t.me/krystalapp" isExternal>
                    Telegram
                  </Link>
                </Text>
              </VStack>
            </Box>
          )}

          {/* Available Pages */}
          <Box mb={8}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {pages.map((page, index) => (
                <Card
                  key={page.title}
                  bg="bg.primary"
                  border="1px"
                  borderColor="border.primary"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={() => router.push(page.defaultLink)}
                >
                  <CardHeader>
                    <HStack justify="space-between" align="start">
                      <HStack spacing={3}>
                        <Icon as={page.icon} boxSize={5} />
                        <VStack align="start" spacing={1}>
                          <Heading size="md">{page.title}</Heading>
                        </VStack>
                      </HStack>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <Text mb={4}>{page.description}</Text>
                    {page.defaultLink && (
                      <Box
                        mt={4}
                        p={3}
                        bg="bg.secondary"
                        borderRadius="md"
                      >
                        <Text
                          fontSize="xs"
                          fontFamily="mono"
                        >
                          Example: {page.defaultLink}
                        </Text>
                      </Box>
                    )}
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          <Footer />
        </Container>
      </Box>
    </ErrorBoundary>
  );
}
