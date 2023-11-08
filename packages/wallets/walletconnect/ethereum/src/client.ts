import WalletConnectClient from '@walletconnect/sign-client';

import type { EngineTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';
import { getSdkError, parseAccountId } from '@walletconnect/utils';
import { ClientNotInitializedError } from './errors.js';
import { WalletConnectModal } from '@walletconnect/modal';
import { Transaction } from 'web3-types';

export interface WalletConnectWalletAdapterConfig {
  network: string;
  options: SignClientTypes.Options;
}

export enum WalletConnectRPCMethods {
  signTransaction = 'eth_signTransaction',
  signMessage = 'personal_sign',
  signEth = 'eth_sign',
  sendTransaction = 'eth_sendTransaction',
  singTypedData = 'eth_signTypedData',
  sendRawTransaction = 'eth_sendRawTransaction',
}

interface WalletConnectWalletInit {
  address: string;
}

const getConnectParams = (chainId: string): EngineTypes.FindParams => ({
  requiredNamespaces: {
    eip155: {
      chains: [chainId],
      methods: [
        WalletConnectRPCMethods.signTransaction,
        WalletConnectRPCMethods.signMessage,
        WalletConnectRPCMethods.sendTransaction,
        WalletConnectRPCMethods.signEth,
        WalletConnectRPCMethods.singTypedData,
      ],
      events: ['chainChanged', 'accountsChanged'],
    },
  },
});

export class WalletConnectWallet {
  private _client: WalletConnectClient | undefined;
  private _session: SessionTypes.Struct | undefined;
  private readonly _network: string;
  private readonly _options: SignClientTypes.Options;

  constructor(config: WalletConnectWalletAdapterConfig) {
    this._network = config.network;
    this._options = config.options;
  }

  async connect(): Promise<WalletConnectWalletInit> {
    const walletConnectModal = new WalletConnectModal({
      projectId: this._options.projectId!,
      themeVariables: { '--wcm-z-index': '999999' },
    });

    const client = this._client ?? (await WalletConnectClient.init(this._options)); //projectId is required
    const sessions = client.find(getConnectParams(this._network)).filter((s: any) => s.acknowledged);

    if (sessions.length) {
      // select last matching session
      this._session = sessions[sessions.length - 1];
      // We assign this variable only after we're sure we've received approval
      this._client = client;

      return {
        address: this.address,
      };
    } else {
      const { uri, approval } = await client.connect(getConnectParams(this._network));
      return new Promise((resolve, reject) => {
        if (uri) {
          walletConnectModal.openModal({ uri });
        }

        approval()
          .then(session => {
            this._session = session;
            // We assign this variable only after we're sure we've received approval
            this._client = client;

            resolve({ address: this.address });
          })
          .catch(reject)
          .finally(() => {
            walletConnectModal.closeModal();
          });
      });
    }
  }

  async disconnect() {
    if (this._client && this._session) {
      await this._client.disconnect({
        topic: this._session.topic,
        reason: getSdkError('USER_DISCONNECTED'),
      });
      this._session = undefined;
    } else {
      throw new ClientNotInitializedError();
    }
  }

  get client(): WalletConnectClient {
    if (this._client) {
      // TODO: using client.off throws an error
      return Object.assign({}, this._client, { off: this._client.removeListener });
      // return this._client;
    } else {
      throw new ClientNotInitializedError();
    }
  }

  get address(): string {
    if (this._client && this._session) {
      const { address } = parseAccountId(this._session.namespaces.eip155.accounts[0]);
      return address;
    } else {
      throw new ClientNotInitializedError();
    }
  }

  async sendTransaction(transaction: Transaction): Promise<string> {
    if (this._client && this._session) {
      const res = await this._client.request<string>({
        // The network does not change the output of message signing, but this is a required parameter for SignClient
        chainId: this._network,
        topic: this._session.topic,
        request: {
          method: WalletConnectRPCMethods.sendTransaction,
          params: [transaction],
        },
      });

      return res;
    } else {
      throw new ClientNotInitializedError();
    }
  }

  async signMessage(message: string): Promise<string> {
    if (this._client && this._session) {
      const res = await this._client.request<string>({
        // The network does not change the output of message signing, but this is a required parameter for SignClient
        chainId: this._network,
        topic: this._session.topic,
        request: {
          method: WalletConnectRPCMethods.signMessage,
          params: [message, this.address.toString()],
        },
      });

      return res;
    } else {
      throw new ClientNotInitializedError();
    }
  }

  async signTransaction(transaction: Transaction): Promise<string> {
    if (this._client && this._session) {
      const { signature } = await this._client.request<{ signature: string }>({
        // The network does not change the output of message signing, but this is a required parameter for SignClient
        chainId: this._network,
        topic: this._session.topic,
        request: {
          method: WalletConnectRPCMethods.signTransaction,
          params: [transaction],
        },
      });

      return signature;
    } else {
      throw new ClientNotInitializedError();
    }
  }

  async signTypedDataV4(message: string): Promise<string> {
    if (this._client && this._session) {
      const res = await this._client.request<string>({
        // The network does not change the output of message signing, but this is a required parameter for SignClient
        chainId: this._network,
        topic: this._session.topic,
        request: {
          method: WalletConnectRPCMethods.singTypedData,
          params: [this.address.toString(), message],
        },
      });

      return res;
    } else {
      throw new ClientNotInitializedError();
    }
  }

  async sendRawTransaction(data: string): Promise<string> {
    if (this._client && this._session) {
      const res = await this._client.request<string>({
        // The network does not change the output of message signing, but this is a required parameter for SignClient
        chainId: this._network,
        topic: this._session.topic,
        request: {
          method: WalletConnectRPCMethods.singTypedData,
          params: [data],
        },
      });

      return res;
    } else {
      throw new ClientNotInitializedError();
    }
  }
}
