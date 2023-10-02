import type {
  Connection,
  PublicKey,
  SendOptions,
  Signer,
  Transaction as TransactionSol,
  TransactionSignature,
} from '@solana/web3.js';
import EventEmitter from 'eventemitter3';
import { Transaction } from 'web3-core';
import { type WalletError, WalletNotConnectedError } from './errors';
import type { SupportedTransactionVersions, TransactionOrVersionedTransaction } from './transaction.js';
import {
  OfflineSigner,
  TransactionCosmos,
  TypeConnectError,
  TypedMessage,
  TypedMessageV3,
  TypedMessageV4,
  WalletReturnType,
} from './types';

export { EventEmitter };

export interface WalletAdapterSolanaEvents {
  connect(publicKey: PublicKey): void;
  disconnect(): void;
  error(error: WalletError): void;
  readyStateChange(readyState: WalletReadyState): void;
  changeChainId(chainId: string[]): void;
}

export interface WalletAdapterEVMEvents {
  connect(address: string): void;
  disconnect(): void;
  error(error: WalletError): void;
  readyStateChange(readyState: WalletReadyState): void;
  changeChainId(chainId: string[]): void;
}

export interface WalletAdapterCosmosEvents {
  connect(address: string): void;
  disconnect(): void;
  error(error: WalletError): void;
  readyStateChange(readyState: WalletReadyState): void;
  changeChainId(chainId: string): void;
}
export interface SendTransactionOptions extends SendOptions {
  signers?: Signer[];
}

// WalletName is a nominal type that wallet adapters should use, e.g. `'MyCryptoWallet' as WalletName<'MyCryptoWallet'>`
// https://medium.com/@KevinBGreene/surviving-the-typescript-ecosystem-branding-and-type-tagging-6cf6e516523d
export type WalletName<T extends string = string> = T & { __brand__: 'WalletName' };

// export interface WalletAdapterProps<Name extends string = string> {
//   name: WalletName<Name>;
//   url: string;
//   icon: string;
//   readyState: WalletReadyState;
//   publicKey?: PublicKey | null;
//   connecting: boolean;
//   connected: boolean;
//   supportedTransactionVersions?: SupportedTransactionVersions;

//   //evm
//   address?: string | null;
//   chain?: string | null;

//   autoConnect(chainId?: string): Promise<void>;
//   connect(chainId?: string): Promise<void>;
//   disconnect(): Promise<void>;
//   sendTransaction(
//     transaction?: TransactionOrVersionedTransaction<this['supportedTransactionVersions'] | any>,
//     connection?: Connection,
//     options?: SendTransactionOptions,
//   ): Promise<TransactionSignature>;
// }

interface WalletAdapterBaseProps<Name extends string = string> {
  id: string;
  name: WalletName<Name>;
  url: string;
  icon: string;
  readyState: WalletReadyState;
  connecting: boolean;
  chain: string;

  autoConnect(chainId?: string | string[]): Promise<void>;
  connect(
    chainId?: string,
    callbackAddChain?: (error: Error, typeError: TypeConnectError) => Promise<void>,
  ): Promise<void>;
  disconnect(): Promise<void>;
}

export interface WalletAdapterEVMProps<Name extends string = string> extends WalletAdapterBaseProps<Name> {
  address: string | null;
  connected: boolean;

  sendTransaction(transaction: Transaction): Promise<WalletReturnType<string[] | string, string>>;
  switchNetwork(
    chainId: string,
    callBackAddChain?: (error: Error) => Promise<void>,
  ): Promise<WalletReturnType<boolean, string>>;
  signTypedDataV4(msgParams: TypedMessageV4<any>): Promise<WalletReturnType<string, string>>;
  signTypedDataV3(msgParams: TypedMessageV3<any>): Promise<WalletReturnType<string, string>>;
  signTypedData(msgParams: TypedMessage[]): Promise<WalletReturnType<string, string>>;
}

export interface WalletAdapterCosmosProps<Name extends string = string> extends WalletAdapterBaseProps<Name> {
  address: string | null;
  connected: boolean;
  offlineSigner: OfflineSigner | null;

  sendTransaction(transaction: TransactionCosmos): Promise<WalletReturnType<string, string>>;
}
export interface WalletAdapterSolanaProps<Name extends string = string> extends WalletAdapterBaseProps<Name> {
  publicKey: PublicKey | null;
  supportedTransactionVersions?: SupportedTransactionVersions;
  connected: boolean;

  sendTransaction(
    transaction: TransactionOrVersionedTransaction<this['supportedTransactionVersions'] | any>,
    connection: Connection,
    options?: SendTransactionOptions,
  ): Promise<WalletReturnType<TransactionSignature, string>>;
}

