'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import styles from './SgenHolderDashboard.module.css';

const SGEN_MINT = 'DLftpBQXTvKgBAtqHbkk8sKtvCsT5WR7Ws3ULdFvjmyF';
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

type BotStrategy = 'Buy the Dip' | 'Take Profit' | 'Dollar-Cost Average' | 'Momentum';
type BotStatus = 'idle' | 'running' | 'paused';
type TradeAction = 'Buy' | 'Sell';

type PaperTrade = {
  action: TradeAction;
  amount: number;
  dateTime: string;
  entryPrice: number;
  exitPrice: number;
  id: string;
  pair: string;
  profitLoss: number;
  status: string;
};

type AtlasSimulationState = {
  currentBalance: number;
  pair: string;
  selectedStrategy: BotStrategy;
  startingBalance: number;
  status: BotStatus;
  totalProfitLoss: number;
  trades: PaperTrade[];
};

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
const ATLAS_PAIRS = ['SGEN/USDC', 'SOL/USDC', 'BTC/USDC'];
const ATLAS_BASE_PRICES: Record<string, number> = {
  'SGEN/USDC': 0.000001,
  'SOL/USDC': 150,
  'BTC/USDC': 65000,
};

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

function createDefaultAtlasState(): AtlasSimulationState {
  return {
    currentBalance: ATLAS_DEFAULT_BALANCE,
    pair: 'SGEN/USDC',
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
    const pair = typeof parsed.pair === 'string' && ATLAS_PAIRS.includes(parsed.pair)
      ? parsed.pair
      : 'SGEN/USDC';
    const status = parsed.status === 'running' || parsed.status === 'paused' ? parsed.status : 'idle';

    return {
      currentBalance: Number(parsed.currentBalance) || startingBalance + totalProfitLoss,
      pair,
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

function getRandomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function getStrategySignal(strategy: BotStrategy): { action: TradeAction; movePercent: number } {
  if (strategy === 'Buy the Dip') {
    return { action: 'Buy', movePercent: getRandomBetween(-0.012, 0.045) };
  }

  if (strategy === 'Take Profit') {
    return { action: 'Sell', movePercent: getRandomBetween(0.004, 0.032) };
  }

  if (strategy === 'Dollar-Cost Average') {
    return { action: 'Buy', movePercent: getRandomBetween(-0.008, 0.022) };
  }

  const movePercent = getRandomBetween(-0.02, 0.05);
  return { action: movePercent >= 0 ? 'Buy' : 'Sell', movePercent };
}

function createSimulatedTrade(simulation: AtlasSimulationState): PaperTrade {
  const { action, movePercent } = getStrategySignal(simulation.selectedStrategy);
  const basePrice = ATLAS_BASE_PRICES[simulation.pair] || 1;
  const marketDrift = getRandomBetween(-0.018, 0.018);
  const entryPrice = basePrice * (1 + marketDrift);
  const exitPrice = entryPrice * (1 + movePercent);
  const tradeSize = Math.max(10, Math.min(simulation.currentBalance * 0.1, simulation.startingBalance * 0.2));
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
    status: 'Closed',
  };
}

function advanceSimulation(simulation: AtlasSimulationState): AtlasSimulationState {
  const nextTrade = createSimulatedTrade(simulation);
  const totalProfitLoss = Number((simulation.totalProfitLoss + nextTrade.profitLoss).toFixed(2));

  return {
    ...simulation,
    currentBalance: Number((simulation.startingBalance + totalProfitLoss).toFixed(2)),
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

function AtlasTradingBot({ walletAddress }: { walletAddress: string }) {
  const [simulation, setSimulation] = useState<AtlasSimulationState>(() => createDefaultAtlasState());

  useEffect(() => {
    const storedSimulation = window.localStorage.getItem(getAtlasStorageKey(walletAddress));
    setSimulation(parseStoredAtlasState(storedSimulation));
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress) return;

    window.localStorage.setItem(getAtlasStorageKey(walletAddress), JSON.stringify(simulation));
  }, [simulation, walletAddress]);

  useEffect(() => {
    if (simulation.status !== 'running') return;

    const timer = window.setInterval(() => {
      setSimulation((current) => {
        if (current.status !== 'running') return current;
        return advanceSimulation(current);
      });
    }, 4500);

    return () => window.clearInterval(timer);
  }, [simulation.status]);

  function updateStartingBalance(value: string) {
    const nextStartingBalance = getValidStartingBalance(Number(value));

    setSimulation((current) => ({
      ...current,
      currentBalance: current.trades.length === 0 ? nextStartingBalance : current.currentBalance,
      startingBalance: nextStartingBalance,
    }));
  }

  function startSimulation() {
    setSimulation((current) => advanceSimulation({ ...current, status: 'running' }));
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
        selectedStrategy: current.selectedStrategy,
        startingBalance,
      };
    });
  }

  return (
    <div className={styles.bot}>
      <div className={styles.botHeader}>
        <div>
          <div className="brand-kicker">Atlas Trading Bot</div>
          <h3 className={styles.claimTitle}>Strategy Simulation</h3>
        </div>
        <div className={styles.botNotice}>Simulation only. No real trades are placed.</div>
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
            onChange={(event) => setSimulation((current) => ({ ...current, pair: event.target.value }))}
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
          <strong>{simulation.status === 'running' ? 'Running' : simulation.status === 'paused' ? 'Paused' : 'Idle'}</strong>
        </div>
      </div>

      <div className={styles.botButtons}>
        <button className={styles.claimButton} type="button" onClick={startSimulation} disabled={simulation.status === 'running'}>
          Start Simulation
        </button>
        <button className={styles.secondaryButton} type="button" onClick={pauseSimulation} disabled={simulation.status !== 'running'}>
          Pause Simulation
        </button>
        <button className={styles.secondaryButton} type="button" onClick={resetSimulation}>
          Reset Simulation
        </button>
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
                    <td>{trade.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyLog}>Start the simulator to generate paper trades from fake market movement.</div>
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
    setClaimMessage('Rewards claimed (SFUEL coming soon)');
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
                    Simulated rewards only {'\u2014'} real SFUEL distribution coming later.
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
