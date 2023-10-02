'use client';

import { BLOCKCHAINS_DATA, WalletProvider } from '@coin98t/wallet-adapter-react';
import { WalletModalProvider } from '@coin98t/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@coin98t/wallet-adapter-phantom';
import { LedgerAdapter } from '@coin98t/wallet-adapter-ledger';
import { Coin98WalletAdapter } from '@coin98t/wallet-adapter-coin98';
import { MetaMaskWalletAdapter } from '@coin98t/wallet-adapter-metamask';

import { KeplrWalletAdapter } from '@coin98t/wallet-adapter-keplr';
import { LeapWalletAdapter } from '@coin98t/wallet-adapter-leap';
import { CompassWalletAdapter } from '@coin98t/wallet-adapter-compass';
import { FinWalletAdapter } from '@coin98t/wallet-adapter-fin';
import { BinanceWalletAdapter } from '@coin98t/wallet-adapter-binance-wallet';
import { TrustWalletAdapter } from '@coin98t/wallet-adapter-trust-wallet';
import { CoinbaseAdapter } from '@coin98t/wallet-adapter-coinbase';
import { WalletConnectAdapter } from '@coin98t/wallet-adapter-walletconnect';

interface ContainerProps {
  children: React.ReactNode;
}

const Provider: React.FC<ContainerProps> = ({ children }) => {
  const enables = [BLOCKCHAINS_DATA.cosmos, BLOCKCHAINS_DATA.ethereum, BLOCKCHAINS_DATA.solana];
  const wallets = [
    Coin98WalletAdapter,
    MetaMaskWalletAdapter,
    KeplrWalletAdapter,
    LeapWalletAdapter,
    CompassWalletAdapter,
    FinWalletAdapter,
    PhantomWalletAdapter,
    LedgerAdapter,
    TrustWalletAdapter,
    BinanceWalletAdapter,
    CoinbaseAdapter,
    WalletConnectAdapter,
  ];
  return (
    <WalletProvider wallets={wallets} enables={enables} autoConnect>
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  );
};

export default Provider;
