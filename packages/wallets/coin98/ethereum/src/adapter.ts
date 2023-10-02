import {
  BaseMessageSignerWalletAdapterEVM,
  EventEmitter,
  WalletDisconnectedError,
  WalletError,
  WalletName,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReturnType,
  WalletSendTransactionError,
  WalletSignMessageError,
  WalletSignTransactionError,
  TypeConnectError,
  TypedMessage,
  TypedMessageV3,
  TypedMessageV4,
} from '@coin98t/wallet-adapter-base';
import {
  scopePollingDetectionStrategy,
  WalletAccountError,
  WalletDisconnectionError,
  WalletReadyState,
} from '@coin98t/wallet-adapter-base';

import type { Transaction } from 'web3-core';
import iconUrl from './icon';
interface Coin98Wallet extends EventEmitter {
  disconnect: () => Promise<void>;
  isConnected: (() => boolean) | boolean;
  accountsChanged(account: Array<string>): unknown;
  chainChanged(chainId: string): unknown;
  request(params: { method: string; params?: string | string[] | unknown }): Promise<string[] | string>;
}

interface Coin98Window extends Window {
  ethereum?: Coin98Wallet;
  coin98: { provider: Coin98Wallet; isMobile: boolean };
}

declare const window: Coin98Window;

export interface Coin98WalletAdapterConfig {}

export const Coin98WalletName = 'Coin98' as WalletName<'Coin98'>;

export class Coin98WalletAdapterEthereum extends BaseMessageSignerWalletAdapterEVM {
  id = 'coin98_ether';
  chain = 'evm';
  name = Coin98WalletName;
  url = 'https://chrome.coin98.com/';
  icon = iconUrl;

  private _connecting: boolean;
  private _wallet: Coin98Wallet | null;
  private _address: string | null;
  private _chainId: string | null;
  private _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  constructor(config: Coin98WalletAdapterConfig = {}) {
    super();
    this._connecting = false;
    this._wallet = null;
    this._address = null;
    this._chainId = null;

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
    return typeof this._wallet?.isConnected === 'function'
      ? !!this._wallet?.isConnected()
      : !!this._wallet?.isConnected;
  }

  get readyState() {
    return this._readyState;
  }

  async autoConnect() {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();
      this._connecting = true;

      const isServer = typeof window === 'undefined';
      const isDapp = isServer ? false : window.coin98.isMobile;
      const wallet = window.coin98.provider!;
      let address: string;

      if (isDapp) {
        // try {
        //   address = (await wallet.request({ method: 'eth_accounts' }))[0]!;
        // } catch (error: any) {
        //   throw new WalletAccountError(error?.message, error);
        // }
        try {
          address = (await wallet.request({ method: 'eth_requestAccounts' }))[0]!;
        } catch (error: any) {
          throw new WalletAccountError(error?.message, error);
        }
      } else {
        try {
          address = (await wallet.request({ method: 'eth_requestAccounts' }))[0]!;
        } catch (error: any) {
          throw new WalletAccountError(error?.message, error);
        }
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

      wallet.on('disconnect', this._disconnected); // handle event disconnect from wallet
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

      const isServer = typeof window === 'undefined';
      const isDapp = isServer ? false : (window as any)?.coin98.isMobile;

      this._connecting = true;

      const wallet = window.coin98.provider!;
      let address: string;

      let currentChainIdWallet;
      currentChainIdWallet = await wallet.request({ method: 'eth_chainId' });

      if (!isDapp) {
        if (
          chainId ===
          (typeof currentChainIdWallet === 'string' ? (currentChainIdWallet as string) : currentChainIdWallet[0])
        ) {
          try {
            address = (await wallet.request({ method: 'eth_requestAccounts' }))[0]!;
          } catch (error: any) {
            throw new WalletAccountError(error?.message, error);
          }
        } else {
          try {
            // Edit switch first with c98, update later
            await wallet.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: !!chainId?.length ? chainId : '0x1' }],
            });

            address = (await wallet.request({ method: 'eth_requestAccounts' }))[0]!;
          } catch (error: any) {
            if (error.code === 4902) {
              try {
                //Call back add chain
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
        }
      } else {
        // try {
        //   address = (await wallet.request({ method: 'eth_accounts' }))[0]!;
        // } catch (error: any) {
        //   throw new WalletAccountError(error?.message, error);
        // }
        if (
          chainId ===
          (typeof currentChainIdWallet === 'string' ? (currentChainIdWallet as string) : currentChainIdWallet[0])
        ) {
          try {
            address = (await wallet.request({ method: 'eth_requestAccounts' }))[0]!;
          } catch (error: any) {
            throw new WalletAccountError(error?.message, error);
          }
        } else {
          try {
            // Edit switch first with c98, update later
            await wallet.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: !!chainId?.length ? chainId : '0x1' }],
            });

            address = (await wallet.request({ method: 'eth_requestAccounts' }))[0]!;
          } catch (error: any) {
            if (error.code === 4902) {
              try {
                //Call back add chain
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
        }
      }

      wallet.on('disconnect', this._disconnected); // handle event disconnect from wallet
      wallet.on('accountsChanged', this._accountChanged);
      wallet.on('chainChanged', this._chainChanged);

      this._wallet = wallet;
      this._chainId = chainId as any;
      this._address = address!;

      this.emit('connect', address!);
      this.emit('changeChainId', chainId! as any);
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
      wallet.removeListener('disconnect', this._disconnected); // handle event disconnect from wallet
      wallet.removeListener('accountsChanged', this._accountChanged);
      wallet.removeListener('chainChanged', this._chainChanged);

      this._wallet = null;
      this._address = null;
      this._chainId = null;

      // try {
      //   wallet.disconnect();
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
        // const signature = await this.signTransaction(transaction);
        // console.log('signature', signature);

        //có thể dùng (window.coin9 as any)?.provider.request({})
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

  // async signTransaction(transaction: Transaction): Promise<any> {
  //   try {
  //     const wallet = this._wallet;
  //     console.log(' wallet', wallet);
  //     if (!wallet) throw new WalletNotConnectedError();

  //     try {
  //       console.log('sig Transaction c98 eth', transaction);

  //       const signature = await wallet.request({
  //         method: 'eth_sign',
  //         params: [transaction],
  //       });

  //       return signature;
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
        // const msg = `0x${Buffer.from(message, 'utf8').toString('hex')}`;
        const msg = message;
        const from = this._address;
        const response = (await wallet.request({ method: 'personal_sign', params: [msg, from] })) as string[];

        return { data: response, error: null, isError: false };
      } catch (error: any) {
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

  // handle event disconnect from wallet
  private _disconnected = () => {
    const wallet = this._wallet;
    if (wallet) {
      wallet.removeListener('disconnect', this._disconnected);
      wallet.removeListener('accountsChanged', this._accountChanged);
      wallet.removeListener('chainChanged', this._chainChanged);
      this._wallet = null;
      this._address = null;

      // this.emit('error', new WalletDisconnectedError());
      this.emit('disconnect');
    }
  };

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
    // On Dapp. If connect evm first, after that you change other block chain => [] => disconnect
    const address = this._address;
    if (!address) return;

    if (address === accounts[0]) return;
    if (!accounts[0]) {
      // when inactive chain
      this.disconnect();
    }
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
