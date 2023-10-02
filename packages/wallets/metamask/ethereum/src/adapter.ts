import {
  BaseMessageSignerWalletAdapterEVM,
  EventEmitter,
  TypeConnectError,
  TypedMessage,
  TypedMessageV3,
  TypedMessageV4,
  WalletDisconnectedError,
  WalletName,
  WalletNotConnectedError,
  WalletReturnType,
  WalletSendTransactionError,
  WalletSignMessageError,
  WalletSignTransactionError,
} from '@coin98t/wallet-adapter-base';
import {
  scopePollingDetectionStrategy,
  WalletAccountError,
  WalletDisconnectionError,
  WalletNotReadyError,
  WalletReadyState,
} from '@coin98t/wallet-adapter-base';
import type { Transaction } from 'web3-core';
import iconUrl from './icon';
interface MetaMaskWalletEvents {
  connect(...args: unknown[]): unknown;
  disconnect(...args: unknown[]): unknown;
  accountsChanged(account: Array<string>): unknown;
  chainChanged(chainId: string): unknown;
}

interface MetaMaskWallet extends EventEmitter<MetaMaskWalletEvents> {
  isMetaMask?: boolean;
  signTransaction(transaction: any): Promise<any>;
  isConnected(): boolean;
  connect(): Promise<string[]>;
  disconnect(): Promise<void>;
  request(params: { method: string; params?: string | string[] | unknown }): Promise<string[] | string>;
}

interface MetaMaskWindow extends Window {
  ethereum?: MetaMaskWallet;
}

declare const window: MetaMaskWindow;

export interface MetaMaskWalletAdapterConfig {}

export const MetaMaskWalletName = 'MetaMask' as WalletName<'MetaMask'>;

export class MetaMaskWalletAdapterEthereum extends BaseMessageSignerWalletAdapterEVM {
  id = 'metamask_ether';
  chain = 'evm';
  name = MetaMaskWalletName;
  url = 'https://metamask.io/download/';
  icon = iconUrl;

  private _connecting: boolean;
  private _wallet: MetaMaskWallet | null;
  private _address: string | null;
  private _chainId: string | null;
  private _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  constructor(config: MetaMaskWalletAdapterConfig = {}) {
    super();
    this._connecting = false;
    this._wallet = null;
    this._address = null;
    this._chainId = null;

    if (this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.ethereum) {
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
    return !!this._wallet?.isConnected();
  }

  get readyState() {
    return this._readyState;
  }

  // async autoConnect(chainId?: string) {
  //   await this.connect(chainId);
  // }

  async autoConnect() {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();
      this._connecting = true;

      const wallet = window.ethereum!;
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
      // wallet.on('disconnect', this._disconnected);
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

      const wallet = window.ethereum!;
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

      // wallet.on('disconnect', this._disconnected);
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
      // wallet.removeListener('disconnect', this._disconnected);
      wallet.removeListener('accountsChanged', this._accountChanged);
      wallet.removeListener('chainChanged', this._chainChanged);

      this._chainId = null;
      this._wallet = null;
      this._address = null;

      // Ethereum wallet không có func disconnect
      // try {
      //   await wallet.disconnect();
      // } catch (error: any) {
      //   this.emit('error', new WalletDisconnectionError(error?.message, error));
      // }
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

  // async signTransaction(transaction: any): Promise<any> {
  //   try {
  //     const wallet = this._wallet;
  //     if (!wallet) throw new WalletNotConnectedError();

  //     try {
  //       const response = await wallet.request({ method: 'eth_signTransaction', params: [transaction] });

  //       return response;
  //     } catch (error: any) {
  //       throw new WalletSignTransactionError(error?.message, error);
  //     }
  //   } catch (error: any) {
  //     this.emit('error', error);
  //     throw error;
  //   }
  // }

  // async signAllTransactions<T extends Transaction>(transactions: T[]): Promise<T[]> {
  //   try {
  //     const wallet = this._wallet;
  //     if (!wallet) throw new WalletNotConnectedError();

  //     try {
  //       const response = await wallet.request({ method: 'sol_signAllTransactions', params: [transactions] });

  //       const publicKey = new PublicKey(response.publicKey);
  //       const signatures = response.signatures;

  //       return transactions.map((transaction, index) => {
  //         const signature = bs58.decode(signatures[index]!);
  //         transaction.addSignature(publicKey, signature);
  //         return transaction;
  //       });
  //     } catch (error: any) {
  //       throw new WalletSignTransactionError(error?.message, error);
  //     }
  //   } catch (error: any) {
  //     this.emit('error', error);
  //     throw error;
  //   }
  // }

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

  // Không bắt được emmit này, nó chỉ bắn khi chuyển chain bị lỗi

  // private _disconnected = () => {
  //   const wallet = this._wallet;
  //   if (wallet) {
  //     wallet.removeListener('disconnect', this._disconnected);
  //     wallet.removeListener('accountsChanged', this._accountChanged);
  //     wallet.removeListener('chainChanged', this._chainChanged);

  //     this._wallet = null;
  //     this._address = null;
  //     this._chainId = null;

  //     this.emit('error', new WalletDisconnectedError());
  //     this.emit('disconnect');
  //   }
  // };

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
    try {
      const wallet = this._wallet;
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
