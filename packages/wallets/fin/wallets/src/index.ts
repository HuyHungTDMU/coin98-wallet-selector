import { FinWalletAdapterCosmos } from '@coin98t/wallet-adapter-fin-cosmos';

type FinWalletAdapterConfig = string[];

const listFinWalletAdapters = [new FinWalletAdapterCosmos()];
export class FinWalletAdapter {
  static getAdapter(chains: FinWalletAdapterConfig, options?: any) {
    return listFinWalletAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
