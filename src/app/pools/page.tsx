"use client";
import React, { useState, useEffect, useMemo, Suspense, useRef } from "react";

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
  useColorModeValue,
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
import Breadcrumbs from "@/components/Breadcrumbs";
import { useCache, useFilterCache } from "../../hooks/useCache";
import { Footer } from "../Footer";
import EmbedWrapper from "@/components/EmbedWrapper";

// Create a type that extends IPoolsParams and adds the index signature for FilterOptions
type FilterParams = IPoolsParams & {
  [key: string]: string | number | undefined;
};

function PoolsPageContent() {
  const router = useRouter();

  const [pools, setPools] = useState<IAPool[]>([]);
  const [loading, setLoading] = useState(true);
  const { error, handleApiError, clearError } = useApiError();
  const { validateApiKey } = useApiKeyValidation();

  // Use filter cache hook for managing filter options with URL sync
  const { filters, updateFilters } = useFilterCache<FilterParams>({
    cacheKey: "pools_filters",
    defaultFilters: {
      token: undefined,
      chainId: undefined,
      protocol: undefined,
      minTvl: undefined,
      minVolume24h: undefined,
      sortBy: SORT_OPTIONS.TVL,
      limit: 50,
      offset: 0,
    },
  });

  // Cache data
  const { chains, protocols } = useChainsProtocols();

  // Track if we've made the initial API call
  const initialApiCallMade = useRef(false);

  const selectedChain = useMemo(() => {
    return chains.find(chain => chain.id == filters?.chainId);
  }, [chains, filters?.chainId]);

  // Fetch pools from API
  const fetchPools = async () => {
    try {
      setLoading(true);
      clearError();

      const apiKey = validateApiKey();

      // Prepare API parameters based on swagger specification
      // Filter out undefined values to avoid sending them to the API
      const apiParams: IPoolsParams = Object.fromEntries(
        Object.entries(filters || {}).filter(
          ([_, value]) => value !== undefined && value !== null && value !== ""
        )
      );

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

  // Fetch pools whenever filters change (but only after initial load)
  useEffect(() => {
    if (filters) {
      if (!initialApiCallMade.current) {
        // Initial load
        console.log("Pools page: initial load", filters);
        fetchPools();
        initialApiCallMade.current = true;
      } else {
        // Subsequent filter changes
        console.log("Pools page: fetching pools due to filter change", filters);
        fetchPools();
      }
    }
  }, [filters]);

  const handleFilterChange = (
    key: keyof FilterParams,
    value: string | number | undefined
  ) => {
    // Only trigger when the value changes
    if (filters?.[key] === value) {
      return;
    }

    // Always reset to 0 offset, unless offset param is present
    const updates: Partial<FilterParams> = { [key]: value };
    if (key !== "offset") {
      updates.offset = 0;
    }

    updateFilters(updates);
  };

  const handleMultipleFilterChanges = (updates: Partial<FilterParams>) => {
    // Only trigger when some value changes
    const hasChanges = Object.keys(updates).some(
      key => updates[key as keyof FilterParams] !== filters?.[key as keyof FilterParams]
    );

    if (hasChanges) {
      updateFilters({ offset: 0, ...updates, withIncentives: undefined });
    }
  };

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
          <Text color="status.success">
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
          <Text color="status.success">
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
          <Text color="status.success">
            {Formatter.formatAPR(pool.stats30d?.apr || 0)}
          </Text>
        ),
      },
    ],
    []
  );

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={fetchPools}
        title="Failed to Load Pools"
      />
    );
  }

  return (
    <Box minH="100vh" bg="bg.secondary">
      <Container maxW="7xl" py={6}>
        {/* Breadcrumbs */}
        <EmbedWrapper type="breadcrumbs">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Pools" }]}
          />
        </EmbedWrapper>

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
              defaultValue={filters?.token || ""}
              onInputFinalized={value => handleFilterChange("token", value)}
              size="sm"
            />
            <Select
              w="fit-content"
              value={filters?.chainId?.toString() || "all"}
              onChange={e =>
                handleMultipleFilterChanges({ 
                  chainId: e.target.value === "all" ? undefined : parseInt(e.target.value),
                  protocol: undefined,
                })
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
              value={filters?.protocol || "all"}
              onChange={e =>
                handleFilterChange(
                  "protocol",
                  e.target.value === "all" ? undefined : e.target.value
                )
              }
              size="sm"
            >
              <option value="all">All Protocols</option>
              {protocols
                .filter(protocol =>
                  selectedChain
                    ? selectedChain?.supportedProtocols?.includes(protocol.key)
                    : true
                )
                .map(protocol => (
                  <option key={protocol.key} value={protocol.key}>
                    {protocol.name}
                  </option>
                ))}
            </Select>
            <Select
              w="fit-content"
              value={filters?.sortBy ?? SORT_OPTIONS.TVL}
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
              defaultValue={filters?.minTvl}
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
              defaultValue={filters?.minVolume24h}
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
            bg="bg.primary"
            border="1px"
            borderColor="border.primary"
            mb={6}
          >
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    {tableColumns.map((col, idx) => (
                      <Th key={idx}>{col.label}</Th>
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
            filters?.offset ? filters.offset / (filters?.limit ?? 50) + 1 : 1
          }
          pageSize={filters?.limit ?? 50}
          onPageChange={page => {
            handleFilterChange("offset", (page - 1) * (filters?.limit ?? 50));
          }}
          onPageSizeChange={size => {
            handleFilterChange("limit", size);
          }}
        />

        {pools.length === 0 && !loading && (
          <Box textAlign="center" py={12}>
            <Text>No pools found matching your criteria.</Text>
          </Box>
        )}

        {loading && (
          <Box textAlign="center" py={12}>
            <Spinner size="xl" />
            <Text>Loading pools and data...</Text>
          </Box>
        )}

        {/* Footer */}
        <Footer />
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
              <Spinner size="xl" />
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
