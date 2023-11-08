import {
  BaseMessageSignerWalletAdapterEVM,
  EventEmitter,
  scopePollingDetectionStrategy,
  TypeConnectError,
  TypedMessage,
  TypedMessageV3,
  TypedMessageV4,
  WalletAccountError,
  WalletName,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
  WalletReturnType,
  WalletSendTransactionError,
  WalletSignMessageError,
} from '@coin98t/wallet-adapter-base';
import { Transaction } from 'web3-types';
import iconUrl from './icon';

interface TrustWallet extends EventEmitter {
  isTrustWallet?: boolean;

  request(params: { method: string; params?: string | string[] | unknown }): Promise<string[] | string>;
}

interface TrustWalletWindow extends Window {
  trustwallet?: TrustWallet;
}

declare const window: TrustWalletWindow;

export interface TrustWalletAdapterConfig {}

export const TrustWalletName = 'Trust Wallet' as WalletName<'Trust Wallet'>;

export class TrustWalletAdapterEthereum extends BaseMessageSignerWalletAdapterEVM {
  id = 'trust_wallet_ether';
  chain = 'evm';
  name = TrustWalletName;
  url = 'https://trustwallet.com/';
  icon = iconUrl;
  private _wallet: TrustWallet | null;
  private _chainId: string | null;

  constructor(config: TrustWalletAdapterConfig = {}) {
    super();
    this._connecting = false;
    this._wallet = null;
    this._address = null;
    this._chainId = null;

    if (this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.trustwallet) {
          this._readyState = WalletReadyState.Installed;
          this.emit('readyStateChange', this._readyState);
          return true;
        }
        return false;
      });
    }
  }

  private _connecting: boolean;

  get connecting() {
    return this._connecting;
  }

  private _address: string | null;

  get address() {
    return this._address;
  }

  private _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  get readyState() {
    return this._readyState;
  }

  get connected() {
    this._wallet?.request({ method: 'eth_requestAccounts' }).then(res => {
      if (res?.length > 0) {
        return true;
      }
    });
    return false;
  }

  get provider() {
    return this._wallet;
  }

  async autoConnect() {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();
      this._connecting = true;

      const wallet = window.trustwallet!;
      let address: string;

      try {
        address = (await wallet.request({ method: 'eth_requestAccounts' }))[0]!;
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      let currentChainIdWallet: string;

      try {
        currentChainIdWallet = (await wallet.request({ method: 'eth_chainId' })) as string;
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      this._wallet = wallet;
      this._address = address;
      this._chainId = currentChainIdWallet;

      wallet.on('accountsChanged', this._accountChanged);
      wallet.on('chainChanged', this._chainChanged);

      this.emit('connect', address);
      this.emit('changeChainId', currentChainIdWallet!);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async connect(
    chainId?: string,
    callback?: (error: Error, typeError: TypeConnectError) => Promise<void>,
  ): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();
      this._connecting = true;

      const wallet = window.trustwallet!;
      let address: string;

      let currentChainIdWallet: string;

      try {
        address = (await wallet.request({ method: 'eth_requestAccounts' }))[0]!;
        await wallet.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: !!chainId?.length ? chainId : '0x1' }],
        });
      } catch (error: any) {
        if (error.code === 4902) {
          try {
            await callback?.(error as Error, 'network');
            address = (await wallet.request({ method: 'eth_requestAccounts' }))[0]!;
            await wallet.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: !!chainId?.length ? chainId : '0x1' }],
            });
          } catch (addError) {
            throw new WalletAccountError(error?.message, error);
          }
        } else {
          throw new WalletAccountError(error?.message, error);
        }
      }

      try {
        currentChainIdWallet = (await wallet.request({ method: 'eth_chainId' })) as string;
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      wallet.on('accountsChanged', this._accountChanged);
      wallet.on('chainChanged', this._chainChanged);

      this._wallet = wallet;
      this._address = address!;
      this._chainId = currentChainIdWallet;

      this.emit('connect', address!);
      this.emit('changeChainId', currentChainIdWallet!);
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
      this._chainId = null;
      this._wallet = null;
      this._address = null;
    }
    this.emit('disconnect');
  }

  async sendTransaction(transaction: Transaction): Promise<WalletReturnType<string[], string>> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const res = (await wallet.request({
          method: 'eth_sendTransaction',
          params: [transaction],
        })) as string[];
        return { data: res, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSendTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
    }
  }

  async signMessage(message: string): Promise<WalletReturnType<string[], string>> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();
      try {
        const msg = `0x${Buffer.from(message, 'utf8').toString('hex')}`;
        const from = this._address;
        const response = (await wallet.request({ method: 'personal_sign', params: [msg, from] })) as string[];

        return { data: response, error: null, isError: false };
      } catch (error: any) {
        console.log(error);

        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
      // throw error;
    }
  }

  async switchNetwork(
    chainId: string,
    callBackAddChain?: (error: Error) => Promise<void>,
  ): Promise<WalletReturnType<boolean, string>> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        await wallet.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: !!chainId?.length ? chainId : '0x1' }],
        });
        return { data: true, error: null, isError: false };
      } catch (error: any) {
        if (error.code === 4902) {
          try {
            await callBackAddChain?.(error as Error);

            await wallet.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: !!chainId?.length ? chainId : '0x1' }],
            });
            return { data: true, error: null, isError: false };
          } catch (addError) {
            throw new WalletAccountError(error?.message, error);
          }
        } else {
          throw new WalletAccountError(error?.message, error);
        }
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: false, error: error?.error?.message, isError: true };
    }
  }

  async signTypedDataV4(msgParams: TypedMessageV4<any>): Promise<WalletReturnType<string, string>> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();
      try {
        const msg = msgParams;
        const from = this._address;
        const response = (await wallet.request({
          method: 'eth_signTypedData_v4',
          params: [from, JSON.stringify(msg)],
        })) as string;

        return { data: response, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
    }
  }

  async signTypedDataV3(msgParams: TypedMessageV3<any>): Promise<WalletReturnType<string, string>> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();
      try {
        const msg = msgParams;
        const from = this._address;
        const response = (await wallet.request({
          method: 'eth_signTypedData_v3',
          params: [from, JSON.stringify(msg)],
        })) as string;

        return { data: response, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
    }
  }

  async signTypedData(msgParams: TypedMessage[]): Promise<WalletReturnType<string, string>> {
    return { data: null, error: "The method 'eth_signTypedData' is not supported.", isError: true };
  }

  private _accountChanged = (accounts: Array<string>) => {
    const address = this._address;
    if (!address) return;

    // bắt ra khi chuyển wallet = null
    if (!accounts[0]) {
      this.disconnect();
    }

    if (address === accounts[0]) return;

    this._address = accounts[0];
    this.emit('connect', accounts[0]);
  };

  private _chainChanged = (chainId: string) => {
    const currentChainId = this._chainId;
    if (!currentChainId || currentChainId === chainId) return;
    this._chainId = chainId;
    this.emit('changeChainId', chainId);
  };
}
