import { KeplrWalletAdapterCosmos } from '@coin98t/wallet-adapter-keplr-cosmos';

type KeplrWalletAdapterConfig = string[];

const listKeplrWalletAdapters = [new KeplrWalletAdapterCosmos()];
export class KeplrWalletAdapter {
  static getAdapter(chains: KeplrWalletAdapterConfig, options?: any) {
    return listKeplrWalletAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
