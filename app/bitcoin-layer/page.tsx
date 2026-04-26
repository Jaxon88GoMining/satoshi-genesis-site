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
  Layers,
  LineChart,
  Lock,
  Radar,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import HolderAccessPanel from './holder-access-panel';

export const metadata: Metadata = {
  title: 'Satoshi Genesis Bitcoin Layer',
  description: 'A Solana-native token ecosystem anchored to Bitcoin\'s public ledger.',
};

const WHITEPAPER_URL = '/downloads/whitepaper.pdf';
const HOME_URL = '/';
const TOKEN_URL = 'https://solscan.io/token/DLftpBQXTvKgBAtqHbkk8sKtvCsT5WR7Ws3ULdFvjmyF';
const SGEN_MINT = 'DLftpBQXTvKgBAtqHbkk8sKtvCsT5WR7Ws3ULdFvjmyF';

const projectFacts = [
  ['Token', 'Satoshi Genesis'],
  ['Symbol', 'SGEN'],
  ['Network', 'Solana mainnet'],
  ['Mint', SGEN_MINT],
  ['Supply', '21,000,000'],
  ['Decimals', '8'],
  ['Mint authority', 'disabled'],
  ['Freeze authority', 'disabled'],
] as const;

const accessTiers = [
  {
    title: 'Free',
    badge: 'Open access',
    accent: 'rgba(255,255,255,0.10)',
    features: [
      'Public Bitcoin Layer overview',
      'Basic Bitcoin education',
      'Sample whale movement cards',
      'Sample dormant wallet cards',
    ],
  },
  {
    title: 'SGEN Holder',
    badge: 'Live holder check',
    accent: 'rgba(251,191,36,0.24)',
    features: [
      'Whale movement alerts',
      'Dormant wallet watchlist',
      'Ancient Bitcoin movement alerts',
      'AI Bitcoin movement summaries',
      'Holder-only reports',
    ],
  },
  {
    title: 'Watchtower Pro',
    badge: 'Mock premium tier',
    accent: 'rgba(249,115,22,0.26)',
    features: [
      'Exchange inflow/outflow signals',
      'Miner flow tracking',
      'Custom wallet watchlists',
      'Priority alerts',
      'Monthly Bitcoin intelligence report',
      'Future API access',
    ],
  },
] as const;

const lockedFeatures = [
  {
    icon: BellRing,
    title: 'Whale Alerts',
    text: 'Follow oversized Bitcoin transfers with readable summaries and future alert logic for meaningful wallet movement.',
  },
  {
    icon: Wallet,
    title: 'Dormant Wallet Alerts',
    text: 'Watch long-silent Bitcoin addresses and surface reactivation signals when historic holdings wake up on the public ledger.',
  },
  {
    icon: Clock3,
    title: 'Ancient BTC Movement Alerts',
    text: 'Highlight especially old Bitcoin movement so rare legacy activity can be reviewed in context instead of missed in noise.',
  },
  {
    icon: LineChart,
    title: 'Exchange Flow Signals',
    text: 'Track public inflow and outflow patterns linked to exchange clusters for a cleaner read on pressure and positioning.',
  },
  {
    icon: Blocks,
    title: 'Miner Flow Tracker',
    text: 'Monitor miner-linked wallet behavior and transfer patterns to better understand public supply-side movement.',
  },
  {
    icon: Bot,
    title: 'AI Bitcoin Summary Engine',
    text: 'Turn raw public-chain events into plain-language briefings that explain what moved, when it moved, and why it matters.',
  },
] as const;

