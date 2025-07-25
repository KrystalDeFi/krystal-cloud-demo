"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
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
  Avatar,
  AvatarGroup,
  AvatarBadge,
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

interface WalletStats {
  totalValue: number;
  totalPositions: number;
  activePositions: number;
  totalFeesEarned: number;
  averageApr: number;
}

export default function WalletPositionsPage() {
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
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChain, setSelectedChain] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("OPEN");
  const [newWalletAddress, setNewWalletAddress] = useState(walletAddress);
  const [sortField, setSortField] = useState("liquidity");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  const isEmbedMode = searchParams.get("embed") === "true";
  const showFooter = searchParams.get("showFooter") !== "false";

  useEffect(() => {
    fetchPositions();
  }, [walletAddress, selectedStatus]);

  useEffect(() => {
    filterPositions();
  }, [positions, searchTerm, selectedChain, sortField, sortOrder]);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiKey = KrystalApi.getApiKey();
      if (!apiKey) {
        throw new Error("API key not found. Please set your API key in the navigation bar.");
      }
      
      const params: IPositionsParams = {
        wallet: walletAddress,
        positionStatus: selectedStatus as 'OPEN' | 'CLOSED',
        chainId: selectedChain !== "all" ? selectedChain : undefined,
      };

      const response = await KrystalApi.positions.getAll(apiKey, params);
      
      if (response?.length > 0) {
        setPositions(response);
        
        // Separate open and closed positions
        const open = response.filter(pos => pos.status === 'OPEN');
        const closed = response.filter(pos => pos.status === 'CLOSED');
        setOpenPositions(open);
        setClosedPositions(closed);
        
        // Calculate stats
        const totalValue = response.reduce((sum, pos) => sum + (pos.liquidity || 0), 0);
        const activePositions = open.length;
        const totalFeesEarned = response.reduce((sum, pos) => sum + (pos.tokensOwed0 ? parseFloat(pos.tokensOwed0) : 0), 0);
        const averageApr = response.length > 0 ? response.reduce((sum, pos) => sum + (pos.liquidity || 0), 0) / response.length : 0;

        setStats({
          totalValue,
          totalPositions: response.length,
          activePositions,
          totalFeesEarned,
          averageApr,
        });
      } else {
        setPositions([]);
        setOpenPositions([]);
        setClosedPositions([]);
        setStats(null);
      }
    } catch (err) {
      console.error("Error fetching positions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch positions. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const filterPositions = () => {
    let filtered = positions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(position =>
        (position.poolName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (position.poolAddress || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (position.walletAddress || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by chain
    if (selectedChain !== "all") {
      filtered = filtered.filter(position => position.chainId === selectedChain);
    }

    // Sort positions
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "liquidity":
          aValue = a.liquidity || 0;
          bValue = b.liquidity || 0;
          break;
        case "fees":
          aValue = parseFloat(a.tokensOwed0 || "0");
          bValue = parseFloat(b.tokensOwed0 || "0");
          break;
        case "age":
          aValue = new Date(a.createdAt || "").getTime();
          bValue = new Date(b.createdAt || "").getTime();
          break;
        default:
          aValue = a.liquidity || 0;
          bValue = b.liquidity || 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPositions(filtered);
  };

  const handleSort = (field: string) => {
    const newOrder = sortField === field && sortOrder === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortOrder(newOrder);
  };

  const handleWalletAddressChange = () => {
    if (newWalletAddress && newWalletAddress !== walletAddress) {
      router.push(`/wallets/${newWalletAddress}/positions`);
    }
  };

  const handleWalletAddressKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleWalletAddressChange();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getChainColor = (chainId: string) => {
    return CHAIN_CONFIGS[chainId]?.color || "gray";
  };

  const getStatusColor = (status: string) => {
    return status === "OPEN" ? "green" : "red";
  };

  const formatAge = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'about 1 hour';
    }
  };

  const getCurrentPositions = () => {
    return selectedStatus === "OPEN" ? openPositions : closedPositions;
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading positions...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxW="7xl" py={6}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {error}
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
                onClick={() => router.push("/")}
                size="sm"
              >
                Back to Home
              </Button>
              <Heading size="2xl">Wallet Positions</Heading>
            </VStack>
            
            {/* Wallet Address Input */}
            <VStack align="end" spacing={2}>
              <InputGroup maxW="400px">
                <Input
                  placeholder="Search by token, address"
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
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

        {/* Tabs */}
        <Tabs defaultIndex={selectedStatus === "OPEN" ? 0 : 1} onChange={(index) => setSelectedStatus(index === 0 ? "OPEN" : "CLOSED")}>
          <TabList>
            <Tab>
              Open position ({openPositions.length})
            </Tab>
            <Tab>
              Closed position ({closedPositions.length})
            </Tab>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                <Select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  maxW="150px"
                >
                  <option value="all">All Chains</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="polygon">Polygon</option>
                  <option value="bsc">BSC</option>
                </Select>
              </HStack>

              {/* Positions Table */}
              <Card bg={cardBg} _dark={{ bg: "gray.800" }} border="1px" borderColor={borderColor}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>
                          <HStack spacing={1}>
                            <Text>Pool Name</Text>
                          </HStack>
                        </Th>
                        <Th cursor="pointer" onClick={() => handleSort("liquidity")}>
                          <HStack spacing={1}>
                            <Text>Liquidity</Text>
                            {sortField === "liquidity" && (
                              sortOrder === "asc" ? <ChevronUpIcon /> : <ChevronDownIcon />
                            )}
                          </HStack>
                        </Th>
                        <Th>
                          <HStack spacing={1}>
                            <Text>Profit & Loss</Text>
                          </HStack>
                        </Th>
                        <Th cursor="pointer" onClick={() => handleSort("fees")}>
                          <HStack spacing={1}>
                            <Text>Unclaimed Fees</Text>
                            {sortField === "fees" && (
                              sortOrder === "asc" ? <ChevronUpIcon /> : <ChevronDownIcon />
                            )}
                          </HStack>
                        </Th>
                        <Th>
                          <HStack spacing={1}>
                            <Text>24h Earning</Text>
                          </HStack>
                        </Th>
                        <Th>
                          <HStack spacing={1}>
                            <Text>APR</Text>
                          </HStack>
                        </Th>
                        <Th>
                          <HStack spacing={1}>
                            <Text>Price Range</Text>
                          </HStack>
                        </Th>
                        <Th cursor="pointer" onClick={() => handleSort("age")}>
                          <HStack spacing={1}>
                            <Text>Age</Text>
                            {sortField === "age" && (
                              sortOrder === "asc" ? <ChevronUpIcon /> : <ChevronDownIcon />
                            )}
                          </HStack>
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredPositions.map((position) => (
                        <Tr
                          key={position.id}
                          _hover={{ bg: "gray.50", _dark: { bg: "gray.700" }, cursor: "pointer" }}
                          onClick={() => router.push(`/positions/${position.chainId}/${position.id}`)}
                        >
                          <Td>
                            <VStack align="start" spacing={1}>
                              <HStack spacing={2}>
                                <Text fontWeight="medium">{position.poolName || "Unknown Pool"}</Text>
                                <Badge size="sm" colorScheme="green">0.3%</Badge>
                                <Badge size="sm" colorScheme="blue">🤖</Badge>
                              </HStack>
                              <Text fontSize="xs" color="gray.500">
                                {position.poolAddress ? `${position.poolAddress.slice(0, 8)}...${position.poolAddress.slice(-6)}` : "Unknown Address"}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontWeight="medium">{formatCurrency(position.liquidity || 0)}</Text>
                          </Td>
                          <Td>
                            <Text color="green.500" fontWeight="medium">
                              {formatCurrency(Math.random() * 5000)} {/* Mock P&L data */}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontWeight="medium">{formatCurrency(parseFloat(position.tokensOwed0 || "0"))}</Text>
                          </Td>
                          <Td>
                            <Text fontWeight="medium">{formatCurrency(Math.random() * 500)} {/* Mock 24h earning */}
                            </Text>
                          </Td>
                          <Td>
                            <Text color="green.500" fontWeight="medium">
                              {(Math.random() * 1000).toFixed(2)}% {/* Mock APR */}
                            </Text>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <HStack spacing={1}>
                                <Text fontSize="xs">0.0002106</Text>
                                <Box w="40px" h="2px" bg="gray.300" position="relative">
                                  <Box position="absolute" left="50%" top="-2px" w="4px" h="6px" bg="yellow.400" borderRadius="sm" />
                                </Box>
                                <Text fontSize="xs">0.0002332</Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Text fontSize="xs" color="red.500">-1.86%</Text>
                                <Text fontSize="xs" color="green.500">8.68%</Text>
                              </HStack>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{formatAge(position.createdAt || new Date().toISOString())}</Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Card>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                <Select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  maxW="150px"
                >
                  <option value="all">All Chains</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="polygon">Polygon</option>
                  <option value="bsc">BSC</option>
                </Select>
              </HStack>

              <Card bg={cardBg} _dark={{ bg: "gray.800" }} border="1px" borderColor={borderColor}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Pool Name</Th>
                        <Th>Liquidity</Th>
                        <Th>Profit & Loss</Th>
                        <Th>Unclaimed Fees</Th>
                        <Th>24h Earning</Th>
                        <Th>APR</Th>
                        <Th>Price Range</Th>
                        <Th>Age</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredPositions.map((position) => (
                        <Tr
                          key={position.id}
                          _hover={{ bg: "gray.50", _dark: { bg: "gray.700" }, cursor: "pointer" }}
                          onClick={() => router.push(`/positions/${position.chainId}/${position.id}`)}
                        >
                          <Td>
                            <VStack align="start" spacing={1}>
                              <HStack spacing={2}>
                                <Text fontWeight="medium">{position.poolName || "Unknown Pool"}</Text>
                                <Badge size="sm" colorScheme="green">0.3%</Badge>
                                <Badge size="sm" colorScheme="blue">🤖</Badge>
                              </HStack>
                              <Text fontSize="xs" color="gray.500">
                                {position.poolAddress ? `${position.poolAddress.slice(0, 8)}...${position.poolAddress.slice(-6)}` : "Unknown Address"}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontWeight="medium">{formatCurrency(position.liquidity || 0)}</Text>
                          </Td>
                          <Td>
                            <Text color="green.500" fontWeight="medium">
                              {formatCurrency(Math.random() * 5000)}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontWeight="medium">{formatCurrency(parseFloat(position.tokensOwed0 || "0"))}</Text>
                          </Td>
                          <Td>
                            <Text fontWeight="medium">{formatCurrency(Math.random() * 500)}</Text>
                          </Td>
                          <Td>
                            <Text color="green.500" fontWeight="medium">
                              {(Math.random() * 1000).toFixed(2)}%
                            </Text>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <HStack spacing={1}>
                                <Text fontSize="xs">0.0002106</Text>
                                <Box w="40px" h="2px" bg="gray.300" position="relative">
                                  <Box position="absolute" left="50%" top="-2px" w="4px" h="6px" bg="yellow.400" borderRadius="sm" />
                                </Box>
                                <Text fontSize="xs">0.0002332</Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Text fontSize="xs" color="red.500">-1.86%</Text>
                                <Text fontSize="xs" color="green.500">8.68%</Text>
                              </HStack>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{formatAge(position.createdAt || new Date().toISOString())}</Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {filteredPositions.length === 0 && (
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