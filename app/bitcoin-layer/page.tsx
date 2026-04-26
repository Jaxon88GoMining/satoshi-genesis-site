import type { Metadata } from 'next';
import type { ComponentType, ReactNode } from 'react';
import {
  ArrowRight,
  BellRing,
  Bitcoin,
  Blocks,
  Bot,
  Clock3,
  FileText,
  Home,
  Layers,
  LineChart,
  Radar,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Satoshi Genesis Bitcoin Layer',
  description: 'A Solana-native token ecosystem anchored to Bitcoin\'s public ledger.',
};

const WHITEPAPER_URL = '/downloads/whitepaper.pdf';
const HOME_URL = '/';
const TOKEN_URL = 'https://solscan.io/token/DLftpBQXTvKgBAtqHbkk8sKtvCsT5WR7Ws3ULdFvjmyF';

const projectFacts = [
  ['Token', 'Satoshi Genesis'],
  ['Symbol', 'SGEN'],
  ['Network', 'Solana mainnet'],
  ['Mint', 'DLftpBQXTvKgBAtqHbkk8sKtvCsT5WR7Ws3ULdFvjmyF'],
  ['Supply', '21,000,000'],
  ['Decimals', '8'],
  ['Mint authority', 'disabled'],
  ['Freeze authority', 'disabled'],
] as const;

const watchtowerCards = [
  {
    icon: Wallet,
    title: 'Dormant wallet monitoring',
    text: 'Track long-silent Bitcoin addresses and highlight reactivation events that matter to market structure and public-chain context.',
  },
  {
    icon: BellRing,
    title: 'Whale movement alerts',
    text: 'Surface large public Bitcoin transfers that may signal treasury motion, custody changes, or meaningful holder behavior.',
  },
  {
    icon: Blocks,
    title: 'Miner flow tracking',
    text: 'Watch miner-linked wallet activity and public outflows to better understand supply pressure and distribution patterns.',
  },
  {
    icon: LineChart,
    title: 'Exchange inflow / outflow signals',
    text: 'Monitor public exchange-facing Bitcoin flows to support a clearer read on potential liquidity, selling pressure, or accumulation.',
  },
  {
    icon: Clock3,
    title: 'Ancient Bitcoin movement alerts',
    text: 'Flag exceptionally old Bitcoin movement when legacy coins become active again on the public ledger.',
  },
  {
    icon: Bot,
    title: 'AI-generated Bitcoin movement summaries',
    text: 'Turn raw public-chain events into readable briefings that explain what moved, why it matters, and what deserves follow-up.',
  },
] as const;

const utilityCards = [
  {
    icon: Radar,
    title: 'Access to advanced Bitcoin dashboards',
    text: 'Use SGEN to unlock deeper monitoring views, summary panels, and public-chain intelligence layouts built around Bitcoin movement.',
  },
  {
    icon: Wallet,
    title: 'Watchlists',
    text: 'Maintain curated Bitcoin watchlists for addresses, entities, or event classes that matter to your research or decision-making.',
  },
  {
    icon: BellRing,
    title: 'Alerts',
    text: 'Receive signal-driven notifications when public Bitcoin flows match the movement patterns you care about most.',
  },
  {
    icon: FileText,
    title: 'Monthly reports',
    text: 'Generate recurring Bitcoin movement reports that summarize major public-ledger changes, patterns, and notable activity.',
  },
  {
    icon: Bot,
    title: 'AI blockchain summaries',
    text: 'Use SGEN-linked features to access AI-assisted summaries that explain Bitcoin movement in plain language without hype or guesswork.',
  },
  {
    icon: Layers,
    title: 'Future holder-only tools',
    text: 'Prepare for restricted dashboards, proof tools, and higher-tier Bitcoin intelligence utilities reserved for SGEN holders.',
  },
] as const;

type SectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
};

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'gold';
  target?: '_blank';
};

