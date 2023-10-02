import {
  AdapterCosmos,
  SignerWalletAdapterSolanaProps,
  SupportedTransactionVersions,
  TransactionCosmos,
  TransactionOrVersionedTransaction,
  TypeConnectError,
  TypedMessage,
  TypedMessageV3,
  TypedMessageV4,
  WalletReturnType,
  type AdapterEVM,
  type AdapterSolana,
  type SendTransactionOptions,
  type WalletReadyState,
} from '@coin98t/wallet-adapter-base';
import {
  TransactionSignature,
  type Connection,
  type PublicKey,
  type Transaction as TransactionSolana,
  type VersionedTransaction,
} from '@solana/web3.js';
import { createContext, useContext } from 'react';
import { Transaction } from 'web3-core';
export interface Wallet {
  adapter: AdapterSolana | AdapterEVM | AdapterCosmos;
  readyState: WalletReadyState;
}

export interface WalletContextState {
  autoConnect: boolean;
  wallets: Wallet[];
  enables: string[];
  chain?: string | number;
  wallet: Wallet | null;
  publicKey: PublicKey | null;
  connecting: boolean;
  connected: boolean;
  isUninstall: boolean;
  disconnecting: boolean;
  selectedChainId: string[] | string | null;
  selectedBlockChain: string | null;

  address: string | null;
  selectWallet(
    walletId: string | null,
    chainId: string | null,
    callback?: (error: Error, typeError: TypeConnectError) => Promise<void>,
  ): void;
  requestInstall: (value: boolean) => void;
  connect(callbackAddChain?: (error: Error) => Promise<void>): Promise<void>;
  disconnect(): Promise<void>;
  switchNetwork(
    chainId: string,
    callBackAddChain?: (error: Error) => Promise<void>,
  ): Promise<WalletReturnType<boolean, string> | undefined>;
  sendTransaction: {
    (
      transaction: TransactionOrVersionedTransaction<SupportedTransactionVersions | any>,
      connection: Connection,
      options?: SendTransactionOptions,
    ): Promise<WalletReturnType<TransactionSignature, string>>;
    (transaction: Transaction): Promise<WalletReturnType<string[] | string, string>>;
    (transaction: TransactionCosmos): Promise<WalletReturnType<string, string>>;
  };

  signTransaction?: SignerWalletAdapterSolanaProps['signTransaction'] | undefined;
  signAllTransactions?: SignerWalletAdapterSolanaProps['signAllTransactions'] | undefined;
  signMessage: {
    (message: Uint8Array | string): Promise<WalletReturnType<Uint8Array, string>>;
    (message: string): Promise<WalletReturnType<string[], string>>;
    (message: Uint8Array | string): Promise<WalletReturnType<string, string>>;
  };

  signTypedData(
    msgParams: TypedMessageV3<any> | TypedMessageV4<any> | TypedMessage[],
    type: 'v1' | 'v3' | 'v4',
  ): Promise<WalletReturnType<string, string>>;
}

const EMPTY_ARRAY: ReadonlyArray<never> = [];

const DEFAULT_CONTEXT = {
  autoConnect: false,
  connecting: false,
  connected: false,
  disconnecting: false,
  isUninstall: false,
  selectWallet(
    _walletId: string | null,
    _chainId: string | null,
    _callback?: (error: Error, typeError: TypeConnectError) => Promise<void>,
  ) {
    console.error(constructMissingProviderErrorMessage('get', 'select'));
  },
  connect(_callbackAddChain?: (error: Error) => Promise<void>) {
    return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'connect')));
  },
  disconnect() {
    return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'disconnect')));
  },
  switchNetwork(_chainId: string, _callbackAddChain?: (error: Error) => Promise<void>) {
    return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'switchNetwork')));
  },
  requestInstall(_value: boolean) {
    console.error(constructMissingProviderErrorMessage('get', 'requestInstall'));
  },
  sendTransaction(
    _transaction: VersionedTransaction | TransactionSolana,
    _connection: Connection,
    _options?: SendTransactionOptions | undefined,
  ) {
    return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'sendTransaction')));
  },
  signTransaction(_transaction: TransactionSolana) {
    return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'signTransaction')));
  },
  signAllTransactions(_transaction: TransactionSolana[]) {
    return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'signAllTransactions')));
  },
  signMessage(_message: string | Uint8Array) {
    return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'signMessage'))) as Promise<
      WalletReturnType<Uint8Array | undefined | string, string>
    >;
  },
  signTypedData(_msgParams: TypedMessageV3<any> | TypedMessageV4<any> | TypedMessage[], type: 'v1' | 'v3' | 'v4') {
    {
      return Promise.reject(console.error(constructMissingProviderErrorMessage('get', 'signTypedData')));
    }
  },
} as WalletContextState;
Object.defineProperty(DEFAULT_CONTEXT, 'wallets', {
  get() {
    console.error(constructMissingProviderErrorMessage('read', 'wallets'));
    return EMPTY_ARRAY;
  },
});
Object.defineProperty(DEFAULT_CONTEXT, 'wallet', {
  get() {
    console.error(constructMissingProviderErrorMessage('read', 'wallet'));
    return null;
  },
});
Object.defineProperty(DEFAULT_CONTEXT, 'publicKey', {
  get() {
    console.error(constructMissingProviderErrorMessage('read', 'publicKey'));
    return null;
  },
});

function constructMissingProviderErrorMessage(action: string, valueName: string) {
  return (
    'You have tried to ' +
    ` ${action} "${valueName}"` +
    ' on a WalletContext without providing one.' +
    ' Make sure to render a WalletProvider' +
    ' as an ancestor of the component that uses ' +
    'WalletContext'
  );
}

export const WalletContext = createContext<WalletContextState>(DEFAULT_CONTEXT as WalletContextState);

export function useWallet(): WalletContextState {
  return useContext(WalletContext);
}
