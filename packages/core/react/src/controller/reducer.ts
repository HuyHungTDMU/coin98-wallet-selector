import { Adapter } from '@coin98t/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import { chainsUseAddress } from '../constants';

export enum AdapterActionKind {
  CONNECT = 'CONNECT',
  DISCONNECT = 'DISCONNECT',
  CONNECTING = 'CONNECTING',
  UNCONNECTING = 'UNCONNECTING',
  DISCONNECTING = 'DISCONNECTING',
  UNDISCONNECTING = 'UNDISCONNECTING',
}

export type AdapterActionType =
  | {
      type: AdapterActionKind.CONNECT;
      payload: {
        data: string | PublicKey;
        adapter: Adapter;
      };
    }
  | {
      type: AdapterActionKind.DISCONNECT;
    }
  | {
      type: AdapterActionKind.CONNECTING;
    }
  | {
      type: AdapterActionKind.UNCONNECTING;
    }
  | {
      type: AdapterActionKind.DISCONNECTING;
    }
  | {
      type: AdapterActionKind.UNDISCONNECTING;
    };

export interface AdapterAcionState {
  connected: boolean;
  disconnecting: boolean;
  connecting: boolean;
  address: string | null;
  publicKey: PublicKey | null;
  selectedBlockChain: string | null;
  provider: unknown;
}

export function reducer(state: AdapterAcionState, action: AdapterActionType) {
  const { type } = action;

  switch (type) {
    case AdapterActionKind.CONNECT:
      const { adapter, data } = action.payload;
      const isUseAddress = chainsUseAddress.includes(adapter.chain) ? true : false;

      return {
        ...state,
        connecting: false,
        connected: true,
        disconnecting: false,
        [isUseAddress ? 'address' : 'publicKey']: isUseAddress ? (data as string) : (data as PublicKey),
        selectedBlockChain: adapter.chain,
        provider: adapter.provider,
      };

    case AdapterActionKind.DISCONNECT:
      return {
        ...state,
        connecting: false,
        connected: false,
        disconnecting: false,
        address: null,
        publicKey: null,
        provider: null,
        selectedBlockChain: null,
      };
    case AdapterActionKind.CONNECTING:
      return { ...state, connecting: true };
    case AdapterActionKind.DISCONNECTING:
      return { ...state, disconnecting: true };
    case AdapterActionKind.UNCONNECTING:
      return { ...state, connecting: false };
    case AdapterActionKind.UNDISCONNECTING:
      return { ...state, disconnecting: false };
    default:
      return state;
  }
}
