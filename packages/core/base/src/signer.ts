import type { Connection, TransactionSignature } from '@solana/web3.js';
import {
  BaseWalletAdapterCosmos,
  BaseWalletAdapterEVM,
  BaseWalletAdapterNear,
  BaseWalletAdapterSolana,
  WalletAdapterCosmos,
  WalletAdapterCosmosProps,
  WalletAdapterEVM,
  WalletAdapterEVMProps,
  WalletAdapterNear,
  WalletAdapterNearProps,
  WalletAdapterSolana,
  WalletAdapterSolanaProps,
  type SendTransactionOptions,
} from './adapter.js';
import { WalletSendTransactionError, WalletSignTransactionError } from './errors';
import { isVersionedTransaction, type TransactionOrVersionedTransaction } from './transaction.js';
import { WalletReturnType, WatchAssetType } from './types/evm-solana-cosmos';
import { SignMessageParams } from './types/near/wallet.types.js';

export interface SignerWalletAdapterSolanaProps<Name extends string = string> extends WalletAdapterSolanaProps<Name> {
  signTransaction<T extends TransactionOrVersionedTransaction<this['supportedTransactionVersions']>>(
    transaction: T,
  ): Promise<T>;
  signAllTransactions<T extends TransactionOrVersionedTransaction<this['supportedTransactionVersions']>>(
    transactions: T[],
  ): Promise<T[]>;
}

export interface SignerWalletAdapterEVMProps<Name extends string = string> extends WalletAdapterEVMProps<Name> {
  signTransaction<Transaction>(transaction: Transaction): Promise<Transaction>;
  signAllTransactions<Transaction>(transactions: Transaction[]): Promise<Transaction[]>;
}

// export type SignerWalletAdapter<Name extends string = string> = WalletAdapter<Name> & SignerWalletAdapterProps<Name>;
export type SignerWalletAdapterSolana<Name extends string = string> = WalletAdapterSolana<Name> &
  SignerWalletAdapterSolanaProps<Name>;

export type SignerWalletAdapterEVM<Name extends string = string> = WalletAdapterEVM<Name> &
  SignerWalletAdapterEVMProps<Name>;

export abstract class BaseSignerWalletAdapterSolana<Name extends string = string>
  extends BaseWalletAdapterSolana<Name>
  implements SignerWalletAdapterSolana<Name>
{
  async sendTransaction(
    transaction: TransactionOrVersionedTransaction<this['supportedTransactionVersions']>,
    connection: Connection,
    options: SendTransactionOptions = {},
  ): Promise<WalletReturnType<TransactionSignature, string>> {
    let emit = true;
    try {
      if (isVersionedTransaction(transaction)) {
        if (!this.supportedTransactionVersions)
          throw new WalletSendTransactionError(`Sending versioned transactions isn't supported by this wallet`);

        if (!this.supportedTransactionVersions.has((transaction as any).version))
          throw new WalletSendTransactionError(
            `Sending transaction version ${(transaction as any).version} isn't supported by this wallet`,
          );

        try {
          transaction = await this.signTransaction(transaction);
          const rawTransaction = transaction.serialize();
          const res = await connection.sendRawTransaction(rawTransaction, options);
          return { data: res, error: null, isError: false };
        } catch (error: any) {
          // If the error was thrown by `signTransaction`, rethrow it and don't emit a duplicate event
          if (error instanceof WalletSignTransactionError) {
            emit = false;
            throw error;
          }
          throw new WalletSendTransactionError(error?.message, error);
        }
      } else {
        try {
          const { signers, ...sendOptions } = options;

          transaction = await this.prepareTransaction(transaction, connection, sendOptions);

          signers?.length && transaction.partialSign(...signers);

          transaction = await this.signTransaction(transaction);
          const rawTransaction = transaction.serialize();
          const res = await connection.sendRawTransaction(rawTransaction, sendOptions);
          return { data: res, error: null, isError: false };
        } catch (error: any) {
          // If the error was thrown by `signTransaction`, rethrow it and don't emit a duplicate event
          if (error instanceof WalletSignTransactionError) {
            emit = false;
            throw error;
          }
          throw new WalletSendTransactionError(error?.message, error);
        }
      }
    } catch (error: any) {
      if (emit) {
        this.emit('error', error);
      }
      return { data: null, error: error?.message, isError: true };
      // throw error;
    }
  }

  abstract signTransaction<T extends TransactionOrVersionedTransaction<this['supportedTransactionVersions']>>(
    transaction: T,
  ): Promise<T>;

  async signAllTransactions<T extends TransactionOrVersionedTransaction<this['supportedTransactionVersions']>>(
    transactions: T[],
  ): Promise<T[]> {
    for (const transaction of transactions) {
      if (isVersionedTransaction(transaction)) {
        if (!this.supportedTransactionVersions)
          throw new WalletSignTransactionError(`Signing versioned transactions isn't supported by this wallet`);

        if (!this.supportedTransactionVersions.has((transaction as any).version))
          throw new WalletSignTransactionError(
            `Signing transaction version ${(transaction as any).version} isn't supported by this wallet`,
          );
      }
    }

    const signedTransactions: T[] = [];
    for (const transaction of transactions) {
      signedTransactions.push(await this.signTransaction(transaction));
    }
    return signedTransactions;
  }
}