type InfoCardProps = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
};

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
            <linearGradient id="sgenGoldBitcoinLayer" x1="12" y1="8" x2="82" y2="92" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE68A" />
              <stop offset="0.45" stopColor="#FBBF24" />
              <stop offset="1" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="42" stroke="url(#sgenGoldBitcoinLayer)" strokeWidth="4" />
          <circle cx="50" cy="50" r="33" stroke="url(#sgenGoldBitcoinLayer)" strokeOpacity="0.9" strokeWidth="2.5" />
          <path d="M50 18V30" stroke="url(#sgenGoldBitcoinLayer)" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 70V82" stroke="url(#sgenGoldBitcoinLayer)" strokeWidth="4" strokeLinecap="round" />
          <path
            d="M61.5 34.5C58.8 31.9 54.8 30.4 49.6 30.4C42.3 30.4 37.8 34.1 37.8 39.5C37.8 44.6 41.6 47.2 49.4 48.7C56.5 50 60.2 52 60.2 56.7C60.2 61.9 55.7 65.6 48.8 65.6C43.1 65.6 38.6 63.7 35.2 60.2"
            stroke="url(#sgenGoldBitcoinLayer)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M49 24.5V30.5" stroke="url(#sgenGoldBitcoinLayer)" strokeWidth="5" strokeLinecap="round" />
          <path d="M49 65.5V75.5" stroke="url(#sgenGoldBitcoinLayer)" strokeWidth="5" strokeLinecap="round" />
          <circle cx="50" cy="50" r="46" stroke="url(#sgenGoldBitcoinLayer)" strokeOpacity="0.25" strokeWidth="1.2" strokeDasharray="2.5 6.5" />
        </svg>
      </div>
      {wordmark ? (
        <div>
          <div className="wordmark-title">Satoshi Genesis</div>
          <div className="wordmark-sub">Bitcoin Layer</div>
        </div>
      ) : null}
    </div>
  );
}

