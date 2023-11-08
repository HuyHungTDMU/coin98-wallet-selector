import {
  BaseMessageSignerWalletAdapterEVM,
  TypedMessageV3,
  TypedMessageV4,
  WalletAccountError,
  WalletName,
  WalletReadyState,
  WalletReturnType,
} from '@coin98t/wallet-adapter-base';
import { Transaction } from 'web3-types';
import iconUrl from './icon';
import TrezorConnect, { EthereumTransaction, EthereumTransactionEIP1559 } from '@trezor/connect-web';

export const TrezorWalletName = 'Trezor' as WalletName<'Trezor'>;

export class TrezorWalletAdapterEthereum extends BaseMessageSignerWalletAdapterEVM {
  id = 'trezor_ether';
  chain = 'evm';
  name = TrezorWalletName;
  url = 'https://trezor.io/trezor-suite';
  icon = iconUrl;

  private _connecting: boolean;
  private _address: string | null;
  private _chainId: string | null;
  private _readyState: WalletReadyState = WalletReadyState.Installed;

  constructor() {
    super();
    this._connecting = false;
    this._address = null;
    this._chainId = null;

    TrezorConnect.init({
      lazyLoad: true, // this param will prevent iframe injection until TrezorConnect.method will be called
      manifest: {
        email: 'support@coin98.com',
        appUrl: 'coin98.com',
      },
    });
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
    return TrezorConnect;
  }

  async getAddress(): Promise<string> {
    const result = await TrezorConnect.getAddress({
      coin: 'eth', // Loại tiền tệ (ví dụ: btc, eth)
      path: "m/49'/0'/0'/0/0", // Đường dẫn (ví dụ: m/44'/60'/0'/0/0)
    });

    if (result.success) {
      this._connecting = true;
      this._address = result.payload.address;
      this._chainId = '0x1';

      return result.payload.address;
    } else {
      throw new WalletAccountError(result.payload.error);
    }
  }

  async autoConnect() {
    try {
      if (this.connected || this.connecting) return;
      const address = await this.getAddress();
      this.emit('connect', address);
      this.emit('changeChainId', '0x1');
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async connect(chainId?: string): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      const address = await this.getAddress();
      this.emit('connect', address!);
      this.emit('changeChainId', chainId || '0x1');
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    this._chainId = null;
    this._address = null;
    this.emit('disconnect');
  }

  async sendTransaction(transaction: Transaction): Promise<WalletReturnType<string[], string>> {
    return { data: null, error: 'Send transaction is not supported', isError: true };
  }

  async signTransaction(
    transaction: EthereumTransaction | EthereumTransactionEIP1559,
  ): Promise<WalletReturnType<string[], string>> {
    try {
      const response = await TrezorConnect.ethereumSignTransaction({
        path: "m/44'/60'/0'",
        transaction,
      });

      if (response.success) {
        return { data: [response.payload.r + response.payload.s + response.payload.v], error: null, isError: false };
      } else {
        return { data: null, error: response.payload.error, isError: true };
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
    }
  }

  async signMessage(message: string): Promise<WalletReturnType<string[], string>> {
    try {
      const response = await TrezorConnect.signMessage({
        path: "m/44'/0'/0'",
        message: message,
        coin: 'eth',
      });

      if (response.success) {
        return { data: [response.payload.signature], error: null, isError: false };
      } else {
        return { data: null, error: response.payload.error, isError: true };
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
    return { data: false, error: 'Switch network is not supported', isError: true };
  }

  async signTypedDataV4(msgParams: TypedMessageV4<any>): Promise<WalletReturnType<string, string>> {
    return { data: null, error: 'SignTypedDataV4 network is not supported', isError: true };
  }

  async signTypedDataV3(msgParams: TypedMessageV3<any>): Promise<WalletReturnType<string, string>> {
    return { data: null, error: 'SignTypedDataV3 network is not supported', isError: true };
  }

  async signTypedData(): Promise<WalletReturnType<string, string>> {
    return { data: null, error: 'SignTypedData network is not supported', isError: true };
  }
}
