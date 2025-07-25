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
  logo: string
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

export interface IAPosition {
  id: string;
  poolName?: string;
  status?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  walletAddress?: string;
  chainId?: string;
  poolAddress?: string;
  tokenId?: string;
  liquidity?: number;
  feeGrowthInside0LastX128?: string;
  feeGrowthInside1LastX128?: string;
  tokensOwed0?: string;
  tokensOwed1?: string;
}

export interface IAPositionDetails extends IAPosition {
  pool: IAPool;
  currentValue: number;
  initialValue: number;
  pnl: number;
  pnlPercentage: number;
  feesEarned: number;
  apr: number;
}

