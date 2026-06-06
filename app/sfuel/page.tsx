import type { Metadata } from 'next';
import Link from 'next/link';

const WHITEPAPER_URL = '/downloads/whitepaper.pdf';
const TOKEN_JSON_URL = '/token/sfuel.json';
const TOKEN_LOGO_URL = '/token/sfuel-logo-v3.png';
const SFUEL_MINT = '6mNqWXFZfL7a16rt6TBn2gY8RwAk4bq28ZdW6csUoray';
const INACTIVE_SFUEL_MINT = '3fgR23jdmbWMHsLsE7xn8WNEVRRhxcSLe4Hztgy3yArH';
const SFUEL_SOLSCAN_URL = `https://solscan.io/token/${SFUEL_MINT}`;
const INACTIVE_SFUEL_SOLSCAN_URL = `https://solscan.io/token/${INACTIVE_SFUEL_MINT}`;

const utilityPoints = [
  'SGEN remains the core ecosystem asset for staking, governance, and long-term alignment.',
  'SFUEL sits under SGEN as the utility token for participation, access, upgrades, and reward flow.',
  'The utility layer is designed to carry day-to-day movement without forcing the core asset to absorb every high-velocity action.',
];

const statusPoints = [
  `Active operational SFUEL mint: ${SFUEL_MINT}`,
  'This is the SFUEL mint currently used for wallet balances, movement, and trading activity.',
  'Other SFUEL-looking mints should not be used for current Satoshi Genesis SFUEL activity.',
];

export const metadata: Metadata = {
  title: 'SFUEL | Satoshi Genesis',
  description: 'SFUEL is the utility token under SGEN in the Satoshi Genesis ecosystem.',
};

