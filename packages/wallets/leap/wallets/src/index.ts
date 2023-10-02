import { LeapWalletAdapterCosmos } from '@coin98t/wallet-adapter-leap-cosmos';

type LeapWalletAdapterConfig = string[];

const listLeapWalletAdapters = [new LeapWalletAdapterCosmos()];
export class LeapWalletAdapter {
  static getAdapter(chains: LeapWalletAdapterConfig, options?: any) {
    return listLeapWalletAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
