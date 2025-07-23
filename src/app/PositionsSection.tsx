"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Input,
  Text,
  VStack,
  Divider,
  Heading,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { KrystalApi, Position, API_KEY_STORAGE } from "../services/krystalApi";

export default function PositionsSection() {
  const [apiKey, setApiKey] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [filtered, setFiltered] = useState<Position[]>([]);
  const [selected, setSelected] = useState<Position | null>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const selectedBg = useColorModeValue("blue.50", "blue.900");

  useEffect(() => {
    const key = localStorage.getItem(API_KEY_STORAGE) || "";
    setApiKey(key);
    if (key) fetchPositions(key);
  }, []);

  useEffect(() => {
    setFiltered(
      positions.filter((p) =>
        (p.id?.toLowerCase().includes(filter.toLowerCase()) ||
          p.poolName?.toLowerCase().includes(filter.toLowerCase()))
      )
    );
  }, [filter, positions]);

  const fetchPositions = async (key: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await KrystalApi.positions.getAll(key);
      setPositions(response.data || []);
      setFiltered(response.data || []);
    } catch (e: any) {
      setError(e.message || "Failed to fetch positions");
    } finally {
      setLoading(false);
    }
  };

  if (!apiKey) {
    return <Text color="gray.500">Please enter your API key above.</Text>;
  }

  return (
    <Flex gap={4} minH="400px">
      <Box w="320px">
        <Input
          placeholder="Filter positions by id or pool name"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          mb={2}
        />
        {loading ? (
          <Flex justify="center" mt={8}>
            <Spinner />
          </Flex>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : filtered.length === 0 ? (
          <Text color="gray.500">No positions found.</Text>
        ) : (
          <Box
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
            overflowY="auto"
            maxH="60vh"
          >
            {filtered.map((pos) => (
              <Box
                key={pos.id}
                p={3}
                cursor="pointer"
                bg={selected?.id === pos.id ? selectedBg : "transparent"}
                borderBottom="1px solid"
                borderColor={borderColor}
                _hover={{ bg: selected?.id === pos.id ? selectedBg : hoverBg }}
                onClick={() => setSelected(pos)}
              >
                <Text fontWeight="500">{pos.id}</Text>
                <Text fontSize="sm" color="gray.500">
                  {pos.poolName || "-"}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <Divider orientation="vertical" />
      <Box flex={1} minW={0} pl={4}>
        {selected ? (
          <Box>
            <Heading size="md" mb={2}>
              {selected.id}
            </Heading>
            <VStack align="start" spacing={1} mb={4}>
              <Text>Pool: {selected.poolName}</Text>
              <Text>Status: {selected.status}</Text>
              <Text>Type: {selected.type}</Text>
              <Text>Created: {selected.createdAt}</Text>
              <Text>Updated: {selected.updatedAt}</Text>
            </VStack>
            <Box
              bg={useColorModeValue("gray.50", "gray.900")}
              p={3}
              borderRadius="md"
              fontSize="xs"
            >
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {JSON.stringify(selected, null, 2)}
              </pre>
            </Box>
          </Box>
        ) : (
          <Text color="gray.500">Select a position to see details.</Text>
        )}
      </Box>
    </Flex>
  );
} 