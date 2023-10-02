import { WalletConnectWalletAdapterSolana } from '@coin98t/wallet-adapter-walletconnect-solana';
import { WalletConnectWalletAdapterEVM } from '@coin98t/wallet-adapter-walletconnect-ethereum';
import type { SignClientTypes } from '@walletconnect/types';

const DEFAULT_OPTIONS: SignClientTypes.Options = {
  projectId: 'dcdc4211d22a611a057f84d2cdc7cdf5',
  relayUrl: 'wss://relay.walletconnect.com',
  metadata: {
    name: 'Coin98 Dapp',
    description: 'C98 App for WalletConnect',
    url: 'https://walletconnect.com/',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
  },
};

export interface WalletConnectAdapterConfigs {
  evmOptions?: SignClientTypes.Options;
  cosmosOptions?: SignClientTypes.Options;
  solanaOptions?: SignClientTypes.Options;
}

// Chỗ này tìm cách để render có truyền được parram và reference nếu dùng func thì gọi
// function trong class mỗi lần rerender lại là một object khác
const listWalletConnectAdapters = [
  new WalletConnectWalletAdapterSolana({ options: DEFAULT_OPTIONS }),
  new WalletConnectWalletAdapterEVM({ options: DEFAULT_OPTIONS }),
];
export class WalletConnectAdapter {
  static getAdapter(chains: string[], options?: any) {
    return listWalletConnectAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
