import {
  WalletConnectWallet,
  WalletConnectWalletAdapterConfig as BaseWalletConnectWalletAdapterConfig,
} from './client';

import { Transaction } from 'web3-types';

import {
  BaseMessageSignerWalletAdapterEVM,
  getNetworkFromChainId,
  TypedMessage,
  TypedMessageV3,
  TypedMessageV4,
  WalletName,
  WalletReturnType,
  WalletSendTransactionError,
} from '@coin98t/wallet-adapter-base';
import {
  WalletConnectionError,
  WalletDisconnectedError,
  WalletDisconnectionError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
  WalletSignMessageError,
  WalletWindowClosedError,
} from '@coin98t/wallet-adapter-base';

import iconUrl from './icon';

export const WalletConnectWalletName = 'WalletConnect' as WalletName<'WalletConnect'>;

export type WalletConnectWalletAdapterConfig = Pick<BaseWalletConnectWalletAdapterConfig, 'options'>;

export class WalletConnectWalletAdapterEVM extends BaseMessageSignerWalletAdapterEVM {
  chain = 'evm';
  id = 'walletconnect_evm';
  name = WalletConnectWalletName;
  url = 'https://walletconnect.org';
  icon = iconUrl;

  private _address: string | null;
  private _connecting: boolean;
  private _wallet: WalletConnectWallet | null;
  private _config: WalletConnectWalletAdapterConfig;
  private _chainId: string | null;
  private _readyState: WalletReadyState =
    typeof window === 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.Loadable;

  constructor(config: WalletConnectWalletAdapterConfig) {
    super();

    this._address = null;
    this._connecting = false;
    this._wallet = null;
    this._config = config;
    this._chainId = null;
  }

  get address() {
    return this._address;
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
      if (this.connected || this.connecting || !network) return;
      if (this._readyState !== WalletReadyState.Loadable) throw new WalletNotReadyError();

      this._connecting = true;

      let wallet: WalletConnectWallet;
      let address: string;
      try {
        wallet = new WalletConnectWallet({
          network: network,
          options: this._config.options,
        });

        ({ address } = await wallet.connect());
      } catch (error: any) {
        if (error.constructor.name === 'QRCodeModalError') throw new WalletWindowClosedError();
        throw new WalletConnectionError(error?.message, error);
      }

      wallet.client.on('session_delete', this._disconnected);

      // Reasearch
      wallet.client.on('session_event', ({ event }: any) => {
        console.log(event);
        if (event === 'chainChanged') {
          this._chainChanged;
        } else if (event === 'accountsChanged') {
          this._accountChanged;
        }
      });

      this._wallet = wallet;
      this._address = address;

      this.emit('connect', address);
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
      this._address = null;

      try {
        await wallet.disconnect();
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }

    this.emit('disconnect');
  }

  async sendTransaction(transaction: Transaction): Promise<WalletReturnType<string, string>> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const res = await wallet.sendTransaction(transaction);
        return { data: res, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSendTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
    }
  }

  // Research xem switch được không ?
  async switchNetwork(
    chainId: string,
    callBackAddChain?: ((error: Error) => Promise<void>) | undefined,
  ): Promise<WalletReturnType<boolean, string>> {
    return { data: null, error: 'Not support this function', isError: true };
  }

  async signMessage(message: string): Promise<WalletReturnType<string[], string>> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const msg = `0x${Buffer.from(message, 'utf8').toString('hex')}`;
        const res = await wallet.signMessage(msg);
        return { data: res as any, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.message, isError: true };
    }
  }

  async signTypedDataV4(msgParams: TypedMessageV4<any>): Promise<WalletReturnType<string, string>> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();
      try {
        const msg = msgParams;
        const response = await wallet.signTypedDataV4(JSON.stringify(msg));

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
        const response = await wallet.signTypedDataV4(JSON.stringify(msg));

        return { data: response, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
    }
    // return { data: null, error: 'Not support this function', isError: true };
  }

  async signTypedData(msgParams: TypedMessage[]): Promise<WalletReturnType<string, string>> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();
      try {
        const msg = msgParams;
        const response = await wallet.signTypedDataV4(JSON.stringify(msg));

        return { data: response, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
    }
    // return { data: null, error: 'Not support this function', isError: true };
  }

  private _disconnected = () => {
    const wallet = this._wallet;
    if (wallet) {
      wallet.client.off('session_delete', this._disconnected);

      this._wallet = null;
      this._address = null;

      this.emit('error', new WalletDisconnectedError());
      this.emit('disconnect');
    }
  };

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
