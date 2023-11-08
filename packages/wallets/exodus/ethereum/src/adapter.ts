import {
  BaseMessageSignerWalletAdapterEVM,
  EventEmitter,
  TypeConnectError,
  TypedMessage,
  TypedMessageV3,
  TypedMessageV4,
  WalletName,
  WalletNotConnectedError,
  WalletReturnType,
  WalletSendTransactionError,
  WalletSignMessageError,
} from '@coin98t/wallet-adapter-base';
import {
  scopePollingDetectionStrategy,
  WalletAccountError,
  WalletNotReadyError,
  WalletReadyState,
} from '@coin98t/wallet-adapter-base';
import { Transaction } from 'web3-types';
import iconUrl from './icon';

interface ExodusWallet extends EventEmitter {
  ethereum: {
    isExodus?: boolean;
    isConnected(): boolean;
    request(params: { method: string; params?: string | string[] | unknown }): Promise<string[] | string>;
    on: (method: string, listener: (event: any) => void) => void;
    removeListener: (method: string, listener: (event: any) => void) => void;
  };
}

interface ExodusWindow extends Window {
  exodus?: ExodusWallet;
  ethereum?: {
    request(params: { method: string; params?: string | string[] | unknown }): Promise<string[] | string>;
  };
}

declare const window: ExodusWindow;

export interface ExodusWalletAdapterConfig {}

export const ExodusWalletName = 'Exodus' as WalletName<'Exodus'>;

export class ExodusWalletAdapterEthereum extends BaseMessageSignerWalletAdapterEVM {
  id = 'exodus_ether';
  chain = 'evm';
  name = ExodusWalletName;
  url = 'https://www.exodus.com/download/';
  icon = iconUrl;

  private _connecting: boolean;
  private _wallet: ExodusWallet | null;
  private _address: string | null;
  private _chainId: string | null;
  private _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  constructor(config: ExodusWalletAdapterConfig = {}) {
    super();
    this._connecting = false;
    this._wallet = null;
    this._address = null;
    this._chainId = null;

    if (this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.exodus) {
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
    return !!this._wallet?.ethereum?.isConnected();
  }

  get readyState() {
    return this._readyState;
  }

  get provider() {
    return this._wallet;
  }

  async autoConnect() {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();
      this._connecting = true;

      const wallet = window?.exodus!;
      let address: string;

      try {
        address = (await wallet.ethereum.request({ method: 'eth_requestAccounts' }))[0]!;
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      let currentChainIdWallet: string;

      try {
        currentChainIdWallet = (await wallet.ethereum.request({ method: 'eth_chainId' })) as string;
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      this._wallet = wallet;
      this._address = address;
      this._chainId = currentChainIdWallet;

      wallet.ethereum.on('accountsChanged', this._accountChanged);
      wallet.ethereum.on('chainChanged', this._chainChanged);

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

      const wallet = window.exodus!;
      let address: string;

      let currentChainIdWallet: string;
      try {
        address = (await wallet.ethereum.request({ method: 'eth_requestAccounts' }))[0]!;
        await wallet.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: !!chainId?.length ? chainId : '0x1' }],
        });
      } catch (error: any) {
        if (error.code === 4902) {
          try {
            await callback?.(error as Error, 'network');
            address = (await wallet.ethereum.request({ method: 'eth_requestAccounts' }))[0]!;
            await wallet.ethereum.request({
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
        currentChainIdWallet = (await wallet.ethereum.request({ method: 'eth_chainId' })) as string;
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      wallet.ethereum.on('accountsChanged', this._accountChanged);
      wallet.ethereum.on('chainChanged', this._chainChanged);

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
      wallet.ethereum.removeListener('accountsChanged', this._accountChanged);
      wallet.ethereum.removeListener('chainChanged', this._chainChanged);

      this._chainId = null;
      this._wallet = null;
      this._address = null;
    }
    this.emit('disconnect');
  }

  async sendTransaction(transaction: Transaction): Promise<WalletReturnType<string[], string>> {
    try {
      const wallet = this._wallet?.ethereum;
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
      const wallet = this._wallet?.ethereum;
      if (!wallet) throw new WalletNotConnectedError();
      try {
        const msg = `0x${Buffer.from(message, 'utf8').toString('hex')}`;
        const from = this._address;
        const response = (await wallet.request({ method: 'personal_sign', params: [msg, from] })) as string[];

        return { data: response, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
    }
  }

  async switchNetwork(
    chainId: string,
    callBackAddChain?: (error: Error) => Promise<void>,
  ): Promise<WalletReturnType<boolean, string>> {
    try {
      const wallet = this._wallet?.ethereum;
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
      const wallet = this._wallet?.ethereum;
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
      const wallet = this._wallet?.ethereum;
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
    try {
      const wallet = this._wallet?.ethereum;
      if (!wallet) throw new WalletNotConnectedError();
      try {
        const msg = msgParams;
        const from = this._address;
        const response = (await wallet.request({
          method: 'eth_signTypedData',
          params: [msg, from],
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
  private _accountChanged = (accounts: Array<string>) => {
    const address = this._address;
    if (!address) return;

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
