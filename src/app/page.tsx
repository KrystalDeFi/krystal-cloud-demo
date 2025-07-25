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
  Badge,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon, ViewIcon, InfoIcon } from "@chakra-ui/icons";
import { useSearchParams, useRouter } from "next/navigation";

const pages = [
  {
    title: "Pools",
    description: "Browse and filter DeFi pools across different chains",
    path: "/pools",
    defaultLink: "/pools",
    icon: SearchIcon,
    features: ["Filter by chain", "Search pools", "View pool details"],
    badge: "Browse",
  },
  {
    title: "Pool Details",
    description: "View detailed information about a specific pool",
    path: "/pools/[chainId]/[poolId]",
    defaultLink: "/pools/1/0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
    icon: InfoIcon,
    features: ["Pool statistics", "Token information", "Historical data"],
    badge: "Details",
    example: "/pools/ethereum/0x123...",
  },
  {
    title: "Wallet Positions",
    description: "View all positions for a specific wallet address",
    path: "/wallets/0x01b31dd0714678f2b4c26f2113be1528ed005340/positions",
    defaultLink:
      "/wallets/0x01b31dd0714678f2b4c26f2113be1528ed005340/positions",
    icon: ViewIcon,
    features: [
      "Portfolio overview",
      "Position tracking",
      "Performance metrics",
    ],
    badge: "Portfolio",
    example: "/wallets/0x1234.../positions",
  },
  {
    title: "Position Details",
    description: "View detailed information about a specific position",
    path: "/positions/[chainId]/[positionId]",
    defaultLink: "/positions/ethereum/1",
    icon: InfoIcon,
    features: [
      "Position details",
      "Transaction history",
      "Performance analysis",
    ],
    badge: "Details",
    example: "/positions/ethereum/0x567...",
  },
];

export default function Home() {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const searchParams = useSearchParams();
  const router = useRouter();

  const isEmbedMode = searchParams.get("embed") === "true";
  const showFooter = searchParams.get("showFooter") !== "false";

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, gray.50, brand.50, purple.50)"
      _dark={{
        bgGradient: "linear(to-br, gray.900, brand.900, purple.900)",
      }}
    >
      <Container maxW="7xl" py={6}>
        {/* Header */}
        <VStack spacing={6} mb={10} textAlign="center">
          <Heading
            size="2xl"
            bgGradient="linear(to-r, brand.400, purple.500)"
            bgClip="text"
            fontWeight="bold"
          >
            Krystal Cloud Demo
          </Heading>
          <Text
            fontSize="lg"
            color="gray.600"
            _dark={{ color: "gray.300" }}
            maxW="2xl"
          >
            Explore DeFi pools and positions with the Krystal Cloud API. This
            embeddable interface provides comprehensive data and analytics.
          </Text>
        </VStack>

        {/* Guidelines */}
        <Box
          bg={cardBg}
          _dark={{ bg: "gray.800" }}
          borderRadius="xl"
          p={6}
          mb={8}
          boxShadow="lg"
          border="1px"
          borderColor={borderColor}
        >
          <Heading
            size="md"
            mb={4}
            color="brand.600"
            _dark={{ color: "brand.400" }}
          >
            🚀 Getting Started
          </Heading>
          <VStack align="start" spacing={3}>
            <Text>
              <strong>Embedding:</strong> Use the embed button (bottom right) to
              customize and embed any page in your application.
            </Text>
            <Text>
              <strong>API Integration:</strong> All data is fetched from the
              Krystal Cloud API. Make sure to set your API key in the navigation
              bar.
            </Text>
            <Text>
              <strong>Customization:</strong> In embed mode, you can customize
              colors, themes, and display options through the right panel.
            </Text>
          </VStack>
        </Box>

        {/* Available Pages */}
        <Box mb={8}>
          <Heading size="lg" mb={6} textAlign="center">
            Available Pages
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {pages.map((page, index) => (
              <Card
                key={index}
                bg={cardBg}
                _dark={{ bg: "gray.800" }}
                border="1px"
                borderColor={borderColor}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "xl",
                  borderColor: "brand.300",
                }}
                transition="all 0.2s"
                cursor="pointer"
                onClick={() => handleCardClick(page.defaultLink)}
              >
                <CardHeader>
                  <HStack justify="space-between" align="start">
                    <HStack spacing={3}>
                      <Icon as={page.icon} color="brand.500" boxSize={5} />
                      <VStack align="start" spacing={1}>
                        <Heading size="md">{page.title}</Heading>
                        <Badge colorScheme="brand" variant="subtle">
                          {page.badge}
                        </Badge>
                      </VStack>
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <Text color="gray.600" _dark={{ color: "gray.300" }} mb={4}>
                    {page.description}
                  </Text>
                  <VStack align="start" spacing={2}>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.700"
                      _dark={{ color: "gray.200" }}
                    >
                      Features:
                    </Text>
                    {page.features.map((feature, idx) => (
                      <Text
                        key={idx}
                        fontSize="sm"
                        color="gray.600"
                        _dark={{ color: "gray.400" }}
                      >
                        • {feature}
                      </Text>
                    ))}
                  </VStack>
                  {page.example && (
                    <Box
                      mt={4}
                      p={3}
                      bg="gray.50"
                      _dark={{ bg: "gray.700" }}
                      borderRadius="md"
                    >
                      <Text
                        fontSize="xs"
                        fontFamily="mono"
                        color="gray.600"
                        _dark={{ color: "gray.300" }}
                      >
                        Example: {page.example}
                      </Text>
                    </Box>
                  )}
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* Footer */}
        {showFooter && (
          <Box textAlign="center" mt={8}>
            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
              Built with Next.js and Chakra UI • Powered by Krystal Cloud API
            </Text>
          </Box>
        )}
      </Container>
    </Box>
  );
}
