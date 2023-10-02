import React, { ReactNode } from 'react';

import { BLOCKCHAINS_DATA, WalletProvider } from '@coin98t/wallet-adapter-react';
import { WalletModalProvider } from '@coin98t/wallet-adapter-react-ui';

import { Coin98WalletAdapter } from '@coin98t/wallet-adapter-coin98';
import { MetaMaskWalletAdapter } from '@coin98t/wallet-adapter-metamask';
import { KeplrWalletAdapter } from '@coin98t/wallet-adapter-keplr';
import { LeapWalletAdapter } from '@coin98t/wallet-adapter-leap';
import { CompassWalletAdapter } from '@coin98t/wallet-adapter-compass';
import { FinWalletAdapter } from '@coin98t/wallet-adapter-fin';
import { PhantomWalletAdapter } from '@coin98t/wallet-adapter-phantom';
import { TrustWalletAdapter } from '@coin98t/wallet-adapter-trust-wallet';
import { BinanceWalletAdapter } from '@coin98t/wallet-adapter-binance-wallet';
import { CoinbaseAdapter } from '@coin98t/wallet-adapter-coinbase';
import { LedgerAdapter } from '@coin98t/wallet-adapter-ledger';

const Layout = ({ children }: { children: ReactNode }) => {
  const enables = [BLOCKCHAINS_DATA.cosmos, BLOCKCHAINS_DATA.ethereum, BLOCKCHAINS_DATA.solana];
  const wallets = [PhantomWalletAdapter, Coin98WalletAdapter, MetaMaskWalletAdapter, TrustWalletAdapter, BinanceWalletAdapter, CoinbaseAdapter, LedgerAdapter];

  return (
    <WalletProvider wallets={wallets} enables={enables} autoConnect>
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  );
};

export default Layout;
