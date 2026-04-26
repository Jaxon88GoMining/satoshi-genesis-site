import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import type { Metadata } from 'next';
import { AppWalletProvider } from './providers';

export const metadata: Metadata = {
  title: 'Satoshi Genesis',
  description: 'A dual-token ecosystem built for activity and designed for value.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppWalletProvider>{children}</AppWalletProvider>
      </body>
    </html>
  );
}
