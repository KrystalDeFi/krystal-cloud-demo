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
  Button,
  Link,
  Divider,
  Grid,
  GridItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip,
  Flex,
  Image,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { 
  ArrowBackIcon, 
  CopyIcon, 
} from "@chakra-ui/icons";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { KrystalApi } from "../../../../services/krystalApi";
import { IAPoolDetails, IAPoolHistorical } from "../../../../services/apiTypes";

// Chart data interface for processed historical data
interface ChartDataPoint {
  timestamp: number;
  date: string;
  price: number;
  volume: number;
  fee: number;
  tvl: number;
  apr: number;
}

export default function PoolDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const chainId = params.chainId as string;
  const poolId = params.poolId as string;

  const [pool, setPool] = useState<IAPoolDetails | null>(null);
  const [historicalData, setHistoricalData] = useState<IAPoolHistorical[]>([]);
  const [loading, setLoading] = useState(true);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChart, setSelectedChart] = useState<'price' | 'apr' | 'tvl' | 'volume' | 'fee'>('tvl');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const isEmbedMode = searchParams.get("embed") === "true";
  const showFooter = searchParams.get("showFooter") !== "false";

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedTextColor = useColorModeValue("gray.600", "gray.300");

  useEffect(() => {
    fetchPoolDetails();
  }, [chainId, poolId]);

  useEffect(() => {
    if (pool) {
      fetchHistoricalData();
    }
  }, [pool, timeRange]);

  const fetchPoolDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiKey = KrystalApi.getApiKey();
      if (!apiKey) {
        throw new Error("API key not found. Please set your API key in the navigation bar.");
      }
      
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

  const fetchHistoricalData = async () => {
    if (!pool) return;
    
    try {
      setHistoricalLoading(true);
      
      const apiKey = KrystalApi.getApiKey();
      if (!apiKey) return;

      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - (timeRange === '7d' ? 7 * 24 * 60 * 60 : timeRange === '30d' ? 30 * 24 * 60 * 60 : 90 * 24 * 60 * 60);

      const response = await KrystalApi.pools.getHistorical(apiKey, {
        chainId,
        poolAddress: poolId,
        startTime,
        endTime,
      });
      
      setHistoricalData(response);
    } catch (err) {
      console.error("Error fetching historical data:", err);
      toast({
        title: "Error",
        description: "Failed to fetch historical data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setHistoricalLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const getChartData = (): ChartDataPoint[] => {
    if (!historicalData || historicalData.length === 0) {
      return [];
    }
    
    // Sort by timestamp to ensure proper order
    const sortedData = [...historicalData].sort((a, b) => a.timestamp - b.timestamp);
    
    return sortedData.map((item, index) => {
      const date = new Date(item.timestamp * 1000);
      const dateString = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      return {
        timestamp: item.timestamp,
        date: dateString,
        price: Number(item.poolPrice) || 0,
        volume: Number(item.volume24h) || 0,
        fee: Number(item.fee24h) || 0,
        tvl: Number(item.tvlUsd) || 0,
        apr: Number(item.apr24h) || 0,
      };
    });
  };

  const renderChart = () => {
    const data = getChartData();
    
    if (historicalLoading) {
      return (
        <Box h="400px" display="flex" alignItems="center" justifyContent="center">
          <Spinner size="xl" />
        </Box>
      );
    }

    if (data.length === 0) {
      return (
        <Box h="400px" display="flex" alignItems="center" justifyContent="center">
          <Text color={mutedTextColor}>No historical data available</Text>
        </Box>
      );
    }

    // Get appropriate number of data points based on time range
    let displayData;
    switch (timeRange) {
      case '7d':
        displayData = data.slice(-7);
        break;
      case '30d':
        displayData = data.slice(-15);
        break;
      case '90d':
        displayData = data.slice(-20);
        break;
      default:
        displayData = data.slice(-10);
    }
    
    // Extract values for the selected chart type
    const getValue = (item: ChartDataPoint) => {
      switch (selectedChart) {
        case 'price': return item.price;
        case 'apr': return item.apr;
        case 'tvl': return item.tvl;
        case 'volume': return item.volume;
        case 'fee': return item.fee;
        default: return item.tvl;
      }
    };
    
    const values = displayData.map(getValue);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    const formatYAxis = (value: number) => {
      if (selectedChart === 'price') return value.toFixed(6);
      if (selectedChart === 'apr') return `${value.toFixed(2)}%`;
      return formatCurrency(value);
    };

    return (
      <Box h="400px" p={4}>
        {/* Chart Container */}
        <Box h="320px" position="relative">
          {selectedChart === 'fee' ? (
            /* Bar Chart for Fee */
            <>
              <HStack spacing={1} h="280px" align="end">
                {displayData.map((item, index) => {
                  const value = getValue(item);
                  
                  // Calculate bar height with better scaling
                  const range = maxValue - minValue;
                  const normalizedValue = range > 0 ? (value - minValue) / range : 0.5;
                  const height = Math.max(8, normalizedValue * 260); // Min 8px, max 260px
                  
                  return (
                    <Box
                      key={index}
                      flex={1}
                      h={`${height}px`}
                      minH="8px"
                      bg="blue.500"
                      borderRadius="sm"
                      transition="all 0.2s"
                      _hover={{ bg: "blue.600" }}
                    >
                      <Tooltip 
                        label={`${item.date}: ${formatYAxis(value)}`}
                        placement="top"
                        hasArrow
                      >
                        <Box w="full" h="full" />
                      </Tooltip>
                    </Box>
                  );
                })}
              </HStack>
            </>
          ) : (
            /* Line Chart for Price, APR, TVL, Volume */
            <Box h="280px" position="relative">
              {/* Grid lines */}
              <Box position="absolute" top={0} left={0} right={0} bottom={0}>
                {[0, 25, 50, 75, 100].map((percent) => (
                  <Box
                    key={percent}
                    position="absolute"
                    left={0}
                    right={0}
                    top={`${percent}%`}
                    borderTop="1px dashed"
                    borderColor="gray.200"
                    opacity={0.5}
                  />
                ))}
              </Box>
              
              {/* Line chart */}
              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                <polyline
                  fill="none"
                  stroke="#3182CE"
                  strokeWidth="2"
                  points={displayData.map((item, index) => {
                    const value = getValue(item);
                    const range = maxValue - minValue;
                    const normalizedValue = range > 0 ? (value - minValue) / range : 0.5;
                    const y = 280 - (normalizedValue * 260); // Invert Y axis
                    const x = (index / (displayData.length - 1)) * 100; // X as percentage
                    return `${x}%,${y}`;
                  }).join(' ')}
                />
                
                {/* Data points */}
                {displayData.map((item, index) => {
                  const value = getValue(item);
                  const range = maxValue - minValue;
                  const normalizedValue = range > 0 ? (value - minValue) / range : 0.5;
                  const y = 280 - (normalizedValue * 260);
                  const x = (index / (displayData.length - 1)) * 100;
                  
                  return (
                    <circle
                      key={index}
                      cx={`${x}%`}
                      cy={y}
                      r="4"
                      fill="#3182CE"
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </Box>
          )}
          
          {/* Date labels */}
          <HStack spacing={1} mt={2} justify="space-between">
            {displayData.map((item, index) => (
              <Text 
                key={index} 
                fontSize="xs" 
                color={mutedTextColor} 
                textAlign="center" 
                flex={1}
                noOfLines={1}
                overflow="hidden"
              >
                {item.date}
              </Text>
            ))}
          </HStack>
        </Box>
        
        {/* Value labels */}
        <HStack spacing={1} mt={3} justify="space-between">
          {displayData.map((item, index) => {
            const value = getValue(item);
            return (
              <Text 
                key={index} 
                fontSize="xs" 
                color={mutedTextColor} 
                textAlign="center" 
                flex={1}
                fontFamily="mono"
                noOfLines={1}
                overflow="hidden"
              >
                {formatYAxis(value)}
              </Text>
            );
          })}
        </HStack>
      </Box>
    );
  };

  const getStatsData = () => {
    if (!pool) return { volume: 0, fee: 0, apr: 0 };
    
    switch (selectedTimeframe) {
      case '1h':
        return {
          volume: pool.stats1h?.volume || 0,
          fee: pool.stats1h?.fee || 0,
          apr: pool.stats1h?.apr || 0
        };
      case '24h':
        return {
          volume: pool.stats24h?.volume || 0,
          fee: pool.stats24h?.fee || 0,
          apr: pool.stats24h?.apr || 0
        };
      case '7d':
        return {
          volume: pool.stats7d?.volume || 0,
          fee: pool.stats7d?.fee || 0,
          apr: pool.stats7d?.apr || 0
        };
      case '30d':
        return {
          volume: pool.stats30d?.volume || 0,
          fee: pool.stats30d?.fee || 0,
          apr: pool.stats30d?.apr || 0
        };
      default:
        return {
          volume: pool.stats24h?.volume || 0,
          fee: pool.stats24h?.fee || 0,
          apr: pool.stats24h?.apr || 0
        };
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg={bgColor}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
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

  const statsData = getStatsData();

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="7xl" py={6}>
        {/* Header */}
        <Box>
          <VStack spacing={6} mb={8}>
            <HStack w="full" justify="space-between" align="start">
              <VStack align="start" spacing={2}>
                <Button
                  leftIcon={<ArrowBackIcon />}
                  variant="ghost"
                  onClick={() => router.push("/pools")}
                  size="sm"
                >
                  Back to Pools
                </Button>
                <VStack align="start" spacing={3}>
                  <HStack spacing={4} align="center">
                    <HStack spacing={2}>
                      <Image 
                        src={pool.token0.logo || `/images/token-fallback.png`} 
                        alt={pool.token0.symbol}
                        boxSize="32px"
                        borderRadius="full"
                        fallbackSrc="/images/token-fallback.png"
                      />
                      <Image 
                        src={pool.token1.logo || `/images/token-fallback.png`} 
                        alt={pool.token1.symbol}
                        boxSize="32px"
                        borderRadius="full"
                        fallbackSrc="/images/token-fallback.png"
                      />
                    </HStack>
                    <Heading size="lg" color={textColor}>{pool.token0.symbol}/{pool.token1.symbol}</Heading>
                  </HStack>
                  
                  <HStack spacing={4} align="center">
                    <HStack spacing={1}>
                      <Image
                        src={pool.chain.logo}
                        fallbackSrc="/images/token-fallback.png"
                        boxSize="20px"
                        borderRadius="full"
                      />
                      <Text fontSize="sm" color={mutedTextColor}>
                        {pool.chain.name}
                      </Text>
                    </HStack>

                    <HStack spacing={1}>
                      <Image 
                        src={pool.protocol.logo || `/images/token-fallback.png`} 
                        alt={pool.protocol.name}
                        boxSize="20px"
                        borderRadius="full"
                        fallbackSrc="/images/token-fallback.png"
                      />
                      <Text fontSize="sm" color={mutedTextColor}>
                        {pool.protocol.name}
                      </Text>
                    </HStack>

                    <Badge size="xs">
                      Fee {(pool.feeTier / 10000).toFixed(3)}%
                    </Badge>
                  </HStack>
                </VStack>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        {/* Key Metrics */}
        <Box>
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 2fr" }}
            gap={6}
            mb={8}
          >
            <GridItem>
              <Card 
                bg={cardBg} 
                border="1px" 
                borderColor={borderColor}
              >
                <CardBody>
                  <Stat>
                    <StatLabel color={mutedTextColor}>Total Value Locked</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold" color={textColor}>{formatCurrency(pool.tvl)}</StatNumber>
                    <StatHelpText>Current TVL</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card 
                bg={cardBg} 
                border="1px" 
                borderColor={borderColor}
              >
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" fontWeight="medium" color={mutedTextColor}>Performance</Text>
                      <HStack spacing={1}>
                        {(['1h', '24h', '7d', '30d'] as const).map((timeframe) => (
                          <Button
                            key={timeframe}
                            size="xs"
                            variant={selectedTimeframe === timeframe ? 'solid' : 'outline'}
                            onClick={() => setSelectedTimeframe(timeframe)}
                          >
                            {timeframe}
                          </Button>
                        ))}
                      </HStack>
                    </HStack>
                    
                    <SimpleGrid columns={3} spacing={4} w="full">
                      <Stat>
                        <StatLabel color={mutedTextColor} fontSize="xs">Volume</StatLabel>
                        <StatNumber fontSize="lg" color={textColor}>{formatCurrency(statsData.volume)}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel color={mutedTextColor} fontSize="xs">Fee</StatLabel>
                        <StatNumber fontSize="lg" color={textColor}>{formatCurrency(statsData.fee)}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel color={mutedTextColor} fontSize="xs">APR</StatLabel>
                        <StatNumber fontSize="lg" color={textColor}>{statsData.apr.toFixed(2)}%</StatNumber>
                      </Stat>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </Box>

        {/* Main Content Grid */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8} mb={8}>
          {/* Historical Chart */}
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <HStack justify="space-between" mb={6}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                      Current price: {parseFloat(pool.poolPrice).toFixed(5)} {pool.token1.symbol}/{pool.token0.symbol}
                    </Text>
                  </VStack>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant={timeRange === '7d' ? 'solid' : 'outline'}
                      onClick={() => setTimeRange('7d')}
                    >
                      7D
                    </Button>
                    <Button
                      size="sm"
                      variant={timeRange === '30d' ? 'solid' : 'outline'}
                      onClick={() => setTimeRange('30d')}
                    >
                      30D
                    </Button>
                    <Button
                      size="sm"
                      variant={timeRange === '90d' ? 'solid' : 'outline'}
                      onClick={() => setTimeRange('90d')}
                    >
                      90D
                    </Button>
                  </HStack>
                </HStack>
                
                <Tabs variant="soft-rounded" colorScheme="blue" onChange={(index) => {
                  const charts = ['price', 'apr', 'tvl', 'volume', 'fee'] as const;
                  setSelectedChart(charts[index]);
                }}>
                  <TabList mb={4}>
                    <Tab>Price</Tab>
                    <Tab>APR</Tab>
                    <Tab>TVL</Tab>
                    <Tab>Volume</Tab>
                    <Tab>Fee</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel p={0}>
                      {renderChart()}
                    </TabPanel>
                    <TabPanel p={0}>
                      {renderChart()}
                    </TabPanel>
                    <TabPanel p={0}>
                      {renderChart()}
                    </TabPanel>
                    <TabPanel p={0}>
                      {renderChart()}
                    </TabPanel>
                    <TabPanel p={0}>
                      {renderChart()}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </GridItem>

          {/* Token Information */}
          <GridItem>
            <VStack spacing={6}>
              <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
                <CardBody>
                  <Heading size="md" mb={6} color={textColor}>Token Information</Heading>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <HStack spacing={2} mb={2} justify="space-between">
                        <HStack spacing={2}>
                          <Image 
                            src={pool.token0.logo || `/images/token-fallback.png`} 
                            alt={pool.token0.symbol}
                            boxSize="24px"
                            borderRadius="full"
                            fallbackSrc="/images/token-fallback.png"
                          />
                          <Text fontWeight="medium" color={textColor}>{pool.token0.symbol}</Text>
                        </HStack>
                        <Text fontSize="sm" color={mutedTextColor}>{pool.token0.name}</Text>
                      </HStack>
                      <HStack spacing={2} justify="space-between">
                        <HStack spacing={2}>
                          <Text fontSize="xs" fontFamily="mono" color={mutedTextColor}>
                            {pool.token0.address.slice(0, 8)}...{pool.token0.address.slice(-4)}
                          </Text>
                          <IconButton
                            icon={<CopyIcon />}
                            size="xs"
                            variant="ghost"
                            onClick={() => copyToClipboard(pool.token0.address, "Token address")}
                            aria-label="Copy token address"
                          />
                        </HStack>
                        {/* <Link href={getExplorerUrl(pool.chainId, pool.token0.address)} isExternal>
                          <IconButton
                            icon={<ExternalLinkIcon />}
                            size="xs"
                            variant="ghost"
                            aria-label="View token on explorer"
                          />
                        </Link> */}
                      </HStack>
                    </Box>
                    <Divider />
                    <Box>
                      <HStack spacing={2} mb={2} justify="space-between">
                        <HStack spacing={2}>
                          <Image 
                            src={pool.token1.logo || `/images/token-fallback.png`} 
                            alt={pool.token1.symbol}
                            boxSize="24px"
                            borderRadius="full"
                            fallbackSrc="/images/token-fallback.png"
                          />
                          <Text fontWeight="medium" color={textColor}>{pool.token1.symbol}</Text>
                        </HStack>
                        <Text fontSize="sm" color={mutedTextColor}>{pool.token1.name}</Text>
                      </HStack>
                      <HStack spacing={2} justify="space-between">
                        <HStack spacing={2}>
                          <Text fontSize="xs" fontFamily="mono" color={mutedTextColor}>
                            {pool.token1.address.slice(0, 8)}...{pool.token1.address.slice(-4)}
                          </Text>
                          <IconButton
                            icon={<CopyIcon />}
                            size="xs"
                            variant="ghost"
                            onClick={() => copyToClipboard(pool.token1.address, "Token address")}
                            aria-label="Copy token address"
                          />
                        </HStack>
                        {/* <Link href={getExplorerUrl(pool.chainId, pool.token1.address)} isExternal>
                          <IconButton
                            icon={<ExternalLinkIcon />}
                            size="xs"
                            variant="ghost"
                            aria-label="View token on explorer"
                          />
                        </Link> */}
                      </HStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Reference Links */}
              <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
                <CardBody>
                  <Heading size="md" mb={4} color={textColor}>References</Heading>
                  <HStack spacing={3} justify="center">
                    <Link href="https://krystal.app" isExternal>
                      <IconButton
                        icon={<Image src="/images/krystal-logo.png" alt="Krystal" boxSize="16px" fallbackSrc="/images/token-fallback.png" />}
                        size="md"
                        variant="outline"
                        aria-label="Visit Krystal"
                      />
                    </Link>
                    {/* <Link href={getDexscreenerUrl(pool.chainId, pool.poolAddress)} isExternal>
                      <IconButton
                        icon={<Image src="/images/dexscreener-logo.png" alt="DexScreener" boxSize="16px" fallbackSrc="/images/token-fallback.png" />}
                        size="md"
                        variant="outline"
                        aria-label="View on DexScreener"
                      />
                    </Link>
                    <Link href={getExplorerUrl(pool.chainId, pool.poolAddress)} isExternal>
                      <IconButton
                        icon={<ExternalLinkIcon />}
                        size="md"
                        variant="outline"
                        aria-label="View on Explorer"
                      />
                    </Link> */}
                  </HStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>

        {/* Footer */}
        {showFooter && (
          <Box textAlign="center" mt={8}>
            <Text fontSize="sm" color={mutedTextColor}>
              Built with Next.js and Chakra UI • Powered by Krystal Cloud API
            </Text>
          </Box>
        )}
      </Container>
    </Box>
  );
} 