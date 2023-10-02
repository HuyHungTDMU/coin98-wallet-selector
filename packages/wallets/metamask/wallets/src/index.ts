import { MetaMaskWalletAdapterEthereum } from '@coin98t/wallet-adapter-metamask-ethereum';

type MetaMaskWalletAdapterConfig = string[];

const listMetaMaskWalletAdapters = [new MetaMaskWalletAdapterEthereum()];
export class MetaMaskWalletAdapter {
  static getAdapter(chains: MetaMaskWalletAdapterConfig, options?: any) {
    return listMetaMaskWalletAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
