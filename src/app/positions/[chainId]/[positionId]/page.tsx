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
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Image,
  Grid,
  GridItem,
  IconButton,
  Divider,
  Link,
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
import Breadcrumbs from "@/components/Breadcrumbs";
import EmbedWrapper from "../../../../components/EmbedWrapper";

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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isEmbedMode = searchParams.get("embed") === "1";

  // Helper functions for calculations
  const getTotalPendingFees = useMemo(() => {
    if (!position) return 0;
    return position.tradingFee.pending.reduce((sum, fee) => sum + fee.value, 0);
  }, [position]);

  const getTotalClaimedFees = useMemo(() => {
    if (!position) return 0;
    return position.tradingFee.claimed.reduce((sum, fee) => sum + fee.value, 0);
  }, [position]);

  const getCurrentPrice = useMemo(() => {
    if (!position || !position.currentAmounts[0] || !position.currentAmounts[1])
      return undefined;
    return position.currentAmounts[1].price / position.currentAmounts[0].price;
  }, [position]);

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

  if (loading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading position data...</Text>
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
    <Box minH="100vh" bg="bg.secondary">
      <Container maxW="7xl" py={6}>
        {/* Breadcrumbs */}
        <EmbedWrapper type="breadcrumbs">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              {
                label: `Wallet #${Formatter.shortAddress(position.ownerAddress)}`,
                href: `/wallets/${position.ownerAddress}/positions`,
              },
              { label: `#${Formatter.shortAddress(position.id)}` },
            ]}
          />
        </EmbedWrapper>
        {/* Header */}
        <VStack spacing={6} mb={8}>
          <HStack w="full" justify="space-between" align="start">
            <VStack align="start" spacing={3}>
              {/* Token Pair and Protocol Info */}
              <HStack spacing={4} align="center">
                <HStack spacing={2}>
                  <Image
                    src={position.currentAmounts[0].token.logo}
                    alt={position.currentAmounts[0].token.symbol}
                    boxSize="32px"
                    borderRadius="full"
                    fallbackSrc="/images/token-fallback.png"
                  />
                  <Image
                    src={position.currentAmounts[1].token.logo}
                    alt={position.currentAmounts[1].token.symbol}
                    boxSize="32px"
                    borderRadius="full"
                    fallbackSrc="/images/token-fallback.png"
                  />
                </HStack>
                <VStack align="start" spacing={1}>
                  <HStack spacing={4}>
                    <Text fontSize="xl" fontWeight="bold">
                      {position.currentAmounts[0].token.symbol}/
                      {position.currentAmounts[1].token.symbol}
                    </Text>
                    {position.pool.feeTier && (
                      <Badge colorScheme="blue" fontSize="xs">
                        {Formatter.formatFeeTier(position.pool.feeTier)}
                      </Badge>
                    )}

                    {/* Status */}
                    <HStack spacing={1} align="center">
                      <DotIndicator status={position.status} size="md" />
                      <Text fontSize="sm">
                        {position.status === "IN_RANGE" ||
                        position.status === "OPEN"
                          ? "In range"
                          : position.status === "OUT_OF_RANGE" ||
                              position.status === "OUT_RANGE"
                            ? "Out of range"
                            : "Closed"}
                      </Text>
                    </HStack>
                  </HStack>
                  <HStack spacing={2}>
                    <ProtocolDisplay
                      protocol={position.pool.protocol}
                      size="sm"
                    />
                    <Text fontSize="sm">•</Text>
                    <Text fontSize="sm">
                      Position #{Formatter.shortAddress(position.id)} (
                      {Formatter.formatAge(position.openedTime)})
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
            </VStack>

            {/* Links */}
            <HStack spacing={3} align="center">
              <Link
                href={`https://defi.krystal.app/account/${position.ownerAddress}/positions/${position.id}?chainId=${position.chain.id}`}
                isExternal
                fontSize="sm"
                _hover={{ textDecoration: "underline" }}
              >
                [Open on Krystal]
              </Link>
              <Link
                href={`https://dexscreener.com/${position.chain.name.toLowerCase()}/${position.pool.poolAddress}`}
                isExternal
                fontSize="sm"
                _hover={{ textDecoration: "underline" }}
              >
                [Dexscreener]
              </Link>
            </HStack>
          </HStack>
        </VStack>

        {/* Main Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
          {/* Total Value */}
          <Card bg="bg.primary" border="1px" borderColor="border.primary">
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="text.muted">
                  Total Value
                </StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" color="metrics">
                  {Formatter.formatCurrency(position.currentPositionValue || 0)}
                </StatNumber>
                <VStack align="start" spacing={1} mt={2}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="text.muted">
                      Liquidity
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {Formatter.formatCurrency(
                        position.performance.totalDepositValue
                      )}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="text.muted">
                      Deposits
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {Formatter.formatCurrency(
                        position.performance.totalDepositValue
                      )}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="text.muted">
                      Withdrawals
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      $0.00
                    </Text>
                  </HStack>
                </VStack>
              </Stat>
            </CardBody>
          </Card>

          {/* Earning */}
          <Card bg="bg.primary" border="1px" borderColor="border.primary">
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="gray.500">
                  <HStack spacing={2}>
                    <Text>💚</Text>
                    <Text>Earning</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" color="green.500">
                  {Formatter.formatCurrency(
                    getTotalPendingFees + getTotalClaimedFees
                  )}
                </StatNumber>
                <VStack align="start" spacing={1} mt={2}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.500">
                      Unclaimed fees & rewards
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="green.500">
                      {Formatter.formatCurrency(getTotalPendingFees)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.500">
                      APR
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="green.500">
                      {Formatter.formatAPR(position.performance.apr.totalApr)}
                    </Text>
                  </HStack>
                </VStack>
              </Stat>
            </CardBody>
          </Card>

          {/* Profit & Loss */}
          <Card bg="bg.primary" border="1px" borderColor="border.primary">
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="text.muted">
                  Profit & Loss
                </StatLabel>
                <StatNumber
                  fontSize="3xl"
                  fontWeight="bold"
                  color="status.success"
                >
                  {Formatter.formatCurrency(position.performance.pnl)}
                </StatNumber>
                <Text fontSize="sm" fontWeight="medium" color="status.success">
                  {Formatter.formatPercentage(
                    position.performance.returnOnInvestment
                  )}
                </Text>
                <Text fontSize="sm" fontWeight="medium" color="status.success">
                  {Formatter.formatAPR(position.performance.apr.totalApr)}
                </Text>
                <VStack align="start" spacing={1} mt={2}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.500">
                      Compare to HODL
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="status.success"
                    >
                      {Formatter.formatCurrency(
                        position.performance.compareToHold
                      )}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.500">
                      ROI
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="status.success"
                    >
                      {Formatter.formatPercentage(
                        position.performance.returnOnInvestment
                      )}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.500">
                      Impermanent Loss
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="status.warning"
                    >
                      {Formatter.formatCurrency(
                        position.performance.impermanentLoss
                      )}
                    </Text>
                  </HStack>
                </VStack>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Content - 2 Column Layout */}
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={8}
          mb={8}
          alignItems="start"
        >
          <VStack spacing={6} align="stretch" h="auto" w="100%">
            {/* Fees & Rewards Section */}
            <Card border="1px" h="auto" w="100%">
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading size="md">Fees & Rewards</Heading>

                  {/* Unclaimed Fees */}
                  <VStack align="start" spacing={1} w="full">
                    <Text fontSize="sm" fontWeight="medium" color="text.muted">
                      Unclaimed
                    </Text>
                    {position.tradingFee.pending.map((fee, index) => (
                      <HStack
                        key={index}
                        justify="space-between"
                        w="full"
                        p={1}
                      >
                        <HStack spacing={2}>
                          <Image
                            src={fee.token.logo}
                            alt={fee.token.symbol}
                            boxSize="14px"
                            borderRadius="full"
                            fallbackSrc="/images/token-fallback.png"
                          />
                          <Text fontSize="sm" fontWeight="medium">
                            {fee.token.symbol}
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            {Formatter.formatTokenAmount(
                              fee.balance,
                              fee.token.decimals,
                              fee.token.symbol
                            )}
                          </Text>
                          <Text fontSize="xs" color="text.muted">
                            {Formatter.formatCurrency(fee.value)}
                          </Text>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>

                  {/* Claimed Fees */}
                  <VStack align="start" spacing={1} w="full">
                    <Text fontSize="sm" fontWeight="medium" color="text.muted">
                      Claimed
                    </Text>
                    {position.tradingFee.claimed.map((fee, index) => (
                      <HStack
                        key={index}
                        justify="space-between"
                        w="full"
                        p={1}
                      >
                        <HStack spacing={2}>
                          <Image
                            src={fee.token.logo}
                            alt={fee.token.symbol}
                            boxSize="14px"
                            borderRadius="full"
                            fallbackSrc="/images/token-fallback.png"
                          />
                          <Text fontSize="sm" fontWeight="medium">
                            {fee.token.symbol}
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            {Formatter.formatTokenAmount(
                              fee.balance,
                              fee.token.decimals,
                              fee.token.symbol
                            )}
                          </Text>
                          <Text fontSize="xs" color="text.muted">
                            {Formatter.formatCurrency(fee.value)}
                          </Text>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>

                  {/* Total Fees */}
                  <HStack justify="space-between" w="full" p={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      Total Fees and Rewards
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="green.500">
                      {Formatter.formatCurrency(
                        getTotalPendingFees + getTotalClaimedFees
                      )}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Left Column - Price Range & Liquidity Distribution */}
            <Card border="1px" h="auto">
              <CardBody>
                <VStack align="start" spacing={6}>
                  {/* Price Range */}
                  <VStack align="start" spacing={4} w="full">
                    <Heading size="md">Price Range</Heading>
                    <VStack align="start" spacing={2} w="full">
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm" color="gray.500">
                          Min Price
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {position.minPrice.toFixed(6)} WETH = 1{" "}
                          {position.currentAmounts[0].token.symbol}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm" color="gray.500">
                          Max Price
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {position.maxPrice.toFixed(6)} WETH = 1{" "}
                          {position.currentAmounts[0].token.symbol}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* Right Column - Liquidity & Fees & Rewards */}
          <VStack spacing={6} align="stretch" h="auto" w="100%">
            {/* Liquidity Section */}
            <Card border="1px" h="auto" w="100%">
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading size="md">Liquidity</Heading>

                  {/* Current Liquidity */}
                  <VStack align="start" spacing={1} w="full">
                    <Text fontSize="sm" fontWeight="medium" color="text.muted">
                      Current Liquidity
                    </Text>
                    {position.currentAmounts.map((amount, index) => {
                      const currentPercentage = (
                        (amount.value / (position.currentPositionValue || 1)) *
                        100
                      ).toFixed(0);

                      return (
                        <HStack
                          key={index}
                          justify="space-between"
                          w="full"
                          p={1}
                        >
                          <HStack spacing={2}>
                            <Image
                              src={amount.token.logo}
                              alt={amount.token.symbol}
                              boxSize="14px"
                              borderRadius="full"
                              fallbackSrc="/images/token-fallback.png"
                            />
                            <Text fontSize="sm" fontWeight="medium">
                              {amount.token.symbol}
                            </Text>
                          </HStack>
                          <HStack spacing={2}>
                            <Text fontSize="xs" color="text.muted">
                              {currentPercentage}%
                            </Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {Formatter.formatTokenAmount(
                                amount.balance,
                                amount.token.decimals,
                                amount.token.symbol
                              )}
                            </Text>
                            <Text fontSize="xs" color="text.muted">
                              {Formatter.formatCurrency(amount.value)}
                            </Text>
                          </HStack>
                        </HStack>
                      );
                    })}
                  </VStack>

                  {/* HODL */}
                  <VStack align="start" spacing={1} w="full">
                    <Text fontSize="sm" fontWeight="medium" color="text.muted">
                      HODL
                    </Text>
                    {position.providedAmounts.map((amount, index) => {
                      const hodlPercentage = (
                        (amount.value /
                          (position.performance.totalDepositValue || 1)) *
                        100
                      ).toFixed(0);

                      return (
                        <HStack
                          key={index}
                          justify="space-between"
                          w="full"
                          p={1}
                        >
                          <HStack spacing={2}>
                            <Image
                              src={amount.token.logo}
                              alt={amount.token.symbol}
                              boxSize="14px"
                              borderRadius="full"
                              fallbackSrc="/images/token-fallback.png"
                            />
                            <Text fontSize="sm" fontWeight="medium">
                              {amount.token.symbol}
                            </Text>
                          </HStack>
                          <HStack spacing={2}>
                            <Text fontSize="xs" color="text.muted">
                              {hodlPercentage}%
                            </Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {Formatter.formatTokenAmount(
                                amount.balance,
                                amount.token.decimals,
                                amount.token.symbol
                              )}
                            </Text>
                            <Text fontSize="xs" color="text.muted">
                              {Formatter.formatCurrency(amount.value)}
                            </Text>
                          </HStack>
                        </HStack>
                      );
                    })}
                  </VStack>

                  {/* Impermanent Loss */}
                  <VStack align="start" spacing={2} w="full">
                    <HStack justify="space-between" w="full" p={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="text.muted"
                      >
                        Impermanent Loss
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="status.error"
                      >
                        {Formatter.formatCurrency(
                          position.performance.impermanentLoss
                        )}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </SimpleGrid>

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
