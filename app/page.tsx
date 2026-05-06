'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import {
  ArrowRight,
  ChevronRight,
  Coins,
  Flame,
  Layers,
  ShieldCheck,
  Vote,
  Wallet,
} from 'lucide-react';

const WHITEPAPER_URL = '/downloads/whitepaper.pdf';
const DECK_URL = '/downloads/pitch-deck.pptx';
const TOKENOMICS_URL = '/downloads/tokenomics-graphic.pdf';
const SGEN_MINT = 'DLftpBQXTvKgBAtqHbkk8sKtvCsT5WR7Ws3ULdFvjmyF';
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const JUPITER_PRICE_API_URL = 'https://lite-api.jup.ag/price/v3';
const JUPITER_PLUGIN_SCRIPT_URL = 'https://plugin.jup.ag/plugin-v1.js';
const JUPITER_PLUGIN_TARGET_ID = 'jupiter-sgen-plugin';

declare global {
  interface Window {
    Jupiter?: {
      init: (config: Record<string, unknown>) => void;
    };
    __sgenJupiterPluginLoading?: Promise<void>;
  }
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6 },
};

type SectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
};

type MetricProps = {
  value: string;
  label: string;
};

type FeatureCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
};

type TokenCardProps = {
  name: string;
  ticker: string;
  role: string;
  bullets: string[];
  gold?: boolean;
};

type LoopStepProps = {
  number: string;
  title: string;
  text: string;
};

type HolderAccessState = 'idle' | 'checking' | 'granted' | 'denied' | 'error';

type JupiterPriceResponse = Record<
  string,
  {
    usdPrice?: number;
  }
>;

type LiveMarketRow = {
  amountSgen: number;
  pair: string;
  priceSource: string;
  solValue: number;
  status: string;
  time: string;
  type: 'Buy' | 'Sell';
  usdValue: number | null;
};

const features: FeatureCardProps[] = [
  {
    icon: Coins,
    title: 'Dual-token structure',
    text: 'Satoshi Genesis separates long-term value from day-to-day activity so the ecosystem can grow without forcing one asset to do everything at once.',
  },
  {
    icon: Wallet,
    title: 'Staking with purpose',
    text: 'Stake SGEN to unlock stronger participation, reward multipliers, premium access, and a clearer reason to hold beyond speculation.',
  },
  {
    icon: Flame,
    title: 'Burn and treasury logic',
    text: 'SFUEL is designed to be earned, spent, and reduced through ecosystem use, while fee routing supports treasury strength and long-term system discipline.',
  },
  {
    icon: Vote,
    title: 'Governance that matters',
    text: 'SGEN holders shape treasury direction, emissions bands, and major ecosystem moves through a governance model designed for clarity, not noise.',
  },
];

const faq = [
  {
    q: 'Why use two tokens?',
    a: 'Because one token rarely handles value storage, rewards, governance, and utility well at the same time. SGEN anchors the core. SFUEL powers the engine.',
  },
  {
    q: 'What is SGEN for?',
    a: 'SGEN is the capped core token used for staking, governance, premium rights, and long-term ecosystem alignment.',
  },
  {
    q: 'What is SFUEL for?',
    a: 'SFUEL is the utility and reward token used for participation, upgrades, access, activity, and burn-linked ecosystem flow.',
  },
  {
    q: 'What chain is SGEN live on?',
    a: 'SGEN is live on Solana mainnet as a Token-2022 asset. Raydium liquidity is planned / in setup.',
  },
];

