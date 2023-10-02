import { BaseMessageSignerWalletAdapterSolana, WalletName, WalletReturnType } from '@coin98t/wallet-adapter-base';
import {
  scopePollingDetectionStrategy,
  WalletAccountError,
  WalletDisconnectionError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletPublicKeyError,
  WalletReadyState,
  WalletSignMessageError,
  WalletSignTransactionError,
} from '@coin98t/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import iconUrl from './icon';

interface Coin98Wallet {
  isCoin98?: boolean;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  isConnected(): boolean;
  connect(): Promise<string[]>;
  disconnect(): Promise<void>;
  request(params: { method: string; params: string | string[] | unknown }): Promise<{
    signature: string;
    publicKey: string;
    signatures: string[];
  }>;
}

interface Coin98Window extends Window {
  coin98?: {
    sol?: Coin98Wallet;
  };
}

declare const window: Coin98Window;

export interface Coin98WalletAdapterConfig {}

export const Coin98WalletName = 'Coin98' as WalletName<'Coin98'>;

export class Coin98WalletAdapterSolana extends BaseMessageSignerWalletAdapterSolana {
  id = 'coin98_solana';
  chain = 'solana';
  name = Coin98WalletName;
  url = 'https://chrome.coin98.com/';
  icon = iconUrl;

  readonly supportedTransactionVersions = null;

  private _connecting: boolean;
  private _wallet: Coin98Wallet | null;
  private _publicKey: PublicKey | null;
  private _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  constructor(config: Coin98WalletAdapterConfig = {}) {
    super();
    this._connecting = false;
    this._wallet = null;
    this._publicKey = null;

    if (this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.coin98?.sol) {
          this._readyState = WalletReadyState.Installed;
          this.emit('readyStateChange', this._readyState);
          return true;
        }
        return false;
      });
    }
  }

  get publicKey() {
    return this._publicKey;
  }

  get connecting() {
    return this._connecting;
  }

  get connected() {
    return !!this._wallet?.isConnected();
  }

  get readyState() {
    return this._readyState;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

      this._connecting = true;

      const wallet = window.coin98!.sol!;

      let account: string;
      try {
        account = (await wallet.connect())[0]!;
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(account);
      } catch (error: any) {
        throw new WalletPublicKeyError(error?.message, error);
      }

      this._wallet = wallet;
      this._publicKey = publicKey;

      this.emit('connect', publicKey);
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

  async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const response = await wallet.request({ method: 'sol_sign', params: [transaction] });
        const publicKey = new PublicKey(response.publicKey);
        const signature = bs58.decode(response.signature);
        transaction.addSignature(publicKey, signature);
        return transaction;
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signAllTransactions<T extends Transaction>(transactions: T[]): Promise<T[]> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const response = await wallet.request({ method: 'sol_signAllTransactions', params: [transactions] });

        const publicKey = new PublicKey(response.publicKey);
        const signatures = response.signatures;

        return transactions.map((transaction, index) => {
          const signature = bs58.decode(signatures[index]!);
          transaction.addSignature(publicKey, signature);
          return transaction;
        });
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
        const response = await wallet.request({ method: 'sol_signMessage', params: [message] });
        const sig = bs58.decode(response.signature);

        return { data: sig, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.message, isError: true };
      // throw error;
    }
  }
}
