import { Signature, PublicKey } from '@near-js/crypto';
/**
 * General signing interface, can be used for in memory signing, RPC singing, external wallet, HSM, etc.
 */
export declare abstract class Signer {
  /**
   * Creates new key and returns public key.
   */
  abstract createKey(accountId: string, networkId?: string): Promise<PublicKey>;
  /**
   * Returns public key for given account / network.
   * @param accountId accountId to retrieve from.
   * @param networkId The targeted network. (ex. default, betanet, etc…)
   */
  abstract getPublicKey(accountId?: string, networkId?: string): Promise<PublicKey>;
  /**
   * Signs given message, by first hashing with sha256.
   * @param message message to sign.
   * @param accountId accountId to use for signing.
   * @param networkId The targeted network. (ex. default, betanet, etc…)
   */
  abstract signMessage(message: Uint8Array, accountId?: string, networkId?: string): Promise<Signature>;
}

interface IConnectParams {
  prefix: string;
  contractId: string;
}

export interface SignMessageParams {
  message: string;
  recipient: string;
  nonce: Buffer;
  callbackUrl?: string;
  state?: string;
}

export interface SignedMessage {
  accountId: string;
  publicKey: string;
  signature: string;
  state?: string;
}

export interface ICoin98Near {
  account: string;
  signer: Signer;
  connect: (params: IConnectParams) => Promise<string>;
  disconnect: () => Promise<void>;
  signMessage: (params: SignMessageParams) => Promise<SignedMessage>;
}

export interface Account {
  /**
   * NEAR account identifier.
   */
  accountId: string;
  /**
   * Account public key.
   */
  publicKey?: string;
}