function SatoshiGenesisLogo({ size = 48, wordmark = false }: { size?: number; wordmark?: boolean }) {
  return (
    <div className={`logo-inline ${wordmark ? '' : 'centered'}`}>
      <div className="logo-mark" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Satoshi Genesis logo"
          style={{ position: 'relative', filter: 'drop-shadow(0 0 22px rgba(251,191,36,0.25))' }}
        >
          <defs>
            <linearGradient id="sgenGold" x1="12" y1="8" x2="82" y2="92" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE68A" />
              <stop offset="0.45" stopColor="#FBBF24" />
              <stop offset="1" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="42" stroke="url(#sgenGold)" strokeWidth="4" />
          <circle cx="50" cy="50" r="33" stroke="url(#sgenGold)" strokeOpacity="0.9" strokeWidth="2.5" />
          <path d="M50 18V30" stroke="url(#sgenGold)" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 70V82" stroke="url(#sgenGold)" strokeWidth="4" strokeLinecap="round" />
          <path
            d="M61.5 34.5C58.8 31.9 54.8 30.4 49.6 30.4C42.3 30.4 37.8 34.1 37.8 39.5C37.8 44.6 41.6 47.2 49.4 48.7C56.5 50 60.2 52 60.2 56.7C60.2 61.9 55.7 65.6 48.8 65.6C43.1 65.6 38.6 63.7 35.2 60.2"
            stroke="url(#sgenGold)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M49 24.5V30.5" stroke="url(#sgenGold)" strokeWidth="5" strokeLinecap="round" />
          <path d="M49 65.5V75.5" stroke="url(#sgenGold)" strokeWidth="5" strokeLinecap="round" />
          <circle cx="50" cy="50" r="46" stroke="url(#sgenGold)" strokeOpacity="0.25" strokeWidth="1.2" strokeDasharray="2.5 6.5" />
        </svg>
      </div>
      {wordmark ? (
        <div>
          <div className="wordmark-title">Satoshi Genesis</div>
          <div className="wordmark-sub">Dual-token ecosystem</div>
        </div>
      ) : null}
    </div>
  );
}

function ButtonLink({
  href,
  children,
  variant = 'primary',
  target,
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'gold';
  target?: '_blank';
}) {
  const className =
    variant === 'primary'
      ? 'button button-primary'
      : variant === 'gold'
        ? 'button button-gold'
        : 'button button-outline';

  return (
    <a className={className} href={href} target={target} rel={target === '_blank' ? 'noreferrer' : undefined}>
      {children}
    </a>
  );
}


function TradeJupiterButton({
  children,
  variant = 'gold',
}: {
  children: React.ReactNode;
  variant?: 'gold' | 'outline';
}) {
  const className = variant === 'outline' ? 'button button-outline' : 'button button-gold';

  return (
    <a
      className={className}
      href="/#trade-sgen"
      target="_blank"
      rel="noreferrer"
      title="Open the Jupiter swap section"
    >
      {children}
    </a>
  );
}

function Section({ id, eyebrow, title, children }: SectionProps) {
  return (
    <section id={id} className="section">
      <div className="container">
        <motion.div {...fadeUp}>
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
          <h2 className="section-title">{title}</h2>
          {children}
        </motion.div>
      </div>
    </section>
  );
}

function Metric({ value, label }: MetricProps) {
  return (
    <div className="panel metric">
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }: FeatureCardProps) {
  return (
    <div className="panel card">
      <div className="feature-icon">
        <Icon className="icon" />
      </div>
      <div className="feature-title">{title}</div>
      <p className="section-copy">{text}</p>
    </div>
  );
}

function TokenCard({ name, ticker, role, bullets, gold = false }: TokenCardProps) {
  return (
    <div className="panel token-card" style={gold ? { borderColor: 'rgba(251,191,36,0.25)' } : undefined}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
        <div>
          <div className="brand-kicker" style={{ color: gold ? '#fde68a' : '#94a3b8' }}>{ticker}</div>
          <h3 className="token-title" style={{ margin: '0.6rem 0 0' }}>{name}</h3>
          <p className="section-copy" style={{ marginTop: '0.75rem' }}>{role}</p>
        </div>
        <div className="token-badge">Core Split</div>
      </div>
      <div className="token-list">
        {bullets.map((bullet) => (
          <div className="token-item" key={bullet}>
            <ChevronRight className="inline-icon" />
            <span>{bullet}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoopStep({ number, title, text }: LoopStepProps) {
  return (
    <div className="panel loop-card">
      <div
        style={{
          display: 'inline-flex',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '9999px',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(251,191,36,0.30)',
          background: 'rgba(251,191,36,0.10)',
          color: '#fde68a',
          fontWeight: 700,
          marginBottom: '1rem',
        }}
      >
        {number}
      </div>
      <div className="card-title">{title}</div>
      <p className="section-copy">{text}</p>
    </div>
  );
}

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatFeedNumber(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  });
}

function formatFeedUsd(value: number | null) {
  if (value === null || !Number.isFinite(value)) return 'Unavailable';
  if (value < 0.01) return `$${value.toFixed(6)}`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

function formatFeedSol(value: number) {
  if (!Number.isFinite(value)) return 'Unavailable';
  if (value < 0.000001) return value.toFixed(9);
  return value.toLocaleString(undefined, { maximumFractionDigits: 6, minimumFractionDigits: 0 });
}

function createMarketRows(sgenUsdPrice: number | null, solUsdPrice: number | null): LiveMarketRow[] {
  const fallbackSgenUsdPrice = 0.000001;
  const fallbackSolUsdPrice = solUsdPrice || 150;
  const effectiveSgenUsdPrice = sgenUsdPrice || fallbackSgenUsdPrice;
  const isLiveSgen = Boolean(sgenUsdPrice && sgenUsdPrice > 0);
  const priceSource = isLiveSgen
    ? 'Jupiter Price API V3'
    : 'Fallback simulation \u2014 live SGEN trade feed coming soon.';
  const amounts = [125000, 48000, 210000, 72500, 156000, 33500];

  return amounts.map((amountSgen, index) => {
    const usdValue = amountSgen * effectiveSgenUsdPrice;
    const solValue = usdValue / fallbackSolUsdPrice;
    const pair = index % 3 === 1 ? 'SGEN/USDC' : index % 3 === 2 ? 'SOL/SGEN' : 'SGEN/SOL';

    return {
      amountSgen,
      pair,
      priceSource,
      solValue,
      status: isLiveSgen ? 'Live price display' : 'Fallback simulation',
      time: index === 0 ? 'Now' : `${index + 1}m ago`,
      type: index % 2 === 0 ? 'Buy' : 'Sell',
      usdValue: isLiveSgen || solUsdPrice ? usdValue : null,
    };
  });
}

type SgenBalanceResponse = {
  balance: string;
  error?: string;
  hasSgen: boolean;
  mint: string;
  rawBalance: string;
  wallet: string;
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

function loadJupiterPlugin() {
  if (window.Jupiter) return Promise.resolve();
  if (window.__sgenJupiterPluginLoading) return window.__sgenJupiterPluginLoading;

  window.__sgenJupiterPluginLoading = new Promise((resolve, reject) => {
    const existingScript = Array.from(document.scripts).find((script) => script.src === JUPITER_PLUGIN_SCRIPT_URL);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Jupiter Plugin failed to load.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = JUPITER_PLUGIN_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.dataset.preload = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Jupiter Plugin failed to load.'));
    document.head.appendChild(script);
  });

  return window.__sgenJupiterPluginLoading;
}

function JupiterSwapWidget() {
  const initializedRef = useRef(false);
  const [pluginState, setPluginState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function initialisePlugin() {
      try {
        await loadJupiterPlugin();

        if (cancelled || !window.Jupiter || initializedRef.current) return;

        const target = document.getElementById(JUPITER_PLUGIN_TARGET_ID);
        if (target) target.innerHTML = '';

        window.Jupiter.init({
          displayMode: 'integrated',
          integratedTargetId: JUPITER_PLUGIN_TARGET_ID,
          formProps: {
            initialInputMint: SOL_MINT,
            initialOutputMint: SGEN_MINT,
            fixedMint: SGEN_MINT,
            fixedAmount: false,
            swapMode: 'ExactInOrOut',
          },
          branding: {
            name: 'Satoshi Genesis',
          },
        });

        initializedRef.current = true;
        setPluginState('ready');
      } catch {
        if (!cancelled) setPluginState('error');
      }
    }

    initialisePlugin();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="jupiter-widget-shell">
      <div id={JUPITER_PLUGIN_TARGET_ID} className="jupiter-widget-target" />
      {pluginState === 'loading' ? <div className="jupiter-widget-status">Loading Jupiter swap...</div> : null}
      {pluginState === 'error' ? (
        <div className="jupiter-widget-status">Jupiter swap could not load. Refresh the page and try again.</div>
      ) : null}
    </div>
  );
}

function LiveMarketFeed() {
  const [rows, setRows] = useState<LiveMarketRow[]>(() => createMarketRows(null, null));
  const [feedStatus, setFeedStatus] = useState('Checking Jupiter Price API V3...');

  useEffect(() => {
    let cancelled = false;

    async function refreshMarketFeed() {
      try {
        const ids = [SGEN_MINT, SOL_MINT, USDC_MINT].join(',');
        const response = await fetch(`${JUPITER_PRICE_API_URL}?ids=${encodeURIComponent(ids)}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Jupiter Price API V3 unavailable.');
        }

        const data = (await response.json()) as JupiterPriceResponse;
        const sgenUsdPrice = data[SGEN_MINT]?.usdPrice;
        const solUsdPrice = data[SOL_MINT]?.usdPrice;
        const hasLiveSgen = typeof sgenUsdPrice === 'number' && Number.isFinite(sgenUsdPrice) && sgenUsdPrice > 0;
        const hasLiveSol = typeof solUsdPrice === 'number' && Number.isFinite(solUsdPrice) && solUsdPrice > 0;

        if (cancelled) return;

        setRows(createMarketRows(hasLiveSgen ? sgenUsdPrice : null, hasLiveSol ? solUsdPrice : null));
        setFeedStatus(
          hasLiveSgen
            ? 'Jupiter Price API V3 connected.'
            : 'Fallback simulation \u2014 live SGEN trade feed coming soon.',
        );
      } catch {
        if (cancelled) return;
        setRows(createMarketRows(null, null));
        setFeedStatus('Fallback simulation \u2014 live SGEN trade feed coming soon.');
      }
    }

    refreshMarketFeed();
    const timer = window.setInterval(refreshMarketFeed, 45000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section id="live-market-feed" className="section market-feed-section">
      <div className="container">
        <motion.div {...fadeUp} className="panel market-feed-panel">
          <div className="market-feed-header">
            <div>
              <div className="eyebrow">Live Market Feed</div>
              <h2 className="section-title" style={{ marginTop: '1rem' }}>SGEN market activity display.</h2>
              <p className="section-copy">
                Live Market Feed is informational only. Trades are executed through Jupiter swap. Simulation rows are clearly marked when live data is unavailable.
              </p>
            </div>
            <div className="market-feed-status">{feedStatus}</div>
          </div>

          <div className="market-table-wrap">
            <table className="market-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Pair</th>
                  <th>Type</th>
                  <th>Amount SGEN</th>
                  <th>SOL Value</th>
                  <th>USD Value if available</th>
                  <th>Price Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.time}-${row.pair}-${index}`}>
                    <td>{row.time}</td>
                    <td>{row.pair}</td>
                    <td>
                      <span className={row.type === 'Buy' ? 'market-type-buy' : 'market-type-sell'}>{row.type}</span>
                    </td>
                    <td>{formatFeedNumber(row.amountSgen)}</td>
                    <td>{formatFeedSol(row.solValue)} SOL</td>
                    <td>{formatFeedUsd(row.usdValue)}</td>
                    <td>{row.priceSource}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SgenHolderAccess() {
  const { connected, disconnect, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [accessState, setAccessState] = useState<HolderAccessState>('idle');
  const [walletAddress, setWalletAddress] = useState('');
  const [sgenBalance, setSgenBalance] = useState('0');
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function checkSgenBalance() {
      if (!connected || !publicKey) {
        setAccessState('idle');
        setWalletAddress('');
        setSgenBalance('0');
        setErrorMessage('');
        return;
      }

      setAccessState('checking');
      setWalletAddress(publicKey.toBase58());
      setErrorMessage('');

      try {
        const walletBase58 = publicKey.toBase58();
        const result = await getSgenBalance(walletBase58);

        if (cancelled) return;

        setWalletAddress(result.wallet);
        setSgenBalance(result.balance);
        setAccessState(result.hasSgen ? 'granted' : 'denied');
      } catch (error) {
        if (cancelled) return;

        setAccessState('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unable to check SGEN balance.');
      }
    }

    checkSgenBalance();

    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, refreshNonce]);

  const statusLabel =
    accessState === 'granted'
      ? 'Access Granted'
      : accessState === 'denied'
        ? 'No SGEN detected'
        : accessState === 'checking'
          ? 'Checking SGEN balance...'
          : accessState === 'error'
            ? 'Wallet check failed'
            : 'Wallet not connected';

  return (
    <section id="holder-access" className="section holder-access-section">
      <div className="container">
        <div className="panel holder-access-panel">
          <div>
            <div className="eyebrow">SGEN holder access</div>
            <h2 className="section-title" style={{ marginTop: '1rem' }}>Connect your wallet to unlock holder access.</h2>
            <p className="section-copy">
              Connect Solflare or Phantom to verify your SGEN balance against the official Solana mainnet mint.
            </p>
          </div>

          <div className="holder-access-grid">
            <div className="holder-wallet-card">
              <div className="card-title">Wallet Connect</div>
              <p className="section-copy">
                Use the wallet button to connect Solflare or Phantom. The site reads your public wallet address and checks for SGEN.
              </p>
              <div className="wallet-button-wrap">
                {connected ? (
                  <>
                    <button className="button button-gold" type="button" onClick={() => setRefreshNonce((value) => value + 1)}>
                      Refresh Balance
                    </button>
                    <button className="button button-outline" type="button" onClick={() => disconnect()}>
                      Disconnect Wallet
                    </button>
                  </>
                ) : (
                  <button className="button button-gold" type="button" onClick={() => setVisible(true)}>
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>

            <div className={`holder-status-card holder-status-${accessState}`}>
              <div className="brand-kicker">Access Status</div>
              <div className="holder-status-title">{statusLabel}</div>
              {walletAddress ? (
                <div className="holder-detail">
                  <strong>Wallet</strong>
                  <span>{shortenAddress(walletAddress)}</span>
                </div>
              ) : null}
              <div className="holder-detail">
                <strong>SGEN mint</strong>
                <span>{SGEN_MINT}</span>
              </div>
              {accessState === 'granted' || accessState === 'denied' ? (
                <div className="holder-detail">
                  <strong>SGEN balance</strong>
                  <span>{sgenBalance}</span>
                </div>
              ) : null}
              {accessState === 'error' ? <p className="section-copy">{errorMessage}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TradeSgenSection() {
  return (
    <section id="trade-sgen" className="section trade-sgen-section">
      <div className="container">
        <div className="panel trade-sgen-panel">
          <div className="trade-sgen-grid">
            <div>
              <div className="eyebrow">Trade SGEN</div>
              <h2 className="section-title" style={{ marginTop: '1rem' }}>Swap SOL into SGEN.</h2>
              <p className="section-copy">
                Use Jupiter swap infrastructure to search for a route into SGEN. The widget defaults to SOL as the input token and SGEN as the output token when a route is available.
              </p>
              <div className="holder-detail trade-mint-detail">
                <strong>SGEN mint</strong>
                <span>{SGEN_MINT}</span>
              </div>
              <p className="safety-text">
                Trading uses third-party Solana swap infrastructure. Always confirm token mint before swapping.
              </p>
            </div>
            <JupiterSwapWidget />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <div className="page">
      <div className="bg-glow">
        <div className="glow-1" />
        <div className="glow-2" />
        <div className="glow-3" />
      </div>

      <div className="shell">
        <header className="header">
          <div className="container header-row">
            <div className="logo-wrap">
              <SatoshiGenesisLogo size={48} />
              <div>
                <div className="brand-kicker">Satoshi Genesis</div>
                <div className="brand-sub">One token holds value. One token powers the engine.</div>
              </div>
            </div>
            <nav className="nav">
              <a href="#tokens" className="nav-link">Tokens</a>
              <a href="#holder-access" className="nav-link">Holder Access</a>
              <a href="#live-market-feed" className="nav-link">Market Feed</a>
              <a href="#trade-sgen" className="nav-link">Trade SGEN</a>
              <a href="#value-loop" className="nav-link">Value Loop</a>
              <a href="#liquidity" className="nav-link">Liquidity</a>
              <a href="#roadmap" className="nav-link">Roadmap</a>
              <a href="/watchtower" className="nav-link">Bitcoin Layer</a>
              <ButtonLink href={WHITEPAPER_URL} target="_blank">Read Whitepaper</ButtonLink>
            </nav>
          </div>
        </header>

        <main>
          <section className="hero">
            <div className="container hero-grid">
              <motion.div {...fadeUp}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <SatoshiGenesisLogo size={96} wordmark />
                </div>
                <div className="eyebrow">Dual-token ecosystem</div>
                <h1 className="hero-title">
                  Built for activity. <span className="gold">Designed for value.</span>
                </h1>
                <p className="hero-copy">
                  Satoshi Genesis is a dual-token ecosystem where <strong>SGEN</strong> anchors staking, governance, and long-term alignment, while <strong>SFUEL</strong> powers rewards, participation, and ecosystem movement.
                </p>
                <div className="hero-actions">
                  <ButtonLink href="#tokenomics">
                    Explore the Ecosystem <ArrowRight className="icon" />
                  </ButtonLink>
                  <ButtonLink href="#trade-sgen" variant="gold">
                    Trade SGEN
                  </ButtonLink>
                  <ButtonLink href={TOKENOMICS_URL} target="_blank" variant="outline">
                    View Token Design
                  </ButtonLink>
                </div>
                <div className="stats-grid">
                  <Metric value="21M" label="Fixed SGEN supply" />
                  <Metric value="2.1B" label="Programmed SFUEL emission ceiling" />
                  <Metric value="Solana" label="Live network" />
                </div>
              </motion.div>

              <motion.div {...fadeUp} style={{ position: 'relative' }}>
                <div className="panel hero-panel">
                  <div className="panel-soft identity-row">
                    <div>
                      <div className="eyebrow">Chosen identity</div>
                      <div className="card-title" style={{ marginTop: '0.5rem' }}>Concept 2 brand system</div>
                    </div>
                    <SatoshiGenesisLogo size={56} />
                  </div>
                  <div className="panel-soft token-hero gold-hero">
                    <div className="brand-kicker">SGEN</div>
                    <div className="token-title" style={{ marginTop: '0.75rem' }}>The Core Asset</div>
                    <p className="section-copy" style={{ marginTop: '0.75rem' }}>
                      Capped. Staked. Governed. Held. Designed to anchor the ecosystem through discipline, access, and long-term alignment.
                    </p>
                  </div>
                  <div className="panel-soft token-hero">
                    <div className="brand-kicker" style={{ color: '#94a3b8' }}>SFUEL</div>
                    <div className="token-title" style={{ marginTop: '0.75rem' }}>The Utility Engine</div>
                    <p className="section-copy" style={{ marginTop: '0.75rem' }}>
                      Earned. Spent. Burned. Circulated. Built to power movement, access, upgrades, and reward-driven participation.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <SgenHolderAccess />

          <LiveMarketFeed />

          <TradeSgenSection />

          <Section id="why" eyebrow="Why it exists" title="A cleaner structure for a stronger crypto economy.">
            <p className="section-copy">
              Many token projects fail because one asset is expected to handle governance, rewards, utility, growth, and long-term value at the same time. Satoshi Genesis separates those roles to reduce internal conflict and create a more durable system.
            </p>
            <div className="feature-grid" style={{ marginTop: '2.5rem' }}>
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </Section>

          <Section id="bitcoin-watchtower" eyebrow="Bitcoin Watchtower" title="A premium Bitcoin monitoring layer designed to expand the SGEN ecosystem.">
            <p className="section-copy">
              Monitor Bitcoin movement, dormant wallets, whale transfers, and future SGEN-gated intelligence tools.
            </p>
            <motion.div {...fadeUp} className="panel cta-panel" style={{ marginTop: '2rem' }}>
              <div className="cta-row">
                <div>
                  <div className="logo-inline">
                    <Layers className="icon large" style={{ color: '#fde68a' }} />
                    <div className="card-title">Bitcoin Watchtower</div>
                  </div>
                  <p className="section-copy" style={{ marginTop: '1rem' }}>
                    Explore the front-end product vision for Bitcoin movement alerts, dormant wallet watchlists, demo feed cards, and future holder-only intelligence access through SGEN.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <ButtonLink href="/watchtower" variant="gold">Explore Bitcoin Layer</ButtonLink>
                </div>
              </div>
            </motion.div>
          </Section>

          <Section id="tokens" eyebrow="Token architecture" title="Two tokens. Clear jobs. Better balance.">
            <p className="section-copy">
              SGEN captures the long-term value layer. SFUEL handles ecosystem movement. That split allows activity to happen without constantly dragging on the core asset.
            </p>
            <div className="token-grid" style={{ marginTop: '2.5rem' }}>
              <TokenCard
                name="Satoshi Genesis"
                ticker="SGEN"
                role="Core token for staking, governance, premium rights, and long-term alignment."
                gold
                bullets={[
                  'Fixed supply of 21,000,000',
                  'Used for staking and governance participation',
                  'Unlocks premium ecosystem access and stronger reward rights',
                  'No future minting after deployment',
                ]}
              />
              <TokenCard
                name="Satoshi Fuel"
                ticker="SFUEL"
                role="Utility and reward token for participation, upgrades, burns, and ecosystem flow."
                bullets={[
                  'Programmed emission ceiling of 2,100,000,000',
                  'Designed for earning, spending, and burn-linked circulation',
                  'Supports activity, access, upgrades, and reward mechanics',
                  'Emissions reduce over time under controlled logic',
                ]}
              />
            </div>
          </Section>

          <Section id="value-loop" eyebrow="How it works" title="Utility feeds the system. The core stays anchored.">
            <p className="section-copy">
              The ecosystem is designed so that participation drives utility demand, utility spend creates sinks, and treasury logic helps reinforce long-term system strength.
            </p>
            <div className="loop-grid" style={{ marginTop: '2.5rem' }}>
              <LoopStep number="01" title="Join and participate" text="Users enter the ecosystem, connect wallets, stake, and engage with activities or premium functions." />
              <LoopStep number="02" title="Earn and use SFUEL" text="Participation creates SFUEL flow through rewards, access mechanics, features, and ecosystem interaction." />
              <LoopStep number="03" title="Spend, burn, and route fees" text="SFUEL is spent across the system, with burns and fee routing designed to reduce drift and improve discipline." />
              <LoopStep number="04" title="Strengthen SGEN alignment" text="SGEN stakers gain stronger access, governance weight, and deeper ecosystem rights as the system matures." />
            </div>
          </Section>

          <Section id="tokenomics" eyebrow="Tokenomics snapshot" title="Simple enough to understand. Strong enough to scale.">
            <p className="section-copy">
              View the full tokenomics graphic for the visual breakdown of supply, emissions, treasury routing, and the value loop.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <ButtonLink href={TOKENOMICS_URL} target="_blank" variant="gold">
                Open Tokenomics Graphic
              </ButtonLink>
            </div>
            <div className="card-grid" style={{ marginTop: '2.5rem' }}>
              <div className="panel card">
                <div className="logo-inline">
                  <Layers className="icon large gold" />
                  <div className="card-title">SGEN allocation</div>
                </div>
                <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
                  {[
                    ['35%', 'Community and staking rewards'],
                    ['20%', 'Liquidity and market depth'],
                    ['15%', 'Treasury reserve'],
                    ['10%', 'Development fund'],
                    ['10%', 'Team and founders'],
                    ['5%', 'Partnerships and ecosystem growth'],
                    ['5%', 'Bootstrap and airdrops'],
                  ].map(([value, label]) => (
                    <div key={label} className="token-item" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel card">
                <div className="logo-inline">
                  <ShieldCheck className="icon large gold" />
                  <div className="card-title">Treasury and fee routing</div>
                </div>
                <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
                  {[
                    ['40%', 'Treasury'],
                    ['30%', 'SFUEL burn or buyback-and-burn'],
                    ['20%', 'Staking reward support'],
                    ['10%', 'Ecosystem growth wallet'],
                  ].map(([value, label]) => (
                    <div key={label} className="token-item" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
                <p className="section-copy" style={{ marginTop: '1.5rem' }}>
                  Treasury policy is designed for transparency and control, with multi-signature management and governance-linked decision paths.
                </p>
              </div>
            </div>
          </Section>

          <Section id="liquidity" eyebrow="Liquidity" title="Trading routes through Jupiter while Raydium liquidity is pending.">
            <p className="section-copy">
              No confirmed active Raydium pool link is published for SGEN yet. Use the Jupiter swap section for available SGEN routes and always verify the official mint before trading.
            </p>
            <div className="card-grid" style={{ marginTop: '2.5rem' }}>
              <div className="panel card">
                <div className="logo-inline">
                  <Wallet className="icon large gold" />
                  <div className="card-title">Liquidity Status</div>
                </div>
                <p className="section-copy" style={{ marginTop: '1rem' }}>
                  Raydium liquidity remains planned / pending until an active pool URL is confirmed. The site does not show Raydium trading buttons without a verified pool.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
                  {[
                    ['Status', 'No confirmed Raydium pool currently published.'],
                    ['Token', 'Satoshi Genesis (SGEN)'],
                    ['Network', 'Solana mainnet'],
                    ['SGEN mint address', SGEN_MINT],
                    ['Current trade route', 'Jupiter swap section'],
                  ].map(([label, value]) => (
                    <div key={label} className="token-item" style={{ alignItems: 'flex-start', gap: '1rem' }}>
                      <strong style={{ minWidth: '10.5rem', color: '#fde68a' }}>{label}</strong>
                      <span style={{ wordBreak: 'break-all' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel card">
                <div className="logo-inline">
                  <ShieldCheck className="icon large gold" />
                  <div className="card-title">Trading Access</div>
                </div>
                <p className="section-copy" style={{ marginTop: '1rem' }}>
                  Trade through the embedded Jupiter swap widget. If a confirmed Raydium pool is published later, the site can add the verified Raydium pool link then.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
                  {[
                    ['Trade button', 'Trade on Jupiter'],
                    ['Raydium visibility', 'Hidden until an active pool is confirmed'],
                  ].map(([label, value]) => (
                    <div key={label} className="token-item" style={{ alignItems: 'flex-start', gap: '1rem' }}>
                      <strong style={{ minWidth: '10.5rem', color: '#fde68a' }}>{label}</strong>
                      <span style={{ wordBreak: 'break-all' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                  <TradeJupiterButton>Trade on Jupiter</TradeJupiterButton>
                </div>
              </div>
            </div>
            <div className="panel card" style={{ marginTop: '1.5rem' }}>
              <div className="logo-inline">
                <ShieldCheck className="icon large gold" />
                <div className="card-title">Risk Disclaimer</div>
              </div>
              <p className="section-copy" style={{ marginTop: '1rem' }}>
                SGEN liquidity is experimental and early-stage. Pool pricing, liquidity depth, slippage, and availability may change. Users should always verify the official SGEN mint address before trading.
              </p>
            </div>
          </Section>

          <Section id="roadmap" eyebrow="Launch Plan" title="Built in phases, with trading access introduced carefully.">
            <p className="section-copy">
              Satoshi Genesis is designed to move from disciplined concept to structured launch with the core documents, treasury rules, and token logic in place before public expansion.
            </p>
            <div className="feature-grid" style={{ marginTop: '2.5rem' }}>
              {[
                ['Phase 1', 'Foundation', 'Finalize brand identity, token names, litepaper, whitepaper, and contract scope.'],
                ['Phase 2', 'Build', 'Deploy contracts in test environments and validate staking, emissions, burns, and treasury flow.'],
                ['Phase 3', 'Community', 'Launch website, publish docs, open channels, and prepare public-facing materials.'],
                ['Phase 4', 'Launch', 'Trade access routes through Jupiter while Raydium liquidity remains pending. Any Raydium pool link should only be shown after the active pool is confirmed.'],
              ].map(([phase, title, text]) => (
                <div key={phase} className="panel card">
                  <div className="eyebrow">{phase}</div>
                  <div className="card-title" style={{ marginTop: '0.75rem' }}>{title}</div>
                  <p className="section-copy" style={{ marginTop: '0.75rem' }}>{text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="faq" eyebrow="FAQ" title="Straight answers for first-time visitors.">
            <div className="faq-grid">
              {faq.map((item) => (
                <div key={item.q} className="panel faq-card">
                  <div className="faq-title">{item.q}</div>
                  <p className="section-copy">{item.a}</p>
                </div>
              ))}
            </div>
          </Section>

          <section className="cta">
            <div className="container">
              <motion.div {...fadeUp} className="panel cta-panel">
                <div className="cta-row">
                  <div>
                    <div className="eyebrow">Satoshi Genesis</div>
                    <h2 className="section-title" style={{ marginTop: '1rem' }}>
                      Use the network. Earn the fuel. Strengthen the core.
                    </h2>
                    <p className="section-copy">
                      A dual-token ecosystem built to separate long-term value from high-velocity utility and give both layers room to work properly.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <TradeJupiterButton>Trade on Jupiter</TradeJupiterButton>
                    <ButtonLink href={WHITEPAPER_URL} target="_blank">Read the Whitepaper</ButtonLink>
                    <ButtonLink href={DECK_URL} target="_blank" variant="outline">View the Deck</ButtonLink>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.10)', background: 'rgba(0,0,0,0.20)' }}>
          <div className="container footer-links">
            <TradeJupiterButton variant="outline">Trade on Jupiter</TradeJupiterButton>
            <ButtonLink href={WHITEPAPER_URL} target="_blank" variant="outline">Whitepaper PDF</ButtonLink>
            <ButtonLink href={DECK_URL} target="_blank" variant="outline">Pitch Deck</ButtonLink>
            <ButtonLink href={TOKENOMICS_URL} target="_blank" variant="outline">Tokenomics Graphic</ButtonLink>
          </div>
          <div className="container footer-main">
            <div className="footer-brand">
              <SatoshiGenesisLogo size={44} />
              <div>
                <div className="card-title">Satoshi Genesis</div>
                <div className="footer-sub">Built for activity. Designed for value.</div>
              </div>
            </div>
            <div className="footer-note">
              Working concept website for project presentation and planning. Raydium liquidity is not shown without a confirmed active pool. SGEN liquidity is experimental and early-stage, and users should always verify the official SGEN mint address before trading.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
