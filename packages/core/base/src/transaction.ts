import type { Transaction as TransactionSolana, TransactionVersion, VersionedTransaction } from '@solana/web3.js';

export type SupportedTransactionVersions = ReadonlySet<TransactionVersion> | null | undefined;

export type TransactionOrVersionedTransaction<S extends SupportedTransactionVersions> = S extends null | undefined
  ? TransactionSolana
  : TransactionSolana | VersionedTransaction;

export function isVersionedTransaction(
  transaction: TransactionSolana | VersionedTransaction,
): transaction is VersionedTransaction {
  return 'version' in transaction;
}
