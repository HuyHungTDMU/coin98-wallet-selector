import { CompassWalletAdapterCosmos } from '@coin98t/wallet-adapter-compass-cosmos';

type CompassWalletAdapterConfig = string[];

const listCompassWalletAdapters = [new CompassWalletAdapterCosmos()];
export class CompassWalletAdapter {
  static getAdapter(chains: CompassWalletAdapterConfig, options?: any) {
    return listCompassWalletAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
