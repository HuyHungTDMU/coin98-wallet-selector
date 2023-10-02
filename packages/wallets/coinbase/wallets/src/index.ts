import { CoinbaseAdapterEthereum } from '@coin98t/wallet-adapter-coinbase-ethereum';

type CoinbaseAdapterConfig = string[];

const listCoinbaseAdapters = [new CoinbaseAdapterEthereum()];

export class CoinbaseAdapter {
  static getAdapter(chains: CoinbaseAdapterConfig, options?: any) {
    return listCoinbaseAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
