import { BitgetWalletAdapterEthereum } from '@coin98t/wallet-adapter-bitget-ethereum';

type BitgetWalletAdapterConfig = string[];

const listBitgetWalletAdapters = [new BitgetWalletAdapterEthereum()];

export class BitgetWalletAdapter {
  static getAdapter(chains: BitgetWalletAdapterConfig, options?: any) {
    return listBitgetWalletAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
