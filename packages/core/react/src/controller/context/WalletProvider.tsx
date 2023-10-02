import { Adapter, TypeConnectError, WalletError } from '@coin98t/wallet-adapter-base';
import { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { AdapterInjection } from '../../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { WalletProviderBase } from './WalletProviderBase';

export interface WalletProviderProps {
  children: ReactNode | React.ReactElement;
  wallets: AdapterInjection[];
  enables: string[];
  autoConnect?: boolean;
  localStorageKey?: string;
  onError?: (error: WalletError, adapter?: Adapter) => void;
}

export type WalletStoreType = {
  walletId: string | null;
  chainId: string | null;
} | null;

export function WalletProvider({
  children,
  wallets: adapters,
  enables,
  autoConnect,
  localStorageKey = 'walletId',
  onError,
}: WalletProviderProps) {
  const [walletActive, setWalletActive] = useLocalStorage<WalletStoreType>(localStorageKey, null);

  const isUnloadingRef = useRef(false);

  // Get adapter sync with blockchain enables
  const renderedAdapters: Adapter[] = adapters.map(walletAdapter => walletAdapter.getAdapter(enables)).flat();

  const adapter = useMemo(
    () => renderedAdapters.find(a => a.id === walletActive?.walletId) ?? null,
    [walletActive?.walletId, renderedAdapters],
  );

  const changeWallet = useCallback(
    (nextWalletId: string | null, chainId: string | null) => {
      if (walletActive?.walletId === nextWalletId && walletActive?.chainId === chainId) {
        return;
      }
      if (adapter) {
        adapter.disconnect();
      }
      setWalletActive({ walletId: nextWalletId, chainId });
    },
    [adapter, setWalletActive, walletActive],
  );

  useEffect(() => {
    if (adapter == null) {
      return;
    }
    function handleDisconnect() {
      if (isUnloadingRef.current) {
        return;
      }
      setWalletActive(null);
    }
    adapter.on('disconnect', handleDisconnect);
    return () => {
      adapter.off('disconnect', handleDisconnect);
    };
  }, [adapter, setWalletActive, walletActive?.walletId]);

  useEffect(() => {
    function handleBeforeUnload() {
      isUnloadingRef.current = true;
    }
    /**
     * Some wallets fire disconnection events when the window unloads. Since there's no way to
     * distinguish between a disconnection event received because a user initiated it, and one
     * that was received because they've closed the window, we have to track window unload
     * events themselves. Downstream components use this information to decide whether to act
     * upon or drop wallet events and errors.
     */
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [renderedAdapters, walletActive?.walletId]);

  const handleCallback = useRef<(error: Error, typeError: TypeConnectError) => Promise<void>>();

  // Return error cross callback of selectWallet
  const handleConnectError = useCallback(
    (error: any, typeError: TypeConnectError) => {
      if (adapter) {
        // If any error happens while connecting, unset the adapter.
        changeWallet(null, null);
        handleCallback.current?.(error, typeError);
      }
    },
    [adapter, changeWallet],
  );

  const hasUserSelectedAWallet = useRef(false);

  const selectWallet = useCallback(
    (
      walletId: string | null,
      chainId: string | null,
      callback?: (error: Error, typeError: TypeConnectError) => Promise<void>,
    ) => {
      //evm chainId thoải mái, nếu sai thì nó ko switch chain qua được => connect ko được.
      hasUserSelectedAWallet.current = true;
      changeWallet(walletId, chainId);
      handleCallback.current = callback;
    },
    [changeWallet],
  );

  const handleAutoConnectRequest = useMemo(() => {
    if (autoConnect !== true || !adapter) {
      return;
    }

    return () => {
      return hasUserSelectedAWallet.current
        ? adapter.connect(walletActive?.chainId!, handleCallback.current)
        : adapter.autoConnect(walletActive?.chainId!);
    };
  }, [adapter, autoConnect, walletActive?.chainId]);

  return (
    <WalletProviderBase
      wallets={renderedAdapters}
      enables={enables}
      adapter={adapter}
      setWalletActive={setWalletActive}
      onSelectWallet={selectWallet}
      isUnloadingRef={isUnloadingRef}
      onConnectError={handleConnectError}
      onAutoConnectRequest={handleAutoConnectRequest}
      onError={onError}
      walletActive={walletActive}
    >
      {children}
    </WalletProviderBase>
  );
}
