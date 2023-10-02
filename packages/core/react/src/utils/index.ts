import { Adapter, WalletError, WalletNotReadyError } from '@coin98t/wallet-adapter-base';

export const handleErrorAdapter = (
  error: WalletError,
  isUnloading: boolean,
  adapter?: Adapter,
  onError?: (error: WalletError, adapter?: Adapter) => void,
) => {
  if (!isUnloading) {
    if (onError) {
      onError(error, adapter);
    } else {
      console.error(error, adapter);
      if (error instanceof WalletNotReadyError && typeof window !== 'undefined' && adapter) {
        window.open(adapter.url, '_blank');
      }
    }
  }
  return error;
};
