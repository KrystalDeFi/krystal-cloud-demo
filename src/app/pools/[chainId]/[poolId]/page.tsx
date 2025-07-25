"use client";
export const dynamic = "force-dynamic";

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
import { ArrowBackIcon, CopyIcon } from "@chakra-ui/icons";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { KrystalApi } from "../../../../services/krystalApi";
import { IAPoolDetails, IAPoolHistorical } from "../../../../services/apiTypes";
import { Formatter } from "@/common/formatter";
import { FallbackImg } from "@/components/FallbackImg";
import { Address } from "@/components/Address";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { CHAIN_CONFIGS } from "@/common/config";

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
  const [selectedChart, setSelectedChart] = useState<
    "price" | "apr" | "tvl" | "volFee"
  >("tvl");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "1h" | "24h" | "7d" | "30d"
  >("24h");

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
        throw new Error(
          "API key not found. Please set your API key in the navigation bar."
        );
      }

      const response = await KrystalApi.pools.getById(apiKey, {
        chainId,
        poolAddress: poolId,
        withIncentives: true,
      });

      setPool(response);
    } catch (err) {
      console.error("Error fetching pool details:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch pool details. Please check your API key."
      );
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
      const startTime =
        endTime -
        (timeRange === "7d"
          ? 7 * 24 * 60 * 60
          : timeRange === "30d"
            ? 30 * 24 * 60 * 60
            : 90 * 24 * 60 * 60);

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
    const sortedData = [...historicalData].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    return sortedData.map((item, index) => {
      const date = new Date(item.timestamp * 1000);

      // Format date based on time range
      let dateString;
      if (timeRange === "7d") {
        dateString = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
        });
      } else if (timeRange === "30d") {
        dateString = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } else {
        dateString = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

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
        <Box
          h="400px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="xl" />
        </Box>
      );
    }

    if (data.length === 0) {
      return (
        <Box
          h="400px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text color={mutedTextColor}>No historical data available</Text>
        </Box>
      );
    }

    // Use all data points from API (API already filters by time range)
    const displayData = data;

    // Theme-aware colors for charts
    const gridColor = useColorModeValue("gray.200", "gray.700");
    const axisColor = useColorModeValue("gray.600", "white");
    const textColor = useColorModeValue("gray.800", "white");

    // Extract values for the selected chart type
    const getValue = (item: ChartDataPoint) => {
      switch (selectedChart) {
        case "price":
          return item.price;
        case "apr":
          return item.apr;
        case "tvl":
          return item.tvl;
        case "volFee":
          return item.volume; // For combined chart, we'll handle volume and fee separately
        default:
          return item.tvl;
      }
    };

    const formatYAxis = (value: number) => {
      if (selectedChart === "price") return value.toFixed(6);
      if (selectedChart === "apr") return `${value.toFixed(2)}%`;
      return formatCurrency(value);
    };

    const formatTooltip = (value: number) => {
      if (selectedChart === "price") return value.toFixed(6);
      if (selectedChart === "apr") return `${value.toFixed(2)}%`;
      return formatCurrency(value);
    };

    return (
      <Box
        h="400px"
        w="full"
        overflow="hidden"
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "250px",
          height: "250px",
          backgroundImage: "url('/images/krystal_logo.svg')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          opacity: useColorModeValue(0.15, 0.08),
          filter: useColorModeValue("none", "brightness(0) invert(1)"),
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Box position="relative" zIndex={1} h="full">
          {selectedChart === "volFee" ? (
            /* Combined Volume/Fee Chart */
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={displayData}>
                <defs>
                  <linearGradient
                    id="volumeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3182CE" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3182CE" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="date"
                  stroke={axisColor}
                  fontSize={12}
                  tick={{ fontSize: 10, fill: axisColor }}
                />
                <YAxis
                  yAxisId="left"
                  stroke={axisColor}
                  fontSize={12}
                  tickFormatter={value => formatCurrency(value)}
                  tick={{ fontSize: 10, fill: axisColor }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke={axisColor}
                  fontSize={12}
                  tickFormatter={value => formatCurrency(value)}
                  tick={{ fontSize: 10, fill: axisColor }}
                  domain={[0, dataMax => dataMax * 1.7]}
                />
                <RechartsTooltip
                  formatter={(value: any, name: any) => {
                    if (name === "volume") {
                      return [formatCurrency(value), "Volume"];
                    } else if (name === "fee") {
                      return [formatCurrency(value), "Fee"];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label: any) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "8px",
                    color: textColor,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#3182CE"
                  fill="url(#volumeGradient)"
                  strokeWidth={2}
                  yAxisId="left"
                  name="volume"
                />
                <Bar
                  dataKey="fee"
                  fill="#3182CE"
                  radius={[2, 2, 0, 0]}
                  yAxisId="right"
                  name="fee"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            /* Line Chart for Price, APR, TVL, Volume */
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3182CE" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3182CE" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="date"
                  stroke={axisColor}
                  fontSize={12}
                  tick={{ fontSize: 10, fill: axisColor }}
                />
                <YAxis
                  stroke={axisColor}
                  fontSize={12}
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 10, fill: axisColor }}
                />
                <RechartsTooltip
                  formatter={(value: any) => [
                    formatTooltip(value),
                    selectedChart.toUpperCase(),
                  ]}
                  labelFormatter={(label: any) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "8px",
                    color: textColor,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedChart}
                  stroke="#3182CE"
                  fill="url(#colorValue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Box>
    );
  };

  const getStatsData = () => {
    if (!pool) return { volume: 0, fee: 0, apr: 0 };

    switch (selectedTimeframe) {
      case "1h":
        return {
          volume: pool.stats1h?.volume || 0,
          fee: pool.stats1h?.fee || 0,
          apr: pool.stats1h?.apr || 0,
        };
      case "24h":
        return {
          volume: pool.stats24h?.volume || 0,
          fee: pool.stats24h?.fee || 0,
          apr: pool.stats24h?.apr || 0,
        };
      case "7d":
        return {
          volume: pool.stats7d?.volume || 0,
          fee: pool.stats7d?.fee || 0,
          apr: pool.stats7d?.apr || 0,
        };
      case "30d":
        return {
          volume: pool.stats30d?.volume || 0,
          fee: pool.stats30d?.fee || 0,
          apr: pool.stats30d?.apr || 0,
        };
      default:
        return {
          volume: pool.stats24h?.volume || 0,
          fee: pool.stats24h?.fee || 0,
          apr: pool.stats24h?.apr || 0,
        };
    }
  };

  if (loading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={bgColor}
      >
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
                    <Heading size="lg" color={textColor}>
                      {pool.token0.symbol}/{pool.token1.symbol}
                    </Heading>
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
          <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={6} mb={8}>
            <GridItem>
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel color={mutedTextColor}>
                      Total Value Locked
                    </StatLabel>
                    <StatNumber
                      fontSize="2xl"
                      fontWeight="bold"
                      color={textColor}
                    >
                      {formatCurrency(pool.tvl)}
                    </StatNumber>
                    <StatHelpText>Current TVL</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={mutedTextColor}
                      >
                        Performance
                      </Text>
                      <HStack spacing={1}>
                        {(["1h", "24h", "7d", "30d"] as const).map(
                          timeframe => (
                            <Button
                              key={timeframe}
                              size="xs"
                              variant={
                                selectedTimeframe === timeframe
                                  ? "solid"
                                  : "outline"
                              }
                              onClick={() => setSelectedTimeframe(timeframe)}
                            >
                              {timeframe}
                            </Button>
                          )
                        )}
                      </HStack>
                    </HStack>

                    <SimpleGrid columns={3} spacing={4} w="full">
                      <Stat>
                        <StatLabel color={mutedTextColor} fontSize="xs">
                          Volume ({selectedTimeframe})
                        </StatLabel>
                        <StatNumber fontSize="lg" color={textColor}>
                          {Formatter.formatCurrency(statsData.volume)}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel color={mutedTextColor} fontSize="xs">
                          Fee ({selectedTimeframe})
                        </StatLabel>
                        <StatNumber fontSize="lg" color={textColor}>
                          {Formatter.formatCurrency(statsData.fee)}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel color={mutedTextColor} fontSize="xs">
                          APR ({selectedTimeframe})
                        </StatLabel>
                        <StatNumber fontSize="lg" color={textColor}>
                          {Formatter.formatAPR(statsData.apr)}
                        </StatNumber>
                      </Stat>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </Box>

        {/* Main Content Grid */}
        <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={8} mb={8}>
          {/* Historical Chart */}
          <GridItem w="full" overflow="hidden">
            <Card
              bg={cardBg}
              border="1px"
              borderColor={borderColor}
              w="full"
              overflow="hidden"
            >
              <CardBody w="full" overflow="hidden">
                <HStack justify="space-between" mb={6}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                      Current price: {parseFloat(pool.poolPrice).toFixed(5)}{" "}
                      {pool.token1.symbol}/{pool.token0.symbol}
                    </Text>
                  </VStack>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant={timeRange === "7d" ? "solid" : "outline"}
                      onClick={() => setTimeRange("7d")}
                    >
                      7D
                    </Button>
                    <Button
                      size="sm"
                      variant={timeRange === "30d" ? "solid" : "outline"}
                      onClick={() => setTimeRange("30d")}
                    >
                      30D
                    </Button>
                    <Button
                      size="sm"
                      variant={timeRange === "90d" ? "solid" : "outline"}
                      onClick={() => setTimeRange("90d")}
                    >
                      90D
                    </Button>
                  </HStack>
                </HStack>

                <Tabs
                  variant="soft-rounded"
                  colorScheme="blue"
                  onChange={index => {
                    const charts = ["price", "apr", "tvl", "volFee"] as const;
                    setSelectedChart(charts[index]);
                  }}
                >
                  <TabList mb={4}>
                    <Tab>Price</Tab>
                    <Tab>APR</Tab>
                    <Tab>TVL</Tab>
                    <Tab>Vol/Fee</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel p={0}>{renderChart()}</TabPanel>
                    <TabPanel p={0}>{renderChart()}</TabPanel>
                    <TabPanel p={0}>{renderChart()}</TabPanel>
                    <TabPanel p={0}>{renderChart()}</TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </GridItem>

          {/* Information */}
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor} w="full">
              <CardBody>
                <Heading size="md" mb={6} color={textColor}>
                  Information
                </Heading>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={2} justify="space-between">
                    <Text fontSize="sm" color={mutedTextColor}>
                      Chain
                    </Text>
                    <HStack spacing={2}>
                      <FallbackImg
                        src={pool.chain.logo}
                        alt={pool.chain.name}
                        boxSize="20px"
                      />
                      <Text fontSize="sm" color={textColor}>
                        {pool.chain.name}
                      </Text>
                    </HStack>
                  </HStack>
                  <HStack spacing={2} justify="space-between">
                    <Text fontSize="sm" color={mutedTextColor}>
                      Protocol
                    </Text>
                    <HStack spacing={2}>
                      <FallbackImg
                        src={pool.protocol.logo}
                        alt={pool.protocol.name}
                        boxSize="20px"
                      />
                      <Text fontSize="sm" color={textColor}>
                        {pool.protocol.name}
                      </Text>
                    </HStack>
                  </HStack>
                  <HStack spacing={2} justify="space-between">
                    <Text fontSize="sm" color={mutedTextColor}>
                      Pool
                    </Text>
                    <Address
                      address={pool.poolAddress}
                      explorerBaseUrl={pool.chain.explorer + "/address/"}
                    />
                  </HStack>
                  <HStack spacing={2} justify="space-between">
                    <Text fontSize="sm" color={mutedTextColor}>
                      Fee-tier
                    </Text>
                    <Text fontSize="sm" color={textColor}>
                      {pool.feeTier / 10000}%
                    </Text>
                  </HStack>
                  <HStack spacing={2} justify="space-between" align="start">
                    <Text fontSize="sm" color={mutedTextColor}>
                      Token0
                    </Text>
                    <VStack align="end" spacing={0}>
                      <HStack spacing={2}>
                        <FallbackImg
                          src={pool.token0.logo ?? ""}
                          alt={pool.token0.symbol}
                          boxSize="20px"
                        />
                        <Text fontSize="sm" color={textColor}>
                          {pool.token0.symbol} ({pool.token0.name})
                        </Text>
                      </HStack>
                      <Address
                        address={pool.token0.address}
                        explorerBaseUrl={pool.chain.explorer + "/token/"}
                        color={textColor}
                        fontSize="xs"
                      />
                    </VStack>
                  </HStack>
                  <HStack spacing={2} justify="space-between" align="start">
                    <Text fontSize="sm" color={mutedTextColor}>
                      Token1
                    </Text>
                    <VStack align="end" spacing={0}>
                      <HStack spacing={2}>
                        <FallbackImg
                          src={pool.token1.logo ?? ""}
                          alt={pool.token1.symbol}
                          boxSize="20px"
                        />
                        <Text fontSize="sm" color={textColor}>
                          {pool.token1.symbol} ({pool.token1.name})
                        </Text>
                      </HStack>
                      <Address
                        address={pool.token1.address}
                        explorerBaseUrl={pool.chain.explorer + "/token/"}
                        color={textColor}
                        fontSize="xs"
                      />
                    </VStack>
                  </HStack>

                  <Divider />

                  <HStack spacing={2} justify="center">
                    {[
                      {
                        img: "/images/krystal.png",
                        label: "[krystal]",
                        href: `https://defi.krystal.app/pools/detail?chainId=${pool.chain.id}&poolAddress=${pool.poolAddress}&protocol=${pool.protocol.key}`,
                      },
                      {
                        img: "/images/dexscreener.png",
                        label: "[dexscreener]",
                        href: `https://dexscreener.com/${CHAIN_CONFIGS[pool.chain.id]?.dexscreener_key}/${pool.poolAddress}`,
                      },
                      {
                        img: "/images/scan.png",
                        label: "[explorer]",
                        href: `${pool.chain.explorer}/address/${pool.poolAddress}`,
                      },
                    ].map(item => (
                      <Link href={item.href} isExternal fontSize="xs">
                        {item.label}
                        {/* <Image
                          src={item.img}
                          boxSize="22px"
                          filter="grayscale(1)"
                          _hover={{ filter: "none" }}
                          transition="filter 0.2s"
                        /> */}
                      </Link>
                    ))}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
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
