import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';
import { CopyMintButton } from './copy-mint-button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SGEN_MINT = 'DLftpBQXTvKgBAtqHbkk8sKtvCsT5WR7Ws3ULdFvjmyF';
const SFUEL_MINT = '3fgR23jdmbWMHsLsE7xn8WNEVRRhxcSLe4Hztgy3yArH';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

const SGEN = {
  name: 'Satoshi Genesis',
  symbol: 'SGEN',
  network: 'Solana Mainnet',
  mint: SGEN_MINT,
  decimals: '8',
  supply: '21,000,000',
  mintAuthority: 'Disabled',
  freezeAuthority: 'Disabled',
};

const SFUEL = {
  name: 'Satoshi Fuel',
  symbol: 'SFUEL',
  network: 'Solana Mainnet',
  mint: SFUEL_MINT,
  decimals: '8',
  supply: '2,100,000,000',
  mintAuthority: 'Disabled',
  freezeAuthority: 'Disabled',
};

type SupplyResult = {
  value: string;
  source: 'live' | 'fallback';
};

export const metadata: Metadata = {
  title: 'Token Verification | Satoshi Genesis',
  description: 'Verify the official SGEN and SFUEL Solana token mint addresses, supply, decimals, and authority status.',
};

function formatSupply(value: string, decimals: number) {
  const padded = value.padStart(decimals + 1, '0');
  const whole = padded.slice(0, -decimals) || '0';
  const fraction = padded.slice(-decimals).replace(/0+$/, '');
  const formattedWhole = Number(whole).toLocaleString('en-US');

  return fraction ? `${formattedWhole}.${fraction}` : formattedWhole;
}

async function getSfuelCurrentSupply(): Promise<SupplyResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);

  try {
    const response = await fetch(SOLANA_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'sfuel-supply',
        method: 'getTokenSupply',
        params: [SFUEL_MINT],
      }),
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`RPC responded with ${response.status}`);
    }

    const payload = await response.json();
    const tokenAmount = payload?.result?.value;

    if (!tokenAmount?.amount || typeof tokenAmount.decimals !== 'number') {
      throw new Error('RPC response did not include token supply.');
    }

    return {
      value: tokenAmount.uiAmountString || formatSupply(tokenAmount.amount, tokenAmount.decimals),
      source: 'live',
    };
  } catch {
    return {
      value: SFUEL.supply,
      source: 'fallback',
    };
  } finally {
    clearTimeout(timeout);
  }
}

function TokenRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="verification-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TokenCard({
  token,
  currentSupply,
}: {
  token: typeof SGEN;
  currentSupply?: SupplyResult;
}) {
  const solscanUrl = `https://solscan.io/token/${token.mint}`;

  return (
    <article className="panel verification-card">
      <div className="verification-card-header">
        <div>
          <div className="brand-kicker">{token.symbol}</div>
          <h2 className="verification-token-title">{token.name}</h2>
        </div>
        <div className="verification-token-badge">Official</div>
      </div>

      <div className="verification-table">
        <TokenRow label="Token Name" value={token.name} />
        <TokenRow label="Symbol" value={token.symbol} />
        <TokenRow label="Network" value={token.network} />
        <div className="verification-row verification-mint-row">
          <span>Mint Address</span>
          <code>{token.mint}</code>
        </div>
        <TokenRow label="Decimals" value={token.decimals} />
        <TokenRow label="Genesis Supply" value={token.supply} />
        {currentSupply ? (
          <div className="verification-row">
            <span>Current Supply</span>
            <strong>
              {currentSupply.value}
              <small>{currentSupply.source === 'live' ? 'Live on-chain' : 'Genesis fallback'}</small>
            </strong>
          </div>
        ) : null}
        <TokenRow label="Mint Authority" value={token.mintAuthority} />
        <TokenRow label="Freeze Authority" value={token.freezeAuthority} />
      </div>

      <div className="verification-actions">
        <CopyMintButton mint={token.mint} />
        <a className="button button-gold" href={solscanUrl} target="_blank" rel="noreferrer">
          <ExternalLink className="icon" />
          View on Solscan
        </a>
      </div>
    </article>
  );
}

export default async function TokenVerificationPage() {
  const sfuelCurrentSupply = await getSfuelCurrentSupply();

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
            <Link href="/" className="logo-wrap" aria-label="Satoshi Genesis home">
              <ShieldCheck className="verification-logo-icon" />
              <div>
                <div className="brand-kicker">Satoshi Genesis</div>
                <div className="brand-sub">Official token source of truth</div>
              </div>
            </Link>
            <nav className="nav">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/#tokens" className="nav-link">Tokens</Link>
              <Link href="/sfuel" className="nav-link">SFUEL</Link>
              <Link href="/bitcoin-layer" className="nav-link">Bitcoin Layer</Link>
            </nav>
          </div>
        </header>

        <main>
          <section className="hero verification-hero">
            <div className="container">
              <div className="eyebrow">Official Verification</div>
              <h1 className="hero-title">Token Verification</h1>
              <p className="hero-copy">
                A single source of truth for official Satoshi Genesis token information. Verify mint addresses,
                decimals, supply, and authority status before trading, swapping, or providing liquidity.
              </p>

              <div className="panel verification-notice">
                <AlertTriangle className="icon large" />
                <p>
                  Always verify token mint addresses before trading, swapping, or providing liquidity. The token mint
                  address is the official source of truth, not the token name, symbol, or logo.
                </p>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container verification-grid">
              <TokenCard token={SGEN} />
              <TokenCard token={SFUEL} currentSupply={sfuelCurrentSupply} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