export abstract class BaseSignerWalletAdapterEVM<Name extends string = string> extends BaseWalletAdapterEVM<Name> {}

export abstract class BaseSignerWalletAdapterNear<Name extends string = string> extends BaseWalletAdapterNear<Name> {}
export abstract class BaseSignerWalletAdapterCosmos<
  Name extends string = string,
> extends BaseWalletAdapterCosmos<Name> {}

export interface MessageSignerWalletAdapterSolanaProps<Name extends string = string>
  extends WalletAdapterSolanaProps<Name> {
  signMessage(message: Uint8Array | string): Promise<WalletReturnType<Uint8Array, string>>;
}

export interface MessageSignerWalletAdapterEVMProps<Name extends string = string> extends WalletAdapterEVMProps<Name> {
  signMessage(message: string): Promise<WalletReturnType<string[], string>>;
}

export interface FullySignerWalletAdapterEVMProps<Name extends string = string> extends WalletAdapterEVMProps<Name> {
  watchAsset(params: WatchAssetType): Promise<WalletReturnType<boolean, string>>;
  ethSign(message: string): Promise<WalletReturnType<string, string>>;
  getEncryptionPublicKey(): Promise<WalletReturnType<string, string>>;
  ethDecrypt(message: string, address?: string): Promise<WalletReturnType<unknown, string>>;
}

export interface MessageSignerWalletAdapterCosmosProps<Name extends string = string>
  extends WalletAdapterCosmosProps<Name> {
  signMessage(message: string | Uint8Array): Promise<WalletReturnType<string, string>>;
}

export interface MessageSignerWalletAdapterNearProps<Name extends string = string>
  extends WalletAdapterNearProps<Name> {
  signMessage({ message, nonce, recipient, state }: SignMessageParams): Promise<WalletReturnType<string, string>>;
}

export type MessageSignerWalletAdapterSolana<Name extends string = string> = WalletAdapterSolana<Name> &
  MessageSignerWalletAdapterSolanaProps<Name>;

export type MessageSignerWalletAdapterEVM<Name extends string = string> = WalletAdapterEVM<Name> &
  MessageSignerWalletAdapterEVMProps<Name>;

export type FullySignerWalletAdapterEVM<Name extends string = string> = MessageSignerWalletAdapterEVM<Name> &
  FullySignerWalletAdapterEVMProps<Name>;

export type MessageSignerWalletAdapterCosmos<Name extends string = string> = WalletAdapterCosmos<Name> &
  MessageSignerWalletAdapterCosmosProps<Name>;
export abstract class BaseMessageSignerWalletAdapterSolana<Name extends string = string>
  extends BaseSignerWalletAdapterSolana<Name>
  implements MessageSignerWalletAdapterSolana<Name>
{
  abstract signMessage(message: Uint8Array | string): Promise<WalletReturnType<Uint8Array, string>>;
}
export type MessageSignerWalletAdapterNear<Name extends string = string> = WalletAdapterNear<Name> &
  MessageSignerWalletAdapterNearProps<Name>;

export abstract class BaseMessageSignerWalletAdapterEVM<Name extends string = string>
  extends BaseSignerWalletAdapterEVM<Name>
  implements MessageSignerWalletAdapterEVM<Name>
{
  abstract signMessage(message: string): Promise<WalletReturnType<string[], string>>;
}

export abstract class BaseFullySignerWalletAdapterEVM<Name extends string = string>
  extends BaseMessageSignerWalletAdapterEVM<Name>
  implements FullySignerWalletAdapterEVM<Name>
{
  abstract watchAsset(params: WatchAssetType): Promise<WalletReturnType<boolean, string>>;
  abstract ethSign(message: string): Promise<WalletReturnType<string, string>>;
  abstract getEncryptionPublicKey(): Promise<WalletReturnType<string, string>>;
  abstract ethDecrypt(message: string, address?: string): Promise<WalletReturnType<unknown, string>>;
}
export abstract class BaseMessageSignerWalletAdapterCosmos<Name extends string = string>
  extends BaseSignerWalletAdapterCosmos<Name>
  implements MessageSignerWalletAdapterCosmos<Name>
{
  abstract signMessage(message: string | Uint8Array): Promise<WalletReturnType<string, string>>;
}

export abstract class BaseMessageSignerWalletAdapterNear<Name extends string = string>
  extends BaseSignerWalletAdapterNear<Name>
  implements MessageSignerWalletAdapterNear<Name>
{
  abstract signMessage({
    message,
    nonce,
    recipient,
    state,
  }: SignMessageParams): Promise<WalletReturnType<string, string>>;
}
