"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Button,
  Link,
  Divider,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { ExternalLinkIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { KrystalApi } from "../../../../services/krystalApi";
import { CHAIN_CONFIGS } from "../../../../common/config";
import { IAPoolDetails } from "../../../../services/apiTypes";

export default function PoolDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chainId = params.chainId as string;
  const poolId = params.poolId as string;

  const [pool, setPool] = useState<IAPoolDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  const isEmbedMode = searchParams.get("embed") === "true";
  const showFooter = searchParams.get("showFooter") !== "false";

  useEffect(() => {
    fetchPoolDetails();
  }, [chainId, poolId]);

  const fetchPoolDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiKey = KrystalApi.getApiKey();
      if (!apiKey) {
        throw new Error("API key not found. Please set your API key in the navigation bar.");
      }
      
      // Call the actual API with parameters
      const response = await KrystalApi.pools.getById(apiKey, {
        chainId,
        poolAddress: poolId,
        withIncentives: true,
      });
      
      setPool(response);
    } catch (err) {
      console.error("Error fetching pool details:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch pool details. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const getChainColor = (chainId: string) => {
    return CHAIN_CONFIGS[chainId]?.color || "gray";
  };

  const getExplorerUrl = (chainId: string, address: string) => {
    return `${CHAIN_CONFIGS[chainId]?.explorer || "#"}/address/${address}`;
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading pool details...</Text>
        </VStack>
      </Box>
    );
  }

  if (error || !pool) {
    return (
      <Container maxW="7xl" py={6}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {error || "Pool not found"}
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      <Container maxW="7xl" py={6}>
        {/* Header */}
        <VStack spacing={6} mb={8}>
          <HStack w="full" justify="space-between" align="start">
            <VStack align="start" spacing={2}>
              <Button
                leftIcon={<ArrowBackIcon />}
                variant="ghost"
                onClick={() => router.push("/pools")}
                size="sm"git
              >
                Back to Pools
              </Button>
              <HStack spacing={4} align="center">
                <Heading size="2xl">{pool.token0.symbol}/{pool.token1.symbol}</Heading>
                <Badge colorScheme={getChainColor(pool.chainId)} size="lg">
                  {CHAIN_CONFIGS[pool.chainId]?.name || pool.chainId}
                </Badge>
              </HStack>
              <Text fontSize="lg" color="gray.600" _dark={{ color: "gray.300" }}>
                Pool Address: {pool.poolAddress}
              </Text>
            </VStack>
            <Link href={getExplorerUrl(pool.chainId, pool.poolAddress)} isExternal>
              <Button rightIcon={<ExternalLinkIcon />} colorScheme="brand">
                View on Explorer
              </Button>
            </Link>
          </HStack>
        </VStack>

        {/* Key Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card bg={cardBg} _dark={{ bg: "gray.800" }} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Value Locked</StatLabel>
                <StatNumber fontSize="2xl">{formatCurrency(pool.tvl)}</StatNumber>
                <StatHelpText>Current TVL</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} _dark={{ bg: "gray.800" }} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>24h Volume</StatLabel>
                <StatNumber fontSize="2xl">{formatCurrency(pool.stats24h?.volume || 0)}</StatNumber>
                <StatHelpText>24-hour trading volume</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} _dark={{ bg: "gray.800" }} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>APR</StatLabel>
                <StatNumber fontSize="2xl" color={(pool.stats24h?.apr || 0) > 0 ? "green.500" : "red.500"}>
                  {(pool.stats24h?.apr || 0).toFixed(2)}%
                </StatNumber>
                <StatHelpText>Annual percentage rate</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} _dark={{ bg: "gray.800" }} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Fee</StatLabel>
                <StatNumber fontSize="2xl">{(pool.feeTier / 10000).toFixed(3)}%</StatNumber>
                <StatHelpText>Trading fee</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Detailed Stats */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8} mb={8}>
          <GridItem>
            <Card bg={cardBg} _dark={{ bg: "gray.800" }} border="1px" borderColor={borderColor}>
              <CardBody>
                <Heading size="md" mb={6}>Pool Statistics</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Stat>
                    <StatLabel>7d Volume</StatLabel>
                    <StatNumber>{formatCurrency(pool.stats7d?.volume || 0)}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>30d Volume</StatLabel>
                    <StatNumber>{formatCurrency(pool.stats30d?.volume || 0)}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>24h Fees</StatLabel>
                    <StatNumber>{formatCurrency(pool.stats24h?.fee || 0)}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>7d Fees</StatLabel>
                    <StatNumber>{formatCurrency(pool.stats7d?.fee || 0)}</StatNumber>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} _dark={{ bg: "gray.800" }} border="1px" borderColor={borderColor}>
              <CardBody>
                <Heading size="md" mb={6}>Token Information</Heading>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="medium" mb={2}>Token 0: {pool.token0.symbol}</Text>
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                      {pool.token0.name}
                    </Text>
                    <Text fontSize="xs" fontFamily="mono" color="gray.500">
                      {pool.token0.address}
                    </Text>
                  </Box>
                  <Divider />
                  <Box>
                    <Text fontWeight="medium" mb={2}>Token 1: {pool.token1.symbol}</Text>
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                      {pool.token1.name}
                    </Text>
                    <Text fontSize="xs" fontFamily="mono" color="gray.500">
                      {pool.token1.address}
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

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