export type WalletAdapterProps = WalletAdapterSolanaProps | WalletAdapterEVMProps | WalletAdapterCosmosProps;

export type WalletAdapterEVM<Name extends string = string> = WalletAdapterEVMProps<Name> &
  EventEmitter<WalletAdapterEVMEvents>;

export type WalletAdapterSolana<Name extends string = string> = WalletAdapterSolanaProps<Name> &
  EventEmitter<WalletAdapterSolanaEvents>;

export type WalletAdapterCosmos<Name extends string = string> = WalletAdapterCosmosProps<Name> &
  EventEmitter<WalletAdapterCosmosEvents>;

// export type WalletAdapter<Name extends string = string> = WalletAdapterProps<Name> & EventEmitter<WalletAdapterEvents>;

/**
 * A wallet's readiness describes a series of states that the wallet can be in,
 * depending on what kind of wallet it is. An installable wallet (eg. a browser
 * extension like Phantom) might be `Installed` if we've found the Phantom API
 * in the global scope, or `NotDetected` otherwise. A loadable, zero-install
 * runtime (eg. Torus Wallet) might simply signal that it's `Loadable`. Use this
 * metadata to personalize the wallet list for each user (eg. to show their
 * installed wallets first).
 */
export enum WalletReadyState {
  /**
   * User-installable wallets can typically be detected by scanning for an API
   * that they've injected into the global context. If such an API is present,
   * we consider the wallet to have been installed.
   */
  Installed = 'Installed',
  NotDetected = 'NotDetected',
  /**
   * Loadable wallets are always available to you. Since you can load them at
   * any time, it's meaningless to say that they have been detected.
   */
  Loadable = 'Loadable',
  /**
   * If a wallet is not supported on a given platform (eg. server-rendering, or
   * mobile) then it will stay in the `Unsupported` state.
   */
  Unsupported = 'Unsupported',
}

export abstract class BaseWalletAdapter<Name extends string = string>
  extends EventEmitter<WalletAdapterSolanaEvents | WalletAdapterEVMEvents | WalletAdapterCosmosEvents>
  implements WalletAdapterBaseProps
{
  abstract name: WalletName<Name>;
  abstract id: string;
  abstract url: string;
  abstract icon: string;
  abstract readyState: WalletReadyState;
  abstract connecting: boolean;
  abstract chain: string;

  async autoConnect(chainId?: string | string[]) {
    await this.connect(chainId);
  }
  abstract connect(
    chainId?: string | string[],
    callbackAddChain?: (error: Error, typeError: TypeConnectError) => Promise<void>,
  ): Promise<void>;
  abstract disconnect(): Promise<void>;

  // bỏ address(evm), publicKey(solana),supportedTransactionVersions (solana) , sendTransaction(), connected() tại vì hai thằng
  // khác nhau không thể dùng default trong abstract chung được, phải tách ra evm riêng va solana riêng để extend sau dựa vào generic truyền vào.

  // 2 func detect isIosAndRedirectable va scopePollingDetectionStrategy để sau
}

export abstract class BaseWalletAdapterEVM<Name extends string = string>
  extends BaseWalletAdapter<Name>
  implements WalletAdapterEVM
{
  abstract address: string | null;
  get connected() {
    return !!this.address;
  }
  abstract switchNetwork(
    chainId: string,
    callBackAddChain?: (error: Error) => Promise<void>,
  ): Promise<WalletReturnType<boolean, string>>;
  abstract sendTransaction(transaction: Transaction): Promise<WalletReturnType<string[] | string, string>>;
  abstract signTypedDataV4(msgParams: TypedMessageV4<any>): Promise<WalletReturnType<string, string>>;
  abstract signTypedDataV3(msgParams: TypedMessageV3<any>): Promise<WalletReturnType<string, string>>;
  abstract signTypedData(msgParams: TypedMessage[]): Promise<WalletReturnType<string, string>>;
}

export abstract class BaseWalletAdapterCosmos<Name extends string = string>
  extends BaseWalletAdapter<Name>
  implements WalletAdapterCosmos
{
  abstract address: string | null;
  get connected() {
    return !!this.address;
  }

  abstract offlineSigner: OfflineSigner | null;

  abstract sendTransaction(transaction: TransactionCosmos): Promise<WalletReturnType<string, string>>;
}
export abstract class BaseWalletAdapterSolana<Name extends string = string>
  extends BaseWalletAdapter<Name>
  implements WalletAdapterSolana
{
  abstract publicKey: PublicKey | null;
  abstract supportedTransactionVersions?: SupportedTransactionVersions;

  get connected() {
    return !!this.publicKey;
  }

  abstract sendTransaction(
    transaction: TransactionOrVersionedTransaction<this['supportedTransactionVersions'] | any>,
    connection: Connection,
    options?: SendTransactionOptions,
  ): Promise<WalletReturnType<TransactionSignature, string>>;

  protected async prepareTransaction(
    transaction: TransactionSol,
    connection: Connection,
    options: SendOptions = {},
  ): Promise<TransactionSol> {
    const publicKey = this.publicKey;
    if (!publicKey) throw new WalletNotConnectedError();

    transaction.feePayer = transaction.feePayer || publicKey;
    transaction.recentBlockhash =
      transaction.recentBlockhash ||
      (
        await connection.getLatestBlockhash({
          commitment: options.preflightCommitment,
          minContextSlot: options.minContextSlot,
        })
      ).blockhash;

    return transaction;
  }
}

