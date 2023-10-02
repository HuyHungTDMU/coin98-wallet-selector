import {BinanceWalletAdapterEthereum} from '@coin98t/wallet-adapter-binance-wallet-ethereum';

type BinanceWalletAdapterConfig = string[];

const listBinanceWalletAdapters = [
    new BinanceWalletAdapterEthereum(),
];

export class BinanceWalletAdapter {
    static getAdapter(chains: BinanceWalletAdapterConfig, options?: any) {
        return listBinanceWalletAdapters.filter(walletAdapter => chains.includes(walletAdapter.chain));
    }
}