function ButtonLink({ href, children, variant = 'primary', target }: ButtonLinkProps) {
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

function Section({ id, eyebrow, title, children }: SectionProps) {
  return (
    <section id={id} className="section">
      <div className="container">
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h2 className="section-title">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function InfoCard({ icon: Icon, title, text }: InfoCardProps) {
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

export default function BitcoinLayerPage() {
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
                <div className="brand-sub">Bitcoin Layer</div>
              </div>
            </div>
            <nav className="nav">
              <a href={HOME_URL} className="nav-link">Home</a>
              <a href="/bitcoin-layer" className="nav-link" style={{ color: '#fde68a' }}>Bitcoin Layer</a>
              <a href="#watchtower" className="nav-link">Watchtower</a>
              <a href="#proof" className="nav-link">Genesis Proof</a>
              <ButtonLink href={WHITEPAPER_URL} target="_blank">Read Whitepaper</ButtonLink>
            </nav>
          </div>
        </header>

        <main>
          <section className="hero">
            <div className="container hero-grid">
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <SatoshiGenesisLogo size={96} wordmark />
                </div>
                <div className="eyebrow">Bitcoin Layer</div>
                <h1 className="hero-title">A Solana-native token ecosystem anchored to Bitcoin&apos;s public ledger.</h1>
                <p className="hero-copy">
                  Satoshi Genesis reads Bitcoin, tracks Bitcoin, explains Bitcoin movement, and prepares a permanent Bitcoin-side proof of the SGEN launch.
                </p>
                <div className="hero-actions">
                  <ButtonLink href={TOKEN_URL} target="_blank">
                    View SGEN Token <ArrowRight className="icon" />
                  </ButtonLink>
                  <ButtonLink href={WHITEPAPER_URL} target="_blank" variant="gold">
                    Read Whitepaper
                  </ButtonLink>
                  <ButtonLink href={HOME_URL} variant="outline">
                    Return Home
                  </ButtonLink>
                </div>
                <div className="stats-grid">
                  <div className="panel metric">
                    <div className="metric-value">Solana</div>
                    <div className="metric-label">Execution layer</div>
                  </div>
                  <div className="panel metric">
                    <div className="metric-value">Bitcoin</div>
                    <div className="metric-label">Historical proof anchor</div>
                  </div>
                  <div className="panel metric">
                    <div className="metric-value">OP_RETURN / Ordinal</div>
                    <div className="metric-label">Planned proof record path</div>
                  </div>
                </div>
              </div>

              <div className="panel hero-panel">
                <div className="panel-soft token-hero gold-hero">
                  <div className="logo-inline">
                    <Bitcoin className="icon large" style={{ color: '#fde68a' }} />
                    <div className="card-title">Bitcoin-Anchored Identity</div>
                  </div>
                  <p className="section-copy" style={{ marginTop: '0.75rem' }}>
                    SGEN lives on Solana mainnet. Bitcoin acts as the proof and historical anchor. The project can record its identity using a Bitcoin OP_RETURN transaction or Bitcoin Ordinal certificate without claiming to be a Bitcoin-native token.
                  </p>
                </div>
                <div className="panel-soft" style={{ padding: '1.25rem', marginTop: '1rem' }}>
                  <div className="eyebrow">Launch facts</div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '0.85rem',
                      marginTop: '1rem',
                    }}
                  >
                    {projectFacts.map(([label, value]) => (
                      <div key={label} className="token-item" style={{ flexDirection: 'column', gap: '0.45rem' }}>
                        <span style={{ color: '#fde68a', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.16em' }}>{label}</span>
                        <strong style={{ wordBreak: 'break-all' }}>{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Section
            id="identity"
            eyebrow="Bitcoin-Anchored Identity"
            title="Solana-native execution with Bitcoin as the long-term public proof layer."
          >
            <p className="section-copy">
              Satoshi Genesis is a Solana mainnet token ecosystem. Bitcoin is not presented as the execution network for SGEN, and SGEN is not presented as a Bitcoin token. Instead, Bitcoin serves as the deepest public ledger reference point for historical anchoring, transparent proof, and durable project identity.
            </p>
            <div className="card-grid" style={{ marginTop: '2rem' }}>
              <div className="panel card">
                <div className="logo-inline">
                  <Layers className="icon large" style={{ color: '#fde68a' }} />
                  <div className="card-title">What anchors the identity</div>
                </div>
                <p className="section-copy" style={{ marginTop: '0.9rem' }}>
                  The Bitcoin Layer gives Satoshi Genesis a public historical anchor that can be referenced long after launch, independent of short-cycle market narratives or private databases.
                </p>
              </div>
              <div className="panel card">
                <div className="logo-inline">
                  <FileText className="icon large" style={{ color: '#fde68a' }} />
                  <div className="card-title">How proof can be recorded</div>
                </div>
                <p className="section-copy" style={{ marginTop: '0.9rem' }}>
                  The project can record its identity using a Bitcoin OP_RETURN transaction or a Bitcoin Ordinal certificate so the launch record has a durable public reference point on Bitcoin itself.
                </p>
              </div>
            </div>
          </Section>

          <Section id="watchtower" eyebrow="Bitcoin Watchtower" title="Public Bitcoin monitoring tools designed for future intelligence dashboards.">
            <p className="section-copy">
              The Bitcoin Watchtower is where Satoshi Genesis can surface public-chain monitoring, entity watchlists, and readable summaries built around Bitcoin movement. Live data will be added in a future version.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                marginTop: '2.5rem',
              }}
            >
              {watchtowerCards.map((card) => (
                <InfoCard key={card.title} {...card} />
              ))}
            </div>
            <div className="panel card" style={{ marginTop: '1.5rem', borderColor: 'rgba(251,191,36,0.25)' }}>
              <div className="logo-inline">
                <Radar className="icon large" style={{ color: '#fde68a' }} />
                <div className="card-title">Future data layer</div>
              </div>
              <p className="section-copy" style={{ marginTop: '0.9rem' }}>
                Initial release focuses on structure, intent, and product direction. Real-time public-chain feeds, dashboards, and alert logic will be added in a future version of the Bitcoin Layer.
              </p>
            </div>
          </Section>

          <Section id="proof" eyebrow="Genesis Proof" title="A permanent Bitcoin-side proof record is being prepared for the SGEN launch.">
            <p className="section-copy">
              Satoshi Genesis will prepare a Bitcoin-side proof record so the project can reference a durable, public, time-anchored artifact tied to the launch identity.
            </p>
            <div className="card-grid" style={{ marginTop: '2.5rem' }}>
              {[
                ['OP_RETURN transaction ID', 'Coming soon'],
                ['Ordinal certificate', 'Coming soon'],
                ['Bitcoin proof document', 'Coming soon'],
              ].map(([label, value]) => (
                <div key={label} className="panel card" style={{ borderColor: 'rgba(251,191,36,0.18)' }}>
                  <div className="eyebrow">{label}</div>
                  <div className="card-title" style={{ marginTop: '0.9rem' }}>{value}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="utility" eyebrow="SGEN Utility Layer" title="SGEN can unlock Bitcoin intelligence features without pretending to be Bitcoin-native.">
            <p className="section-copy">
              The Bitcoin Layer is a utility direction for SGEN. It creates a place where token holders can access public-chain dashboards, monitoring tools, and future research utilities built around Bitcoin data and proof records.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                marginTop: '2.5rem',
              }}
            >
              {utilityCards.map((card) => (
                <InfoCard key={card.title} {...card} />
              ))}
            </div>
          </Section>

          <Section id="safety" eyebrow="Safety & Integrity Statement" title="Public-chain monitoring only. No false promises.">
            <div
              className="panel card"
              style={{
                borderColor: 'rgba(251,191,36,0.28)',
                background: 'linear-gradient(135deg, rgba(253,224,71,0.12), rgba(249,115,22,0.06))',
              }}
            >
              <div className="logo-inline">
                <ShieldCheck className="icon large" style={{ color: '#fde68a' }} />
                <div className="card-title">Safety & Integrity Statement</div>
              </div>
              <p className="section-copy" style={{ marginTop: '1rem' }}>
                Satoshi Genesis does not hack wallets, brute-force private keys, or promise recovery of Bitcoin that users do not control. The Bitcoin Layer is for public blockchain intelligence, proof anchoring, education, and transparent monitoring only.
              </p>
            </div>
          </Section>

          <section className="cta">
            <div className="container">
              <div className="panel cta-panel">
                <div className="cta-row">
                  <div>
                    <div className="eyebrow">Call to Action</div>
                    <h2 className="section-title" style={{ marginTop: '1rem' }}>
                      Explore SGEN, track the Bitcoin Layer roadmap, and return to the main site anytime.
                    </h2>
                    <p className="section-copy">
                      This page frames Satoshi Genesis as a Solana-native ecosystem that reads Bitcoin publicly, explains Bitcoin movement clearly, and prepares a permanent Bitcoin-side proof record for launch identity.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <ButtonLink href={TOKEN_URL} target="_blank" variant="gold">View SGEN Token</ButtonLink>
                    <ButtonLink href={WHITEPAPER_URL} target="_blank">Read Whitepaper</ButtonLink>
                    <ButtonLink href={HOME_URL} variant="outline">Return Home</ButtonLink>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.10)', background: 'rgba(0,0,0,0.20)' }}>
          <div className="container footer-links">
            <ButtonLink href={TOKEN_URL} target="_blank" variant="outline">View SGEN Token</ButtonLink>
            <ButtonLink href={WHITEPAPER_URL} target="_blank" variant="outline">Whitepaper PDF</ButtonLink>
            <ButtonLink href={HOME_URL} variant="outline">Return Home</ButtonLink>
          </div>
          <div className="container footer-main">
            <div className="footer-brand">
              <SatoshiGenesisLogo size={44} />
              <div>
                <div className="card-title">Satoshi Genesis Bitcoin Layer</div>
                <div className="footer-sub">Public-chain intelligence and Bitcoin proof anchoring.</div>
              </div>
            </div>
            <div className="footer-note">
              SGEN is a Solana mainnet token. The Bitcoin Layer is a monitoring and proof framework built around public blockchain data, future dashboards, and permanent proof anchoring records.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
