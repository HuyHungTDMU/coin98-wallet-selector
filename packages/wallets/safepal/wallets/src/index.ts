import { SafePalWalletAdapterEthereum } from '@coin98t/wallet-adapter-safepal-ethereum';

type SafePalWalletAdapterConfig = string[];

const listSafePalWalletAdapters = [new SafePalWalletAdapterEthereum()];

export class SafePalWalletAdapter {
  static getAdapter(chains: SafePalWalletAdapterConfig, options?: any) {
    return listSafePalWalletAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
