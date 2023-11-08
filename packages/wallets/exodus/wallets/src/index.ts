import { ExodusWalletAdapterEthereum } from '@coin98t/wallet-adapter-exodus-ethereum';

type ExodusWalletAdapterConfig = string[];

const listExodusWalletAdapters = [new ExodusWalletAdapterEthereum()];
export class ExodusWalletAdapter {
  static getAdapter(chains: ExodusWalletAdapterConfig, options?: any) {
    return listExodusWalletAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
