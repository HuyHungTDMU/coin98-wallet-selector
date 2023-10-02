import { WalletError } from '@coin98t/wallet-adapter-base';

export class WalletNotSelectedError extends WalletError {
  name = 'WalletNotSelectedError';
}
