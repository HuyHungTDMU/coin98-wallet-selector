import {
  SolanaSignAndSendTransaction,
  type SolanaSignAndSendTransactionFeature,
  type SolanaSignMessageFeature,
  SolanaSignTransaction,
  type SolanaSignTransactionFeature,
} from '@solana/wallet-standard-features';
import type { Wallet as StandardWallet, WalletWithFeatures as StandardWalletWithFeatures } from '@wallet-standard/base';
import {
  StandardConnect,
  type StandardConnectFeature,
  type StandardDisconnectFeature,
  StandardEvents,
  type StandardEventsFeature,
} from '@wallet-standard/features';
import type { WalletAdapterSolana, WalletAdapterSolanaProps } from './adapter.js';

export type WalletAdapterCompatibleStandardWallet = StandardWalletWithFeatures<
  StandardConnectFeature &
    StandardEventsFeature &
    (SolanaSignAndSendTransactionFeature | SolanaSignTransactionFeature) &
    (StandardDisconnectFeature | SolanaSignMessageFeature | object)
>;

export interface StandardWalletAdapterProps<Name extends string = string> extends WalletAdapterSolanaProps<Name> {
  wallet: WalletAdapterCompatibleStandardWallet;
  standard: true;
}

export type StandardWalletAdapter<Name extends string = string> = WalletAdapterSolana<Name> &
  StandardWalletAdapterProps<Name>;

export function isWalletAdapterCompatibleStandardWallet(
  wallet: StandardWallet,
): wallet is WalletAdapterCompatibleStandardWallet {
  return (
    StandardConnect in wallet.features &&
    StandardEvents in wallet.features &&
    (SolanaSignAndSendTransaction in wallet.features || SolanaSignTransaction in wallet.features)
  );
}
