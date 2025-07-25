"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Tooltip,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Flex,
  Image,
  Link,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  SearchIcon,
  ExternalLinkIcon,
  ArrowBackIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@chakra-ui/icons";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { KrystalApi, IPositionsParams } from "../../../../services/krystalApi";
import { IAPosition } from "../../../../services/apiTypes";
import { CHAIN_CONFIGS } from "../../../../common/config";
import { Formatter } from "../../../../common/formatter";
import { DotIndicator } from "../../../../components/DotIndicator";
import { ChainDisplay } from "../../../../components/ChainDisplay";
import { ProtocolDisplay } from "../../../../components/ProtocolDisplay";
import { TokenPairDisplay } from "../../../../components/TokenPairDisplay";
import { PriceRangeDisplay } from "../../../../components/PriceRangeDisplay";
import { useApiError, useApiKeyValidation } from "../../../../hooks/useApiError";
import { ErrorDisplay } from "../../../../components/ErrorDisplay";
import ErrorBoundary from "../../../../components/ErrorBoundary";

interface WalletStats {
  totalValue: number;
  totalPositions: number;
  activePositions: number;
  totalFeesEarned: number;
  averageApr: number;
}

// Virtualized table row component for better performance
const VirtualizedTableRow = React.memo(
  ({
    position,
    onRowClick,
  }: {
    position: IAPosition;
    onRowClick: (position: IAPosition) => void;
  }) => {
    const getCurrentPrice = useCallback((position: IAPosition) => {
      if (position.currentAmounts.length >= 2) {
        const token0 = position.currentAmounts[0];
        const token1 = position.currentAmounts[1];
        if (token0.price > 0 && token1.price > 0) {
          return token0.price / token1.price;
        }
      }
      return undefined;
    }, []);

    const getTotalPendingFees = useCallback((position: IAPosition) => {
      return position.tradingFee.pending.reduce(
        (sum, fee) => sum + fee.value,
        0
      );
    }, []);

    return (
      <Tr
        _hover={{ bg: "gray.50", _dark: { bg: "gray.700" }, cursor: "pointer" }}
        onClick={() => onRowClick(position)}
      >
        <Td>
          <VStack align="start" spacing={1}>
            <HStack spacing={2}>
              <ChainDisplay chain={position.chain} size="sm" />
              <ProtocolDisplay protocol={position.pool.protocol} size="sm" />
              <DotIndicator status={position.status} size="sm" />
            </HStack>
            <HStack spacing={2}>
              {position.currentAmounts.slice(0, 2).map((amount, index) => (
                <HStack key={index} spacing={1}>
                  <Image
                    src={amount.token.logo}
                    alt={amount.token.symbol}
                    w="16px"
                    h="16px"
                    borderRadius="full"
                    fallbackSrc="/images/token-fallback.png"
                  />
                  <Text fontSize="xs">{amount.token.symbol}</Text>
                </HStack>
              ))}
            </HStack>
          </VStack>
        </Td>
        <Td>
          <Text fontWeight="medium">
            {Formatter.formatCurrency(position.currentPositionValue || 0)}
          </Text>
        </Td>
        <Td>
          <Text
            color={position.performance.pnl >= 0 ? "green.500" : "red.500"}
            fontWeight="medium"
          >
            {Formatter.formatCurrency(position.performance.pnl)}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {Formatter.formatPercentage(
              position.performance.returnOnInvestment
            )}
          </Text>
        </Td>
        <Td>
          <Text fontWeight="medium">
            {Formatter.formatCurrency(getTotalPendingFees(position))}
          </Text>
        </Td>
        <Td>
          <Text color="green.500" fontWeight="medium">
            {Formatter.formatAPR(position.performance.apr.totalApr)}
          </Text>
        </Td>
        <Td>
          <PriceRangeDisplay
            minPrice={position.minPrice}
            maxPrice={position.maxPrice}
            currentPrice={getCurrentPrice(position)}
            showPercentages={true}
            showVisual={true}
          />
        </Td>
        <Td>
          <Text fontSize="sm">{Formatter.formatAge(position.openedTime)}</Text>
        </Td>
      </Tr>
    );
  }
);

VirtualizedTableRow.displayName = "VirtualizedTableRow";

function WalletPositionsPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const walletAddress = params.walletAddress as string;

  const [positions, setPositions] = useState<IAPosition[]>([]);
  const [openPositions, setOpenPositions] = useState<IAPosition[]>([]);
  const [closedPositions, setClosedPositions] = useState<IAPosition[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<IAPosition[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { error, setError, handleApiError, clearError } = useApiError();
  const { validateApiKey } = useApiKeyValidation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChain, setSelectedChain] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("OPEN");
  const [newWalletAddress, setNewWalletAddress] = useState(walletAddress);
  const [sortField, setSortField] = useState("currentPositionValue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const isEmbedMode = searchParams.get("embed") === "true";
  const showFooter = searchParams.get("showFooter") !== "false";

  // Memoized filtered positions
  const memoizedFilteredPositions = useMemo(() => {
    let filtered = selectedStatus === "OPEN" ? openPositions : closedPositions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        position =>
          position.pool.protocol.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          position.pool.poolAddress
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          position.chain.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          position.currentAmounts.some(
            amount =>
              amount.token.symbol
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              amount.token.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by chain
    if (selectedChain !== "all") {
      filtered = filtered.filter(
        position => position.chain.id.toString() === selectedChain
      );
    }

    // Sort positions
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "currentPositionValue":
          aValue = a.currentPositionValue || 0;
          bValue = b.currentPositionValue || 0;
          break;
        case "liquidity":
          aValue = parseFloat(a.liquidity) || 0;
          bValue = parseFloat(b.liquidity) || 0;
          break;
        case "pnl":
          aValue = a.performance.pnl || 0;
          bValue = b.performance.pnl || 0;
          break;
        case "apr":
          aValue = a.performance.apr.totalApr || 0;
          bValue = b.performance.apr.totalApr || 0;
          break;
        case "fees":
          aValue = a.tradingFee.pending.reduce(
            (sum, fee) => sum + fee.value,
            0
          );
          bValue = b.tradingFee.pending.reduce(
            (sum, fee) => sum + fee.value,
            0
          );
          break;
        case "age":
          aValue = a.openedTime || 0;
          bValue = b.openedTime || 0;
          break;
        default:
          aValue = a.currentPositionValue || 0;
          bValue = b.currentPositionValue || 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    openPositions,
    closedPositions,
    selectedStatus,
    searchTerm,
    selectedChain,
    sortField,
    sortOrder,
  ]);

  // Memoized paginated positions
  const paginatedPositions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return memoizedFilteredPositions.slice(startIndex, endIndex);
  }, [memoizedFilteredPositions, currentPage, pageSize]);

  // Memoized stats
  const memoizedStats = useMemo(() => {
    if (openPositions.length === 0 && closedPositions.length === 0) return null;

    const allPositions = [...openPositions, ...closedPositions];
    const totalValue = allPositions.reduce(
      (sum, pos) => sum + (pos.currentPositionValue || 0),
      0
    );
    const activePositions = openPositions.length;
    const totalFeesEarned = allPositions.reduce((sum, pos) => {
      const pendingFees = pos.tradingFee.pending.reduce(
        (feeSum, fee) => feeSum + fee.value,
        0
      );
      const claimedFees = pos.tradingFee.claimed.reduce(
        (feeSum, fee) => feeSum + fee.value,
        0
      );
      return sum + pendingFees + claimedFees;
    }, 0);
    const averageApr =
      allPositions.length > 0
        ? allPositions.reduce(
            (sum, pos) => sum + pos.performance.apr.totalApr,
            0
          ) / allPositions.length
        : 0;

    return {
      totalValue,
      totalPositions: allPositions.length,
      activePositions,
      totalFeesEarned,
      averageApr,
    };
  }, [openPositions, closedPositions]);

  useEffect(() => {
    fetchAllPositions();
  }, [walletAddress]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedStatus, searchTerm, selectedChain, sortField, sortOrder]);

  const fetchAllPositions = async () => {
    try {
      setLoading(true);
      clearError();

      const apiKey = validateApiKey();

      // Fetch open positions
      const openParams: IPositionsParams = {
        wallet: walletAddress,
        positionStatus: "OPEN",
      };

      // Fetch closed positions
      const closedParams: IPositionsParams = {
        wallet: walletAddress,
        positionStatus: "CLOSED",
      };

      // Make both API calls in parallel
      const [openResponse, closedResponse] = await Promise.all([
        KrystalApi.positions.getAll(apiKey, openParams),
        KrystalApi.positions.getAll(apiKey, closedParams),
      ]);

      const openPositions = openResponse || [];
      const closedPositions = closedResponse || [];

      setOpenPositions(openPositions);
      setClosedPositions(closedPositions);
      setPositions([...openPositions, ...closedPositions]);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = useCallback(
    (field: string) => {
      const newOrder =
        sortField === field && sortOrder === "desc" ? "asc" : "desc";
      setSortField(field);
      setSortOrder(newOrder);
    },
    [sortField, sortOrder]
  );

  const handleWalletAddressChange = useCallback(() => {
    if (newWalletAddress && newWalletAddress !== walletAddress) {
      router.push(`/wallets/${newWalletAddress}/positions`);
    }
  }, [newWalletAddress, walletAddress, router]);

  const handleWalletAddressKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleWalletAddressChange();
      }
    },
    [handleWalletAddressChange]
  );

  const handleRowClick = useCallback(
    (position: IAPosition) => {
      router.push(`/positions/${position.chain.id}/${position.id}`);
    },
    [router]
  );

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setPageSize(prev => prev + 25);
      setIsLoadingMore(false);
    }, 100);
  }, []);

  const totalPages = Math.ceil(memoizedFilteredPositions.length / pageSize);
  const hasMore = currentPage * pageSize < memoizedFilteredPositions.length;

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
          <Text>Loading positions...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={fetchAllPositions}
        title="Failed to Load Wallet Positions"
      />
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
                onClick={() => router.push("/")}
                size="sm"
              >
                Back to Home
              </Button>
              <Heading size="2xl">Wallet Positions</Heading>
              <Text
                fontSize="lg"
                color="gray.600"
                _dark={{ color: "gray.300" }}
              >
                {walletAddress}
              </Text>
            </VStack>

            {/* Wallet Address Input */}
            <VStack align="end" spacing={2}>
              <InputGroup maxW="400px">
                <Input
                  placeholder="Enter wallet address"
                  value={newWalletAddress}
                  onChange={e => setNewWalletAddress(e.target.value)}
                  onKeyPress={handleWalletAddressKeyPress}
                  onBlur={handleWalletAddressChange}
                />
                <InputLeftElement>
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
              </InputGroup>
            </VStack>
          </HStack>
        </VStack>

        {/* Stats */}
        {memoizedStats && (
          <Card bg={cardBg} p={6} mb={6} border="1px" borderColor={borderColor}>
            <HStack spacing={8} justify="space-around">
              <VStack>
                <Text fontSize="sm" color="gray.500">
                  Total Value
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {Formatter.formatCurrency(memoizedStats.totalValue)}
                </Text>
              </VStack>
              <VStack>
                <Text fontSize="sm" color="gray.500">
                  Active Positions
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {memoizedStats.activePositions}
                </Text>
              </VStack>
              <VStack>
                <Text fontSize="sm" color="gray.500">
                  Total Fees Earned
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {Formatter.formatCurrency(memoizedStats.totalFeesEarned)}
                </Text>
              </VStack>
              <VStack>
                <Text fontSize="sm" color="gray.500">
                  Average APR
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {Formatter.formatAPR(memoizedStats.averageApr)}
                </Text>
              </VStack>
            </HStack>
          </Card>
        )}

        {/* Tabs */}
        <Tabs
          defaultIndex={0}
          onChange={index => setSelectedStatus(index === 0 ? "OPEN" : "CLOSED")}
        >
          <TabList>
            <Tab>Open Positions ({openPositions.length})</Tab>
            <Tab>Closed Positions ({closedPositions.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pt={6}>
              {/* Filters */}
              <HStack spacing={4} mb={6} wrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search positions..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                <Select
                  value={selectedChain}
                  onChange={e => setSelectedChain(e.target.value)}
                  maxW="150px"
                >
                  <option value="all">All Chains</option>
                  {Array.from(new Set(openPositions.map(p => p.chain.id))).map(
                    chainId => (
                      <option key={chainId} value={chainId}>
                        {
                          openPositions.find(p => p.chain.id === chainId)?.chain
                            .name
                        }
                      </option>
                    )
                  )}
                </Select>
              </HStack>

              {/* Positions Table */}
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Pool</Th>
                        <Th
                          cursor="pointer"
                          onClick={() => handleSort("currentPositionValue")}
                        >
                          <HStack spacing={1}>
                            <Text>Position Value</Text>
                            {sortField === "currentPositionValue" &&
                              (sortOrder === "asc" ? (
                                <ChevronUpIcon />
                              ) : (
                                <ChevronDownIcon />
                              ))}
                          </HStack>
                        </Th>
                        <Th cursor="pointer" onClick={() => handleSort("pnl")}>
                          <HStack spacing={1}>
                            <Text>P&L</Text>
                            {sortField === "pnl" &&
                              (sortOrder === "asc" ? (
                                <ChevronUpIcon />
                              ) : (
                                <ChevronDownIcon />
                              ))}
                          </HStack>
                        </Th>
                        <Th cursor="pointer" onClick={() => handleSort("fees")}>
                          <HStack spacing={1}>
                            <Text>Pending Fees</Text>
                            {sortField === "fees" &&
                              (sortOrder === "asc" ? (
                                <ChevronUpIcon />
                              ) : (
                                <ChevronDownIcon />
                              ))}
                          </HStack>
                        </Th>
                        <Th cursor="pointer" onClick={() => handleSort("apr")}>
                          <HStack spacing={1}>
                            <Text>APR</Text>
                            {sortField === "apr" &&
                              (sortOrder === "asc" ? (
                                <ChevronUpIcon />
                              ) : (
                                <ChevronDownIcon />
                              ))}
                          </HStack>
                        </Th>
                        <Th>Price Range</Th>
                        <Th cursor="pointer" onClick={() => handleSort("age")}>
                          <HStack spacing={1}>
                            <Text>Age</Text>
                            {sortField === "age" &&
                              (sortOrder === "asc" ? (
                                <ChevronUpIcon />
                              ) : (
                                <ChevronDownIcon />
                              ))}
                          </HStack>
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {paginatedPositions.map(position => (
                        <VirtualizedTableRow
                          key={position.id}
                          position={position}
                          onRowClick={handleRowClick}
                        />
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Card>

              {/* Load More Button */}
              {hasMore && (
                <Box textAlign="center" mt={4}>
                  <Button
                    onClick={handleLoadMore}
                    isLoading={isLoadingMore}
                    loadingText="Loading..."
                    variant="outline"
                    size="lg"
                  >
                    Load More (
                    {memoizedFilteredPositions.length -
                      paginatedPositions.length}{" "}
                    remaining)
                  </Button>
                </Box>
              )}

              {/* Results Summary */}
              <Box textAlign="center" mt={4}>
                <Text fontSize="sm" color="gray.500">
                  Showing {paginatedPositions.length} of{" "}
                  {memoizedFilteredPositions.length} positions
                </Text>
              </Box>
            </TabPanel>

            <TabPanel p={0} pt={6}>
              {/* Same content for closed positions */}
              <HStack spacing={4} mb={6} wrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search positions..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                <Select
                  value={selectedChain}
                  onChange={e => setSelectedChain(e.target.value)}
                  maxW="150px"
                >
                  <option value="all">All Chains</option>
                  {Array.from(
                    new Set(closedPositions.map(p => p.chain.id))
                  ).map(chainId => (
                    <option key={chainId} value={chainId}>
                      {
                        closedPositions.find(p => p.chain.id === chainId)?.chain
                          .name
                      }
                    </option>
                  ))}
                </Select>
              </HStack>

              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Pool</Th>
                        <Th>Position Value</Th>
                        <Th>P&L</Th>
                        <Th>Pending Fees</Th>
                        <Th>APR</Th>
                        <Th>Price Range</Th>
                        <Th>Age</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {paginatedPositions.map(position => (
                        <VirtualizedTableRow
                          key={position.id}
                          position={position}
                          onRowClick={handleRowClick}
                        />
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Card>

              {/* Load More Button */}
              {hasMore && (
                <Box textAlign="center" mt={4}>
                  <Button
                    onClick={handleLoadMore}
                    isLoading={isLoadingMore}
                    loadingText="Loading..."
                    variant="outline"
                    size="lg"
                  >
                    Load More (
                    {memoizedFilteredPositions.length -
                      paginatedPositions.length}{" "}
                    remaining)
                  </Button>
                </Box>
              )}

              {/* Results Summary */}
              <Box textAlign="center" mt={4}>
                <Text fontSize="sm" color="gray.500">
                  Showing {paginatedPositions.length} of{" "}
                  {memoizedFilteredPositions.length} positions
                </Text>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {memoizedFilteredPositions.length === 0 && (
          <Box textAlign="center" py={12}>
            <Text color="gray.500" _dark={{ color: "gray.400" }}>
              No positions found matching your criteria.
            </Text>
          </Box>
        )}

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

export default function WalletPositionsPage() {
  return (
    <ErrorBoundary>
      <WalletPositionsPageContent />
    </ErrorBoundary>
  );
}
