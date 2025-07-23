import { useState, useEffect } from 'react';
import { KrystalApi, Pool, Position, API_KEY_STORAGE } from '../services/krystalApi';

export const useKrystalApi = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const key = KrystalApi.getApiKey();
    setApiKey(key);
  }, []);

  const updateApiKey = (key: string) => {
    setApiKey(key);
    KrystalApi.setApiKey(key);
  };

  const clearApiKey = () => {
    setApiKey('');
    localStorage.removeItem(API_KEY_STORAGE);
  };

  return {
    apiKey,
    updateApiKey,
    clearApiKey,
    isLoading,
    error,
    setError,
    setIsLoading,
  };
};

export const usePools = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [filteredPools, setFilteredPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchPools = async (apiKey: string) => {
    if (!apiKey) return;
    
    setIsLoading(true);
    setError('');
    try {
      const response = await KrystalApi.pools.getAll(apiKey);
      setPools(response.data || []);
      setFilteredPools(response.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch pools');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPools = (filter: string) => {
    setFilteredPools(
      pools.filter((pool) =>
        pool.name?.toLowerCase().includes(filter.toLowerCase())
      )
    );
  };

  return {
    pools,
    filteredPools,
    isLoading,
    error,
    fetchPools,
    filterPools,
  };
};

export const usePositions = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchPositions = async (apiKey: string) => {
    if (!apiKey) return;
    
    setIsLoading(true);
    setError('');
    try {
      const response = await KrystalApi.positions.getAll(apiKey);
      setPositions(response.data || []);
      setFilteredPositions(response.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch positions');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPositions = (filter: string) => {
    setFilteredPositions(
      positions.filter((position) =>
        position.id?.toLowerCase().includes(filter.toLowerCase()) ||
        position.poolName?.toLowerCase().includes(filter.toLowerCase())
      )
    );
  };

  return {
    positions,
    filteredPositions,
    isLoading,
    error,
    fetchPositions,
    filterPositions,
  };
}; 