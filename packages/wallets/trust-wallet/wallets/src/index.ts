import { TrustWalletAdapterEthereum } from '@coin98t/wallet-adapter-trust-wallet-ethereum';

type TrustWalletAdapterConfig = string[];

const listTrustWalletAdapters = [new TrustWalletAdapterEthereum()];
export class TrustWalletAdapter {
  static getAdapter(chains: TrustWalletAdapterConfig, options?: any) {
    return listTrustWalletAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
