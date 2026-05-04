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

function formatCountdown(remainingMs: number) {
  if (remainingMs <= 0) return 'Ready now';

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}

export function SgenHolderDashboard() {
  const { connected, publicKey } = useWallet();
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  const [accessState, setAccessState] = useState<HolderAccessState>('checking');
  const [walletAddress, setWalletAddress] = useState('');
  const [sgenBalance, setSgenBalance] = useState('0');
  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null);
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
      setLastClaimTime(null);
      setClaimMessage('');
      return;
    }

    const storedClaimTime = window.localStorage.getItem(getClaimStorageKey(walletAddress));
    const parsedClaimTime = storedClaimTime ? Number(storedClaimTime) : 0;

    setLastClaimTime(Number.isFinite(parsedClaimTime) && parsedClaimTime > 0 ? parsedClaimTime : null);
    setClaimMessage('');
    setNow(Date.now());
  }, [walletAddress, accessState]);

  useEffect(() => {
    if (!lastClaimTime) return;

    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, [lastClaimTime]);

  if (!connected || !publicKey || !portalElement) return null;

  const statusLabel = getStatusLabel(accessState);
  const holderZoneVisible = accessState === 'granted';
  const nextClaimTime = lastClaimTime ? lastClaimTime + CLAIM_INTERVAL_MS : 0;
  const claimRemainingMs = Math.max(0, nextClaimTime - now);
  const canClaimRewards = holderZoneVisible && claimRemainingMs <= 0;
  const claimCountdown = formatCountdown(claimRemainingMs);
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
    window.localStorage.setItem(getClaimStorageKey(walletAddress), claimTime.toString());
    setLastClaimTime(claimTime);
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

          {holderZoneVisible ? (
            <div className={styles.zone}>
              <div className={styles.header}>
                <div>
                  <div className="brand-kicker">Holder Only</div>
                  <h2 className={styles.title}>SGEN Holder Zone</h2>
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
