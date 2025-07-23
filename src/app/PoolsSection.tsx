"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Input,
  Text,
  VStack,
  HStack,
  Divider,
  Heading,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Image,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Tooltip,
  Select,
  Button,
  useToast,
  ButtonGroup,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { KrystalApi } from "../services/krystalApi";
import { IAPool } from "@/services/apiTypes";

// Helper function to format numbers
const formatNumber = (num: number, decimals: number = 2): string => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toFixed(decimals);
};

// Helper function to format percentage
const formatPercentage = (num: number): string => {
  return `${num.toFixed(2)}%`;
};

// Helper function to get chain display name
const getChainDisplayName = (chainId: string): string => {
  const chainMap: { [key: string]: string } = {
    "ethereum@1": "Ethereum",
    "ethereum@56": "BSC",
    "ethereum@137": "Polygon",
    "ethereum@42161": "Arbitrum",
    "ethereum@10": "Optimism",
    "ethereum@8453": "Base",
  };
  return chainMap[chainId] || chainId;
};

// Helper function to get protocol display name
const getProtocolDisplayName = (protocol: string): string => {
  const protocolMap: { [key: string]: string } = {
    "uniswapv4": "Uniswap V4",
    "uniswapv3": "Uniswap V3",
    "uniswapv2": "Uniswap V2",
    "pancakeswap": "PancakeSwap",
    "sushiswap": "SushiSwap",
  };
  return protocolMap[protocol] || protocol;
};