const sampleFeed = [
  {
    label: 'Ancient Wallet Activity',
    title: '12.4 year dormant wallet moved 50 BTC',
    text: 'Demo alert showing how long-silent public Bitcoin movement can be surfaced and summarised for users.',
  },
  {
    label: 'Whale Transfer',
    title: '1,250 BTC moved between unknown wallets',
    text: 'Demo alert showing a large public transfer moving between two unidentified counterparties.',
  },
  {
    label: 'Exchange Inflow Signal',
    title: '340 BTC sent to major exchange cluster',
    text: 'Demo alert showing a public exchange-facing movement event that could matter to liquidity interpretation.',
  },
  {
    label: 'Miner Flow',
    title: 'Mining wallet transferred 22 BTC',
    text: 'Demo alert showing miner-linked public wallet movement for monitoring and future summary tools.',
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

type LockedCardProps = {
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

function LockedFeatureCard({ icon: Icon, title, text }: LockedCardProps) {
  return (
    <div className="panel card" style={{ borderColor: 'rgba(251,191,36,0.18)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
        <div className="feature-icon">
          <Icon className="icon" />
        </div>
        <div className="token-badge" style={{ color: '#fde68a', borderColor: 'rgba(251,191,36,0.20)' }}>
          <Lock className="inline-icon" /> Locked
        </div>
      </div>
      <div className="feature-title" style={{ marginTop: '0.4rem' }}>{title}</div>
      <p className="section-copy">{text}</p>
      <div className="token-item" style={{ marginTop: '1rem', justifyContent: 'center', color: '#fde68a' }}>
        Locked — SGEN Holder / Pro Access
      </div>
      <div style={{ marginTop: '1rem' }}>
        <ButtonLink href="#holder-access-cta" variant="outline">Unlock Access</ButtonLink>
      </div>
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
              <a href="/watchtower" className="nav-link" style={{ color: '#fde68a' }}>Bitcoin Layer</a>
              <a href="#access" className="nav-link">Access</a>
              <a href="#locked" className="nav-link">Locked Tools</a>
              <a href="#feed" className="nav-link">Demo Feed</a>
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
                    <div className="metric-value">Live Holder Check</div>
                    <div className="metric-label">Wallet connection and SGEN balance verification</div>
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

          <Section id="access" eyebrow="Bitcoin Watchtower Access" title="A front-end access model for Bitcoin intelligence, alerts, and future holder tools.">
            <p className="section-copy">
              This Phase 4 layout combines the access mockup with a real Solana wallet connection and SGEN balance check. Live Bitcoin movement feeds will still be added in a future version.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginTop: '2.5rem',
              }}
            >
              {accessTiers.map((tier) => (
                <div key={tier.title} className="panel card" style={{ borderColor: tier.accent }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                    <div className="card-title">{tier.title}</div>
                    <div className="token-badge" style={{ borderColor: tier.accent, color: '#fde68a' }}>{tier.badge}</div>
                  </div>
                  <div className="token-list">
                    {tier.features.map((feature) => (
                      <div key={feature} className="token-item">
                        <ArrowRight className="inline-icon" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="locked" eyebrow="Locked Feature Cards" title="Premium Watchtower modules shown as SGEN-gated and Pro-gated product mockups.">
            <p className="section-copy">
              These cards preview future gated Watchtower modules. The holder gate now performs a live SGEN balance check, while premium payments and Pro billing remain out of scope for this phase.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
                marginTop: '2.5rem',
              }}
            >
              {lockedFeatures.map((feature) => (
                <LockedFeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </Section>

          <Section id="feed" eyebrow="Sample Alert Feed" title="Demo movement cards showing how Watchtower alerts can look before live data is connected.">
            <div className="panel card" style={{ borderColor: 'rgba(251,191,36,0.25)' }}>
              <div className="eyebrow">Demo data — live tracking coming soon</div>
              <p className="section-copy" style={{ marginTop: '0.9rem' }}>
                These cards use fake example events for layout and product design only. They do not represent live Bitcoin monitoring or real-time market intelligence yet.
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
                marginTop: '1.5rem',
              }}
            >
              {sampleFeed.map((item) => (
                <div key={item.title} className="panel card">
                  <div className="eyebrow">{item.label}</div>
                  <div className="card-title" style={{ marginTop: '0.85rem' }}>{item.title}</div>
                  <p className="section-copy" style={{ marginTop: '0.85rem' }}>{item.text}</p>
                </div>
              ))}
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
              <p className="section-copy" style={{ marginTop: '1rem' }}>
                The Watchtower monitors public blockchain data only. It does not access private wallets, recover lost Bitcoin, brute-force keys, or provide financial advice.
              </p>
            </div>
          </Section>

          <section className="cta">
            <div className="container">
              <div className="panel cta-panel">
                <div className="cta-row">
                  <div>
                    <div className="eyebrow">Monetisation CTA</div>
                    <h2 className="section-title" style={{ marginTop: '1rem' }}>
                      Unlock the Satoshi Genesis Bitcoin Watchtower
                    </h2>
                    <p className="section-copy">
                      Hold SGEN or upgrade to Watchtower Pro to access advanced Bitcoin movement intelligence, alert feeds, watchlists, and reports.
                    </p>
                  </div>
                  <HolderAccessPanel />
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
              SGEN is a Solana mainnet token. The Bitcoin Layer is a monitoring and proof framework built around public blockchain data, future dashboards, product access mockups, and permanent proof anchoring records.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
