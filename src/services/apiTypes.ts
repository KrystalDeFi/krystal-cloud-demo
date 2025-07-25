// ============================================================================
// COMMON INTERFACES. IA means interfaces from API.
// ============================================================================

// Token interface used across the application
export interface IAToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
}

// Chain information
export interface IAChain {
  name: string;
  id: number;
  logo: string;
  explorer: string;
  supportedProtocols: string[];
}

// Protocol information
export interface IAProtocol {
  key: string;
  name: string;
  logo: string;
}

// Statistics for different time periods
export interface IStats {
  volume: number;
  fee: number;
  apr?: number;
}

// ============================================================================
// POOL INTERFACES
// ============================================================================

// Pool Item in the List
export interface IAPool {
  chain: IAChain;
  poolAddress: string;
  poolPrice: string;
  protocol: IAProtocol;
  feeTier: number;
  token0: IAToken;
  token1: IAToken;
  tvl: number;
  stats1h: IStats;
  stats24h: IStats;
  stats7d: IStats;
  stats30d: IStats;
  incentives?: IAIncentive[];
}

// Incentive interface
export interface IAIncentive {
  id: string;
  type: string;
  reward: number;
  rewardToken: IAToken;
  startTime: string;
  endTime: string;
}

export interface IAPoolDetails {
  chain: IAChain;
  poolAddress: string;
  poolPrice: string;
  protocol: IAProtocol;
  feeTier: number;
  token0: IAToken;
  token1: IAToken;
  tvl: number;
  stats1h: IStats;
  stats24h: IStats;
  stats7d: IStats;
  stats30d: IStats;
  incentives?: IAIncentive[];
}

// Pool historical data interface
export interface IAPoolHistorical {
  timestamp: number;
  volume24h: number;
  fee24h: number;
  apr24h: number;
  tvlUsd: number;
  poolPrice: number;
}

// ============================================================================
// POSITION INTERFACES
// ============================================================================

// Token amount interface for positions
export interface IATokenAmount {
  token: IAToken;
  balance: string;
  price: number;
  value: number;
}

// Trading fee interface
export interface IATradingFee {
  pending: IATokenAmount[];
  claimed: IATokenAmount[];
}

// Performance interface
export interface IAPerformance {
  totalDepositValue: number;
  totalWithdrawValue: number;
  impermanentLoss: number;
  pnl: number;
  returnOnInvestment: number;
  compareToHold: number;
  apr: {
    totalApr: number;
    feeApr: number;
    farmApr: number;
  };
}

// Position interface based on the API response
export interface IAPosition {
  chain: IAChain;
  pool: {
    id: string;
    poolAddress: string;
    protocol: IAProtocol;
  };
  ownerAddress: string;
  id: string;
  tokenAddress: string;
  tokenId: string;
  liquidity: string;
  minPrice: number;
  maxPrice: number;
  currentPositionValue?: number;
  status: string;
  currentAmounts: IATokenAmount[];
  providedAmounts: IATokenAmount[];
  tradingFee: IATradingFee;
  lastUpdateBlock: number;
  openedTime: number;
  performance: IAPerformance;
}

export interface IAPositionDetails {
  chain: IAChain;
  pool: IAPool;
  ownerAddress: string;
  id: string;
  tokenAddress: string;
  tokenId: string;
  liquidity: string;
  minPrice: number;
  maxPrice: number;
  currentPositionValue?: number;
  status: string;
  currentAmounts: IATokenAmount[];
  providedAmounts: IATokenAmount[];
  tradingFee: IATradingFee;
  lastUpdateBlock: number;
  openedTime: number;
  performance: IAPerformance;
  currentValue: number;
  initialValue: number;
  pnl: number;
  pnlPercentage: number;
  feesEarned: number;
  apr: number;
}
