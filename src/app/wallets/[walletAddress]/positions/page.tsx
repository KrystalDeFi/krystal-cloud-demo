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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { SearchIcon, ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { KrystalApi, IPositionsParams } from "../../../../services/krystalApi";
import { IAPosition } from "../../../../services/apiTypes";
import { Formatter } from "../../../../common/formatter";
import { DotIndicator } from "../../../../components/DotIndicator";
import { ChainDisplay } from "../../../../components/ChainDisplay";
import { ProtocolDisplay } from "../../../../components/ProtocolDisplay";
import { PriceRangeDisplay } from "../../../../components/PriceRangeDisplay";
import {
  useApiError,
  useApiKeyValidation,
} from "../../../../hooks/useApiError";
import { ErrorDisplay } from "../../../../components/ErrorDisplay";
import ErrorBoundary from "../../../../components/ErrorBoundary";
import { Footer } from "@/app/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FallbackImg } from "@/components/FallbackImg";
import { EmbedWrapper } from "@/components/EmbedWrapper";

interface WalletStats {
  totalValue: number;
  totalPositions: number;
  activePositions: number;
  closedPositions: number;
  totalFeesEarned: number;
  pendingFees: number;
  totalPnL: number;
  activePnL: number;
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

    const [token0, token1] = position.currentAmounts;

    return (
      <Tr
        _hover={{ bg: "gray.50", _dark: { bg: "gray.700" }, cursor: "pointer" }}
        onClick={() => onRowClick(position)}
      >
        <Td>
          <VStack align="start" spacing={1}>
            <HStack spacing={2}>
              <HStack spacing={1}>
                {[token0, token1].map((t, index) => (
                  <FallbackImg
                    src={t.token.logo || ""}
                    alt={t.token.symbol}
                    w="20px"
                    h="20px"
                    borderRadius="full"
                    key={index}
                  />
                ))}
              </HStack>

              <HStack spacing={0} fontSize="md">
                <Text>{token0.token.symbol}</Text>
                <Text>/</Text>
                <Text>{token1.token.symbol}</Text>
              </HStack>
              <DotIndicator status={position.status} size="sm" />
            </HStack>

            <HStack spacing={2} mt={2}>
              <ChainDisplay chain={position.chain} size="sm" />
              <ProtocolDisplay protocol={position.pool.protocol} size="sm" />
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
            fontSize="lg"
            fontWeight="bold"
            color={
              position.performance.pnl >= 0 ? "status.success" : "status.error"
            }
          >
            {Formatter.formatCurrency(position.performance.pnl)}
          </Text>
          <Text color="status.success" fontWeight="medium">
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
          <Text fontWeight="medium">
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

  const isEmbedMode = searchParams.get("embed") === "1";

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
    const closedPositionsCount = closedPositions.length;

    // Calculate fees
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

    const pendingFees = allPositions.reduce((sum, pos) => {
      return (
        sum +
        pos.tradingFee.pending.reduce((feeSum, fee) => feeSum + fee.value, 0)
      );
    }, 0);

    // Calculate PnL
    const totalPnL = allPositions.reduce((sum, pos) => {
      return sum + (pos.performance.pnl || 0);
    }, 0);

    const activePnL = openPositions.reduce((sum, pos) => {
      return sum + (pos.performance.pnl || 0);
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
      closedPositions: closedPositionsCount,
      totalFeesEarned,
      pendingFees,
      totalPnL,
      activePnL,
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
        bg="bg.secondary"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading wallet data...</Text>
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
    <Box minH="100vh" bg="bg.secondary">
      <Container maxW="7xl" py={6}>
        <EmbedWrapper type="breadcrumbs">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: `Wallet` },
              { label: `#${Formatter.shortAddress(walletAddress)}` },
            ]}
          />
        </EmbedWrapper>

        {/* Stats */}
        {memoizedStats && (
          <Card
            bg="bg.primary"
            p={6}
            mb={6}
            border="1px"
            borderColor="border.primary"
          >
            <HStack
              spacing={6}
              wrap="wrap"
              align="start"
              justifyContent={"space-between"}
            >
              <Stat>
                <StatLabel fontSize="sm" color="gray.500">
                  Total Value
                </StatLabel>
                <StatNumber fontSize="2xl" color="chakra-metrics">
                  {Formatter.formatCurrency(memoizedStats.totalValue)}
                </StatNumber>
              </Stat>

              <Stat>
                <StatLabel fontSize="sm" color="text.muted">
                  Active Positions
                </StatLabel>
                <StatNumber fontSize="2xl" color="metrics">
                  {memoizedStats.activePositions}
                </StatNumber>
                <StatHelpText fontSize="xs" color="text.muted">
                  Closed: {memoizedStats.closedPositions}
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel fontSize="sm" color="text.muted">
                  Total Fees Earned
                </StatLabel>
                <StatNumber fontSize="2xl" color="metrics">
                  {Formatter.formatCurrency(memoizedStats.totalFeesEarned)}
                </StatNumber>
                <StatHelpText fontSize="xs" color="text.muted">
                  Pending: {Formatter.formatCurrency(memoizedStats.pendingFees)}
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel fontSize="sm" color="text.muted">
                  Total PnL
                </StatLabel>
                <StatNumber
                  fontSize="2xl"
                  color={
                    memoizedStats.totalPnL >= 0
                      ? "status.success"
                      : "status.error"
                  }
                >
                  {Formatter.formatCurrency(memoizedStats.totalPnL)}
                </StatNumber>
                <StatHelpText fontSize="xs" color="text.muted">
                  Active PnL:{" "}
                  {Formatter.formatCurrency(memoizedStats.activePnL)}
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel fontSize="sm" color="gray.500">
                  Average APR
                </StatLabel>
                <StatNumber fontSize="2xl" color="chakra-metrics">
                  {Formatter.formatAPR(memoizedStats.averageApr)}
                </StatNumber>
              </Stat>
            </HStack>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Search</Th>
                  <Th>Chain</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>
                    <InputGroup maxW="300px">
                      <InputLeftElement>
                        <SearchIcon color="text.muted" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search positions..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Td>
                  <Td>
                    <Select
                      value={selectedChain}
                      onChange={e => setSelectedChain(e.target.value)}
                      maxW="200px"
                    >
                      <option value="all">All Chains</option>
                      {Array.from(
                        new Set(openPositions.map(p => p.chain.id))
                      ).map(chainId => (
                        <option key={chainId} value={chainId}>
                          {
                            openPositions.find(p => p.chain.id === chainId)
                              ?.chain.name
                          }
                        </option>
                      ))}
                    </Select>
                  </Td>
                  <Td>
                    <Select
                      value={selectedStatus}
                      onChange={e =>
                        setSelectedStatus(e.target.value as "OPEN" | "CLOSED")
                      }
                      maxW="200px"
                    >
                      <option value="OPEN">Open</option>
                      <option value="CLOSED">Closed</option>
                    </Select>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Card>

        {/* Positions Table */}
        <Card>
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
              {memoizedFilteredPositions.length - paginatedPositions.length}{" "}
              remaining)
            </Button>
          </Box>
        )}

        {/* Results Summary */}
        <Box textAlign="center" mt={4}>
          <Text fontSize="sm" color="text.muted">
            Showing {paginatedPositions.length} of{" "}
            {memoizedFilteredPositions.length} positions
          </Text>
        </Box>

        {memoizedFilteredPositions.length === 0 && (
          <Box textAlign="center" py={12}>
            <Text fontSize="sm" color="text.muted">
              No positions found matching your criteria.
            </Text>
          </Box>
        )}

        {/* Footer */}
        <Footer />
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
