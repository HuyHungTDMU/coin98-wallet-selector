import { Coin98WalletAdapterEthereum } from '@coin98t/wallet-adapter-coin98-ethereum';
import { Coin98WalletAdapterSolana } from '@coin98t/wallet-adapter-coin98-solana';
import { Coin98WalletAdapterCosmos } from '@coin98t/wallet-adapter-coin98-cosmos';

type Coin98WalletAdapterConfig = string[];

const listCoin98WalletAdapters = [
  new Coin98WalletAdapterEthereum(),
  new Coin98WalletAdapterSolana(),
  new Coin98WalletAdapterCosmos(),
];
export class Coin98WalletAdapter {
  static getAdapter(chains: Coin98WalletAdapterConfig, options?: any) {
    return listCoin98WalletAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
