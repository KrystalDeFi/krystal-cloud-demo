"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo } from "react";
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
  Image,
  Divider,
  Grid,
  GridItem,
  IconButton,
} from "@chakra-ui/react";
import { ExternalLinkIcon, ArrowBackIcon, CopyIcon } from "@chakra-ui/icons";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  KrystalApi,
  IPositionDetailParams,
} from "../../../../services/krystalApi";
import { IAPositionDetails } from "../../../../services/apiTypes";
import { Formatter } from "../../../../common/formatter";
import { DotIndicator } from "../../../../components/DotIndicator";
import { ChainDisplay } from "../../../../components/ChainDisplay";
import { ProtocolDisplay } from "../../../../components/ProtocolDisplay";
import { TokenPairDisplay } from "../../../../components/TokenPairDisplay";
import { PriceRangeDisplay } from "../../../../components/PriceRangeDisplay";
import {
  useApiError,
  useApiKeyValidation,
} from "../../../../hooks/useApiError";
import { ErrorDisplay } from "../../../../components/ErrorDisplay";
import ErrorBoundary from "../../../../components/ErrorBoundary";
import { Footer } from "@/app/Footer";

function PositionDetailsPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chainId = params.chainId as string;
  const positionId = params.positionId as string;

  const [position, setPosition] = useState<IAPositionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { error, setError, handleApiError, clearError } = useApiError();
  const { validateApiKey } = useApiKeyValidation();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedTextColor = useColorModeValue("gray.600", "gray.300");

  const isEmbedMode = searchParams.get("embed") === "1";

  useEffect(() => {
    fetchPositionDetails();
  }, [chainId, positionId]);

  const fetchPositionDetails = async () => {
    try {
      setLoading(true);
      clearError();

      const apiKey = validateApiKey();

      const params: IPositionDetailParams = {
        chainId,
        positionId,
      };

      const response = await KrystalApi.positions.getById(apiKey, params);
      setPosition(response);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getCurrentPrice = useMemo(() => {
    if (!position || position.currentAmounts.length < 2) return undefined;

    const token0 = position.currentAmounts[0];
    const token1 = position.currentAmounts[1];
    if (token0.price > 0 && token1.price > 0) {
      return token0.price / token1.price;
    }
    return undefined;
  }, [position]);

  const getTotalPendingFees = useMemo(() => {
    if (!position) return 0;
    return position.tradingFee.pending.reduce((sum, fee) => sum + fee.value, 0);
  }, [position]);

  const getTotalClaimedFees = useMemo(() => {
    if (!position) return 0;
    return position.tradingFee.claimed.reduce((sum, fee) => sum + fee.value, 0);
  }, [position]);

  if (loading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading position details...</Text>
        </VStack>
      </Box>
    );
  }

  if (error || !position) {
    return (
      <ErrorDisplay
        error={error || "Position not found"}
        onRetry={fetchPositionDetails}
        title="Failed to Load Position Details"
      />
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      <Container maxW="7xl" py={6}>
        {/* Header */}
        {!isEmbedMode && (
          <VStack spacing={6} mb={8}>
            <HStack w="full" justify="space-between" align="start">
              <VStack align="start" spacing={2}>
                <Button
                  leftIcon={<ArrowBackIcon />}
                  variant="ghost"
                  onClick={() =>
                    router.push(`/wallets/${position?.ownerAddress}/positions`)
                  }
                  size="sm"
                >
                  Back to Wallet
                </Button>
                <HStack spacing={4} align="center">
                  <Heading size="2xl" color="chakra-title">
                    Position Details
                  </Heading>
                  <ChainDisplay chain={position.chain} size="lg" />
                  <ProtocolDisplay
                    protocol={position.pool.protocol}
                    size="lg"
                  />
                  <DotIndicator status={position.status} size="lg" />
                </HStack>
                <Text fontSize="lg" color={mutedTextColor}>
                  Position ID: {position.id}
                </Text>
              </VStack>
              <Link
                href={`${position.chain.explorer}/address/${position.pool.poolAddress}`}
                isExternal
              >
                <Button rightIcon={<ExternalLinkIcon />} colorScheme="blue">
                  View on Explorer
                </Button>
              </Link>
            </HStack>
          </VStack>
        )}

        {/* Key Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Current Value</StatLabel>
                <StatNumber fontSize="2xl">
                  {Formatter.formatCurrency(position.currentPositionValue || 0)}
                </StatNumber>
                <StatHelpText>Current position value</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Deposited</StatLabel>
                <StatNumber fontSize="2xl">
                  {Formatter.formatCurrency(
                    position.performance.totalDepositValue
                  )}
                </StatNumber>
                <StatHelpText>Total amount deposited</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>P&L</StatLabel>
                <StatNumber
                  fontSize="2xl"
                  color={
                    position.performance.pnl >= 0 ? "chakra-metrics" : "red.500"
                  }
                >
                  {Formatter.formatCurrency(position.performance.pnl)}
                </StatNumber>
                <StatHelpText>
                  {Formatter.formatPercentage(
                    position.performance.returnOnInvestment
                  )}{" "}
                  ROI
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total APR</StatLabel>
                <StatNumber fontSize="2xl" color="chakra-metrics">
                  {Formatter.formatAPR(position.performance.apr.totalApr)}
                </StatNumber>
                <StatHelpText>Annual percentage rate</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Performance Metrics */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} mb={8}>
          <CardBody>
            <Heading size="md" mb={6} color="chakra-title">
              Performance Metrics
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Impermanent Loss
                </Text>
                <Text
                  fontSize="lg"
                  color={
                    position.performance.impermanentLoss >= 0
                      ? "green.500"
                      : "red.500"
                  }
                >
                  {Formatter.formatPercentage(
                    position.performance.impermanentLoss
                  )}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Compare to Hold
                </Text>
                <Text
                  fontSize="lg"
                  color={
                    position.performance.compareToHold >= 0
                      ? "green.500"
                      : "red.500"
                  }
                >
                  {Formatter.formatPercentage(
                    position.performance.compareToHold
                  )}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Fee APR
                </Text>
                <Text fontSize="lg" color="green.500">
                  {Formatter.formatAPR(position.performance.apr.feeApr)}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Farm APR
                </Text>
                <Text fontSize="lg" color="green.500">
                  {Formatter.formatAPR(position.performance.apr.farmApr)}
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Token Information */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} mb={8}>
          <CardBody>
            <Heading size="md" mb={6} color={textColor}>
              Token Information
            </Heading>

            {/* Current Amounts */}
            <Box mb={6}>
              <Text fontWeight="medium" mb={4}>
                Current Amounts
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {position.currentAmounts.map((amount, index) => (
                  <Card key={index} variant="outline" p={4}>
                    <HStack spacing={3}>
                      <Image
                        src={amount.token.logo}
                        alt={amount.token.symbol}
                        boxSize="32px"
                        borderRadius="full"
                        fallbackSrc="/images/token-fallback.png"
                      />
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="medium">{amount.token.symbol}</Text>
                        <Text fontSize="sm" color={mutedTextColor}>
                          {amount.token.name}
                        </Text>
                        <Text
                          fontSize="xs"
                          fontFamily="mono"
                          color={mutedTextColor}
                        >
                          {Formatter.formatNumber(
                            parseFloat(amount.balance) /
                              Math.pow(10, amount.token.decimals),
                            6
                          )}
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {Formatter.formatCurrency(amount.value)}
                        </Text>
                      </VStack>
                    </HStack>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>

            {/* Provided Amounts */}
            <Box mb={6}>
              <Text fontWeight="medium" mb={4}>
                Initial Provided Amounts
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {position.providedAmounts.map((amount, index) => (
                  <Card key={index} variant="outline" p={4}>
                    <HStack spacing={3}>
                      <Image
                        src={amount.token.logo}
                        alt={amount.token.symbol}
                        boxSize="32px"
                        borderRadius="full"
                        fallbackSrc="/images/token-fallback.png"
                      />
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="medium">{amount.token.symbol}</Text>
                        <Text fontSize="sm" color={mutedTextColor}>
                          {amount.token.name}
                        </Text>
                        <Text
                          fontSize="xs"
                          fontFamily="mono"
                          color={mutedTextColor}
                        >
                          {Formatter.formatNumber(
                            parseFloat(amount.balance) /
                              Math.pow(10, amount.token.decimals),
                            6
                          )}
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {Formatter.formatCurrency(amount.value)}
                        </Text>
                      </VStack>
                    </HStack>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>

            {/* Trading Fees */}
            <Box>
              <Text fontWeight="medium" mb={4}>
                Trading Fees
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box>
                  <Text fontSize="sm" color={mutedTextColor} mb={2}>
                    Pending Fees
                  </Text>
                  <VStack spacing={2}>
                    {position.tradingFee.pending.map((fee, index) => (
                      <HStack key={index} justify="space-between" w="full">
                        <HStack spacing={2}>
                          <Image
                            src={fee.token.logo}
                            alt={fee.token.symbol}
                            boxSize="16px"
                            borderRadius="full"
                            fallbackSrc="/images/token-fallback.png"
                          />
                          <Text fontSize="sm">{fee.token.symbol}</Text>
                        </HStack>
                        <Text fontSize="sm" fontWeight="medium">
                          {Formatter.formatCurrency(fee.value)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                  <Divider my={2} />
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" fontWeight="medium">
                      Total Pending
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="green.500">
                      {Formatter.formatCurrency(getTotalPendingFees)}
                    </Text>
                  </HStack>
                </Box>
                <Box>
                  <Text fontSize="sm" color={mutedTextColor} mb={2}>
                    Claimed Fees
                  </Text>
                  <VStack spacing={2}>
                    {position.tradingFee.claimed.map((fee, index) => (
                      <HStack key={index} justify="space-between" w="full">
                        <HStack spacing={2}>
                          <Image
                            src={fee.token.logo}
                            alt={fee.token.symbol}
                            boxSize="16px"
                            borderRadius="full"
                            fallbackSrc="/images/token-fallback.png"
                          />
                          <Text fontSize="sm">{fee.token.symbol}</Text>
                        </HStack>
                        <Text fontSize="sm" fontWeight="medium">
                          {Formatter.formatCurrency(fee.value)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                  <Divider my={2} />
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" fontWeight="medium">
                      Total Claimed
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="blue.500">
                      {Formatter.formatCurrency(getTotalClaimedFees)}
                    </Text>
                  </HStack>
                </Box>
              </SimpleGrid>
            </Box>
          </CardBody>
        </Card>

        {/* Position Details */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} mb={8}>
          <CardBody>
            <Heading size="md" mb={6} color={textColor}>
              Position Details
            </Heading>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={6}
            >
              <GridItem>
                <VStack align="start" spacing={4}>
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Wallet Address
                    </Text>
                    <HStack>
                      <Text
                        fontSize="sm"
                        fontFamily="mono"
                        color={mutedTextColor}
                      >
                        {position.ownerAddress}
                      </Text>
                      <IconButton
                        size="sm"
                        icon={<CopyIcon />}
                        aria-label="Copy address"
                        onClick={() =>
                          copyToClipboard(
                            position.ownerAddress,
                            "Wallet address"
                          )
                        }
                      />
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Pool Address
                    </Text>
                    <HStack>
                      <Text
                        fontSize="sm"
                        fontFamily="mono"
                        color={mutedTextColor}
                      >
                        {position.pool.poolAddress}
                      </Text>
                      <IconButton
                        size="sm"
                        icon={<CopyIcon />}
                        aria-label="Copy pool address"
                        onClick={() =>
                          copyToClipboard(
                            position.pool.poolAddress,
                            "Pool address"
                          )
                        }
                      />
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Token ID
                    </Text>
                    <Text fontSize="sm" color={mutedTextColor}>
                      {position.tokenId}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Liquidity
                    </Text>
                    <Text fontSize="sm" color={mutedTextColor}>
                      {Formatter.formatNumber(
                        parseFloat(position.liquidity),
                        0
                      )}
                    </Text>
                  </Box>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack align="start" spacing={4}>
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Price Range
                    </Text>
                    <PriceRangeDisplay
                      minPrice={position.minPrice}
                      maxPrice={position.maxPrice}
                      currentPrice={getCurrentPrice}
                      showPercentages={true}
                      showVisual={true}
                    />
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Opened Time
                    </Text>
                    <Text fontSize="sm" color={mutedTextColor}>
                      {Formatter.formatAge(position.openedTime)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Last Update Block
                    </Text>
                    <Text fontSize="sm" color={mutedTextColor}>
                      {position.lastUpdateBlock.toLocaleString()}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Status
                    </Text>
                    <HStack>
                      <DotIndicator status={position.status} size="md" />
                      <Text fontSize="sm" color={mutedTextColor}>
                        {position.status === "IN_RANGE"
                          ? "In Range"
                          : position.status === "OUT_OF_RANGE"
                            ? "Out of Range"
                            : position.status === "CLOSED"
                              ? "Closed"
                              : position.status}
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Footer */}
        <Footer />
      </Container>
    </Box>
  );
}

export default function PositionDetailsPage() {
  return (
    <ErrorBoundary>
      <PositionDetailsPageContent />
    </ErrorBoundary>
  );
}
