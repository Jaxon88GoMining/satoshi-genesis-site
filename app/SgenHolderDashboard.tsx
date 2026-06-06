'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import styles from './SgenHolderDashboard.module.css';

const SGEN_MINT = 'DLftpBQXTvKgBAtqHbkk8sKtvCsT5WR7Ws3ULdFvjmyF';
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const JUPITER_PRICE_API_URL = 'https://lite-api.jup.ag/price/v3';
const CLAIM_INTERVAL_MS = 24 * 60 * 60 * 1000;

type HolderAccessState = 'checking' | 'granted' | 'denied' | 'error';

type SgenBalanceResponse = {
  balance: string;
  error?: string;
  hasSgen: boolean;
  mint: string;
  rawBalance: string;
  wallet: string;
};

type ClaimLedger = {
  sfuelRewardsBalance: number;
  totalClaims: number;
  lastClaimTime: number | null;
};

type HolderTier = {
  claimAmount: number;
  minimumSgen: number;
  name: string;
};

type AtlasPair = 'SOL/USDC' | 'SGEN/SOL' | 'SGEN/USDC';
type AtlasMode = 'simulation' | 'liveSignal';
type BotStrategy = 'Buy the Dip' | 'Take Profit' | 'Dollar-Cost Average' | 'Momentum';
type BotStatus = 'idle' | 'running' | 'paused';
type TradeAction = 'Buy' | 'Sell';
type SignalAction = 'BUY' | 'SELL' | 'HOLD';

type PaperTrade = {
  action: TradeAction;
  amount: number;
  dateTime: string;
  entryPrice: number;
  exitPrice: number;
  id: string;
  pair: string;
  profitLoss: number;
  reason?: string;
  signalConfidence?: number;
  signalSource?: string;
  status: string;
};

type RiskSettings = {
  cooldownSeconds: number;
  dailyMaxSignals: number;
  maxTradeSize: number;
  stopLossPercent: number;
  takeProfitPercent: number;
};

type MarketSnapshot = {
  changePercent: number;
  pair: AtlasPair;
  previousPrice: number;
  price: number;
  priceSource: string;
  updatedAt: string | null;
};

type StrategySignal = {
  action: SignalAction;
  blocked?: boolean;
  confidence: number;
  lastUpdated: string | null;
  reason: string;
};

type SignalHistoryEntry = {
  confidence: number;
  id: string;
  pair: AtlasPair;
  priceSource: string;
  reason: string;
  signal: SignalAction;
  strategy: BotStrategy;
  time: string;
};

type AtlasSimulationState = {
  currentBalance: number;
  dailySignalCount: number;
  dailySignalDay: string;
  dailyTradeCount: number;
  dailyTradeDay: string;
  lastSignalTime: number | null;
  mode: AtlasMode;
  pair: AtlasPair;
  riskSettings: RiskSettings;
  selectedStrategy: BotStrategy;
  startingBalance: number;
  status: BotStatus;
  totalProfitLoss: number;
  trades: PaperTrade[];
};

type JupiterPriceResponse = Record<
  string,
  {
    usdPrice?: number;
  }
>;

const HOLDER_TIERS: HolderTier[] = [
  { name: 'Genesis Whale', minimumSgen: 100000, claimAmount: 250 },
  { name: 'Gold', minimumSgen: 10000, claimAmount: 75 },
  { name: 'Silver', minimumSgen: 1000, claimAmount: 25 },
  { name: 'Bronze', minimumSgen: 1, claimAmount: 10 },
];

const NO_TIER: HolderTier = {
  name: 'No tier',
  minimumSgen: 0,
  claimAmount: 0,
};

const ATLAS_DEFAULT_BALANCE = 1000;
const ATLAS_STORAGE_PREFIX = 'atlas-trading-bot-simulation';
const ATLAS_STRATEGIES: BotStrategy[] = ['Buy the Dip', 'Take Profit', 'Dollar-Cost Average', 'Momentum'];
const ATLAS_PAIRS: AtlasPair[] = ['SOL/USDC', 'SGEN/SOL', 'SGEN/USDC'];
const ATLAS_BASE_PRICES: Record<string, number> = {
  'SGEN/USDC': 0.000001,
  'SGEN/SOL': 0.000000012,
  'SOL/USDC': 150,
};
const ATLAS_DEFAULT_RISK_SETTINGS: RiskSettings = {
  cooldownSeconds: 60,
  dailyMaxSignals: 8,
  maxTradeSize: 100,
  stopLossPercent: 4,
  takeProfitPercent: 8,
};
const ATLAS_SAFETY_BLOCKED_MESSAGE = 'Signal blocked by safety settings';
const ATLAS_SIGNAL_DEDUPE_WINDOW_MS = 3000;

async function getSgenBalance(walletAddress: string) {
  const response = await fetch(`/api/sgen-balance?wallet=${encodeURIComponent(walletAddress)}`, {
    cache: 'no-store',
  });
  const data = (await response.json()) as Partial<SgenBalanceResponse>;

  if (!response.ok) {
    throw new Error(data.error || 'Unable to check SGEN balance.');
  }

  if (data.mint !== SGEN_MINT) {
    throw new Error('SGEN mint mismatch. Balance check stopped.');
  }

  return data as SgenBalanceResponse;
}

function getStatusLabel(accessState: HolderAccessState) {
  if (accessState === 'granted') return 'Access Granted';
  if (accessState === 'denied') return 'No SGEN detected';
  if (accessState === 'checking') return 'Checking SGEN balance...';
  return 'Wallet check failed';
}

function getClaimStorageKey(walletAddress: string) {
  return `sgen-daily-claim:${walletAddress}`;
}

function createEmptyClaimLedger(): ClaimLedger {
  return {
    sfuelRewardsBalance: 0,
    totalClaims: 0,
    lastClaimTime: null,
  };
}

function parseStoredClaimLedger(storedValue: string | null): ClaimLedger {
  if (!storedValue) return createEmptyClaimLedger();

  const legacyClaimTime = Number(storedValue);
  if (Number.isFinite(legacyClaimTime) && legacyClaimTime > 0) {
    return {
      ...createEmptyClaimLedger(),
      lastClaimTime: legacyClaimTime,
    };
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<ClaimLedger>;
    return {
      sfuelRewardsBalance: Number(parsed.sfuelRewardsBalance) || 0,
      totalClaims: Number(parsed.totalClaims) || 0,
      lastClaimTime:
        typeof parsed.lastClaimTime === 'number' && Number.isFinite(parsed.lastClaimTime)
          ? parsed.lastClaimTime
          : null,
    };
  } catch {
    return createEmptyClaimLedger();
  }
}

