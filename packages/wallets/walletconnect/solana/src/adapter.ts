import {
  WalletConnectWallet,
  WalletConnectWalletAdapterConfig as BaseWalletConnectWalletAdapterConfig,
} from './client';

import { getNetworkFromChainId, WalletName, WalletReturnType } from '@coin98t/wallet-adapter-base';
import {
  BaseSignerWalletAdapterSolana,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletDisconnectionError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
  WalletSignMessageError,
  WalletSignTransactionError,
  WalletWindowClosedError,
} from '@coin98t/wallet-adapter-base';
import type { PublicKey, Transaction, TransactionVersion, VersionedTransaction } from '@solana/web3.js';
import iconUrl from './icon';
export const WalletConnectWalletName = 'WalletConnect' as WalletName<'WalletConnect'>;

export type WalletConnectWalletAdapterConfig = Pick<BaseWalletConnectWalletAdapterConfig, 'options'>;

export class WalletConnectWalletAdapterSolana extends BaseSignerWalletAdapterSolana {
  chain = 'solana';
  id = 'walletconnect_solana';
  name = WalletConnectWalletName;
  url = 'https://walletconnect.org';
  icon = iconUrl;
  // V0 transactions are supported via the `transaction` parameter, and is off-spec.
  // Legacy transactions have these [parameters](https://docs.walletconnect.com/2.0/advanced/rpc-reference/solana-rpc#solana_signtransaction)
  readonly supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

  private _publicKey: PublicKey | null;
  private _connecting: boolean;
  private _wallet: WalletConnectWallet | null;
  private _config: WalletConnectWalletAdapterConfig;
  private _readyState: WalletReadyState =
    typeof window === 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.Loadable;

  constructor(config: WalletConnectWalletAdapterConfig) {
    super();

    this._publicKey = null;
    this._connecting = false;
    this._wallet = null;
    this._config = config;
  }

  get publicKey() {
    return this._publicKey;
  }

  get connecting() {
    return this._connecting;
  }

  get readyState() {
    return this._readyState;
  }

  get provider() {
    return this._wallet;
  }

  async connect(chainId?: string): Promise<void> {
    const network = getNetworkFromChainId(chainId);
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Loadable) throw new WalletNotReadyError();

      this._connecting = true;

      let wallet: WalletConnectWallet;
      let publicKey: PublicKey;
      try {
        wallet = new WalletConnectWallet({
          network,
          options: this._config.options,
        });

        ({ publicKey } = await wallet.connect());
      } catch (error: any) {
        if (error.constructor.name === 'QRCodeModalError') throw new WalletWindowClosedError();
        throw new WalletConnectionError(error?.message, error);
      }

      wallet.client.on('session_delete', this._disconnected);

      this._wallet = wallet;
      this._publicKey = publicKey;

      this.emit('connect', publicKey);
      this.emit('changeChainId', chainId!);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet;
    if (wallet) {
      wallet.client.off('session_delete', this._disconnected);

      this._wallet = null;
      this._publicKey = null;

      try {
        await wallet.disconnect();
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }

    this.emit('disconnect');
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        return (await wallet.signTransaction(transaction)) as T;
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signMessage(message: Uint8Array): Promise<WalletReturnType<Uint8Array, string>> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const res = await wallet.signMessage(message);
        return { data: res, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.message, isError: true };
    }
  }

  private _disconnected = () => {
    const wallet = this._wallet;
    if (wallet) {
      wallet.client.off('session_delete', this._disconnected);

      this._wallet = null;
      this._publicKey = null;

      this.emit('error', new WalletDisconnectedError());
      this.emit('disconnect');
    }
  };
}
