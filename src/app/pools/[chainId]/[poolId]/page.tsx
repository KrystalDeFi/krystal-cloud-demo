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
  Image,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { KrystalApi } from "../../../../services/krystalApi";
import { IAPoolDetails, IAPoolHistorical } from "../../../../services/apiTypes";
import { Formatter } from "@/common/formatter";
import { FallbackImg } from "@/components/FallbackImg";
import { Address } from "@/components/Address";
import {
  useApiError,
  useApiKeyValidation,
} from "../../../../hooks/useApiError";
import { ErrorDisplay } from "../../../../components/ErrorDisplay";
import ErrorBoundary from "../../../../components/ErrorBoundary";
import {
  AreaChart,
  Area,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { CHAIN_CONFIGS } from "@/common/config";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Footer } from "@/app/Footer";
import { useCache } from "@/hooks/useCache";
import EmbedWrapper from "@/components/EmbedWrapper";
import { useChainsProtocols } from "@/contexts/ChainsProtocolsContext";

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

function PoolDetailsPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chainId = params.chainId as string;
  const poolId = params.poolId as string;

  const [pool, setPool] = useState<IAPoolDetails | null>(null);
  const [historicalData, setHistoricalData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartTimeRange, setChartTimeRange] = useState<"7D" | "30D" | "90D">("30D");
  const [selectedData, setSelectedData] = useState<"price" | "apr" | "tvl" | "volFee">("price");
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [selectedChart, setSelectedChart] = useState<"price" | "apr" | "tvl" | "volFee">("price");
  const [performanceTimeframe, setPerformanceTimeframe] = useState<"1h" | "24h" | "7d" | "30d">("24h");

  const { error: apiError, handleApiError, clearError } = useApiError();
  const { validateApiKey } = useApiKeyValidation();
  const toast = useToast();

  const { chains, protocols } = useChainsProtocols();

  // Fetch pool details from API
  const fetchPoolDetails = async () => {
    try {
      setLoading(true);
      clearError();

      const apiKey = validateApiKey();

      const response = await KrystalApi.pools.getById(apiKey, {
        chainId,
        poolAddress: poolId,
        withIncentives: true,
      });

      setPool(response);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoolDetails();
  }, [chainId, poolId]);

  useEffect(() => {
    if (pool) {
      fetchHistoricalData();
    }
  }, [pool, chartTimeRange]);

  const fetchHistoricalData = async () => {
    if (!pool) return;

    try {
      setHistoricalLoading(true);

      const apiKey = validateApiKey();

      const endTime = Math.floor(Date.now() / 1000);
      const startTime =
        endTime -
        (chartTimeRange === "7D"
          ? 7 * 24 * 60 * 60
          : chartTimeRange === "30D"
            ? 30 * 24 * 60 * 60
            : 90 * 24 * 60 * 60);

      const response = await KrystalApi.pools.getHistorical(apiKey, {
        chainId,
        poolAddress: poolId,
        startTime,
        endTime,
      });

      setHistoricalData(response.map(item => ({
        timestamp: item.timestamp,
        date: new Date(item.timestamp * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        price: Number(item.poolPrice) || 0,
        volume: Number(item.volume24h) || 0,
        fee: Number(item.fee24h) || 0,
        tvl: Number(item.tvlUsd) || 0,
        apr: Number(item.apr24h) || 0,
      })));
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
      if (chartTimeRange === "7D") {
        dateString = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
        });
      } else if (chartTimeRange === "30D") {
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
        price: item.price,
        volume: item.volume,
        fee: item.fee,
        tvl: item.tvl,
        apr: item.apr,
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
          <Text color={useColorModeValue("brand.200", "brand.700")}>No historical data available</Text>
        </Box>
      );
    }

    // Use all data points from API (API already filters by time range)
    const displayData =
      selectedChart !== "volFee"
        ? data.filter(item => item[selectedChart] != 0)
        : data;

    // Theme-aware colors for charts using primary color
    const gridColor = useColorModeValue("brand.200", "brand.700");
    const axisColor = useColorModeValue("brand.600", "white");
    const textColor = useColorModeValue("brand.800", "white");

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
                    <stop
                      offset="5%"
                      stopColor="var(--chakra-colors-brand-500)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chakra-colors-brand-500)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="date"
                  stroke={axisColor}
                  fontSize={12}
                  tick={{ fontSize: 10, fill: axisColor }}
                  axisLine={{ stroke: axisColor }}
                />
                <YAxis
                  yAxisId="left"
                  stroke={axisColor}
                  fontSize={12}
                  tickFormatter={value => formatCurrency(value)}
                  tick={{ fontSize: 10, fill: axisColor }}
                  axisLine={{ stroke: axisColor }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke={axisColor}
                  fontSize={12}
                  tickFormatter={value => formatCurrency(value)}
                  tick={{ fontSize: 10, fill: axisColor }}
                  axisLine={{ stroke: axisColor }}
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
                    backgroundColor: useColorModeValue("chakra-body-bg", "chakra-body-bg"),
                    border: `1px solid ${useColorModeValue("chakra-border-color", "chakra-border-color")}`,
                    borderRadius: "8px",
                    color: textColor,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="var(--chakra-colors-brand-500)"
                  fill="url(#volumeGradient)"
                  strokeWidth={2}
                  yAxisId="left"
                  name="volume"
                />
                <Bar
                  dataKey="fee"
                  fill="var(--chakra-colors-brand-600)"
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
                    <stop
                      offset="5%"
                      stopColor="var(--chakra-colors-brand-500)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chakra-colors-brand-500)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="date"
                  stroke={axisColor}
                  fontSize={12}
                  tick={{ fontSize: 10, fill: axisColor }}
                  axisLine={{ stroke: axisColor }}
                />
                <YAxis
                  stroke={axisColor}
                  fontSize={12}
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 10, fill: axisColor }}
                  axisLine={{ stroke: axisColor }}
                />
                <RechartsTooltip
                  formatter={(value: any) => [
                    formatTooltip(value),
                    selectedChart.toUpperCase(),
                  ]}
                  labelFormatter={(label: any) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: useColorModeValue("chakra-body-bg", "chakra-body-bg"),
                    border: `1px solid ${useColorModeValue("chakra-border-color", "chakra-border-color")}`,
                    borderRadius: "8px",
                    color: textColor,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedChart}
                  stroke="var(--chakra-colors-brand-500)"
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

    switch (performanceTimeframe) {
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
        bg={useColorModeValue("chakra-body-bg", "chakra-body-bg")}
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="highlight" />
          <Text>Loading pool details...</Text>
        </VStack>
      </Box>
    );
  }

  if (error || !pool) {
    return (
      <ErrorDisplay
        error={error || "Pool not found"}
        onRetry={fetchPoolDetails}
        title="Failed to Load Pool Details"
      />
    );
  }

  const statsData = getStatsData();

  return (
    <Box minH="100vh" bg={useColorModeValue("chakra-body-bg", "chakra-body-bg")}>
      <Container maxW="7xl" py={6}>
        {/* Header */}

        <EmbedWrapper type="breadcrumbs">
          <Breadcrumbs
            items={[
              { label: "Pools", href: "/pools" },
              { label: `#${Formatter.shortAddress(pool.poolAddress)}` },
            ]}
          />
        </EmbedWrapper>

        <HStack align="center" spacing={3} mb={4} mt={4}>
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
            <Heading size="lg" color={useColorModeValue("chakra-title", "chakra-title")}>
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
              <Text fontSize="sm" color={useColorModeValue("chakra-metrics", "chakra-metrics")}>
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
              <Text fontSize="sm" color={useColorModeValue("chakra-metrics", "chakra-metrics")}>
                {pool.protocol.name}
              </Text>
            </HStack>

            <Badge size="xs">Fee {Formatter.formatFeeTier(pool.feeTier)}</Badge>
          </HStack>
        </HStack>

        {/* Key Metrics */}
        <Box>
          <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={6} mb={8}>
            <GridItem>
              <Card bg={useColorModeValue("chakra-body-bg", "chakra-body-bg")} border="1px" borderColor={useColorModeValue("chakra-border-color", "chakra-border-color")}>
                <CardBody>
                  <Stat>
                    <StatLabel color={useColorModeValue("chakra-metrics", "chakra-metrics")}>
                      Total Value Locked
                    </StatLabel>
                    <StatNumber
                      fontSize="2xl"
                      fontWeight="bold"
                    >
                      {formatCurrency(pool.tvl)}
                    </StatNumber>
                    <StatHelpText>Current TVL</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card bg={useColorModeValue("chakra-body-bg", "chakra-body-bg")} border="1px" borderColor={useColorModeValue("chakra-border-color", "chakra-border-color")}>
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <HStack justify="space-between" w="full">
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={useColorModeValue("chakra-metrics", "chakra-metrics")}
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
                                performanceTimeframe === timeframe
                                  ? "solid"
                                  : "outline"
                              }
                              colorScheme="brand"
                              onClick={() => setPerformanceTimeframe(timeframe)}
                            >
                              {timeframe}
                            </Button>
                          )
                        )}
                      </HStack>
                    </HStack>

                    <SimpleGrid columns={3} spacing={4} w="full">
                      <Stat>
                        <StatLabel color={useColorModeValue("chakra-metrics", "chakra-metrics")} fontSize="xs">
                          Volume ({performanceTimeframe})
                        </StatLabel>
                        <StatNumber fontSize="lg" color={useColorModeValue("chakra-title", "chakra-title")}>
                          {Formatter.formatCurrency(statsData.volume)}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel color={useColorModeValue("chakra-metrics", "chakra-metrics")} fontSize="xs">
                          Fee ({performanceTimeframe})
                        </StatLabel>
                        <StatNumber fontSize="lg" color={useColorModeValue("chakra-title", "chakra-title")}>
                          {Formatter.formatCurrency(statsData.fee)}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel color={useColorModeValue("chakra-metrics", "chakra-metrics")} fontSize="xs">
                          APR ({performanceTimeframe})
                        </StatLabel>
                        <StatNumber fontSize="lg" color={useColorModeValue("chakra-title", "chakra-title")}>
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
              bg={useColorModeValue("chakra-body-bg", "chakra-body-bg")}
              border="1px"
              borderColor={useColorModeValue("chakra-border-color", "chakra-border-color")}
              w="full"
              overflow="hidden"
            >
              <CardBody w="full" overflow="hidden">
                <HStack justify="space-between" mb={6}>
                  <VStack align="start" spacing={1}>
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color="chakra-metrics"
                    >
                      Current price: {parseFloat(pool.poolPrice).toFixed(5)}{" "}
                      {pool.token1.symbol}/{pool.token0.symbol}
                    </Text>
                  </VStack>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant={chartTimeRange === "7D" ? "solid" : "outline"}
                      colorScheme="brand"
                      onClick={() => setChartTimeRange("7D")}
                    >
                      7D
                    </Button>
                    <Button
                      size="sm"
                      variant={chartTimeRange === "30D" ? "solid" : "outline"}
                      colorScheme="brand"
                      onClick={() => setChartTimeRange("30D")}
                    >
                      30D
                    </Button>
                    <Button
                      size="sm"
                      variant={chartTimeRange === "90D" ? "solid" : "outline"}
                      colorScheme="brand"
                      onClick={() => setChartTimeRange("90D")}
                    >
                      90D
                    </Button>
                  </HStack>
                </HStack>

                <Tabs
                  variant="soft-rounded"
                  colorScheme="brand"
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
            <Card bg={useColorModeValue("chakra-body-bg", "chakra-body-bg")} border="1px" borderColor={useColorModeValue("chakra-border-color", "chakra-border-color")} w="full">
              <CardBody>
                <Heading size="md" mb={6} color="chakra-title">
                  Information
                </Heading>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={2} justify="space-between">
                    <Text fontSize="sm" color={useColorModeValue("chakra-metrics", "chakra-metrics")}>
                      Chain
                    </Text>
                    <HStack spacing={2}>
                      <FallbackImg
                        src={pool.chain.logo}
                        alt={pool.chain.name}
                        boxSize="20px"
                      />
                      <Text fontSize="sm" color="chakra-metrics">
                        {pool.chain.name}
                      </Text>
                    </HStack>
                  </HStack>
                  <HStack spacing={2} justify="space-between">
                    <Text fontSize="sm" color={useColorModeValue("chakra-metrics", "chakra-metrics")}>
                      Protocol
                    </Text>
                    <HStack spacing={2}>
                      <FallbackImg
                        src={pool.protocol.logo}
                        alt={pool.protocol.name}
                        boxSize="20px"
                      />
                      <Text fontSize="sm" color="chakra-metrics">
                        {pool.protocol.name}
                      </Text>
                    </HStack>
                  </HStack>
                  <HStack spacing={2} justify="space-between">
                    <Text fontSize="sm" color={useColorModeValue("chakra-metrics", "chakra-metrics")}>
                      Pool
                    </Text>
                    <Address
                      address={pool.poolAddress}
                      explorerBaseUrl={pool.chain.explorer + "/address/"}
                    />
                  </HStack>
                  <HStack spacing={2} justify="space-between">
                    <Text fontSize="sm" color={useColorModeValue("chakra-metrics", "chakra-metrics")}>
                      Fee-tier
                    </Text>
                    <Text fontSize="sm" color="chakra-metrics">
                      {Formatter.formatFeeTier(pool.feeTier)}
                    </Text>
                  </HStack>
                  <HStack spacing={2} justify="space-between" align="start">
                    <Text fontSize="sm" color={useColorModeValue("chakra-metrics", "chakra-metrics")}>
                      Token0
                    </Text>
                    <VStack align="end" spacing={0}>
                      <HStack spacing={2}>
                        <FallbackImg
                          src={pool.token0.logo ?? ""}
                          alt={pool.token0.symbol}
                          boxSize="20px"
                        />
                        <Text fontSize="sm" color="chakra-metrics">
                          {pool.token0.symbol} ({pool.token0.name})
                        </Text>
                      </HStack>
                      <Address
                        address={pool.token0.address}
                        explorerBaseUrl={pool.chain.explorer + "/token/"}
                        color={useColorModeValue("chakra-title", "chakra-title")}
                        fontSize="xs"
                      />
                    </VStack>
                  </HStack>
                  <HStack spacing={2} justify="space-between" align="start">
                    <Text fontSize="sm" color={useColorModeValue("chakra-metrics", "chakra-metrics")}>
                      Token1
                    </Text>
                    <VStack align="end" spacing={0}>
                      <HStack spacing={2}>
                        <FallbackImg
                          src={pool.token1.logo ?? ""}
                          alt={pool.token1.symbol}
                          boxSize="20px"
                        />
                        <Text fontSize="sm" color="chakra-metrics">
                          {pool.token1.symbol} ({pool.token1.name})
                        </Text>
                      </HStack>
                      <Address
                        address={pool.token1.address}
                        explorerBaseUrl={pool.chain.explorer + "/token/"}
                        color={useColorModeValue("chakra-title", "chakra-title")}
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
        <Footer />
      </Container>
    </Box>
  );
}

export default function PoolDetailsPage() {
  return (
    <ErrorBoundary>
      <PoolDetailsPageContent />
    </ErrorBoundary>
  );
}

