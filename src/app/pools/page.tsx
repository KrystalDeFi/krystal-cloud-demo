"use client";
import React, { useState, useEffect } from "react";
import {
  Flex,
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Button,
  Link,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputRightElement,
} from "@chakra-ui/react";
import { 
  SearchIcon, 
  ExternalLinkIcon, 
  ArrowBackIcon,
  ArrowRightIcon,
} from "@chakra-ui/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { IPoolsParams, KrystalApi } from "../../services/krystalApi";
import { 
  ISortField, 
  ISortOrder, 
  CHAIN_CONFIGS,
  SORT_OPTIONS,
} from "../../common/config";
import { useChainsProtocols } from "../../contexts/ChainsProtocolsContext";
import Pagination from "../../components/Pagination";
import { IAPool } from "../../services/apiTypes";

export default function PoolsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pools, setPools] = useState<IAPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [tempSearchTerm, setTempSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedChain, setSelectedChain] = useState(searchParams.get("chainId") || "all");
  const [selectedProtocol, setSelectedProtocol] = useState(searchParams.get("protocol") || "all");
  const [tvlFrom, setTvlFrom] = useState<number>(parseInt(searchParams.get("tvlFrom") || "1000"));
  const [volume24hFrom, setVolume24hFrom] = useState<number>(parseInt(searchParams.get("volume24hFrom") || "1000"));
  const [sortField, setSortField] = useState<ISortField>((searchParams.get("sort") as ISortField) || "tvl");
  const [sortOrder, setSortOrder] = useState<ISortOrder>((searchParams.get("order") as ISortOrder) || "desc");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get("limit") || "20"));
  const [totalItems, setTotalItems] = useState(0);

  // Cache data
  const { chains, protocols} = useChainsProtocols();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  // Update URL params when filters change
  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.replace(`/pools?${params.toString()}`);
  };

  // Fetch pools from API
  const fetchPools = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiKey = KrystalApi.getApiKey();
      if (!apiKey) {
        throw new Error("API key not found. Please set your API key in the navigation bar.");
      }
      
      // Prepare API parameters based on swagger specification
      const apiParams: IPoolsParams = {
        chainId: selectedChain !== "all" ? selectedChain : undefined,
        protocol: selectedProtocol !== "all" ? selectedProtocol : undefined,
        token: searchTerm || undefined,
        tvlFrom: tvlFrom > 1000 ? tvlFrom : undefined,
        volume24hFrom: volume24hFrom > 1000 ? volume24hFrom : undefined,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      };

      // Add sort parameters (convert UI sort to API sortBy)
      switch (sortField) {
        case "apr":
          apiParams.sortBy = SORT_OPTIONS.APR;
          break;
        case "tvl":
          apiParams.sortBy = SORT_OPTIONS.TVL;
          break;
        case "volume24h":
          apiParams.sortBy = SORT_OPTIONS.VOLUME_24H;
          break;
        case "fees24h":
          apiParams.sortBy = SORT_OPTIONS.FEE;
          break;
      }

      console.log("API Parameters:", apiParams);

      // Call the actual API with parameters
      const response = await KrystalApi.pools.getAll(apiKey, apiParams);
      
      console.log("API Response:", response);
      
      if (response && response.data && Array.isArray(response.data)) {
        const poolsData = response.data;
        const totalCount = response.total || response.data.length;
        
        setPools(poolsData);
        setTotalItems(totalCount);
      } else {
        console.error("Invalid response format:", response);
        setError("Invalid response format from API");
      }
    } catch (err) {
      console.error("Error fetching pools:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch pools. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch pools whenever parameters change
  useEffect(() => {
    fetchPools();
  }, [selectedChain, selectedProtocol, searchTerm, tvlFrom, volume24hFrom, sortField, sortOrder, currentPage, pageSize]);

  // Sync URL params with state
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlChain = searchParams.get("chainId") || "all";
    const urlProtocol = searchParams.get("protocol") || "all";
    const urlTvlFrom = parseInt(searchParams.get("tvlFrom") || "1000");
    const urlVolume24hFrom = parseInt(searchParams.get("volume24hFrom") || "1000");
    const urlSort = (searchParams.get("sort") as ISortField) || "tvl";
    const urlOrder = (searchParams.get("order") as ISortOrder) || "desc";
    const urlPage = parseInt(searchParams.get("page") || "1");
    const urlLimit = parseInt(searchParams.get("limit") || "20");

    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
      setTempSearchTerm(urlSearch);
    }
    if (urlChain !== selectedChain) setSelectedChain(urlChain);
    if (urlProtocol !== selectedProtocol) setSelectedProtocol(urlProtocol);
    if (urlTvlFrom !== tvlFrom) setTvlFrom(urlTvlFrom);
    if (urlVolume24hFrom !== volume24hFrom) setVolume24hFrom(urlVolume24hFrom);
    if (urlSort !== sortField) setSortField(urlSort);
    if (urlOrder !== sortOrder) setSortOrder(urlOrder);
    if (urlPage !== currentPage) setCurrentPage(urlPage);
    if (urlLimit !== pageSize) setPageSize(urlLimit);
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    updateUrlParams({ search: value, page: "1" });
  };

  const handleSearchSubmit = () => {
    handleSearch(tempSearchTerm);
  };

  const handleSearchBlur = () => {
    if (tempSearchTerm !== searchTerm) {
      handleSearch(tempSearchTerm);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleChainFilter = (value: string) => {
    setSelectedChain(value);
    setCurrentPage(1);
    updateUrlParams({ chainId: value, page: "1" });
  };

  const handleProtocolFilter = (value: string) => {
    setSelectedProtocol(value);
    setCurrentPage(1);
    updateUrlParams({ protocol: value, page: "1" });
  };

  const handleTvlFromChange = (value: number) => {
    setTvlFrom(value);
    setCurrentPage(1);
    updateUrlParams({ tvlFrom: value.toString(), page: "1" });
  };

  const handleVolume24hFromChange = (value: number) => {
    setVolume24hFrom(value);
    setCurrentPage(1);
    updateUrlParams({ volume24hFrom: value.toString(), page: "1" });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams({ page: page.toString() });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    updateUrlParams({ limit: size.toString(), page: "1" });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getChainColor = (chainId: string) => {
    return CHAIN_CONFIGS[chainId]?.color || CHAIN_CONFIGS["unknown"]?.color || "gray";
  };

  const getExplorerUrl = (chainId: string, address: string) => {
    return `${CHAIN_CONFIGS[chainId]?.explorer || CHAIN_CONFIGS["unknown"]?.explorer || "#"}/address/${address}`;
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading pools and data...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxW="7xl" py={6}>
        <VStack spacing={4}>
          {error && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              {error}
            </Alert>
          )}
        </VStack>
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
                onClick={() => router.push("/")}
                size="sm"
              >
                Back to Home
              </Button>
              <Heading size="2xl">DeFi Pools</Heading>
              <Text fontSize="lg" color="gray.600" _dark={{ color: "gray.300" }}>
                Browse and filter DeFi pools across different chains
              </Text>
            </VStack>
          </HStack>
        </VStack>

        {/* Filters */}

        <VStack spacing={4} align="stretch">
          {/* Search and Basic Filters */}
          <Flex gap={4} wrap="wrap" justifyContent={"space-between"} fontSize={"xs"}>
            <InputGroup w="fit-content" fontSize={"xs"}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by token"
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                onBlur={handleSearchBlur}
                pr={tempSearchTerm ? 10 : 4}
              />
              {tempSearchTerm && (
                <InputRightElement>
                  <IconButton
                    aria-label="Search"
                    icon={<ArrowRightIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={handleSearchSubmit}
                    color="gray.500"
                    _hover={{ color: "brand.500" }}
                  />
                </InputRightElement>
              )}
            </InputGroup>
            <Select w="fit-content"
              value={selectedChain}
              onChange={(e) => handleChainFilter(e.target.value)}
            >
              <option value="all">All Chains</option>
              {chains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </Select>
            <Select
              w="fit-content"
              value={selectedProtocol}
              onChange={(e) => handleProtocolFilter(e.target.value)}
            >
              <option value="all">All Protocols</option>
              {protocols.map((protocol) => (
                <option key={protocol.key} value={protocol.name}>
                  {protocol.name}
                </option>
              ))}
            </Select>
            <Select
              w="fit-content"
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortField(field as ISortField);
                setSortOrder(order as ISortOrder);
                setCurrentPage(1);
                updateUrlParams({ sort: field, order, page: "1" });
              }}
            >
              <option value="tvl">Sort by: TVL</option>
              <option value="apr">Sort by: APR</option>
              <option value="volume24h">Sort by: 24h Volume</option>
              <option value="fees24h">Sort by: 24h Fees</option>
            </Select>

            <Box >
              <NumberInput
                value={tvlFrom}
                onChange={(_, value) => handleTvlFromChange(value)}
                min={0}
                maxW="150px"
              >
                <NumberInputField />
              </NumberInput>
              <Text fontSize="sm" mb={1}>Min TVL (USD)</Text>
            </Box>
            <Box>
              <NumberInput
                value={volume24hFrom}
                onChange={(_, value) => handleVolume24hFromChange(value)}
                min={0}
                maxW="150px"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="sm" mb={1}>Min 24h Volume (USD)</Text>
            </Box>
          </Flex>
        </VStack>

        {/* Pools Table */}
        <Card bg={cardBg} _dark={{ bg: "gray.800" }} border="1px" borderColor={borderColor} mb={6}>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>
                    <HStack spacing={1}>
                      <Text>Pool</Text>
                    </HStack>
                  </Th>
                  <Th>
                    <HStack spacing={1}>
                      <Text>Chain</Text>
                    </HStack>
                  </Th>
                  <Th>
                    <HStack spacing={1}>
                      <Text>Protocol</Text>
                    </HStack>
                  </Th>
                  <Th>
                    <HStack spacing={1}>
                      <Text>TVL</Text>
                    </HStack>
                  </Th>
                  <Th>
                    <HStack spacing={1}>
                      <Text>24h Volume</Text>
                    </HStack>
                  </Th>
                  <Th>
                    <HStack spacing={1}>
                      <Text>24h Fees</Text>
                    </HStack>
                  </Th>
                  <Th>
                    <HStack spacing={1}>
                      <Text>APR</Text>
                    </HStack>
                  </Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pools.map((pool: IAPool) => (
                  <Tr
                    key={pool.poolAddress}
                    _hover={{ bg: "gray.50", _dark: { bg: "gray.700" }, cursor: "pointer" }}
                    onClick={() => router.push(`/pools/${pool.chain.id}/${pool.poolAddress}`)}
                  >
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack spacing={2}>
                          <Text fontWeight="medium">{pool.token0.symbol}/{pool.token1.symbol}</Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.500" fontFamily="mono">
                          {pool.poolAddress.slice(0, 8)}...{pool.poolAddress.slice(-6)}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getChainColor(pool.chain.id)}>
                        {pool.chain.name}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{pool.protocol.name}</Text>
                    </Td>
                    <Td>{formatCurrency(pool.tvl)}</Td>
                    <Td>{formatCurrency(pool.stats24h?.volume || 0)}</Td>
                    <Td>{formatCurrency(pool.stats24h?.fee || 0)}</Td>
                    <Td>
                      <Text color={(pool.stats24h?.apr || 0) > 0 ? "green.500" : "red.500"}>
                        {(pool.stats24h?.apr || 0).toFixed(2)}%
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label="View Pool Details">
                          <IconButton
                            aria-label="View pool details"
                            icon={<ExternalLinkIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/pools/${pool.chainId}/${pool.poolAddress}`);
                            }}
                          />
                        </Tooltip>
                        <Tooltip label="View on Explorer">
                          <Link href={getExplorerUrl(pool.chainId, pool.poolAddress)} isExternal>
                            <IconButton
                              aria-label="View on explorer"
                              icon={<ExternalLinkIcon />}
                              size="sm"
                              variant="ghost"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Link>
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Card>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />

        {pools.length === 0 && !loading && (
          <Box textAlign="center" py={12}>
            <Text color="gray.500" _dark={{ color: "gray.400" }}>
              No pools found matching your criteria.
            </Text>
          </Box>
        )}

        {/* Footer */}
        <Box textAlign="center" mt={8}>
          <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
            Built with Next.js and Chakra UI • Powered by Krystal Cloud API
          </Text>
        </Box>
      </Container>
    </Box>
  );
} 