// export abstract class BaseWalletAdapter<Name extends string = string> // if dont pass generic Name , generic class will get default value is string
//   extends EventEmitter<WalletAdapterEvents>
//   implements WalletAdapter<Name>
// {
//   abstract name: WalletName<Name>;
//   abstract url: string;
//   abstract icon: string;
//   abstract readyState: WalletReadyState;
//   abstract publicKey: PublicKey | null;
//   abstract connecting: boolean;
//   abstract supportedTransactionVersions?: SupportedTransactionVersions;

//   address = null;

//   get connected() {
//     return !!this.publicKey;
//   } // đây cũng giống như 1 property, object.connected, nhưng mà mình cần chỉnh lại trước khi trả về giá trị thì mình thêm get ở trước

//   async autoConnect() {
//     await this.connect();
//   }

//   abstract connect(): Promise<void>;
//   abstract disconnect(): Promise<void>;

//   abstract sendTransaction(
//     transaction?: TransactionOrVersionedTransaction<this['supportedTransactionVersions'] | any>,
//     connection?: Connection,
//     options?: SendTransactionOptions,
//   ): Promise<TransactionSignature>;

//   protected async prepareTransaction(
//     transaction: TransactionSol,
//     connection: Connection,
//     options: SendOptions = {},
//   ): Promise<TransactionSol> {
//     const publicKey = this.publicKey;
//     if (!publicKey) throw new WalletNotConnectedError();

//     transaction.feePayer = transaction.feePayer || publicKey;
//     transaction.recentBlockhash =
//       transaction.recentBlockhash ||
//       (
//         await connection.getLatestBlockhash({
//           commitment: options.preflightCommitment,
//           minContextSlot: options.minContextSlot,
//         })
//       ).blockhash;

//     return transaction;
//   }
// }

// Func export

export function scopePollingDetectionStrategy(detect: () => boolean): void {
  // Early return when server-side rendering
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const disposers: (() => void)[] = [];

  function detectAndDispose() {
    const detected = detect();
    if (detected) {
      for (const dispose of disposers) {
        dispose();
      }
    }
  }

  // Strategy #1: Try detecting every second.
  const interval =
    // TODO: #334 Replace with idle callback strategy.
    setInterval(detectAndDispose, 1000);
  disposers.push(() => clearInterval(interval));

  // Strategy #2: Detect as soon as the DOM becomes 'ready'/'interactive'.
  if (
    // Implies that `DOMContentLoaded` has not yet fired.
    document.readyState === 'loading'
  ) {
    document.addEventListener('DOMContentLoaded', detectAndDispose, { once: true });
    disposers.push(() => document.removeEventListener('DOMContentLoaded', detectAndDispose));
  }

  // Strategy #3: Detect after the `window` has fully loaded.
  if (
    // If the `complete` state has been reached, we're too late.
    document.readyState !== 'complete'
  ) {
    window.addEventListener('load', detectAndDispose, { once: true });
    disposers.push(() => window.removeEventListener('load', detectAndDispose));
  }

  // Strategy #4: Detect synchronously, now.
  detectAndDispose();
}

/**
 * Users on iOS can be redirected into a wallet's in-app browser automatically,
 * if that wallet has a universal link configured to do so
 * But should not be redirected from within a webview, eg. if they're already
 * inside a wallet's browser
 * This function can be used to identify users who are on iOS and can be redirected
 *
 * @returns true if the user can be redirected
 */
export function isIosAndRedirectable() {
  // SSR: return false
  if (!navigator) return false;

  const userAgent = navigator.userAgent.toLowerCase();

  // if on iOS the user agent will contain either iPhone or iPad
  // caveat: if requesting desktop site then this won't work
  const isIos = userAgent.includes('iphone') || userAgent.includes('ipad');

  // if in a webview then it will not include Safari
  // note that other iOS browsers also include Safari
  // so we will redirect only if Safari is also included
  const isSafari = userAgent.includes('safari');

  return isIos && isSafari;
}
