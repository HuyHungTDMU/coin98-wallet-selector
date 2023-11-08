import {
  EventEmitter,
  WalletName,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletSendTransactionError,
  TypeConnectError,
  WalletDisconnectionError,
  WalletSignMessageError,
  WalletReturnType,
  BaseMessageSignerWalletAdapterNear,
} from '@coin98t/wallet-adapter-base';
import { scopePollingDetectionStrategy, WalletAccountError, WalletReadyState } from '@coin98t/wallet-adapter-base';
import { FinalExecutionOutcome } from 'near-api-js/lib/providers';

import iconUrl from './icon';
import { resolveNetwork } from './options';
import { Provider } from './services/provider/provider.service';
import { signTransactions } from './services/transaction/sign-transactions';
import {
  Account,
  ICoin98Near,
  Network,
  Optional,
  SignAndSendTransactionParams,
  SignMessageParams,
  Transaction,
} from './types';

interface Coin98Wallet extends EventEmitter, ICoin98Near {}
interface Coin98Window extends Window {
  coin98: { near: Coin98Wallet; isMobile: boolean };
}

declare const window: Coin98Window;

export interface Coin98WalletAdapterConfig {}

export const Coin98WalletName = 'Coin98' as WalletName<'Coin98'>;

export class Coin98WalletAdapterNear extends BaseMessageSignerWalletAdapterNear {
  id = 'coin98_near';
  chain = 'near';
  name = Coin98WalletName;
  url = 'https://chrome.coin98.com/';
  icon = iconUrl;

  private _connecting: boolean;
  private _wallet: Coin98Wallet | null;
  private _chainId: string | null;
  private _address: string | null;
  private _network: Network | null;
  private _account: Account | null;
  private _provider: Provider | null;

  private _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  constructor(config?: Coin98WalletAdapterConfig) {
    super();
    this._connecting = false;
    this._wallet = null;
    this._address = null;
    this._chainId = null;
    this._network = null;
    this._account = null;
    this._provider = null;

    if (this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.coin98) {
          this._readyState = WalletReadyState.Installed;
          this.emit('readyStateChange', this._readyState);
          return true;
        }
        return false;
      });
    }
  }

  get address() {
    return this._address;
  }

  get connecting() {
    return this._connecting;
  }

  get connected() {
    return !!this._address;
  }

  get readyState() {
    return this._readyState;
  }

  get provider() {
    return this._wallet;
  }

  private _getAccount = async (network: Network): Promise<Account | null> => {
    const wallet = window.coin98.near;
    const accountId = wallet.account;

    if (!accountId) {
      return null;
    }

    const publicKey = await wallet.signer.getPublicKey(accountId, network.networkId);

    return {
      accountId,
      publicKey: publicKey ? publicKey.toString() : undefined,
    };
  };

  async autoConnect(chainId = 'near-mainnet') {
    await this.connect(chainId);
  }

  async connect(
    chainId = 'near-mainnet',
    callback?: (error: Error, typeError: TypeConnectError) => Promise<void>,
  ): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

      const isServer = typeof window === 'undefined';
      const isDapp = isServer ? false : (window as any)?.coin98.isMobile;

      this._connecting = true;

      let wallet = window.coin98.near;
      const contractId = ''; // Let me think
      let address: string;
      let account: Account | null;

      let network = resolveNetwork(chainId!);
      if (!isDapp) {
        try {
          const existingAccounts = await this._getAccount(network);
          if (existingAccounts) {
            address = existingAccounts.accountId;
            account = existingAccounts;
          } else {
            await wallet.connect({ prefix: 'near_selector', contractId });
            account = await this._getAccount(network);
            address = account!.accountId;
          }
        } catch (error: any) {
          throw new WalletAccountError(error?.message, error);
        }
      } else {
        try {
          const existingAccounts = await this._getAccount(network);
          if (existingAccounts) {
            address = existingAccounts.accountId;
            account = existingAccounts;
          } else {
            await wallet.connect({ prefix: 'near_selector', contractId });
            account = await this._getAccount(network);
            address = account!.accountId;
          }
        } catch (error: any) {
          throw new WalletAccountError(error?.message, error);
        }
      }

      let provider = new Provider(network.nodeUrl);

      this._provider = provider;
      this._wallet = wallet;
      this._chainId = chainId;
      this._address = address!;
      this._network = network;
      this._account = account;

      this.emit('connect', address!);
      this.emit('changeChainId', chainId);
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
      this._address = null;
      this._chainId = null;

      try {
        await wallet.disconnect();
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }

    this.emit('disconnect');
  }

  getAccounts = (): Account => {
    return this._account as Account;
  };

  async verifyOwner() {
    throw new Error(`Method not supported by ${this.name}`);
  }

  private _transformTransactions = (
    transactions: Array<Optional<Transaction, 'signerId' | 'receiverId'>>,
  ): Array<Transaction> => {
    if (!this._account) {
      throw new Error('No active account');
    }

    return transactions.map(transaction => {
      return {
        signerId: transaction.signerId || this._account!.accountId,
        receiverId: transaction.receiverId!,
        actions: transaction.actions,
      };
    });
  };

  async signAndSendTransaction({
    signerId,
    receiverId,
    actions,
  }: SignAndSendTransactionParams): Promise<WalletReturnType<FinalExecutionOutcome, string>> {
    try {
      const wallet = this._wallet;
      const provider = this._provider;
      const network = this._network;
      if (!wallet || !provider || !network) throw new WalletNotConnectedError();
      try {
        const signedTransactions = await signTransactions(
          this._transformTransactions([{ signerId, receiverId, actions }]),
          wallet.signer,
          network,
        );
        const res = await provider.sendTransaction(signedTransactions[0]);

        return { data: res, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSendTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
    }
  }

  async signAndSendTransactions(
    transactions: Array<SignAndSendTransactionParams>,
  ): Promise<WalletReturnType<FinalExecutionOutcome[], string>> {
    try {
      const wallet = this._wallet;
      const provider = this._provider;
      const network = this._network;
      if (!wallet || !provider || !network) throw new WalletNotConnectedError();
      try {
        const signedTransactions = await signTransactions(
          this._transformTransactions(transactions),
          wallet.signer,
          network,
        );

        const res: Array<FinalExecutionOutcome> = [];

        for (let i = 0; i < signedTransactions.length; i++) {
          res.push(await provider.sendTransaction(signedTransactions[i]));
        }

        return { data: res, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSendTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
    }
  }

  async signMessage({
    message,
    nonce,
    recipient,
    state,
  }: SignMessageParams): Promise<WalletReturnType<string, string>> {
    try {
      const wallet = this._wallet;
      const provider = this._provider;
      const network = this._network;
      if (!wallet || !provider || !network) throw new WalletNotConnectedError();
      try {
        const res = await wallet.signMessage({
          message,
          nonce,
          recipient,
          state,
        });
        return { data: res.signature, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
    }
  }

  // There is changesing account, disconnecting from wallet missing
}
