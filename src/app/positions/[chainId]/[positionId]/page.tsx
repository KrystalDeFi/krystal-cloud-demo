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
  Divider,
  useColorModeValue,
  Button,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { ExternalLinkIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { KrystalApi, IPositionDetailParams } from "../../../../services/krystalApi";
import { IAPositionDetails } from "../../../../services/apiTypes";
import { CHAIN_CONFIGS } from "../../../../common/config";

export default function PositionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chainId = params.chainId as string;
  const positionId = params.positionId as string;

  const [position, setPosition] = useState<IAPositionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  const isEmbedMode = searchParams.get("embed") === "true";
  const showFooter = searchParams.get("showFooter") !== "false";

  useEffect(() => {
    fetchPositionDetails();
  }, [chainId, positionId]);

  const fetchPositionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiKey = KrystalApi.getApiKey();
      if (!apiKey) {
        throw new Error("API key not found. Please set your API key in the navigation bar.");
      }
      
      const params: IPositionDetailParams = {
        chainId,
        positionId,
      };

      const response = await KrystalApi.positions.getById(apiKey, params);
      setPosition(response);
    } catch (err) {
      console.error("Error fetching position details:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch position details. Please check your API key.");
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

  const formatTokenAmount = (amount: number, decimals: number) => {
    return (amount / Math.pow(10, decimals)).toFixed(6);
  };

  const getChainColor = (chainId: string) => {
    return CHAIN_CONFIGS[chainId]?.color || "gray";
  };

  const getStatusColor = (status: string) => {
    return status === "OPEN" ? "green" : "red";
  };

  const getExplorerUrl = (chainId: string, address: string) => {
    return `${CHAIN_CONFIGS[chainId]?.explorer || "#"}/address/${address}`;
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading position details...</Text>
        </VStack>
      </Box>
    );
  }

  if (error || !position) {
    return (
      <Container maxW="7xl" py={6}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {error || "Position not found"}
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
                onClick={() => router.push(`/wallets/${position.walletAddress}/positions`)}
                size="sm"
              >
                Back to Wallet
              </Button>
              <HStack spacing={4} align="center">
                <Heading size="2xl">Position Details</Heading>
                <Badge colorScheme={getChainColor(position.chainId || "")} size="lg">
                  {CHAIN_CONFIGS[position.chainId || ""]?.name || position.chainId || "Unknown"}
                </Badge>
                <Badge colorScheme={getStatusColor(position.status || "OPEN")} size="lg">
                  {position.status || "OPEN"}
                </Badge>
              </HStack>
              <Text fontSize="lg" color="gray.600" _dark={{ color: "gray.300" }}>
                Position ID: {position.id}
              </Text>
            </VStack>
            <Link href={getExplorerUrl(position.chainId || "", position.poolAddress || "")} isExternal>
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
                <StatLabel>Current Value</StatLabel>
                <StatNumber fontSize="2xl">{formatCurrency(position.currentValue)}</StatNumber>
                <StatHelpText>Current position value</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} _dark={{ bg: "gray.800" }} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Initial Value</StatLabel>
                <StatNumber fontSize="2xl">{formatCurrency(position.initialValue)}</StatNumber>
                <StatHelpText>Initial investment</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} _dark={{ bg: "gray.800" }} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>P&L</StatLabel>
                <StatNumber fontSize="2xl" color={position.pnl > 0 ? "green.500" : "red.500"}>
                  {formatCurrency(position.pnl)}
                </StatNumber>
                <StatHelpText>Profit/Loss</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} _dark={{ bg: "gray.800" }} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Fees Earned</StatLabel>
                <StatNumber fontSize="2xl">{formatCurrency(position.feesEarned)}</StatNumber>
                <StatHelpText>Total fees earned</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Pool Information */}
        {position.pool && (
          <Card bg={cardBg} _dark={{ bg: "gray.800" }} mb={8} border="1px" borderColor={borderColor}>
            <CardBody>
              <Heading size="md" mb={6}>Pool Information</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box>
                  <Text fontWeight="medium" mb={2}>Pool</Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                    {position.pool.token0.symbol}/{position.pool.token1.symbol}
                  </Text>
                  <Text fontSize="xs" fontFamily="mono" color="gray.500">
                    {position.pool.poolAddress}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="medium" mb={2}>Protocol</Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                    {position.pool.protocol.name}
                  </Text>
                  <Text fontSize="xs" fontFamily="mono" color="gray.500">
                    {position.pool.protocol.factoryAddress}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="medium" mb={2}>TVL</Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                    {formatCurrency(position.pool.tvl)}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="medium" mb={2}>Fee Tier</Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                    {(position.pool.feeTier / 10000).toFixed(3)}%
                  </Text>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Position Details */}
        <Card bg={cardBg} _dark={{ bg: "gray.800" }} mb={8} border="1px" borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={6}>Position Details</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <Text fontWeight="medium" mb={2}>Wallet Address</Text>
                <Text fontSize="sm" fontFamily="mono" color="gray.600" _dark={{ color: "gray.300" }}>
                  {position.walletAddress}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>Token ID</Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                  {position.tokenId}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>Liquidity</Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                  {position.liquidity ? formatCurrency(position.liquidity) : "N/A"}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>APR</Text>
                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                  {position.apr ? `${position.apr.toFixed(2)}%` : "N/A"}
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

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