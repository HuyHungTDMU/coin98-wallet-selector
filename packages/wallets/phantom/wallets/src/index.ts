import { PhantomWalletAdapterSolana } from '@coin98t/wallet-adapter-phantom-solana';

type PhantomWalletAdapterConfig = string[];

const listPhantomWalletAdapters = [new PhantomWalletAdapterSolana()];
export class PhantomWalletAdapter {
  static getAdapter(chains: PhantomWalletAdapterConfig, options?: any) {
    return listPhantomWalletAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
