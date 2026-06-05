'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { SgenHolderDashboard } from './SgenHolderDashboard';

const network = WalletAdapterNetwork.Mainnet;
const mainnetEndpoint = 'https://api.mainnet-beta.solana.com';

export function AppWalletProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => mainnetEndpoint, []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })],
    [],
  );

  useEffect(() => {
    console.log('[SGEN access] network', 'mainnet-beta');
    console.log('[SGEN access] rpc endpoint', endpoint);
  }, [endpoint]);

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
          <SgenHolderDashboard />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
