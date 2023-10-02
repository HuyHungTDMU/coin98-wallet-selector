'use client';

import { ChainInfo, evmChains, seiNetwork, seiTestnet, solana } from '@coin98t/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';
import React from 'react';
const WalletModalC98 = dynamic(async () => (await import('@coin98t/wallet-adapter-react-ui')).WalletModalC98, {
  ssr: false,
});

const Coin98AdapterModal = () => {
  const defaultChains: ChainInfo[] = [solana, seiNetwork, seiTestnet, ...evmChains];
  return <WalletModalC98 isC98Theme enableChains={defaultChains} activeChainId={'0x1'} />;
};

export default Coin98AdapterModal;
