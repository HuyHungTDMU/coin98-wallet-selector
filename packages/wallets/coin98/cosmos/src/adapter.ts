import {
  BaseMessageSignerWalletAdapterCosmos,
  BroadcastMode,
  EventEmitter,
  Key,
  OfflineSigner,
  scopePollingDetectionStrategy,
  StdFee,
  StdSignature,
  TransactionCosmos,
  TypeConnectError,
  WalletAccountError,
  WalletConnectionError,
  WalletName,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
  WalletReturnType,
  WalletSendTransactionError,
  WalletSignMessageError,
} from '@coin98t/wallet-adapter-base';
import { toAscii, toUtf8 } from '@cosmjs/encoding';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { calculateFee } from '@cosmjs/stargate';
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import { coin98ExtensionInfo } from './registry';
import iconUrl from './icon';

interface Coin98WalletEvents {
  connect(...args: unknown[]): unknown;

  disconnect(...args: unknown[]): unknown;

  keplr_keystorechange(...args: unknown[]): unknown;

  changeChainId(...args: unknown[]): unknown;
}

interface Coin98Wallet extends EventEmitter<Coin98WalletEvents> {
  enable(chainIds: string | string[]): Promise<void>;

  disable(chainIds?: string | string[]): Promise<void>;

  getKey(chainId: string): Promise<Key>;

  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature>;

  verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature,
  ): Promise<boolean>;

  getOfflineSigner(chainId: string): OfflineSigner | null;

  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array>;
}

interface Coin98Window extends Window {
  coin98: {
    keplr?: Coin98Wallet;
  };
}

declare const window: Coin98Window;

export interface Coin98WalletAdapterConfig {}

export const Coin98WalletName = 'Coin98' as WalletName<'Coin98'>;

export class Coin98WalletAdapterCosmos extends BaseMessageSignerWalletAdapterCosmos {
  id = 'coin98_cosmos';
  chain = 'cosmos';
  name = Coin98WalletName;
  url = 'https://chrome.coin98.com/';
  icon = iconUrl;
  private _connecting: boolean;
  private _wallet: Coin98Wallet | null;
  private _address: string | null;
  private _chainId: string | null;
  private _offlineSigner: OfflineSigner | null;
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
    this._offlineSigner = null;

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

  get chainId() {
    return this._chainId;
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

  get offlineSigner() {
    return this._offlineSigner;
  }

  get provider() {
    return this._wallet;
  }

  async autoConnect(chainId: string) {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();
      this._connecting = true;

      const wallet = window.coin98.keplr!;
      let address: string;
      let offlineSigner: OfflineSigner | null;

      try {
        const { bech32Address } = await wallet.getKey(chainId);
        address = bech32Address;
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      try {
        offlineSigner = wallet.getOfflineSigner(chainId);
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      this._wallet = wallet;
      this._address = address;
      this._chainId = chainId;
      this._offlineSigner = offlineSigner;

      window.addEventListener('cosmos_accountsChanged', this._onKeyStoreChange);

      this.emit('changeChainId', chainId);
      this.emit('connect', address);
    } catch (error: any) {
      this.emit(error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async connect(
    chainId: string,
    callback?: (error: Error, typeError: TypeConnectError) => Promise<void>,
  ): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();
      this._connecting = true;

      const wallet = window.coin98.keplr!;
      let address: string;
      let offlineSigner: OfflineSigner | null;

      try {
        /// connect wallet
        await wallet.enable(chainId);
      } catch (error: any) {
        if (this._rejectMatched(error as Error)) {
          throw new WalletConnectionError(error?.message, error);
        }
        // callback add chain
        await callback?.(error as Error, 'network');
        await wallet.enable(chainId);
      }

      try {
        const { bech32Address } = await wallet.getKey(chainId);
        address = bech32Address;
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      try {
        offlineSigner = wallet.getOfflineSigner(chainId);
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      this._wallet = wallet;
      this._address = address!;
      this._chainId = chainId;
      this._offlineSigner = offlineSigner;

      window.addEventListener('cosmos_accountsChanged', this._onKeyStoreChange);

      this.emit('changeChainId', chainId);
      this.emit('connect', address!);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(chainId?: string | string[]): Promise<void> {
    const wallet = this._wallet;
    if (wallet) {
      window.removeEventListener('cosmos_accountsChanged', this._onKeyStoreChange);

      this._wallet = null;
      this._address = null;
      this._chainId = null;
      this._offlineSigner = null;
    }
    this.emit('disconnect');
  }

  async signMessage(message: string | Uint8Array): Promise<WalletReturnType<string, string>> {
    try {
      const wallet = this._wallet;
      const chainId = this._chainId;
      const from = this._address;

      if (!wallet) throw new WalletNotConnectedError();
      try {
        if (typeof message === 'string') {
          message = toAscii(message);
        }
        const { signature } = await wallet.signArbitrary(chainId!, from!, message);
        return { data: signature, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.message, isError: true };
    }
  }

  // Send Transaction CosmosJS
  async sendTransaction(transaction: TransactionCosmos): Promise<WalletReturnType<string, string>> {
    try {
      const wallet = this._wallet;
      const offlineSigner = this._offlineSigner;
      let client;
      let usedFee: StdFee | 'auto' | number;

      if (!wallet) throw new WalletNotConnectedError();

      try {
        client = await SigningCosmWasmClient.connectWithSigner(transaction.rpcUrl, offlineSigner as any);
      } catch (error: any) {
        throw new WalletSendTransactionError(error?.message, error);
      }

      if (!transaction.fee) {
        const signAndBroadcastMessages = transaction.instructions.map(i => ({
          typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
          value: MsgExecuteContract.fromPartial({
            sender: this._address!,
            contract: i.contractAddress,
            msg: toUtf8(JSON.stringify(i.msg)),
            funds: [...(i.funds || [])],
          }),
        }));

        const gasEstimation = await client.simulate(this._address!, signAndBroadcastMessages, transaction.memo);
        const multiplier = 1.3;
        usedFee = calculateFee(Math.round(gasEstimation * multiplier), '0.0025' + transaction.denom);
      } else {
        usedFee = transaction.fee;
      }

      try {
        const result = await client.executeMultiple(
          this._address!,
          transaction.instructions,
          usedFee,
          transaction.memo || '',
        );

        return { data: result as any, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSendTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.error?.message, isError: true };
    }
  }

  private _onKeyStoreChange = async () => {
    const wallet = this._wallet;
    if (!wallet) return;
    const chainId = this._chainId;

    this._address = null;
    await this.autoConnect(chainId!);
  };

  private _rejectMatched(e: Error) {
    return coin98ExtensionInfo.rejectMessage.source === e.message;
  }
}
