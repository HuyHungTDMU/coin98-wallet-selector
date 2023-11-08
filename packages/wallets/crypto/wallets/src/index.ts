import { CryptoWalletAdapterEthereum } from '@coin98t/wallet-adapter-crypto-ethereum';

type CryptoWalletAdapterConfig = string[];

const listCryptoWalletAdapters = [new CryptoWalletAdapterEthereum()];

export class CryptoWalletAdapter {
  static getAdapter(chains: CryptoWalletAdapterConfig, options?: any) {
    return listCryptoWalletAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
