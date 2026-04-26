'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Wallet } from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { ParsedAccountData, PublicKey } from '@solana/web3.js';

const SGEN_MINT = 'DLftpBQXTvKgBAtqHbkk8sKtvCsT5WR7Ws3ULdFvjmyF';
const SGEN_DECIMALS = 8;
const mintPublicKey = new PublicKey(SGEN_MINT);

function formatTokenAmount(rawAmount: number, decimals: number) {
  const divisor = 10 ** decimals;
  return (rawAmount / divisor).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export default function HolderAccessPanel() {
  const { connection } = useConnection();
  const { publicKey, wallet, connected, connecting, connect } = useWallet();
  const { setVisible } = useWalletModal();
  const [panelOpen, setPanelOpen] = useState(false);
  const [balanceRaw, setBalanceRaw] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardMessage, setDashboardMessage] = useState<string | null>(null);

  const checkBalance = useCallback(async () => {
    if (!publicKey) {
      setBalanceRaw(null);
      setError(null);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: mintPublicKey,
      });

      const total = response.value.reduce((sum, accountInfo) => {
        const data = accountInfo.account.data as ParsedAccountData;
        const amount = data.parsed.info.tokenAmount.amount as string;
        return sum + Number.parseInt(amount, 10);
      }, 0);

      setBalanceRaw(total);
    } catch (balanceError) {
      console.error(balanceError);
      setBalanceRaw(0);
      setError('Unable to verify SGEN balance right now.');
    } finally {
      setIsChecking(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    if (wallet && !connected && !connecting) {
      void connect().catch((connectError) => {
        console.error(connectError);
      });
    }
  }, [wallet, connected, connecting, connect]);

  useEffect(() => {
    if (connected && publicKey) {
      setPanelOpen(true);
      setDashboardMessage(null);
      void checkBalance();
      return;
    }

    setBalanceRaw(null);
    setError(null);
    setDashboardMessage(null);
  }, [connected, publicKey, checkBalance]);

  const hasHolderAccess = useMemo(() => (balanceRaw ?? 0) > 0, [balanceRaw]);
  const walletAddress = publicKey?.toBase58() ?? 'Wallet not connected';
  const balanceLabel =
    connected && publicKey
      ? isChecking
        ? 'Checking...'
        : balanceRaw === null
          ? 'Not checked'
          : formatTokenAmount(balanceRaw, SGEN_DECIMALS)
      : 'Not checked';
  const accessLabel =
    connected && publicKey
      ? isChecking
        ? 'Checking SGEN balance...'
        : hasHolderAccess
          ? 'Unlocked — SGEN Holder'
          : 'Locked — SGEN required'
      : 'Locked — SGEN required';

  const handleConnectWallet = useCallback(async () => {
    setPanelOpen(true);
    setDashboardMessage(null);

    if (!wallet) {
      setVisible(true);
      return;
    }

    if (!connected) {
      try {
        await connect();
      } catch (connectError) {
        console.error(connectError);
        setError('Wallet connection was not completed.');
      }
    }
  }, [wallet, connected, connect, setVisible]);

  const handleUnlockDashboard = useCallback(() => {
    setDashboardMessage(
      hasHolderAccess
        ? 'Holder dashboard route coming soon. Your wallet passed the SGEN holder access check.'
        : 'Connect a wallet with SGEN to unlock holder-only Bitcoin Watchtower tools.',
    );
  }, [hasHolderAccess]);

  return (
    <div id="holder-access-cta" style={{ display: 'grid', gap: '0.75rem', width: '100%', maxWidth: '420px' }}>
      <button type="button" className="button button-gold" onClick={handleConnectWallet}>
        Connect Wallet
      </button>
      <button type="button" className="button button-outline" onClick={() => setPanelOpen((current) => !current)}>
        Get SGEN Access
      </button>
      {panelOpen ? (
        <div id="holder-access-panel" className="panel card" style={{ borderColor: 'rgba(251,191,36,0.24)' }}>
          <div className="logo-inline">
            <Wallet className="icon large" style={{ color: '#fde68a' }} />
            <div className="card-title">SGEN Holder Access</div>
          </div>
          <p className="section-copy" style={{ marginTop: '0.9rem' }}>
            Hold SGEN to unlock Bitcoin Watchtower holder tools.
          </p>
          <div className="token-list" style={{ marginTop: '1rem' }}>
            <div className="token-item" style={{ flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ color: '#fde68a', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
                Supported wallets
              </span>
              <strong>Solflare, Phantom</strong>
            </div>
            <div className="token-item" style={{ flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ color: '#fde68a', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
                SGEN mint
              </span>
              <strong style={{ wordBreak: 'break-all' }}>{SGEN_MINT}</strong>
            </div>
            <div className="token-item" style={{ flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ color: '#fde68a', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
                Wallet address
              </span>
              <strong style={{ wordBreak: 'break-all' }}>{walletAddress}</strong>
            </div>
            <div className="token-item" style={{ flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ color: '#fde68a', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
                SGEN balance
              </span>
              <strong>{balanceLabel}</strong>
            </div>
            <div className="token-item" style={{ flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ color: '#fde68a', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
                Access status
              </span>
              <strong>Access: {accessLabel}</strong>
            </div>
          </div>
          {wallet?.adapter?.name ? (
            <p className="section-copy" style={{ marginTop: '1rem' }}>
              Selected wallet: <strong>{wallet.adapter.name}</strong>
            </p>
          ) : null}
          {error ? (
            <p className="section-copy" style={{ marginTop: '1rem', color: '#fca5a5' }}>
              {error}
            </p>
          ) : null}
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="button button-outline" onClick={handleConnectWallet}>
              Connect Wallet
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={() => void checkBalance()}
              disabled={!connected || isChecking}
              style={!connected || isChecking ? { opacity: 0.72, cursor: 'not-allowed' } : undefined}
            >
              Check SGEN Balance
            </button>
            <button
              type="button"
              className="button button-gold"
              onClick={handleUnlockDashboard}
              disabled={!hasHolderAccess}
              style={!hasHolderAccess ? { opacity: 0.72, cursor: 'not-allowed' } : undefined}
            >
              Unlock Holder Dashboard
            </button>
          </div>
          <div className="panel-soft" style={{ padding: '1rem', marginTop: '1rem' }}>
            <div className="logo-inline">
              <ShieldCheck className="icon" style={{ color: '#fde68a' }} />
              <div className="card-title" style={{ fontSize: '1rem' }}>Holder access state</div>
            </div>
            <p className="section-copy" style={{ marginTop: '0.75rem' }}>
              If the connected wallet holds more than 0 SGEN, access changes to unlocked. If the wallet holds 0 SGEN or no token account is found, access stays locked.
            </p>
            <p className="section-copy" style={{ marginTop: '0.75rem' }}>
              {dashboardMessage || 'Holder dashboard route coming soon. Wallet connection and token balance checks are active now.'}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
