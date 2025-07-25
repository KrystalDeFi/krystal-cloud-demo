"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";

export const dynamic = "force-dynamic";
import {
  Flex,
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Button,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Image,
} from "@chakra-ui/react";
import { ExternalLinkIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { IPoolsParams, KrystalApi } from "../../services/krystalApi";
import { SORT_OPTIONS } from "../../common/config";
import { useChainsProtocols } from "../../contexts/ChainsProtocolsContext";
import Pagination from "../../components/Pagination";
import { IAPool } from "../../services/apiTypes";
import TextInput from "@/components/TextInput";
import { Formatter } from "@/common/formatter";
import { useApiError, useApiKeyValidation } from "../../hooks/useApiError";
import { ErrorDisplay } from "../../components/ErrorDisplay";
import ErrorBoundary from "../../components/ErrorBoundary";

interface FilterParams extends IPoolsParams {}

function PoolsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pools, setPools] = useState<IAPool[]>([]);
  const [loading, setLoading] = useState(true);
  const { error, setError, handleApiError, clearError } = useApiError();
  const { validateApiKey } = useApiKeyValidation();

  const [filters, setFilters] = useState<FilterParams>({
    token: searchParams?.get("token") || undefined,
    chainId: searchParams?.get("chainId")
      ? +searchParams.get("chainId")!
      : undefined,
    protocol: searchParams?.get("protocol") || undefined,
    minTvl: searchParams?.get("minTvl")
      ? parseInt(searchParams.get("minTvl")!)
      : undefined,
    minVolume24h: searchParams?.get("minVolume24h")
      ? parseInt(searchParams.get("minVolume24h")!)
      : undefined,
    sortBy: parseInt(
      searchParams?.get("sortBy") || SORT_OPTIONS.TVL.toString()
    ),
    limit: parseInt(searchParams?.get("limit") || "50"),
    offset: parseInt(searchParams?.get("offset") || "0"),
  });

  // Cache data
  const { chains, protocols } = useChainsProtocols();

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
      clearError();

      const apiKey = validateApiKey();

      // Prepare API parameters based on swagger specification
      const apiParams: IPoolsParams = {
        ...filters,
      };

      console.log("API Parameters:", apiParams);

      // Call the actual API with parameters
      const response = await KrystalApi.pools.getAll(apiKey, apiParams);

      console.log("API Response:", response);

      if (response && response.data && Array.isArray(response.data)) {
        const poolsData = response.data;
        setPools(poolsData);
      } else {
        console.error("Invalid response format:", response);
        throw new Error("Invalid response format from API");
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pools whenever parameters change
  useEffect(() => {
    fetchPools();
  }, [filters]);

  const handleFilterChange = (
    key: keyof FilterParams,
    value: string | number | undefined
  ) => {
    // Only trigger when the value changes
    if (filters[key] === value) {
      return;
    }

    // Always reset to 0 offset, unless offset param is present
    setFilters({ ...filters, offset: 0, [key]: value });
    updateUrlParams({ [key]: value?.toString() || "" });
  };

  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={fetchPools}
        title="Failed to Load Pools"
      />
    );
  }

  const tableColumns = useMemo(
    () => [
      {
        label: "Pool",
        renderer: (pool: IAPool) => (
          <HStack>
            <Image
              boxSize={5}
              src={pool.token0.logo}
              alt={pool.token0.symbol}
              fallbackSrc="/images/token-fallback.png"
            />
            <Text fontWeight="medium">{pool.token0.symbol}</Text>
            <Text>/</Text>
            <Image
              boxSize={5}
              src={pool.token1.logo}
              alt={pool.token1.symbol}
              fallbackSrc="/images/token-fallback.png"
            />
            <Text fontWeight="medium">{pool.token1.symbol}</Text>
          </HStack>
        ),
      },
      {
        label: "Chain",
        renderer: (pool: IAPool) => (
          <HStack>
            <Image boxSize={5} src={pool.chain.logo} alt={pool.chain.name} />
            <Text fontSize="sm">{pool.chain.name}</Text>
          </HStack>
        ),
      },
      {
        label: "Protocol",
        renderer: (pool: IAPool) => (
          <HStack spacing={2}>
            <Image
              boxSize={5}
              src={pool.protocol.logo}
              alt={pool.protocol.name}
            />
            <Text fontSize="sm">{pool.protocol.name}</Text>
          </HStack>
        ),
      },
      {
        label: "TVL",
        renderer: (pool: IAPool) => (
          <Text>{Formatter.formatCurrency(pool.tvl)}</Text>
        ),
      },
      {
        label: "24h Volume",
        renderer: (pool: IAPool) => (
          <Text>{Formatter.formatCurrency(pool.stats24h?.volume || 0)}</Text>
        ),
      },
      {
        label: "24h Fees",
        renderer: (pool: IAPool) => (
          <Text>{Formatter.formatCurrency(pool.stats24h?.fee || 0)}</Text>
        ),
      },
      {
        label: "24h APR",
        renderer: (pool: IAPool) => (
          <Text color="green.500">
            {Formatter.formatAPR(pool.stats24h?.apr || 0)}
          </Text>
        ),
      },
      {
        label: "7d Volume",
        renderer: (pool: IAPool) => (
          <Text>{Formatter.formatCurrency(pool.stats7d?.volume || 0)}</Text>
        ),
      },
      {
        label: "7d Fees",
        renderer: (pool: IAPool) => (
          <Text>{Formatter.formatCurrency(pool.stats7d?.fee || 0)}</Text>
        ),
      },
      {
        label: "7d APR",
        renderer: (pool: IAPool) => (
          <Text color="green.500">
            {Formatter.formatAPR(pool.stats7d?.apr || 0)}
          </Text>
        ),
      },
      {
        label: "30d Volume",
        renderer: (pool: IAPool) => (
          <Text>{Formatter.formatCurrency(pool.stats30d?.volume || 0)}</Text>
        ),
      },
      {
        label: "30d Fees",
        renderer: (pool: IAPool) => (
          <Text>{Formatter.formatCurrency(pool.stats30d?.fee || 0)}</Text>
        ),
      },
      {
        label: "30d APR",
        renderer: (pool: IAPool) => (
          <Text color="green.500">
            {Formatter.formatAPR(pool.stats30d?.apr || 0)}
          </Text>
        ),
      },
    ],
    []
  );

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
              <Text
                fontSize="lg"
                color="gray.600"
                _dark={{ color: "gray.300" }}
              >
                Browse and filter DeFi pools across different chains
              </Text>
            </VStack>
          </HStack>
        </VStack>

        {/* Filters */}

        <VStack spacing={4} align="stretch">
          {/* Search and Basic Filters */}
          <Flex
            gap={4}
            wrap="wrap"
            justifyContent={"space-between"}
            fontSize={"xs"}
            pb={8}
          >
            <TextInput
              placeholder="Search by token"
              defaultValue={filters.token || ""}
              onInputFinalized={value => handleFilterChange("token", value)}
              size="sm"
            />
            <Select
              w="fit-content"
              value={filters.chainId?.toString() || "all"}
              onChange={e =>
                handleFilterChange(
                  "chainId",
                  e.target.value === "all"
                    ? undefined
                    : parseInt(e.target.value)
                )
              }
              size="sm"
            >
              <option value="all">All Chains</option>
              {chains.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </Select>
            <Select
              w="fit-content"
              value={filters.protocol || "all"}
              onChange={e =>
                handleFilterChange(
                  "protocol",
                  e.target.value === "all" ? undefined : e.target.value
                )
              }
              size="sm"
            >
              <option value="all">All Protocols</option>
              {protocols.map(protocol => (
                <option key={protocol.key} value={protocol.key}>
                  {protocol.name}
                </option>
              ))}
            </Select>
            <Select
              w="fit-content"
              value={filters.sortBy ?? SORT_OPTIONS.TVL}
              onChange={e => {
                handleFilterChange("sortBy", +e.target.value);
              }}
              size="sm"
            >
              <option value={SORT_OPTIONS.TVL}>Sort by: TVL</option>
              <option value={SORT_OPTIONS.APR}>Sort by: APR</option>
              <option value={SORT_OPTIONS.VOLUME_24H}>
                Sort by: 24h Volume
              </option>
              <option value={SORT_OPTIONS.FEE}>Sort by: 24h Fees</option>
            </Select>
            <TextInput
              label="Min TVL (USD)"
              size="sm"
              placeholder="default: 1000"
              defaultValue={filters.minTvl}
              onInputFinalized={value =>
                handleFilterChange(
                  "minTvl",
                  value ? parseInt(value) : undefined
                )
              }
              type="number"
            />
            <TextInput
              label="Min 24h Volume (USD)"
              size="sm"
              placeholder="default: 1000"
              defaultValue={filters.minVolume24h}
              onInputFinalized={value =>
                handleFilterChange(
                  "minVolume24h",
                  value ? parseInt(value) : undefined
                )
              }
              type="number"
            />
          </Flex>
        </VStack>

        {/* Pools Table */}
        {!loading && (
          <Card
            bg={cardBg}
            _dark={{ bg: "gray.800" }}
            border="1px"
            borderColor={borderColor}
            mb={6}
          >
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    {tableColumns.map((col, idx) => (
                      <Th key={idx}>
                        <HStack spacing={1}>
                          <Text>{col.label}</Text>
                        </HStack>
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {pools.map((pool: IAPool) => (
                    <Tr
                      key={pool.poolAddress}
                      _hover={{
                        bg: "gray.50",
                        _dark: { bg: "gray.700" },
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        router.push(
                          `/pools/${pool.chain.id}/${pool.poolAddress}`
                        )
                      }
                    >
                      {tableColumns.map((col, idx) => (
                        <Td key={idx}>{col.renderer(pool)}</Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={
            filters.offset ? filters.offset / (filters.limit ?? 50) + 1 : 1
          }
          pageSize={filters.limit ?? 50}
          onPageChange={page => {
            handleFilterChange("offset", (page - 1) * (filters.limit ?? 50));
          }}
          onPageSizeChange={size => {
            handleFilterChange("limit", size);
          }}
        />

        {pools.length === 0 && !loading && (
          <Box textAlign="center" py={12}>
            <Text color="gray.500" _dark={{ color: "gray.400" }}>
              No pools found matching your criteria.
            </Text>
          </Box>
        )}

        {loading && (
          <Box textAlign="center" py={12}>
            <Spinner size="xl" color="brand.500" />
            <Text>Loading pools and data...</Text>
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

export default function PoolsPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <Container maxW="7xl" py={6}>
            <Box textAlign="center" py={12}>
              <Spinner size="xl" color="brand.500" />
              <Text>Loading...</Text>
            </Box>
          </Container>
        }
      >
        <PoolsPageContent />
      </Suspense>
    </ErrorBoundary>
  );
}