export default function PoolsSection() {
  const [apiKey, setApiKey] = useState("");
  const [pools, setPools] = useState<IAPool[]>([]);
  const [filtered, setFiltered] = useState<IAPool[]>([]);
  const [selected, setSelected] = useState<IAPool | null>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("tvl");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [paginatedPools, setPaginatedPools] = useState<IAPool[]>([]);

  const toast = useToast();
  
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const selectedBg = useColorModeValue("blue.50", "blue.900");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedTextColor = useColorModeValue("gray.600", "gray.400");

  // Calculate pagination values
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  useEffect(() => {
    const key = localStorage.getItem(KrystalApi.API_KEY_STORAGE) || "";
    setApiKey(key);
    if (key) fetchPools(key);
  }, []);

  useEffect(() => {
    let filteredPools = pools.filter((p) =>
      p.token0?.symbol?.toLowerCase().includes(filter.toLowerCase()) ||
      p.token1?.symbol?.toLowerCase().includes(filter.toLowerCase()) ||
      p.protocol?.name?.toLowerCase().includes(filter.toLowerCase()) ||
      p.chainId?.toLowerCase().includes(filter.toLowerCase())
    );

    // Sort pools
    filteredPools.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case "tvl":
          aValue = a.tvl;
          bValue = b.tvl;
          break;
        case "volume24h":
          aValue = a.stats24h.volume;
          bValue = b.stats24h.volume;
          break;
        case "apr24h":
          aValue = a.stats24h.apr || 0;
          bValue = b.stats24h.apr || 0;
          break;
        default:
          aValue = a.tvl;
          bValue = b.tvl;
      }

      return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
    });

    setFiltered(filteredPools);
    // Reset to first page when filtering or sorting
    setCurrentPage(1);
  }, [filter, pools, sortBy, sortOrder]);

  // Update paginated pools when filtered pools or pagination settings change
  useEffect(() => {
    const paginated = filtered.slice(startIndex, endIndex);
    setPaginatedPools(paginated);
  }, [filtered, currentPage, pageSize, startIndex, endIndex]);

  const fetchPools = async (key: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await KrystalApi.pools.getAll(key);
      const poolsData = response.data || [];
      setPools(poolsData);
      setFiltered(poolsData);
      
      toast({
        title: "Pools loaded successfully",
        description: `${poolsData.length} pools found`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (e: any) {
      setError(e.message || "Failed to fetch pools");
      toast({
        title: "Error loading pools",
        description: e.message || "Failed to fetch pools",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          size="sm"
          variant={currentPage === 1 ? "solid" : "outline"}
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <Text key="ellipsis1" color={mutedTextColor} px={2}>
            ...
          </Text>
        );
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          size="sm"
          variant={currentPage === i ? "solid" : "outline"}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <Text key="ellipsis2" color={mutedTextColor} px={2}>
            ...
          </Text>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          size="sm"
          variant={currentPage === totalPages ? "solid" : "outline"}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return (
      <Flex justify="center" align="center" gap={2} mt={6}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handlePageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
        >
          Previous
        </Button>
        
        <ButtonGroup size="sm" isAttached>
          {pages}
        </ButtonGroup>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => handlePageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
        >
          Next
        </Button>
      </Flex>
    );
  };

  if (!apiKey) {
    return (
      <Box textAlign="center" py={10}>
        <Text color={mutedTextColor} fontSize="lg">
          Please enter your API key above to view pools.
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header with stats */}
      <Box>
        <Heading size="lg" mb={4} color={textColor}>
          DeFi Pools
        </Heading>
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={6}>
          <Stat>
            <StatLabel color={mutedTextColor}>Total Pools</StatLabel>
            <StatNumber color={textColor}>{pools.length}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel color={mutedTextColor}>Total TVL</StatLabel>
            <StatNumber color={textColor}>
              ${formatNumber(pools.reduce((sum, pool) => sum + pool.tvl, 0), 0)}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel color={mutedTextColor}>Avg 24h APR</StatLabel>
            <StatNumber color={textColor}>
              {pools.length > 0 
                ? formatPercentage(pools.reduce((sum, pool) => sum + (pool.stats24h.apr || 0), 0) / pools.length)
                : "0%"
              }
            </StatNumber>
          </Stat>
        </Grid>
      </Box>

      {/* Filters and Controls */}
      <Flex gap={4} flexWrap="wrap" alignItems="center">
        <Input
          placeholder="Search pools by token, protocol, or chain..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          maxW="400px"
          bg={cardBg}
          borderColor={borderColor}
        />
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          maxW="150px"
          bg={cardBg}
          borderColor={borderColor}
        >
          <option value="tvl">Sort by TVL</option>
          <option value="volume24h">Sort by Volume</option>
          <option value="apr24h">Sort by APR</option>
        </Select>
        <Button
          size="sm"
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          variant="outline"
        >
          {sortOrder === "desc" ? "↓" : "↑"}
        </Button>
        <Button
          size="sm"
          onClick={() => fetchPools(apiKey)}
          isLoading={loading}
          colorScheme="blue"
        >
          Refresh
        </Button>
      </Flex>

      {/* Page Size Control */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <HStack spacing={2}>
          <Text fontSize="sm" color={mutedTextColor}>Show:</Text>
          <Select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            size="sm"
            maxW="100px"
            bg={cardBg}
            borderColor={borderColor}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Select>
          <Text fontSize="sm" color={mutedTextColor}>pools per page</Text>
        </HStack>
        
        {filtered.length > 0 && (
          <Text fontSize="sm" color={mutedTextColor}>
            Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length} pools
          </Text>
        )}
      </Flex>

      {/* Loading and Error States */}
      {loading && (
        <Flex justify="center" py={10}>
          <VStack spacing={4}>
            <Spinner size="lg" />
            <Text color={mutedTextColor}>Loading pools...</Text>
          </VStack>
        </Flex>
      )}

      {error && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && pools.length === 0 && (
        <Box textAlign="center" py={10}>
          <Text color={mutedTextColor} fontSize="lg">
            No pools found. Please check your API key and try again.
          </Text>
        </Box>
      )}

      {!loading && !error && pools.length > 0 && filtered.length === 0 && (
        <Box textAlign="center" py={10}>
          <Text color={mutedTextColor} fontSize="lg">
            No pools found matching your search criteria.
          </Text>
          <Button 
            mt={4} 
            variant="outline" 
            onClick={() => setFilter("")}
          >
            Clear Search
          </Button>
        </Box>
      )}

      {/* Pools Grid */}
      {!loading && !error && paginatedPools.length > 0 && (
        <>
          <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6}>
            {paginatedPools.map((pool) => (
              <Card
                key={pool.poolAddress}
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                  borderColor: "blue.300",
                }}
                onClick={() => setSelected(pool)}
              >
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <HStack spacing={2}>
                        <Image
                          src={pool.token0.logo || "/next.svg"}
                          alt={pool.token0.symbol}
                          boxSize="24px"
                          borderRadius="full"
                          fallbackSrc="/next.svg"
                        />
                        <Image
                          src={pool.token1.logo || "/next.svg"}
                          alt={pool.token1.symbol}
                          boxSize="24px"
                          borderRadius="full"
                          fallbackSrc="/next.svg"
                        />
                      </HStack>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="lg" color={textColor}>
                          {pool.token0.symbol}/{pool.token1.symbol}
                        </Text>
                        <HStack spacing={2}>
                          <Badge colorScheme="blue" size="sm">
                            {getProtocolDisplayName(pool.protocol.name)}
                          </Badge>
                          <Badge colorScheme="green" size="sm">
                            {getChainDisplayName(pool.chainId)}
                          </Badge>
                        </HStack>
                      </VStack>
                    </HStack>
                  </Flex>
                </CardHeader>

                <CardBody pt={0}>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Stat>
                      <StatLabel color={mutedTextColor} fontSize="sm">TVL</StatLabel>
                      <StatNumber color={textColor} fontSize="lg">
                        ${formatNumber(pool.tvl)}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color={mutedTextColor} fontSize="sm">24h Volume</StatLabel>
                      <StatNumber color={textColor} fontSize="lg">
                        ${formatNumber(pool.stats24h.volume)}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color={mutedTextColor} fontSize="sm">24h APR</StatLabel>
                      <StatNumber color="green.500" fontSize="lg">
                        {formatPercentage(pool.stats24h.apr || 0)}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color={mutedTextColor} fontSize="sm">Fee Tier</StatLabel>
                      <StatNumber color={textColor} fontSize="lg">
                        {pool.feeTier / 10000}%
                      </StatNumber>
                    </Stat>
                  </Grid>

                  {/* Additional stats */}
                  <VStack spacing={2} mt={4} align="start">
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color={mutedTextColor}>7d APR:</Text>
                      <Text fontSize="sm" color="orange.500" fontWeight="medium">
                        {formatPercentage(pool.stats7d.apr || 0)}
                      </Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color={mutedTextColor}>30d APR:</Text>
                      <Text fontSize="sm" color="purple.500" fontWeight="medium">
                        {formatPercentage(pool.stats30d.apr || 0)}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </Grid>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}

      {/* Selected Pool Details Modal */}
      {selected && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={1000}
          onClick={() => setSelected(null)}
        >
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg={cardBg}
            borderRadius="xl"
            p={6}
            maxW="800px"
            w="90%"
            maxH="90vh"
            overflowY="auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Flex justify="space-between" align="center" mb={6}>
              <HStack spacing={4}>
                <HStack spacing={2}>
                  <Image
                    src={selected.token0.logo || "/next.svg"}
                    alt={selected.token0.symbol}
                    boxSize="32px"
                    borderRadius="full"
                    fallbackSrc="/next.svg"
                  />
                  <Image
                    src={selected.token1.logo || "/next.svg"}
                    alt={selected.token1.symbol}
                    boxSize="32px"
                    borderRadius="full"
                    fallbackSrc="/next.svg"
                  />
                </HStack>
                <VStack align="start" spacing={0}>
                  <Heading size="lg" color={textColor}>
                    {selected.token0.symbol}/{selected.token1.symbol}
                  </Heading>
                  <HStack spacing={2}>
                    <Badge colorScheme="blue">{getProtocolDisplayName(selected.protocol.name)}</Badge>
                    <Badge colorScheme="green">{getChainDisplayName(selected.chainId)}</Badge>
                  </HStack>
                </VStack>
              </HStack>
              <IconButton
                aria-label="Close"
                icon={<Text fontSize="xl">×</Text>}
                variant="ghost"
                onClick={() => setSelected(null)}
              />
            </Flex>

            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6} mb={6}>
              <Stat>
                <StatLabel color={mutedTextColor}>Total Value Locked</StatLabel>
                <StatNumber color={textColor} fontSize="2xl">
                  ${formatNumber(selected.tvl)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel color={mutedTextColor}>24h Volume</StatLabel>
                <StatNumber color={textColor} fontSize="2xl">
                  ${formatNumber(selected.stats24h.volume)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel color={mutedTextColor}>24h APR</StatLabel>
                <StatNumber color="green.500" fontSize="2xl">
                  {formatPercentage(selected.stats24h.apr || 0)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel color={mutedTextColor}>Fee Tier</StatLabel>
                <StatNumber color={textColor} fontSize="2xl">
                  {selected.feeTier / 10000}%
                </StatNumber>
              </Stat>
            </Grid>

            <VStack spacing={4} align="stretch">
              <Heading size="md" color={textColor}>Performance Metrics</Heading>
              <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={4}>
                <Box p={4} bg={useColorModeValue("gray.50", "gray.600")} borderRadius="md">
                  <Text fontSize="sm" color={mutedTextColor}>1h APR</Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.500">
                    {formatPercentage(selected.stats1h.apr || 0)}
                  </Text>
                </Box>
                <Box p={4} bg={useColorModeValue("gray.50", "gray.600")} borderRadius="md">
                  <Text fontSize="sm" color={mutedTextColor}>24h APR</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    {formatPercentage(selected.stats24h.apr || 0)}
                  </Text>
                </Box>
                <Box p={4} bg={useColorModeValue("gray.50", "gray.600")} borderRadius="md">
                  <Text fontSize="sm" color={mutedTextColor}>7d APR</Text>
                  <Text fontSize="lg" fontWeight="bold" color="orange.500">
                    {formatPercentage(selected.stats7d.apr || 0)}
                  </Text>
                </Box>
                <Box p={4} bg={useColorModeValue("gray.50", "gray.600")} borderRadius="md">
                  <Text fontSize="sm" color={mutedTextColor}>30d APR</Text>
                  <Text fontSize="lg" fontWeight="bold" color="purple.500">
                    {formatPercentage(selected.stats30d.apr || 0)}
                  </Text>
                </Box>
              </Grid>

              <VStack spacing={3} align="start">
                <Heading size="md" color={textColor}>Pool Information</Heading>
                <Box fontSize="sm" color={mutedTextColor}>
                  <Text><strong>Pool Address:</strong> {selected.poolAddress}</Text>
                  <Text><strong>Factory Address:</strong> {selected.protocol.factoryAddress}</Text>
                  <Text><strong>Token 0:</strong> {selected.token0.name} ({selected.token0.symbol})</Text>
                  <Text><strong>Token 1:</strong> {selected.token1.name} ({selected.token1.symbol})</Text>
                </Box>
              </VStack>
            </VStack>
          </Box>
        </Box>
      )}
    </VStack>
  );
} 