export default function SFuelPage() {
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
              <img
                src={TOKEN_LOGO_URL}
                alt="SFUEL logo"
                width="48"
                height="48"
                style={{ borderRadius: '9999px', boxShadow: '0 0 24px rgba(251, 191, 36, 0.22)' }}
              />
              <div>
                <div className="brand-kicker">Satoshi Fuel</div>
                <div className="brand-sub">Utility token under the SGEN ecosystem</div>
              </div>
            </div>
            <nav className="nav">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/#tokens" className="nav-link">Token Architecture</Link>
              <Link href="/#tokenomics" className="nav-link">Tokenomics</Link>
              <a href={WHITEPAPER_URL} className="button button-outline" target="_blank" rel="noreferrer">
                Read Whitepaper
              </a>
            </nav>
          </div>
        </header>

        <main>
          <section className="hero">
            <div className="container hero-grid">
              <div>
                <div className="eyebrow">SFUEL Utility Layer</div>
                <h1 className="hero-title">
                  The utility token <span className="gold">under SGEN.</span>
                </h1>
                <p className="hero-copy">
                  SFUEL is the working utility layer of the Satoshi Genesis ecosystem. SGEN remains the core asset for staking,
                  governance, premium rights, and long-term alignment. SFUEL sits beneath that core to power participation,
                  access, upgrades, rewards, and ecosystem movement.
                </p>
                <div className="hero-actions">
                  <a className="button button-gold" href={TOKEN_JSON_URL} target="_blank" rel="noreferrer">
                    Open SFUEL Metadata
                  </a>
                  <a className="button button-outline" href={SFUEL_SOLSCAN_URL} target="_blank" rel="noreferrer">
                    View Mint on Solscan
                  </a>
                  <a className="button button-outline" href={TOKEN_LOGO_URL} target="_blank" rel="noreferrer">
                    Open Logo Path
                  </a>
                  <a className="button button-outline" href={WHITEPAPER_URL} target="_blank" rel="noreferrer">
                    Whitepaper
                  </a>
                </div>
                <div className="stats-grid">
                  <div className="panel metric">
                    <div className="metric-value">SGEN</div>
                    <div className="metric-label">Core asset layer</div>
                  </div>
                  <div className="panel metric">
                    <div className="metric-value">SFUEL</div>
                    <div className="metric-label">Utility token layer</div>
                  </div>
                  <div className="panel metric">
                    <div className="metric-value">Mainnet</div>
                    <div className="metric-label">Active mint selected</div>
                  </div>
                </div>
              </div>

              <div className="panel hero-panel">
                <div className="panel-soft token-hero gold-hero">
                  <div className="brand-kicker">Positioning</div>
                  <div className="token-title" style={{ marginTop: '0.75rem' }}>Utility under the core</div>
                  <p className="section-copy" style={{ marginTop: '0.75rem' }}>
                    SFUEL is not the governance anchor. It is the utility token designed to support action, circulation, and user flow
                    under the SGEN-led structure.
                  </p>
                </div>
                <div className="panel-soft token-hero">
                  <div className="brand-kicker" style={{ color: '#94a3b8' }}>Current status</div>
                  <div className="token-title" style={{ marginTop: '0.75rem' }}>Active mint selected</div>
                  <p className="section-copy" style={{ marginTop: '0.75rem' }}>
                    SFUEL currently points to the mint where wallet balances, movement, and trading activity already exist.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="eyebrow">How SFUEL fits</div>
              <h2 className="section-title">A utility token designed to move underneath SGEN.</h2>
              <p className="section-copy">
                The Satoshi Genesis structure separates long-term alignment from high-velocity ecosystem use. That means SGEN can stay
                focused on core value, while SFUEL handles the day-to-day utility layer.
              </p>
              <div className="card-grid" style={{ marginTop: '2rem' }}>
                {utilityPoints.map((point) => (
                  <div key={point} className="panel card">
                    <div className="feature-title">SFUEL role</div>
                    <p className="section-copy">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="eyebrow">Launch status</div>
              <h2 className="section-title">Active SFUEL mint selected for current trading activity.</h2>
              <p className="section-copy">
                Some wallets may show more than one token named Satoshi Fuel / SFUEL. Always verify the mint address before using,
                sending, swapping, or referencing SFUEL.
              </p>
              <div className="token-list" style={{ marginTop: '1.5rem' }}>
                {statusPoints.map((point) => (
                  <div key={point} className="token-item">
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section sfuel-warning-section">
            <div className="container">
              <div className="panel sfuel-warning-panel">
                <div>
                  <div className="eyebrow">Duplicate SFUEL warning</div>
                  <h2 className="section-title" style={{ marginTop: '1rem' }}>
                    If your wallet shows two SFUEL tokens, use the active operational mint.
                  </h2>
                  <p className="section-copy">
                    The active SFUEL mint is the one where the current wallet balances, movement, and trading work have already been done.
                    Check the mint address, not just the token name or logo.
                  </p>
                </div>
                <div className="sfuel-mint-grid">
                  <div className="sfuel-mint-card sfuel-mint-official">
                    <div className="brand-kicker">Active SFUEL</div>
                    <strong>Use this mint</strong>
                    <code>{SFUEL_MINT}</code>
                    <span>Current trading and wallet activity / 1B supply / 6 decimals</span>
                    <a href={SFUEL_SOLSCAN_URL} target="_blank" rel="noreferrer">View active mint on Solscan</a>
                  </div>
                  <div className="sfuel-mint-card sfuel-mint-rejected">
                    <div className="brand-kicker">Inactive SFUEL</div>
                    <strong>Do not use for current activity</strong>
                    <code>{INACTIVE_SFUEL_MINT}</code>
                    <span>Unused for current trading and wallet movement</span>
                    <a href={INACTIVE_SFUEL_SOLSCAN_URL} target="_blank" rel="noreferrer">View inactive mint on Solscan</a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="cta">
            <div className="container">
              <div className="panel cta-panel">
                <div className="cta-row">
                  <div>
                    <div className="eyebrow">Website assets</div>
                    <h2 className="section-title" style={{ marginTop: '1rem' }}>
                      Active SFUEL metadata and branding are ready.
                    </h2>
                    <p className="section-copy">
                      Use the active SFUEL mint and hosted metadata only. Other SFUEL-looking mints should not be used for current activity.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <a className="button button-gold" href={TOKEN_JSON_URL} target="_blank" rel="noreferrer">
                      View /token/sfuel.json
                    </a>
                    <a className="button button-outline" href={TOKEN_LOGO_URL} target="_blank" rel="noreferrer">
                      View /token/sfuel-logo-v3.png
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
