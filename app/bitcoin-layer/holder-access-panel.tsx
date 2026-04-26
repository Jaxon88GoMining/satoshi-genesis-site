'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Wallet } from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { ParsedAccountData, PublicKey } from '@solana/web3.js';

const SGEN_MINT = 'DLftpBQXTvKgBAtqHbkk8sKtvCsT5WR7Ws3ULdFvjmyF';
const SGEN_DECIMALS = 8;
const SOLANA_NETWORK_LABEL = 'mainnet-beta';
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
const balanceFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: SGEN_DECIMALS,
});

type CheckStatus = 'idle' | 'checking' | 'success' | 'error';

type DebugState = {
  network: string;
  tokenAccountsFound: number;
  matchingSgenAccounts: number;
  detectedSgenBalance: number;
  lastCheckStatus: CheckStatus;
};

const defaultDebugState: DebugState = {
  network: SOLANA_NETWORK_LABEL,
  tokenAccountsFound: 0,
  matchingSgenAccounts: 0,
  detectedSgenBalance: 0,
  lastCheckStatus: 'idle',
};

function formatTokenAmount(amount: number) {
  return balanceFormatter.format(amount);
}

export default function HolderAccessPanel() {
  const { connection } = useConnection();
  const { publicKey, wallet, connected, connecting, connect } = useWallet();
  const { setVisible } = useWalletModal();
  const [panelOpen, setPanelOpen] = useState(true);
  const [balanceUiAmount, setBalanceUiAmount] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardMessage, setDashboardMessage] = useState<string | null>(null);
  const [debugState, setDebugState] = useState<DebugState>(defaultDebugState);

  const checkBalance = useCallback(async () => {
    if (!publicKey) {
      setBalanceUiAmount(null);
      setError(null);
      setDebugState(defaultDebugState);
      return;
    }

    setIsChecking(true);
    setError(null);
    setDebugState((current) => ({ ...current, lastCheckStatus: 'checking' }));

    console.log('[SGEN access] network', SOLANA_NETWORK_LABEL);
    console.log('[SGEN access] connected wallet address', publicKey.toBase58());

    try {
      const [tokenProgramAccounts, token2022Accounts] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        }),
        connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_2022_PROGRAM_ID,
        }),
      ]);

      const allAccounts = [...tokenProgramAccounts.value, ...token2022Accounts.value];
      console.log('[SGEN access] token accounts found', allAccounts.length);

      const matchingAccounts = allAccounts.filter((accountInfo) => {
        const accountData = accountInfo.account.data;

        if (typeof accountData !== 'object' || !('parsed' in accountData)) {
          return false;
        }

        const parsedData = (accountData as ParsedAccountData).parsed.info as {
          mint?: string;
        };

        return parsedData.mint === SGEN_MINT;
      });

      console.log('[SGEN access] matching SGEN accounts', matchingAccounts.length);

      const total = matchingAccounts.reduce((sum, accountInfo, index) => {
        const accountData = accountInfo.account.data as ParsedAccountData;
        const parsedInfo = accountData.parsed.info as {
          tokenAmount?: {
            uiAmount?: number | null;
          };
        };
        const uiAmount = parsedInfo.tokenAmount?.uiAmount ?? 0;

        console.log('[SGEN access] raw tokenAmount.uiAmount', index, uiAmount);

        return sum + uiAmount;
      }, 0);

      console.log('[SGEN access] total SGEN balance', total);

      setBalanceUiAmount(total);
      setDebugState({
        network: SOLANA_NETWORK_LABEL,
        tokenAccountsFound: allAccounts.length,
        matchingSgenAccounts: matchingAccounts.length,
        detectedSgenBalance: total,
        lastCheckStatus: 'success',
      });
    } catch (balanceError) {
      console.error('[SGEN access] balance check failed', balanceError);
      setBalanceUiAmount(null);
      setError('Unable to verify SGEN balance.');
      setDebugState((current) => ({
        ...current,
        network: SOLANA_NETWORK_LABEL,
        lastCheckStatus: 'error',
      }));
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

    setBalanceUiAmount(null);
    setError(null);
    setDashboardMessage(null);
    setDebugState(defaultDebugState);
  }, [connected, publicKey, checkBalance]);

  const hasHolderAccess = useMemo(() => (balanceUiAmount ?? 0) > 0, [balanceUiAmount]);
  const walletAddress = publicKey?.toBase58() ?? 'Wallet not connected';
  const balanceLabel =
    connected && publicKey
      ? isChecking
        ? 'Checking...'
        : balanceUiAmount === null
          ? 'Not checked'
          : formatTokenAmount(balanceUiAmount)
      : 'Not checked';
  const accessLabel =
    connected && publicKey
      ? isChecking
        ? 'Checking SGEN balance...'
        : balanceUiAmount !== null
          ? hasHolderAccess
            ? 'Unlocked — SGEN Holder'
            : 'Locked — SGEN required'
          : 'Balance check unavailable'
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
      <button type="button" className="button button-outline" onClick={() => setPanelOpen(true)}>
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
                Network
              </span>
              <strong>{SOLANA_NETWORK_LABEL}</strong>
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
          <div className="panel-soft" style={{ padding: '1rem', marginTop: '1rem' }}>
            <div className="logo-inline">
              <ShieldCheck className="icon" style={{ color: '#fde68a' }} />
              <div className="card-title" style={{ fontSize: '1rem' }}>Temporary debug state</div>
            </div>
            <div className="token-list" style={{ marginTop: '0.85rem' }}>
              <div className="token-item" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Network</span>
                <strong>{debugState.network}</strong>
              </div>
              <div className="token-item" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Token accounts found</span>
                <strong>{debugState.tokenAccountsFound}</strong>
              </div>
              <div className="token-item" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Matching SGEN accounts</span>
                <strong>{debugState.matchingSgenAccounts}</strong>
              </div>
              <div className="token-item" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Detected SGEN balance</span>
                <strong>{formatTokenAmount(debugState.detectedSgenBalance)}</strong>
              </div>
              <div className="token-item" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Last check status</span>
                <strong>{debugState.lastCheckStatus}</strong>
              </div>
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