function formatCountdown(remainingMs: number) {
  if (remainingMs <= 0) return 'Ready now';

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}

function formatClaimTime(timestamp: number | null) {
  if (!timestamp) return 'Not claimed yet';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function getSgenBalanceAmount(balance: string) {
  const parsedBalance = Number(balance.replace(/,/g, '').trim());
  return Number.isFinite(parsedBalance) ? parsedBalance : 0;
}

function getHolderTier(balance: string) {
  const balanceAmount = getSgenBalanceAmount(balance);
  return HOLDER_TIERS.find((tier) => balanceAmount >= tier.minimumSgen) || NO_TIER;
}

function getAtlasStorageKey(walletAddress: string) {
  return `${ATLAS_STORAGE_PREFIX}:${walletAddress}`;
}

function getAtlasSignalHistoryStorageKey(walletAddress: string) {
  return `${ATLAS_STORAGE_PREFIX}:signals:${walletAddress}`;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getValidRiskSettings(value: Partial<RiskSettings> | undefined): RiskSettings {
  const legacyValue = value as Partial<RiskSettings> & { dailyMaxTrades?: number };

  return {
    cooldownSeconds: Number.isFinite(Number(value?.cooldownSeconds))
      ? Math.max(0, Math.min(3600, Number(value?.cooldownSeconds)))
      : ATLAS_DEFAULT_RISK_SETTINGS.cooldownSeconds,
    dailyMaxSignals: Number.isFinite(Number(value?.dailyMaxSignals ?? legacyValue?.dailyMaxTrades))
      ? Math.max(1, Math.min(100, Number(value?.dailyMaxSignals ?? legacyValue?.dailyMaxTrades)))
      : ATLAS_DEFAULT_RISK_SETTINGS.dailyMaxSignals,
    maxTradeSize: Number.isFinite(Number(value?.maxTradeSize))
      ? Math.max(1, Math.min(1000000, Number(value?.maxTradeSize)))
      : ATLAS_DEFAULT_RISK_SETTINGS.maxTradeSize,
    stopLossPercent: Number.isFinite(Number(value?.stopLossPercent))
      ? Math.max(0.1, Math.min(95, Number(value?.stopLossPercent)))
      : ATLAS_DEFAULT_RISK_SETTINGS.stopLossPercent,
    takeProfitPercent: Number.isFinite(Number(value?.takeProfitPercent))
      ? Math.max(0.1, Math.min(500, Number(value?.takeProfitPercent)))
      : ATLAS_DEFAULT_RISK_SETTINGS.takeProfitPercent,
  };
}

function createDefaultAtlasState(): AtlasSimulationState {
  return {
    currentBalance: ATLAS_DEFAULT_BALANCE,
    dailySignalCount: 0,
    dailySignalDay: getTodayKey(),
    dailyTradeCount: 0,
    dailyTradeDay: getTodayKey(),
    lastSignalTime: null,
    mode: 'simulation',
    pair: 'SGEN/USDC',
    riskSettings: ATLAS_DEFAULT_RISK_SETTINGS,
    selectedStrategy: 'Buy the Dip',
    startingBalance: ATLAS_DEFAULT_BALANCE,
    status: 'idle',
    totalProfitLoss: 0,
    trades: [],
  };
}

function getValidStartingBalance(value: number) {
  return Number.isFinite(value) && value > 0 ? value : ATLAS_DEFAULT_BALANCE;
}

function parseStoredAtlasState(storedValue: string | null): AtlasSimulationState {
  if (!storedValue) return createDefaultAtlasState();

  try {
    const parsed = JSON.parse(storedValue) as Partial<AtlasSimulationState>;
    const startingBalance = getValidStartingBalance(Number(parsed.startingBalance));
    const totalProfitLoss = Number(parsed.totalProfitLoss) || 0;
    const selectedStrategy = ATLAS_STRATEGIES.includes(parsed.selectedStrategy as BotStrategy)
      ? (parsed.selectedStrategy as BotStrategy)
      : 'Buy the Dip';
    const pair = typeof parsed.pair === 'string' && ATLAS_PAIRS.includes(parsed.pair as AtlasPair)
      ? (parsed.pair as AtlasPair)
      : 'SGEN/USDC';
    const status = parsed.status === 'running' || parsed.status === 'paused' ? parsed.status : 'idle';
    const dailySignalDay = typeof parsed.dailySignalDay === 'string' ? parsed.dailySignalDay : getTodayKey();
    const dailySignalCount = dailySignalDay === getTodayKey() ? Number(parsed.dailySignalCount) || 0 : 0;
    const dailyTradeDay = typeof parsed.dailyTradeDay === 'string' ? parsed.dailyTradeDay : getTodayKey();
    const dailyTradeCount = dailyTradeDay === getTodayKey() ? Number(parsed.dailyTradeCount) || 0 : 0;
    const mode = parsed.mode === 'liveSignal' ? 'liveSignal' : 'simulation';

    return {
      currentBalance: Number(parsed.currentBalance) || startingBalance + totalProfitLoss,
      dailySignalCount,
      dailySignalDay: getTodayKey(),
      dailyTradeCount,
      dailyTradeDay: getTodayKey(),
      lastSignalTime: typeof parsed.lastSignalTime === 'number' ? parsed.lastSignalTime : null,
      mode,
      pair,
      riskSettings: getValidRiskSettings(parsed.riskSettings),
      selectedStrategy,
      startingBalance,
      status,
      totalProfitLoss,
      trades: Array.isArray(parsed.trades) ? parsed.trades.slice(0, 25) : [],
    };
  } catch {
    return createDefaultAtlasState();
  }
}

function parseStoredSignalHistory(storedValue: string | null): SignalHistoryEntry[] {
  if (!storedValue) return [];

  try {
    const parsed = JSON.parse(storedValue);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((entry): entry is Partial<SignalHistoryEntry> => Boolean(entry) && typeof entry === 'object')
      .map((entry) => ({
        confidence: Math.max(0, Math.min(100, Number(entry.confidence) || 0)),
        id: typeof entry.id === 'string' ? entry.id : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        pair: ATLAS_PAIRS.includes(entry.pair as AtlasPair) ? (entry.pair as AtlasPair) : 'SGEN/USDC',
        priceSource: typeof entry.priceSource === 'string' ? entry.priceSource : 'Unknown',
        reason: typeof entry.reason === 'string' ? entry.reason : 'Atlas strategy signal',
        signal: entry.signal === 'BUY' || entry.signal === 'SELL' || entry.signal === 'HOLD' ? entry.signal : 'HOLD',
        strategy: ATLAS_STRATEGIES.includes(entry.strategy as BotStrategy)
          ? (entry.strategy as BotStrategy)
          : 'Buy the Dip',
        time: typeof entry.time === 'string' ? entry.time : new Date().toISOString(),
      }))
      .slice(0, 50);
  } catch {
    return [];
  }
}

function getRandomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createDefaultMarketSnapshot(pair: AtlasPair = 'SGEN/USDC'): MarketSnapshot {
  const price = ATLAS_BASE_PRICES[pair] || 1;
  return {
    changePercent: 0,
    pair,
    previousPrice: price,
    price,
    priceSource: 'Fallback simulation',
    updatedAt: null,
  };
}

function getPriceFromJupiterData(pair: AtlasPair, data: JupiterPriceResponse) {
  const solUsdPrice = data[SOL_MINT]?.usdPrice;
  const sgenUsdPrice = data[SGEN_MINT]?.usdPrice;
  const hasSolUsd = typeof solUsdPrice === 'number' && Number.isFinite(solUsdPrice) && solUsdPrice > 0;
  const hasSgenUsd = typeof sgenUsdPrice === 'number' && Number.isFinite(sgenUsdPrice) && sgenUsdPrice > 0;

  if (pair === 'SOL/USDC' && hasSolUsd) {
    return { price: solUsdPrice, source: 'Jupiter Price API V3' };
  }

  if (pair === 'SGEN/USDC' && hasSgenUsd) {
    return { price: sgenUsdPrice, source: 'Jupiter Price API V3' };
  }

  if (pair === 'SGEN/SOL' && hasSgenUsd && hasSolUsd) {
    return { price: sgenUsdPrice / solUsdPrice, source: 'Jupiter Price API V3' };
  }

  return {
    price: ATLAS_BASE_PRICES[pair] || 1,
    source: pair.startsWith('SGEN')
      ? 'Fallback simulated signal mode - live SGEN price unavailable'
      : 'Fallback simulated signal mode - live pair price unavailable',
  };
}

async function fetchMarketSnapshot(pair: AtlasPair, previousSnapshot?: MarketSnapshot): Promise<MarketSnapshot> {
  const ids = [SGEN_MINT, SOL_MINT, USDC_MINT].join(',');
  const response = await fetch(`${JUPITER_PRICE_API_URL}?ids=${encodeURIComponent(ids)}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Jupiter market data unavailable.');
  }

  const data = (await response.json()) as JupiterPriceResponse;
  const priceQuote = getPriceFromJupiterData(pair, data);
  const previousPrice = previousSnapshot?.pair === pair ? previousSnapshot.price : priceQuote.price;
  const changePercent = previousPrice > 0 ? ((priceQuote.price - previousPrice) / previousPrice) * 100 : 0;

  return {
    changePercent,
    pair,
    previousPrice,
    price: priceQuote.price,
    priceSource: priceQuote.source,
    updatedAt: new Date().toISOString(),
  };
}

function getFallbackMarketSnapshot(pair: AtlasPair, previousSnapshot?: MarketSnapshot): MarketSnapshot {
  const basePrice = previousSnapshot?.pair === pair ? previousSnapshot.price : ATLAS_BASE_PRICES[pair] || 1;
  const price = basePrice * (1 + getRandomBetween(-0.008, 0.008));
  const previousPrice = previousSnapshot?.pair === pair ? previousSnapshot.price : basePrice;

  return {
    changePercent: previousPrice > 0 ? ((price - previousPrice) / previousPrice) * 100 : 0,
    pair,
    previousPrice,
    price,
    priceSource: pair.startsWith('SGEN')
      ? 'Fallback simulated signal mode - live SGEN price unavailable'
      : 'Fallback simulated signal mode - live pair price unavailable',
    updatedAt: new Date().toISOString(),
  };
}

function clampConfidence(value: number) {
  return Math.max(35, Math.min(95, Math.round(value)));
}

function evaluateStrategySignal(
  strategy: BotStrategy,
  marketSnapshot: MarketSnapshot,
  riskSettings: RiskSettings,
  dailySignalCount: number,
  lastSignalTime: number | null,
): StrategySignal {
  const now = Date.now();
  const cooldownRemaining = lastSignalTime
    ? Math.max(0, riskSettings.cooldownSeconds - Math.floor((now - lastSignalTime) / 1000))
    : 0;

  if (dailySignalCount >= riskSettings.dailyMaxSignals) {
    return {
      action: 'HOLD',
      blocked: true,
      confidence: 84,
      lastUpdated: marketSnapshot.updatedAt,
      reason: ATLAS_SAFETY_BLOCKED_MESSAGE,
    };
  }

  if (cooldownRemaining > 0) {
    return {
      action: 'HOLD',
      blocked: true,
      confidence: 72,
      lastUpdated: marketSnapshot.updatedAt,
      reason: ATLAS_SAFETY_BLOCKED_MESSAGE,
    };
  }

  const change = marketSnapshot.changePercent;
  const absChange = Math.abs(change);

  if (strategy === 'Buy the Dip') {
    if (change <= -riskSettings.stopLossPercent / 2) {
      return {
        action: 'BUY',
        confidence: clampConfidence(62 + absChange * 6),
        lastUpdated: marketSnapshot.updatedAt,
        reason: `${marketSnapshot.pair} is down ${absChange.toFixed(2)}%, matching the dip-buy rule.`,
      };
    }

    return {
      action: 'HOLD',
      confidence: clampConfidence(52 + Math.max(0, 2 - absChange) * 6),
      lastUpdated: marketSnapshot.updatedAt,
      reason: `No strong dip detected. Waiting for a cleaner entry on ${marketSnapshot.pair}.`,
    };
  }

  if (strategy === 'Take Profit') {
    if (change >= riskSettings.takeProfitPercent / 2) {
      return {
        action: 'SELL',
        confidence: clampConfidence(64 + absChange * 5),
        lastUpdated: marketSnapshot.updatedAt,
        reason: `${marketSnapshot.pair} is up ${change.toFixed(2)}%, matching the take-profit rule.`,
      };
    }

    if (change <= -riskSettings.stopLossPercent) {
      return {
        action: 'SELL',
        confidence: clampConfidence(70 + absChange * 4),
        lastUpdated: marketSnapshot.updatedAt,
        reason: `Stop-loss rule triggered after a ${absChange.toFixed(2)}% move down.`,
      };
    }

    return {
      action: 'HOLD',
      confidence: 58,
      lastUpdated: marketSnapshot.updatedAt,
      reason: 'Profit target has not been reached yet.',
    };
  }

  if (strategy === 'Dollar-Cost Average') {
    return {
      action: 'BUY',
      confidence: clampConfidence(56 + Math.min(20, riskSettings.dailyMaxSignals - dailySignalCount)),
      lastUpdated: marketSnapshot.updatedAt,
      reason: `DCA rule is active for ${marketSnapshot.pair}; paper execution respects cooldown and daily signal limits.`,
    };
  }

  if (change >= 0.45) {
    return {
      action: 'BUY',
      confidence: clampConfidence(61 + absChange * 8),
      lastUpdated: marketSnapshot.updatedAt,
      reason: `Positive momentum detected: ${marketSnapshot.pair} moved ${change.toFixed(2)}%.`,
    };
  }

  if (change <= -0.45) {
    return {
      action: 'SELL',
      confidence: clampConfidence(61 + absChange * 8),
      lastUpdated: marketSnapshot.updatedAt,
      reason: `Negative momentum detected: ${marketSnapshot.pair} moved ${change.toFixed(2)}%.`,
    };
  }

  return {
    action: 'HOLD',
    confidence: 55,
    lastUpdated: marketSnapshot.updatedAt,
    reason: `Momentum is neutral at ${change.toFixed(2)}%.`,
  };
}

function createSignalHistoryEntry(
  simulation: AtlasSimulationState,
  marketSnapshot: MarketSnapshot,
  signal: StrategySignal,
): SignalHistoryEntry {
  return {
    confidence: signal.confidence,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    pair: simulation.pair,
    priceSource: marketSnapshot.priceSource,
    reason: signal.reason,
    signal: signal.action,
    strategy: simulation.selectedStrategy,
    time: signal.lastUpdated || new Date().toISOString(),
  };
}

function addSignalHistoryEntry(
  history: SignalHistoryEntry[],
  entry: SignalHistoryEntry,
): SignalHistoryEntry[] {
  const latestEntry = history[0];

  if (latestEntry) {
    const latestTime = new Date(latestEntry.time).getTime();
    const entryTime = new Date(entry.time).getTime();
    const isDuplicateSignal =
      latestEntry.pair === entry.pair &&
      latestEntry.strategy === entry.strategy &&
      latestEntry.signal === entry.signal &&
      latestEntry.confidence === entry.confidence;

    if (
      isDuplicateSignal &&
      Number.isFinite(latestTime) &&
      Number.isFinite(entryTime) &&
      Math.abs(entryTime - latestTime) <= ATLAS_SIGNAL_DEDUPE_WINDOW_MS
    ) {
      return history;
    }
  }

  return [entry, ...history].slice(0, 50);
}

function recordSignalOnSimulation(
  simulation: AtlasSimulationState,
  signal: StrategySignal,
): AtlasSimulationState {
  const todayKey = getTodayKey();
  const dailySignalCount = simulation.dailySignalDay === todayKey ? simulation.dailySignalCount : 0;

  if (signal.blocked) {
    return {
      ...simulation,
      dailySignalCount,
      dailySignalDay: todayKey,
    };
  }

  return {
    ...simulation,
    dailySignalCount: dailySignalCount + 1,
    dailySignalDay: todayKey,
    lastSignalTime: Date.now(),
  };
}

function createSimulatedTrade(
  simulation: AtlasSimulationState,
  marketSnapshot: MarketSnapshot,
  signal: StrategySignal,
): PaperTrade {
  const action: TradeAction = signal.action === 'SELL' ? 'Sell' : 'Buy';
  const movePercent =
    signal.action === 'SELL'
      ? -Math.max(0.002, Math.abs(marketSnapshot.changePercent) / 100)
      : Math.max(0.002, Math.abs(marketSnapshot.changePercent) / 100);
  const entryPrice = marketSnapshot.price || ATLAS_BASE_PRICES[simulation.pair] || 1;
  const exitPrice = entryPrice * (1 + movePercent);
  const tradeSize = Math.max(1, Math.min(simulation.riskSettings.maxTradeSize, simulation.currentBalance * 0.1));
  const profitLoss = tradeSize * movePercent;

  return {
    action,
    amount: Number(tradeSize.toFixed(2)),
    dateTime: new Date().toISOString(),
    entryPrice,
    exitPrice,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    pair: simulation.pair,
    profitLoss: Number(profitLoss.toFixed(2)),
    reason: signal.reason,
    signalConfidence: signal.confidence,
    signalSource: marketSnapshot.priceSource,
    status: 'Paper only',
  };
}

function advanceSimulation(
  simulation: AtlasSimulationState,
  marketSnapshot: MarketSnapshot,
  signal: StrategySignal,
): AtlasSimulationState {
  if (signal.blocked || signal.action === 'HOLD') return simulation;

  const todayKey = getTodayKey();
  const dailyTradeCount = simulation.dailyTradeDay === todayKey ? simulation.dailyTradeCount : 0;

  const nextTrade = createSimulatedTrade(
    {
      ...simulation,
      dailyTradeCount,
      dailyTradeDay: todayKey,
    },
    marketSnapshot,
    signal,
  );
  const totalProfitLoss = Number((simulation.totalProfitLoss + nextTrade.profitLoss).toFixed(2));

  return {
    ...simulation,
    currentBalance: Number((simulation.startingBalance + totalProfitLoss).toFixed(2)),
    dailyTradeCount: dailyTradeCount + 1,
    dailyTradeDay: todayKey,
    totalProfitLoss,
    trades: [nextTrade, ...simulation.trades].slice(0, 25),
  };
}

function formatCurrency(value: number) {
  return `${value < 0 ? '-' : ''}$${Math.abs(value).toFixed(2)}`;
}

function formatPrice(value: number) {
  if (value < 0.01) return value.toFixed(8);
  if (value < 1000) return value.toFixed(2);
  return value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function formatTradeDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
}

function getAtlasModeLabel(mode: AtlasMode) {
  return mode === 'liveSignal' ? 'Live Signal Mode' : 'Simulation Mode';
}

function AtlasTradingBot({ walletAddress }: { walletAddress: string }) {
  const [simulation, setSimulation] = useState<AtlasSimulationState>(() => createDefaultAtlasState());
  const [marketSnapshot, setMarketSnapshot] = useState<MarketSnapshot>(() => createDefaultMarketSnapshot());
  const marketSnapshotRef = useRef<MarketSnapshot>(createDefaultMarketSnapshot());
  const [signalHistory, setSignalHistory] = useState<SignalHistoryEntry[]>([]);
  const [strategySignal, setStrategySignal] = useState<StrategySignal>({
    action: 'HOLD',
    confidence: 50,
    lastUpdated: null,
    reason: 'Waiting for live market data.',
  });
  const [marketFeedStatus, setMarketFeedStatus] = useState('Connecting to Jupiter market data...');

  useEffect(() => {
    const storedSimulation = window.localStorage.getItem(getAtlasStorageKey(walletAddress));
    const parsedSimulation = parseStoredAtlasState(storedSimulation);
    setSimulation(parsedSimulation);
    const defaultSnapshot = createDefaultMarketSnapshot(parsedSimulation.pair);
    marketSnapshotRef.current = defaultSnapshot;
    setMarketSnapshot(defaultSnapshot);
    setSignalHistory(parseStoredSignalHistory(window.localStorage.getItem(getAtlasSignalHistoryStorageKey(walletAddress))));
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress) return;

    window.localStorage.setItem(getAtlasStorageKey(walletAddress), JSON.stringify(simulation));
  }, [simulation, walletAddress]);

  useEffect(() => {
    if (!walletAddress) return;

    window.localStorage.setItem(getAtlasSignalHistoryStorageKey(walletAddress), JSON.stringify(signalHistory));
  }, [signalHistory, walletAddress]);

  useEffect(() => {
    let cancelled = false;

    async function refreshMarketData() {
      try {
        const snapshot = await fetchMarketSnapshot(simulation.pair, marketSnapshotRef.current);
        if (cancelled) return;
        const signal = evaluateStrategySignal(
          simulation.selectedStrategy,
          snapshot,
          simulation.riskSettings,
          simulation.dailySignalDay === getTodayKey() ? simulation.dailySignalCount : 0,
          simulation.lastSignalTime,
        );

        marketSnapshotRef.current = snapshot;
        setMarketSnapshot(snapshot);
        setStrategySignal(signal);
        setMarketFeedStatus(snapshot.priceSource);
      } catch {
        if (cancelled) return;
        const snapshot = getFallbackMarketSnapshot(simulation.pair, marketSnapshotRef.current);
        const signal = evaluateStrategySignal(
          simulation.selectedStrategy,
          snapshot,
          simulation.riskSettings,
          simulation.dailySignalDay === getTodayKey() ? simulation.dailySignalCount : 0,
          simulation.lastSignalTime,
        );

        marketSnapshotRef.current = snapshot;
        setMarketSnapshot(snapshot);
        setStrategySignal(signal);
        setMarketFeedStatus(snapshot.priceSource);
      }
    }

    refreshMarketData();
    const timer = window.setInterval(refreshMarketData, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [
    simulation.dailyTradeCount,
    simulation.dailyTradeDay,
    simulation.dailySignalCount,
    simulation.dailySignalDay,
    simulation.lastSignalTime,
    simulation.pair,
    simulation.riskSettings,
    simulation.selectedStrategy,
  ]);

  useEffect(() => {
    if (simulation.status !== 'running') return;

    const timer = window.setInterval(() => {
      setSimulation((current) => {
        if (current.status !== 'running') return current;
        const currentSignal = evaluateStrategySignal(
          current.selectedStrategy,
          marketSnapshot,
          current.riskSettings,
          current.dailySignalDay === getTodayKey() ? current.dailySignalCount : 0,
          current.lastSignalTime,
        );
        setStrategySignal(currentSignal);
        setSignalHistory((history) =>
          addSignalHistoryEntry(history, createSignalHistoryEntry(current, marketSnapshot, currentSignal)),
        );
        const nextSimulation = recordSignalOnSimulation(current, currentSignal);
        return current.mode === 'liveSignal'
          ? nextSimulation
          : advanceSimulation(nextSimulation, marketSnapshot, currentSignal);
      });
    }, 4500);

    return () => window.clearInterval(timer);
  }, [marketSnapshot, simulation.status]);

  function updateStartingBalance(value: string) {
    const nextStartingBalance = getValidStartingBalance(Number(value));

    setSimulation((current) => ({
      ...current,
      currentBalance: current.trades.length === 0 ? nextStartingBalance : current.currentBalance,
      startingBalance: nextStartingBalance,
    }));
  }

  function updateRiskSetting(key: keyof RiskSettings, value: string) {
    setSimulation((current) => ({
      ...current,
      riskSettings: getValidRiskSettings({
        ...current.riskSettings,
        [key]: Number(value),
      }),
    }));
  }

  function updatePair(value: string) {
    const nextPair = ATLAS_PAIRS.includes(value as AtlasPair) ? (value as AtlasPair) : 'SGEN/USDC';
    setSimulation((current) => ({ ...current, pair: nextPair }));
    const defaultSnapshot = createDefaultMarketSnapshot(nextPair);
    marketSnapshotRef.current = defaultSnapshot;
    setMarketSnapshot(defaultSnapshot);
  }

  function updateMode(mode: AtlasMode) {
    setSimulation((current) => ({
      ...current,
      mode,
      status: current.status === 'running' ? 'paused' : current.status,
    }));
  }

  function startSimulation() {
    setSimulation((current) => {
      const currentSignal = evaluateStrategySignal(
        current.selectedStrategy,
        marketSnapshot,
        current.riskSettings,
        current.dailySignalDay === getTodayKey() ? current.dailySignalCount : 0,
        current.lastSignalTime,
      );
      setStrategySignal(currentSignal);
      setSignalHistory((history) =>
        addSignalHistoryEntry(history, createSignalHistoryEntry(current, marketSnapshot, currentSignal)),
      );
      const nextSimulation = recordSignalOnSimulation({ ...current, status: 'running' }, currentSignal);
      return current.mode === 'liveSignal'
        ? nextSimulation
        : advanceSimulation(nextSimulation, marketSnapshot, currentSignal);
    });
  }

  function pauseSimulation() {
    setSimulation((current) => ({ ...current, status: 'paused' }));
  }

  function resetSimulation() {
    setSimulation((current) => {
      const startingBalance = getValidStartingBalance(current.startingBalance);

      return {
        ...createDefaultAtlasState(),
        currentBalance: startingBalance,
        pair: current.pair,
        mode: current.mode,
        riskSettings: current.riskSettings,
        selectedStrategy: current.selectedStrategy,
        startingBalance,
      };
    });
  }

  const signalClassName = [
    styles.signalBadge,
    strategySignal.action === 'BUY' ? styles.signalBuy : '',
    strategySignal.action === 'SELL' ? styles.signalSell : '',
    strategySignal.action === 'HOLD' ? styles.signalHold : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.bot}>
      <div className={styles.botHeader}>
        <div>
          <div className="brand-kicker">Atlas Trading Bot</div>
          <h3 className={styles.claimTitle}>Real-time Strategy Signals</h3>
          <p className={styles.botIntro}>
            Atlas is currently a paper-trading and signal platform designed for learning, testing, and future controlled trading tools.
          </p>
        </div>
        <div className={styles.botNotice}>Atlas signals are informational only. No real trades are placed automatically. You approve all swaps manually through your wallet.</div>
      </div>

      <div className={styles.signalPanel}>
        <div>
          <span>Signal output</span>
          <strong className={signalClassName}>{strategySignal.action} signal</strong>
          <small>{strategySignal.reason}</small>
        </div>
        <div>
          <span>Confidence</span>
          <strong>{strategySignal.confidence}%</strong>
          <small>Strategy: {simulation.selectedStrategy}</small>
        </div>
        <div>
          <span>Last updated</span>
          <strong>{strategySignal.lastUpdated ? formatTradeDate(strategySignal.lastUpdated) : 'Waiting for feed'}</strong>
          <small>{marketFeedStatus}</small>
        </div>
      </div>

      <div className={styles.modePanel}>
        <div>
          <span>Atlas mode</span>
          <strong>{getAtlasModeLabel(simulation.mode)}</strong>
          <small>
            {simulation.mode === 'liveSignal'
              ? 'Live Signal + Manual Approval keeps signals live and routes every real trade to Jupiter for wallet approval.'
              : 'Simulation Mode records paper trades only and never submits blockchain transactions.'}
          </small>
        </div>
        <div className={styles.modeToggle} aria-label="Atlas trading mode">
          <button
            className={simulation.mode === 'simulation' ? styles.activeModeButton : ''}
            type="button"
            onClick={() => updateMode('simulation')}
          >
            Simulation Mode
          </button>
          <button
            className={simulation.mode === 'liveSignal' ? styles.activeModeButton : ''}
            type="button"
            onClick={() => updateMode('liveSignal')}
          >
            Live Signal Mode
          </button>
        </div>
      </div>

      {simulation.mode === 'liveSignal' ? (
        <div className={styles.liveApprovalPanel}>
          <div>
            <div className="brand-kicker">Live Signal + Manual Approval</div>
            <strong>Atlas does not auto-trade. You approve every trade manually.</strong>
            <p>Low liquidity may cause failed trades or poor pricing.</p>
          </div>
          <a
            className={styles.claimButton}
            href="/#trade-sgen"
            target="_blank"
            rel="noreferrer"
            title={`Open Jupiter swap for manual ${simulation.pair} trading where routes are available`}
          >
            Open Jupiter Trade
          </a>
        </div>
      ) : null}

      <div className={styles.priceFeed}>
        <div>
          <span>Selected pair</span>
          <strong>{simulation.pair}</strong>
          <small>Track SOL/USDC, SGEN/SOL, or SGEN/USDC.</small>
        </div>
        <div>
          <span>Live price</span>
          <strong>{formatPrice(marketSnapshot.price)}</strong>
          <small>{marketSnapshot.changePercent >= 0 ? '+' : ''}{marketSnapshot.changePercent.toFixed(2)}% since last tick</small>
        </div>
      </div>

      <div className={styles.botControls}>
        <label className={styles.botField}>
          <span>Starting simulated balance</span>
          <input
            min="1"
            step="50"
            type="number"
            value={simulation.startingBalance}
            onChange={(event) => updateStartingBalance(event.target.value)}
          />
        </label>
        <label className={styles.botField}>
          <span>Pair</span>
          <select
            value={simulation.pair}
            onChange={(event) => updatePair(event.target.value)}
          >
            {ATLAS_PAIRS.map((pair) => (
              <option key={pair} value={pair}>
                {pair}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.botField}>
          <span>Strategy</span>
          <select
            value={simulation.selectedStrategy}
            onChange={(event) =>
              setSimulation((current) => ({
                ...current,
                selectedStrategy: event.target.value as BotStrategy,
              }))
            }
          >
            {ATLAS_STRATEGIES.map((strategy) => (
              <option key={strategy} value={strategy}>
                {strategy}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.botSafetyRules}>
        <div>
          <div className="brand-kicker">Bot Safety Rules</div>
          <strong>Wallet-approved simulation only</strong>
        </div>
        <ul>
          <li>Atlas does not auto-trade or hold funds.</li>
          <li>Atlas never asks for seed phrases.</li>
          <li>Manual trades are approved through your wallet.</li>
          <li>Signals are informational only.</li>
          <li>Simulation mode is for learning and testing.</li>
        </ul>
      </div>

      <div className={styles.riskGrid}>
        <label className={styles.botField}>
          <span>Max simulated trade size</span>
          <input
            min="1"
            step="10"
            type="number"
            value={simulation.riskSettings.maxTradeSize}
            onChange={(event) => updateRiskSetting('maxTradeSize', event.target.value)}
          />
        </label>
        <label className={styles.botField}>
          <span>Stop loss %</span>
          <input
            min="0.1"
            step="0.1"
            type="number"
            value={simulation.riskSettings.stopLossPercent}
            onChange={(event) => updateRiskSetting('stopLossPercent', event.target.value)}
          />
        </label>
        <label className={styles.botField}>
          <span>Take profit %</span>
          <input
            min="0.1"
            step="0.1"
            type="number"
            value={simulation.riskSettings.takeProfitPercent}
            onChange={(event) => updateRiskSetting('takeProfitPercent', event.target.value)}
          />
        </label>
        <label className={styles.botField}>
          <span>Cooldown between signals</span>
          <input
            min="0"
            step="5"
            type="number"
            value={simulation.riskSettings.cooldownSeconds}
            onChange={(event) => updateRiskSetting('cooldownSeconds', event.target.value)}
          />
        </label>
        <label className={styles.botField}>
          <span>Daily max signals</span>
          <input
            min="1"
            step="1"
            type="number"
            value={simulation.riskSettings.dailyMaxSignals}
            onChange={(event) => updateRiskSetting('dailyMaxSignals', event.target.value)}
          />
        </label>
      </div>

      <div className={styles.botStats}>
        <div className={styles.botStat}>
          <span>Current simulated balance</span>
          <strong>{formatCurrency(simulation.currentBalance)} USDC</strong>
        </div>
        <div className={styles.botStat}>
          <span>Total simulated P/L</span>
          <strong className={simulation.totalProfitLoss >= 0 ? styles.positive : styles.negative}>
            {formatCurrency(simulation.totalProfitLoss)}
          </strong>
        </div>
        <div className={styles.botStat}>
          <span>Status</span>
          <strong>{simulation.status === 'running' ? `Running ${getAtlasModeLabel(simulation.mode)}` : simulation.status === 'paused' ? 'Paused' : 'Idle'}</strong>
        </div>
        <div className={styles.botStat}>
          <span>Signals today</span>
          <strong>{simulation.dailySignalDay === getTodayKey() ? simulation.dailySignalCount : 0} / {simulation.riskSettings.dailyMaxSignals}</strong>
        </div>
      </div>

      {strategySignal.blocked ? (
        <div className={styles.safetyBlocked}>{ATLAS_SAFETY_BLOCKED_MESSAGE}</div>
      ) : null}

      <div className={styles.botButtons}>
        <button className={styles.claimButton} type="button" onClick={startSimulation} disabled={simulation.status === 'running'}>
          {simulation.mode === 'liveSignal' ? 'Start Live Signals' : 'Start Simulation'}
        </button>
        <button className={styles.secondaryButton} type="button" onClick={pauseSimulation} disabled={simulation.status !== 'running'}>
          Pause Simulation
        </button>
        <button className={styles.secondaryButton} type="button" onClick={resetSimulation}>
          Reset Simulation
        </button>
        <a
          className={styles.secondaryButton}
          href="/#trade-sgen"
          target="_blank"
          rel="noreferrer"
          title={`Open Jupiter swap for manual ${simulation.pair} trading where routes are available`}
        >
          Open Jupiter Trade
        </a>
      </div>

      <div className={styles.tradeLog}>
        <div className={styles.tradeLogHeader}>
          <div className="brand-kicker">Signal History</div>
          <span>{signalHistory.length} saved signals</span>
        </div>
        {signalHistory.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={`${styles.tradeTable} ${styles.signalHistoryTable}`}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Pair</th>
                  <th>Strategy</th>
                  <th>Signal</th>
                  <th>Confidence %</th>
                  <th>Reason</th>
                  <th>Price source</th>
                </tr>
              </thead>
              <tbody>
                {signalHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatTradeDate(entry.time)}</td>
                    <td>{entry.pair}</td>
                    <td>{entry.strategy}</td>
                    <td>{entry.signal}</td>
                    <td>{entry.confidence}%</td>
                    <td>{entry.reason}</td>
                    <td>{entry.priceSource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyLog}>Start Atlas to save BUY, SELL, and HOLD signals locally for this wallet.</div>
        )}
      </div>

      <div className={styles.tradeLog}>
        <div className={styles.tradeLogHeader}>
          <div className="brand-kicker">Paper Trading Log</div>
          <span>{simulation.trades.length} simulated trades</span>
        </div>
        {simulation.trades.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.tradeTable}>
              <thead>
                <tr>
                  <th>Date/time</th>
                  <th>Pair</th>
                  <th>Action</th>
                  <th>Amount</th>
                  <th>Entry price</th>
                  <th>Exit price</th>
                  <th>Profit/Loss</th>
                  <th>Signal</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {simulation.trades.map((trade) => (
                  <tr key={trade.id}>
                    <td>{formatTradeDate(trade.dateTime)}</td>
                    <td>{trade.pair}</td>
                    <td>{trade.action}</td>
                    <td>{formatCurrency(trade.amount)}</td>
                    <td>{formatPrice(trade.entryPrice)}</td>
                    <td>{formatPrice(trade.exitPrice)}</td>
                    <td className={trade.profitLoss >= 0 ? styles.positive : styles.negative}>
                      {formatCurrency(trade.profitLoss)}
                    </td>
                    <td>{trade.signalConfidence ? `${trade.signalConfidence}%` : 'Signal'}</td>
                    <td>{trade.reason || trade.signalSource || 'Paper strategy signal'}</td>
                    <td>{trade.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyLog}>
            {simulation.mode === 'liveSignal'
              ? 'Live Signal Mode does not create paper trades. Use Open Jupiter Trade to approve any real swap manually.'
              : 'Start the simulator to log paper trades from Atlas strategy signals. No blockchain transactions are submitted.'}
          </div>
        )}
      </div>
    </div>
  );
}

export function SgenHolderDashboard() {
  const { connected, publicKey } = useWallet();
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  const [accessState, setAccessState] = useState<HolderAccessState>('checking');
  const [walletAddress, setWalletAddress] = useState('');
  const [sgenBalance, setSgenBalance] = useState('0');
  const [claimLedger, setClaimLedger] = useState<ClaimLedger>(() => createEmptyClaimLedger());
  const [claimMessage, setClaimMessage] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    function mountDashboardPortal() {
      const holderAccessSection = document.getElementById('holder-access');
      if (!holderAccessSection) return;

      let dashboardPortal = document.getElementById('holder-dashboard-portal');
      if (!dashboardPortal) {
        dashboardPortal = document.createElement('div');
        dashboardPortal.id = 'holder-dashboard-portal';
        holderAccessSection.insertAdjacentElement('afterend', dashboardPortal);
      }

      setPortalElement(dashboardPortal);
    }

    mountDashboardPortal();
    const frame = requestAnimationFrame(mountDashboardPortal);

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkSgenBalance() {
      if (!connected || !publicKey) {
        setAccessState('checking');
        setWalletAddress('');
        setSgenBalance('0');
        return;
      }

      const walletBase58 = publicKey.toBase58();
      setAccessState('checking');
      setWalletAddress(walletBase58);

      try {
        const result = await getSgenBalance(walletBase58);

        if (cancelled) return;

        setWalletAddress(result.wallet);
        setSgenBalance(result.balance);
        setAccessState(result.hasSgen ? 'granted' : 'denied');
      } catch {
        if (!cancelled) setAccessState('error');
      }
    }

    checkSgenBalance();

    return () => {
      cancelled = true;
    };
  }, [connected, publicKey]);

  useEffect(() => {
    if (!walletAddress || accessState !== 'granted') {
      setClaimLedger(createEmptyClaimLedger());
      setClaimMessage('');
      return;
    }

    const storedClaimLedger = window.localStorage.getItem(getClaimStorageKey(walletAddress));

    setClaimLedger(parseStoredClaimLedger(storedClaimLedger));
    setClaimMessage('');
    setNow(Date.now());
  }, [walletAddress, accessState]);

  useEffect(() => {
    if (!claimLedger.lastClaimTime) return;

    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, [claimLedger.lastClaimTime]);

  if (!connected || !publicKey || !portalElement) return null;

  const statusLabel = getStatusLabel(accessState);
  const holderZoneVisible = accessState === 'granted';
  const holderTier = getHolderTier(sgenBalance);
  const lastClaimTime = claimLedger.lastClaimTime;
  const nextClaimTime = lastClaimTime ? lastClaimTime + CLAIM_INTERVAL_MS : 0;
  const claimRemainingMs = Math.max(0, nextClaimTime - now);
  const canClaimRewards = holderZoneVisible && holderTier.claimAmount > 0 && claimRemainingMs <= 0;
  const claimCountdown = formatCountdown(claimRemainingMs);
  const nextClaimAvailable = !lastClaimTime || claimRemainingMs <= 0 ? 'Ready now' : formatClaimTime(nextClaimTime);
  const pillClassName = [
    styles.pill,
    accessState === 'granted' ? styles.pillGranted : '',
    accessState === 'denied' || accessState === 'error' ? styles.pillDenied : '',
  ]
    .filter(Boolean)
    .join(' ');

  function handleClaimRewards() {
    if (!canClaimRewards || !walletAddress) return;

    const claimTime = Date.now();
    const nextClaimLedger: ClaimLedger = {
      sfuelRewardsBalance: claimLedger.sfuelRewardsBalance + holderTier.claimAmount,
      totalClaims: claimLedger.totalClaims + 1,
      lastClaimTime: claimTime,
    };

    window.localStorage.setItem(getClaimStorageKey(walletAddress), JSON.stringify(nextClaimLedger));
    setClaimLedger(nextClaimLedger);
    setNow(claimTime);
    setClaimMessage('Rewards claimed (SFUEL ledger updated)');
  }

  return createPortal(
    <section id="holder-dashboard" className={`section ${styles.section}`}>
      <div className="container">
        <div className={`panel ${styles.dashboard}`}>
          <div className={styles.header}>
            <div>
              <div className="brand-kicker">Holder Dashboard</div>
              <h2 className={styles.title}>Wallet overview</h2>
            </div>
            <div className={pillClassName}>{statusLabel}</div>
          </div>

          <div className={styles.grid}>
            <div className={styles.item}>
              <span>Wallet address</span>
              <strong>{walletAddress}</strong>
            </div>
            <div className={styles.item}>
              <span>SGEN balance</span>
              <strong>{accessState === 'checking' ? 'Checking...' : sgenBalance}</strong>
            </div>
            <div className={styles.item}>
              <span>Access</span>
              <strong>{statusLabel}</strong>
            </div>
          </div>

          <div className={styles.tierGrid}>
            <div className={styles.tierItem}>
              <span>Current tier</span>
              <strong>{holderTier.name}</strong>
            </div>
            <div className={styles.tierItem}>
              <span>SGEN balance</span>
              <strong>{accessState === 'checking' ? 'Checking...' : sgenBalance}</strong>
            </div>
            <div className={styles.tierItem}>
              <span>Daily SFUEL claim amount</span>
              <strong>{holderTier.claimAmount} SFUEL</strong>
            </div>
          </div>

          {holderZoneVisible ? (
            <div className={styles.zone}>
              <div className={styles.header}>
                <div>
                  <div className="brand-kicker">Holder Only</div>
                  <h2 className={styles.title}>SGEN Holder Zone</h2>
                </div>
              </div>
              <div className={styles.ledger}>
                <div className={styles.ledgerHeader}>
                  <div>
                    <div className="brand-kicker">SFUEL Rewards Ledger</div>
                    <h3 className={styles.claimTitle}>SFUEL Rewards Ledger</h3>
                  </div>
                  <p className={styles.simulatedLabel}>
                    Simulated rewards only {'\u2014'} official SFUEL mint verified; distribution remains wallet-approved.
                  </p>
                </div>
                <div className={styles.ledgerGrid}>
                  <div className={styles.ledgerItem}>
                    <span>SFUEL Rewards Balance</span>
                    <strong>{claimLedger.sfuelRewardsBalance} SFUEL</strong>
                  </div>
                  <div className={styles.ledgerItem}>
                    <span>Total Claims</span>
                    <strong>{claimLedger.totalClaims}</strong>
                  </div>
                  <div className={styles.ledgerItem}>
                    <span>Last Claim Time</span>
                    <strong>{formatClaimTime(lastClaimTime)}</strong>
                  </div>
                  <div className={styles.ledgerItem}>
                    <span>Next Claim Available</span>
                    <strong>{nextClaimAvailable}</strong>
                  </div>
                </div>
              </div>
              <div className={styles.claim}>
                <div>
                  <div className="brand-kicker">Daily Claim</div>
                  <h3 className={styles.claimTitle}>Daily Claim</h3>
                </div>
                <div className={styles.claimActions}>
                  <button
                    className={styles.claimButton}
                    type="button"
                    onClick={handleClaimRewards}
                    disabled={!canClaimRewards}
                  >
                    Claim Rewards
                  </button>
                  <div className={styles.countdown}>Next claim: {claimCountdown}</div>
                  {claimMessage ? <div className={styles.claimMessage}>{claimMessage}</div> : null}
                </div>
              </div>
              <AtlasTradingBot walletAddress={walletAddress} />
              <div className={styles.grid}>
                <div className={styles.zoneCard}>
                  <div className="card-title">Coming Features</div>
                </div>
                <div className={styles.zoneCard}>
                  <div className="card-title">Future Rewards</div>
                </div>
                <div className={styles.zoneCard}>
                  <div className="card-title">Early Access Tools</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>,
    portalElement,
  );
}
