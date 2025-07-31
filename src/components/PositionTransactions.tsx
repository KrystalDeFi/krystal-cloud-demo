"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  Heading,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Spinner,
  Button,
  Select,
  useColorModeValue,
  Link,
  IconButton,
  Tooltip,
  Image,
} from "@chakra-ui/react";
import { ExternalLinkIcon, CopyIcon } from "@chakra-ui/icons";
import { KrystalApi, IPositionTransactionsParams } from "../services/krystalApi";
import { IAPositionTransaction, IATokenBalance } from "../services/apiTypes";
import { Formatter } from "../common/formatter";
import { useApiError, useApiKeyValidation } from "../hooks/useApiError";

interface PositionTransactionsProps {
  chainId: string;
  wallet?: string;
  tokenAddress: string;
  tokenId?: string;
  chainExplorer?: string;
}

export default function PositionTransactions({
  chainId,
  wallet,
  tokenAddress,
  tokenId,
  chainExplorer,
}: PositionTransactionsProps) {
  const [transactions, setTransactions] = useState<IAPositionTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);
  const { error: apiError, setError: setApiError, handleApiError, clearError } = useApiError();
  const { validateApiKey } = useApiKeyValidation();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: IPositionTransactionsParams = {
        chainId,
        wallet,
        tokenAddress,
        tokenId,
        limit
      };
      
      console.log("Fetching transactions with params:", params);
      
      const response = await KrystalApi.positions.getTransactions(validateApiKey(), params);
      console.log("API Response:", response);
      
      let transactionData: IAPositionTransaction[] = [];
      
      // Handle different response structures
      if (Array.isArray(response)) {
        transactionData = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.transactions)) {
          transactionData = response.transactions;
        } else if (Array.isArray(response.data)) {
          transactionData = response.data;
        }
      }
      
      console.log("Extracted transaction data:", transactionData);
      
      if (transactionData.length > 0) {
        console.log("First transaction raw data:", transactionData[0]);
        console.log("First transaction keys:", Object.keys(transactionData[0]));
        console.log("First transaction has transactions property:", 'transactions' in transactionData[0]);
        console.log("First transaction.transactions:", transactionData[0].transactions);
      }
      
      // Transform the data to include calculated balance and total value
      const transformedData = transactionData.map(transformTransactionData);
      setTransactions(transformedData);
      
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenAddress) {
      fetchTransactions();
    }
  }, [chainId, wallet, tokenAddress, tokenId, limit]);

  const transformTransactionData = (tx: IAPositionTransaction) => {
    console.log("Processing transaction:", tx.type, tx.txHash);
    
    const balance: IATokenBalance[] = [];
    
    // Extract token data from the transactions array
    if (tx.transactions && Array.isArray(tx.transactions)) {
      console.log("Found transactions array with", tx.transactions.length, "items");
      
      tx.transactions.forEach((transactionDetail: any, index: number) => {
        console.log(`Processing transaction detail ${index}:`, transactionDetail);
        
        if (transactionDetail.tokenWithValue) {
          const tokenData = transactionDetail.tokenWithValue;
          const token = tokenData.token;
          const balanceValue = tokenData.balance;
          const price = tokenData.price;
          const value = tokenData.value;
          
          console.log("Token data:", {
            symbol: token.symbol,
            balance: balanceValue,
            decimals: token.decimals,
            price: price,
            value: value
          });
          
          // Calculate actual amount by dividing balance by decimals
          const balanceNum = parseFloat(balanceValue);
          const decimals = token.decimals || 18;
          const actualAmount = balanceNum / Math.pow(10, decimals);
          
          console.log("USDT Debug:", {
            symbol: token.symbol,
            rawBalance: balanceValue,
            balanceNum: balanceNum,
            decimals: decimals,
            calculation: `${balanceNum} / 10^${decimals}`,
            actualAmount: actualAmount,
            expectedUSDT: token.symbol === 'USDT' ? `${balanceNum} / 1000000 = ${balanceNum / 1000000}` : 'N/A'
          });
          
          console.log("Calculated amount:", actualAmount, "for", token.symbol);
          
          // Determine if this is positive or negative based on transaction type
          let change: 'positive' | 'negative' = 'positive';
          if (tx.type === 'DEPOSIT') {
            change = 'negative'; // Depositing means removing from wallet
          } else if (tx.type === 'WITHDRAW') {
            change = 'positive'; // Withdrawing means adding to wallet
          } else if (tx.type === 'COLLECT_FEE') {
            change = 'positive'; // Collecting fees means adding to wallet
          }
          
          balance.push({
            token: {
              address: token.address,
              symbol: token.symbol,
              name: token.name,
              decimals: token.decimals,
              logo: token.logo
            },
            amount: actualAmount.toString(),
            value: value,
            change: change
          });
        }
      });
    }
    
    console.log("Final balance array:", balance);
    
    // Calculate tx fee
    const txFee = tx.gasFeeAmount ? {
      amount: tx.gasFeeAmount.toString(),
      usdValue: tx.gasFeeValue || 0 // Use gasFeeValue directly from API
    } : undefined;
    
    return {
      ...tx,
      balance: balance.length > 0 ? balance : undefined,
      totalValue: balance.reduce((sum, item) => {
        return sum + (item.change === 'positive' ? item.value : -item.value);
      }, 0),
      txFee
    };
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "MINT":
      case "DEPOSIT":
        return "green";
      case "BURN":
      case "WITHDRAW":
        return "red";
      case "COLLECT":
      case "COLLECT_FEE":
        return "blue";
      case "INCREASE_LIQUIDITY":
        return "green";
      case "DECREASE_LIQUIDITY":
        return "orange";
      default:
        return "gray";
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "MINT":
        return "Mint";
      case "BURN":
        return "Burn";
      case "COLLECT":
        return "Collect";
      case "COLLECT_FEE":
        return "Collect Fee";
      case "WITHDRAW":
        return "Withdraw";
      case "DEPOSIT":
        return "Deposit";
      case "INCREASE_LIQUIDITY":
        return "Increase";
      case "DECREASE_LIQUIDITY":
        return "Decrease";
      default:
        return type;
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case "MINT":
        return "M";
      case "BURN":
        return "B";
      case "COLLECT":
        return "C";
      case "COLLECT_FEE":
        return "F";
      case "WITHDRAW":
        return "W";
      case "DEPOSIT":
        return "D";
      case "INCREASE_LIQUIDITY":
        return "I";
      case "DECREASE_LIQUIDITY":
        return "L";
      default:
        return "?";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (error) {
    return (
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <CardBody>
          <Text color="red.500">Error loading transactions: {error}</Text>
          <Button onClick={fetchTransactions} mt={2} size="sm">
            Retry
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={bgColor} border="1px" borderColor={borderColor}>
      <CardBody>
        <VStack align="start" spacing={4}>
          <HStack justify="space-between" w="full">
            <Heading size="md">Transactions</Heading>
            <Text fontSize="sm" color="gray.500">
              {transactions.length} transactions
            </Text>
          </HStack>

          {loading ? (
            <Box w="full" textAlign="center" py={8}>
              <Spinner size="lg" />
              <Text mt={2}>Loading transactions...</Text>
            </Box>
          ) : transactions.length === 0 ? (
            <Box w="full" textAlign="center" py={8}>
              <Text color="gray.500">No transactions found</Text>
            </Box>
          ) : (
            <>
              <TableContainer w="full">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Txn Hash</Th>
                      <Th>Type</Th>
                      <Th>Balance</Th>
                      <Th>Total Value</Th>
                      <Th>Tx fee</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {transactions.map((tx, index) => (
                      <Tr key={index}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="xs" color="gray.500">
                              {tx.blockTime ? Formatter.formatDate(tx.blockTime) : 'Unknown'}
                            </Text>
                            <HStack spacing={1}>
                              <Box w="4" h="4" bg="blue.500" borderRadius="sm" />
                              <Text fontSize="xs" fontFamily="mono">
                                {Formatter.shortAddress(tx.txHash)}
                              </Text>
                              <Tooltip label="Copy hash">
                                <IconButton
                                  size="xs"
                                  icon={<CopyIcon />}
                                  onClick={() => copyToClipboard(tx.txHash)}
                                  aria-label="Copy transaction hash"
                                  variant="ghost"
                                />
                              </Tooltip>
                            </HStack>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={1}>
                              <Box 
                                w="4" 
                                h="4" 
                                bg={getTransactionTypeColor(tx.type)} 
                                borderRadius="sm"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                {/* Transaction type icon */}
                                <Text fontSize="xs" color="white" fontWeight="bold">
                                  {getTransactionTypeIcon(tx.type)}
                                </Text>
                              </Box>
                              <Text fontSize="sm" fontWeight="medium">
                                {getTransactionTypeLabel(tx.type)}
                              </Text>
                            </HStack>
                            <HStack spacing={1}>
                              <Text fontSize="xs" color="gray.500">
                                contract {Formatter.shortAddress(tx.emitContractAddress)}
                              </Text>
                              <Tooltip label="Copy contract address">
                                <IconButton
                                  size="xs"
                                  icon={<CopyIcon />}
                                  onClick={() => copyToClipboard(tx.emitContractAddress)}
                                  aria-label="Copy contract address"
                                  variant="ghost"
                                />
                              </Tooltip>
                            </HStack>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            {tx.balance && tx.balance.length > 0 ? (
                              tx.balance.map((balance, balanceIndex) => (
                                <HStack key={balanceIndex} spacing={1} w="full">
                                  <Image
                                    src={balance.token.logo}
                                    alt={balance.token.symbol}
                                    boxSize="3"
                                    borderRadius="full"
                                    fallbackSrc="/images/token-fallback.png"
                                  />
                                  <Text 
                                    fontSize="xs" 
                                    color={balance.change === 'positive' ? 'green.500' : 'red.500'}
                                    fontWeight="medium"
                                  >
                                    {balance.change === 'positive' ? '+' : '-'}
                                    {balance.amount && parseFloat(balance.amount) !== 0 ? 
                                      new Intl.NumberFormat("en-US", {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: balance.token.decimals > 6 ? 6 : balance.token.decimals,
                                      }).format(parseFloat(balance.amount)) + ` ${balance.token.symbol}` : 
                                      `0 ${balance.token.symbol}`
                                    }
                                  </Text>
                                  {balance.value > 0 && (
                                    <Text fontSize="xs" color="gray.500">
                                      {Formatter.formatCurrency(balance.value)}
                                    </Text>
                                  )}
                                </HStack>
                              ))
                            ) : (
                              <Text fontSize="xs" color="gray.500">No balance data</Text>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <Text 
                            fontSize="sm" 
                            fontWeight="medium"
                            color={tx.totalValue && tx.totalValue > 0 ? 'green.500' : 'red.500'}
                          >
                            {tx.totalValue ? (
                              tx.totalValue > 0 ? '+' : ''
                            ) + Formatter.formatCurrency(tx.totalValue) : '-'}
                          </Text>
                        </Td>
                        <Td>
                          {tx.txFee ? (
                            <VStack align="start" spacing={1}>
                              <Text fontSize="xs">
                                {tx.txFee.amount} ETH
                              </Text>
                              <HStack spacing={1}>
                                <Box w="3" h="3" bg="blue.500" borderRadius="sm" />
                                <Text fontSize="xs" color="gray.500">
                                  {Formatter.formatCurrency(tx.txFee.usdValue)}
                                </Text>
                              </HStack>
                            </VStack>
                          ) : (
                            <Text fontSize="xs" color="gray.500">-</Text>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {/* Limit Selector */}
              <HStack justify="space-between" w="full" pt={4}>
                <HStack spacing={2}>
                  <Text fontSize="sm">Limit:</Text>
                  <Select
                    size="sm"
                    w="80px"
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </Select>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  Showing {transactions.length} of {transactions.length} transactions
                </Text>
              </HStack>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
} 