import {
  BaseMessageSignerWalletAdapterEVM,
  TypedMessage,
  TypedMessageV3,
  TypedMessageV4,
  WalletConnectionError,
  WalletName,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
  WalletReturnType,
  WalletSignMessageError,
} from '@coin98t/wallet-adapter-base';
import { Transaction } from 'web3-types';
import iconUrl from './icon';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebBLE from '@ledgerhq/hw-transport-web-ble';
import Eth from '@ledgerhq/hw-app-eth';
import { LedgerEthTransactionResolution } from '@ledgerhq/hw-app-eth/lib/services/types';

export const LedgerName = 'Ledger' as WalletName<'Ledger'>;

const enum ConnectionType {
  hid = 'hid',
  ble = 'ble',
}

export class LedgerAdapterEthereum extends BaseMessageSignerWalletAdapterEVM {
  id = 'ledger_ether';
  chain = 'evm';
  name = LedgerName;
  url = 'https://www.ledger.com';
  icon = iconUrl;
  private _chainId: string | null;
  private _wallet: any | null;
  private _transport: any | null;
  private _connecting: boolean;
  private _address: string | null;

  constructor() {
    super();
    this._connecting = false;
    this._wallet = null;
    this._address = null;
    this._chainId = null;
    this._transport = null;
  }

  get connecting() {
    return this._connecting;
  }

  get address() {
    return this._address;
  }

  get provider() {
    return this._wallet;
  }

  private _readyState: WalletReadyState = WalletReadyState.Installed;

  get readyState() {
    return this._readyState;
  }

  get connected() {
    return !!this._address;
  }

  async getAccount(connectionType: ConnectionType) {
    if (this.connected || this.connecting) return;

    const isSupported =
      connectionType === ConnectionType.hid ? await TransportWebHID.isSupported() : TransportWebBLE.isSupported();
    if (!isSupported) {
      throw new WalletNotReadyError();
    }

    let addressResult: string;
    const transport = this._transport;
    if (transport) {
      const eth = new Eth(transport);
      const ethResult = await eth.getAddress("44'/60'/0'/0/0");
      addressResult = ethResult.address;

      this._connecting = true;
      this._address = addressResult!;
    } else {
      let newTransport: any = null;
      try {
        newTransport =
          connectionType === ConnectionType.hid ? await TransportWebHID.create() : await TransportWebBLE.create();
        const eth = new Eth(newTransport);
        const ethResult = await eth.getAddress("44'/60'/0'/0/0");
        addressResult = ethResult.address;

        this._connecting = true;
        this._transport = newTransport;
        this._address = addressResult!;
      } catch (error: any) {
        this.emit('error', error);
        throw new WalletConnectionError();
      }
    }
    this.emit('connect', addressResult!);
  }

  async autoConnect(connectionType = ConnectionType.ble) {
    try {
      if (this.connected || this.connecting) return;
      await this.getAccount(connectionType);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async connect(connectionType = ConnectionType.ble): Promise<void> {
    try {
      await this.getAccount(connectionType);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const transport = this._transport;
    if (transport) {
      this._chainId = null;
      this._wallet = null;
      this._address = null;
      this._connecting = false;
    }
    this.emit('disconnect');
  }

  async sendTransaction(transaction: Transaction): Promise<WalletReturnType<string[], string>> {
    return { data: null, error: 'Send transaction is not supported', isError: true };
  }

  async signTransaction(
    rawTxHex: string,
    resolution?: LedgerEthTransactionResolution | null | undefined,
  ): Promise<WalletReturnType<string[], string>> {
    try {
      const transport = this._transport;
      if (!transport) throw new WalletNotConnectedError();
      try {
        const eth = new Eth(transport);
        const result = await eth.signTransaction("44'/60'/0'/0/0", rawTxHex, resolution);
        let v = (Number(result['v']) - 27).toString(16);
        if (v.length < 2) {
          v = '0' + v;
        }
        const signedHash = '0x' + result['r'] + result['s'] + v;

        return { data: [signedHash], error: null, isError: false };
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
    }
  }

  async signMessage(message: string): Promise<WalletReturnType<string[], string>> {
    try {
      const transport = this._transport;
      if (!transport) throw new WalletNotConnectedError();
      try {
        const eth = new Eth(transport);
        const signature = await eth.signPersonalMessage("44'/60'/0'/0/0", Buffer.from(message).toString('hex'));
        const signedHash = '0x' + signature.r + signature.s + signature.v.toString(16);

        return { data: [signedHash], error: null, isError: false };
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
    return { data: false, error: 'Switch network is not supported', isError: true };
  }

  async signTypedDataV4(msgParams: TypedMessageV4<any>): Promise<WalletReturnType<string, string>> {
    try {
      const transport = this._transport;
      if (!transport) throw new WalletNotConnectedError();
      try {
        const eth = new Eth(transport);
        const msg = msgParams;
        const signature = await eth.signPersonalMessage(
          "44'/60'/0'/0/0",
          Buffer.from(JSON.stringify(msg)).toString('hex'),
        );
        const signedHash = '0x' + signature.r + signature.s + signature.v.toString(16);

        return { data: signedHash, error: null, isError: false };
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
      const transport = this._transport;
      if (!transport) throw new WalletNotConnectedError();
      try {
        const eth = new Eth(transport);
        const msg = msgParams;
        const signature = await eth.signPersonalMessage(
          "44'/60'/0'/0/0",
          Buffer.from(JSON.stringify(msg)).toString('hex'),
        );
        const signedHash = '0x' + signature.r + signature.s + signature.v.toString(16);
        return { data: signedHash, error: null, isError: false };
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
      const transport = this._transport;
      if (!transport) throw new WalletNotConnectedError();
      try {
        const eth = new Eth(transport);
        const msg = msgParams;
        const signature = await eth.signPersonalMessage(
          "44'/60'/0'/0/0",
          Buffer.from(JSON.stringify(msg)).toString('hex'),
        );
        const signedHash = '0x' + signature.r + signature.s + signature.v.toString(16);
        return { data: signedHash, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
    }
  }
}
