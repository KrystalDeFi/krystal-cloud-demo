"use client";

import ErrorBoundary from "@/components/ErrorBoundary";
import {
  Box,
  Center,
  Container,
  Spinner,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import KrystalZap from "@krystaldefi/zap";
import { useParams } from "next/navigation";
import { Suspense } from "react";

export default function PoolsPage() {
  const { colorMode } = useColorMode();
  const params = useParams();
  const chainId = params.chainId as string;
  const poolId = params.poolId as string;

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
        <Box textAlign="center" py={6}>
          <Text fontSize="36px" fontWeight="bold" color="brand.500">
            Krystal Zap Component
          </Text>
          <Text
            fontSize="xl"
            color="gray.600"
            maxW="2xl"
            mx="auto"
            transition="colors 0.2s"
            _dark={{ color: "gray.400" }}
          >
            A reusable React component for zapping into Uniswap V3 family
            liquidity pools. Swap tokens and add liquidity in a single
            transaction.
          </Text>
        </Box>
        <Container maxW="lg" py={6}>
          <KrystalZap
            platform={"uniswapv3"}
            chainId={+chainId}
            poolAddress={poolId}
            userAddress={"0x9E97A40996c749C8C86F16b4F412dD96467da69C"}
            onTxDataReady={console.log}
            onError={console.log}
            onLoading={console.log}
            theme={colorMode}
            colorScheme={{
              dark: {
                "--card": "217.78 23.08% 22.94%",
                "--card-foreground": "0 0% 98%",
                "--primary": "217 91% 60%",
                "--secondary": "220 15% 30%",
                "--ring": "217 91% 60%",
              },
              light: {
                "--card": "0 0% 100%",
                "--card-foreground": "240 10% 15%",
                "--primary": "217 91% 60%",
                "--secondary": "240 5% 95%",
                "--ring": "217 91% 60%",
              },
            }}
          />
        </Container>
        <Container maxW="4xl" py={6}>
          <Box
            mt={16}
            display="grid"
            gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
            gap={6}
            maxW="4xl"
            mx="auto"
          >
            <Box
              p={6}
              borderRadius="lg"
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              boxShadow="md"
              transition="all 0.2s"
              _dark={{
                bg: "gray.800",
                borderColor: "gray.700",
              }}
            >
              <Center bg="brand.500" boxSize={12} borderRadius="lg" mb={4}>
                <Text fontSize="2xl">🪙</Text>
              </Center>
              <Text
                fontSize="lg"
                fontWeight="semibold"
                color="gray.800"
                _dark={{ color: "white" }}
                mb={2}
              >
                Token Selection
              </Text>
              <Text color="gray.600" _dark={{ color: "gray.400" }}>
                Browse and select from your wallet&apos;s token balances with
                real-time USD values.
              </Text>
            </Box>

            <Box
              p={6}
              borderRadius="lg"
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              boxShadow="md"
              transition="all 0.2s"
              _dark={{
                bg: "gray.800",
                borderColor: "gray.700",
              }}
            >
              <Center bg="brand.500" boxSize={12} borderRadius="lg" mb={4}>
                <Text fontSize="2xl">⚙️</Text>
              </Center>
              <Text
                fontSize="lg"
                fontWeight="semibold"
                color="gray.800"
                _dark={{ color: "white" }}
                mb={2}
              >
                Slippage Control
              </Text>
              <Text color="gray.600" _dark={{ color: "gray.400" }}>
                Configure separate slippage tolerances for swaps and liquidity
                provision.
              </Text>
            </Box>

            <Box
              p={6}
              borderRadius="lg"
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              boxShadow="md"
              transition="all 0.2s"
              _dark={{
                bg: "gray.800",
                borderColor: "gray.700",
              }}
            >
              <Center bg="brand.500" boxSize={12} borderRadius="lg" mb={4}>
                <Text fontSize="2xl">⚡</Text>
              </Center>
              <Text
                fontSize="lg"
                fontWeight="semibold"
                color="gray.800"
                _dark={{ color: "white" }}
                mb={2}
              >
                One-Click Zap
              </Text>
              <Text color="gray.600" _dark={{ color: "gray.400" }}>
                Execute complex DeFi operations with a single transaction
                through Krystal&apos;s API.
              </Text>
            </Box>
          </Box>
          {/* Usage Example */}
          <Box mt={16} maxW="4xl" mx="auto">
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="gray.800"
              _dark={{ color: "white" }}
              mb={6}
              textAlign="center"
            >
              Usage Example
            </Text>
            <Box
              p={6}
              borderRadius="lg"
              bg="gray.100"
              borderWidth="1px"
              borderColor="gray.200"
              overflowX="auto"
              transition="all 0.2s"
              _dark={{
                bg: "gray.700",
                borderColor: "gray.600",
              }}
            >
              <Box
                as="pre"
                fontSize="sm"
                color="gray.800"
                _dark={{ color: "gray.100" }}
              >
                {`import KrystalZap from '@krystaldefi/zap';

Supported chains and platforms are get from API https://api.krystal.app/all/v1/lp_explorer/configs 

<KrystalZap
  platform="uniswapv3"
  chainId={${chainId}}
  poolAddress="${poolId || "0x..."}"
  userAddress="0x..."
  liquiditySlippage={0.02} // Optional, defaults to 2%
  swapSlippage={0.01} // Optional, defaults to 1%
  onTxDataReady={(txObj) => console.log(txObj)}
  onError={(error) => console.error(error)}
  onLoading={(loading) => console.log(loading)}
  theme="dark"     //Optional, defaults to dark
  colorScheme={{   //Optional
    dark: {
      "--card": "217.78 23.08% 22.94%",
      "--card-foreground": "0 0% 98%",
      "--primary": "217 91% 60%",
      "--secondary": "220 15% 30%",
      "--ring": "217 91% 60%",
    },
    light: {
      "--card": "0 0% 100%",
      "--card-foreground": "240 10% 15%",
      "--primary": "217 91% 60%",
      "--secondary": "240 5% 95%",
      "--ring": "217 91% 60%",
    },
  }}
/>`}
              </Box>
            </Box>
          </Box>
        </Container>
      </Suspense>
    </ErrorBoundary>
  );
}
