'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

const network = WalletAdapterNetwork.Mainnet;
const mainnetEndpoint = 'https://solana-rpc.publicnode.com';

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
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
