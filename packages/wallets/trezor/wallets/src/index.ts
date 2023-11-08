import { TrezorWalletAdapterEthereum } from '@coin98t/wallet-adapter-trezor-ethereum';

type TrezorWalletAdapterConfig = string[];

const listTrezorWalletAdapters = [new TrezorWalletAdapterEthereum()];
export class TrezorWalletAdapter {
  static getAdapter(chains: TrezorWalletAdapterConfig, options?: any) {
    return listTrezorWalletAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
  }
}
