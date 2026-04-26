'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
const METEORA_POOL_URL = 'https://app.meteora.ag/dlmm/AvWn3ppCNaLDDKfN2rwY2Mhs5m34zGvM5PD18j5jTbVu';

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
    q: 'What chain is the project designed for?',
    a: 'The current working build assumption is an EVM-compatible deployment, with Base as the preferred first path for a clean launch setup.',
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
              <a href="#value-loop" className="nav-link">Value Loop</a>
              <a href="#roadmap" className="nav-link">Roadmap</a>
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
                  <ButtonLink href={METEORA_POOL_URL} target="_blank" variant="gold">
                    Open SGEN-SOL on Meteora
                  </ButtonLink>
                  <ButtonLink href={TOKENOMICS_URL} target="_blank" variant="outline">
                    View Token Design
                  </ButtonLink>
                </div>
                <div className="stats-grid">
                  <Metric value="21M" label="Fixed SGEN supply" />
                  <Metric value="2.1B" label="Programmed SFUEL emission ceiling" />
                  <Metric value="Base" label="Preferred working chain path" />
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

          <Section id="roadmap" eyebrow="Roadmap" title="Built in phases, not hype cycles.">
            <p className="section-copy">
              Satoshi Genesis is designed to move from disciplined concept to structured launch with the core documents, treasury rules, and token logic in place before public expansion.
            </p>
            <div className="feature-grid" style={{ marginTop: '2.5rem' }}>
              {[
                ['Phase 1', 'Foundation', 'Finalize brand identity, token names, litepaper, whitepaper, and contract scope.'],
                ['Phase 2', 'Build', 'Deploy contracts in test environments and validate staking, emissions, burns, and treasury flow.'],
                ['Phase 3', 'Community', 'Launch website, publish docs, open channels, and prepare public-facing materials.'],
                ['Phase 4', 'Launch', 'Deploy production contracts, seed liquidity, enable staking, and activate ecosystem participation.'],
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
                    <ButtonLink href={METEORA_POOL_URL} target="_blank" variant="gold">Open Meteora Pool</ButtonLink>
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
            <ButtonLink href={METEORA_POOL_URL} target="_blank" variant="outline">Open Meteora Pool</ButtonLink>
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
              Working concept website for project presentation and planning. Public launch materials, legal review, tax treatment, compliance, and smart contract audit should be completed before deployment.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
