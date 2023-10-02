import { LedgerAdapterEthereum } from '@coin98t/wallet-adapter-ledger-ethereum';

type LedgerAdapterConfig = string[];

const listLedgerAdapters = [new LedgerAdapterEthereum()];

export class LedgerAdapter {
  static getAdapter(chains: LedgerAdapterConfig, options?: any) {
    return listLedgerAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
