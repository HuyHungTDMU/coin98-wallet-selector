import {
  AdapterCosmos,
  AdapterEVM,
  AdapterSolana,
  AdapterNear,
  BaseMessageSignerWalletAdapterCosmos,
  BaseMessageSignerWalletAdapterEVM,
  BaseMessageSignerWalletAdapterSolana,
  BaseFullySignerWalletAdapterEVM,
  SendTransactionOptions,
  SignerWalletAdapterSolanaProps,
  SupportedTransactionVersions,
  TransactionCosmos,
  TransactionOrVersionedTransaction,
  TypeConnectError,
  TypedMessage,
  TypedMessageV3,
  TypedMessageV4,
  WalletError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReturnType,
  WatchAssetType,
  BaseMessageSignerWalletAdapterNear,
  Account,
} from '@coin98t/wallet-adapter-base';
import { type Adapter, WalletReadyState, SignMessageParams } from '@coin98t/wallet-adapter-base';
import {
  Connection,
  PublicKey,
  Transaction as TransactionSolana,
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js';

import React, { type ReactNode, useEffect, useState, useMemo, useCallback, useRef, useReducer } from 'react';
import { Transaction } from 'web3-types';
import { chainsUseAddress } from '../../constants';
import { WalletNotSelectedError } from '../../errors';
import { isFullySignerEVM } from '../../utils';
import { WalletContext } from '../hooks/useWallet.js';
import { AdapterActionKind, reducer } from '../reducer';
import { WalletStoreType } from './WalletProvider.js';

export interface WalletProviderBaseProps {
  children: ReactNode;
  wallets: Adapter[];
  enables: string[];
  walletActive: WalletStoreType;
  adapter: Adapter | null;
  isUnloadingRef: React.RefObject<boolean>;
  setWalletActive: React.Dispatch<
    React.SetStateAction<{
      walletId: string | null;
      chainId: string | null;
    } | null>
  >;
  onSelectWallet: (
    walletId: string | null,
    chainId: string,
    callback?: (error: Error, typeError: TypeConnectError) => Promise<void>,
  ) => void;
  onAutoConnectRequest?: () => Promise<void>;
  onConnectError: (error: any, typeError: TypeConnectError) => void;
  onError?: (error: WalletError, adapter?: Adapter) => void;
}

export function WalletProviderBase({
  children,
  wallets: adapters,
  enables,
  walletActive,
  setWalletActive,
  onSelectWallet,
  adapter,
  isUnloadingRef,
  onConnectError,
  onError,
  onAutoConnectRequest,
}: WalletProviderBaseProps) {
  const [state, dispatch] = useReducer(reducer, {
    connected: adapter?.connected ?? false,
    disconnecting: false,
    connecting: false,
    publicKey: (adapter as AdapterSolana)?.publicKey,
    address: (adapter as AdapterEVM | AdapterCosmos)?.address,
    selectedBlockChain: adapter?.chain!,
    provider: adapter?.provider,
  });
  const { connecting, connected, disconnecting, publicKey, address, selectedBlockChain, provider } = state;

  const [selectedChainId, setSelectedChainId] = useState<string[] | string | null>(null);

  const [isNotInstalled, setIsNotInstalled] = useState(false);

  const isConnectingRef = useRef(false);
  const isDisconnectingRef = useRef(false);

  //handle Error
  const onErrorRef = useRef(onError);

  // IN IT ADAPTERS
  useEffect(() => {
    onErrorRef.current = onError;
    return () => {
      onErrorRef.current = undefined;
    };
  }, [onError]);

  const handleErrorRef = useRef((error: WalletError, adapter?: Adapter) => {
    if (!isUnloadingRef.current) {
      if (onErrorRef.current) {
        onErrorRef.current(error, adapter);
      } else {
        console.error(error, adapter);
        if (error instanceof WalletNotReadyError && typeof window !== 'undefined' && adapter) {
          window.open(adapter.url, '_blank');
        }
      }
    }
    return error;
  });

  // Wrap with readyState when init wallets state, filter readyState !== Unsupported when put into wallets
  const [wallets, setWallets] = useState(() =>
    adapters
      .map(adapter => ({
        adapter,
        readyState: adapter.readyState,
      }))
      .filter(({ readyState }) => readyState !== WalletReadyState.Unsupported),
  );
  // Double check wallet, error if adapter return from function such as wallet connect
  const wallet = useMemo(() => wallets.find(wallet => wallet.adapter === adapter) ?? null, [adapter, wallets]);

  // When the adapters change, start to listen for changes to their `readyState`
  useEffect(() => {
    // When the adapters change, wrap them to conform to the `Wallet` interface
    setWallets(
      wallets =>
        adapters
          .map((adapter, index) => {
            // both loop through adapters and wallets, if both adapter same index and value return wallet needn't wrap
            const wallet = wallets[index];
            // If the wallet hasn't changed, return the same instance
            return wallet && wallet.adapter === adapter && wallet.readyState === adapter.readyState
              ? wallet
              : {
                  adapter: adapter,
                  readyState: adapter.readyState,
                };
          })
          .filter(({ readyState }) => readyState !== WalletReadyState.Unsupported), // filter adapter.readyState !== unsupported
    );

    function handleReadyStateChange(this: Adapter, readyState: WalletReadyState) {
      // when adapter emit readyState change, find in wallets if available when update status readyState in wallets, if unavailable return, just update Loading to Installed state
      setWallets(prevWallets => {
        const index = prevWallets.findIndex(({ adapter }) => adapter === this);
        if (index === -1) return prevWallets;

        // update status readyState map with index previously available, if push it at end array that it not good for users
        const { adapter } = prevWallets[index]!;
        return [...prevWallets.slice(0, index), { adapter, readyState }, ...prevWallets.slice(index + 1)].filter(
          ({ readyState }) => readyState !== WalletReadyState.Unsupported,
        );
      });
    }
    // If import manny adapters when check ready too long time, so when done which will be emit event readyStateChange to update wallets state
    adapters.forEach(adapter => adapter.on('readyStateChange', handleReadyStateChange, adapter));
    return () => {
      adapters.forEach(adapter => adapter.off('readyStateChange', handleReadyStateChange, adapter));
    };
  }, [adapters]);

  //  HANDLE WHEN SELECTED ADAPTER
  // Setup and teardown event listeners when the adapter changes
  useEffect(() => {
    if (!adapter) return;

    const isUseAddress = chainsUseAddress.includes(adapter.chain) ? true : false;

    const handleConnect = (data: PublicKey | string) => {
      isConnectingRef.current = false;
      isDisconnectingRef.current = false;

      dispatch({
        type: AdapterActionKind.CONNECT,
        payload: {
          data,
          adapter,
        },
      });
    };

    const handleDisconnect = () => {
      if (isUnloadingRef.current) return;

      isConnectingRef.current = false;
      isDisconnectingRef.current = false;

      dispatch({
        type: AdapterActionKind.DISCONNECT,
      });
      setSelectedChainId(null);
    };

    const handleChangeChainId = (selectedChainId: string[] | string | null) => {
      setSelectedChainId(selectedChainId);
      setWalletActive({ walletId: adapter.id, chainId: selectedChainId as string | null });
    };

    const handleError = (error: WalletError) => {
      handleErrorRef.current(error, adapter);
    };

    adapter.on('connect', handleConnect);
    adapter.on('disconnect', handleDisconnect);
    adapter.on('changeChainId', handleChangeChainId);
    adapter.on('error', handleError);

    return () => {
      if (isUseAddress) {
        adapter.removeListener('connect', handleConnect);
        adapter.removeListener('disconnect', handleDisconnect);
        adapter.removeListener('error', handleError);
        adapter.removeListener('changeChainId', handleChangeChainId);
      } else {
        adapter.off('connect', handleConnect);
        adapter.off('disconnect', handleDisconnect);
        adapter.off('error', handleError);
        adapter.off('changeChainId', handleChangeChainId);
      }
      handleDisconnect();
    };
  }, [adapter, isUnloadingRef, setWalletActive]);

  // When the adapter changes, clear the `autoConnect` tracking flag
  const didAttemptAutoConnectRef = useRef(false);
  useEffect(() => {
    return () => {
      didAttemptAutoConnectRef.current = false;
    };
  }, [adapter]);

  // If auto-connect is enabled, request to connect when the adapter changes and is ready
  useEffect(() => {
    // If detect notInstalled set wallet active is null and open page to install
    if (!(wallet?.readyState === WalletReadyState.Installed || wallet?.readyState === WalletReadyState.Loadable)) {
      if (typeof window !== 'undefined' && wallet?.adapter) {
        setIsNotInstalled(true);
      }
      return onConnectError('Wallet not found', 'detect');
    }

    if (didAttemptAutoConnectRef.current || connected || isConnectingRef.current || !onAutoConnectRequest) {
      return;
    }

    isConnectingRef.current = true;
    dispatch({ type: AdapterActionKind.CONNECTING });

    // after first connect, auto set prevent auto connect if rerender component, if reload auto connect is available
    didAttemptAutoConnectRef.current = true;
    (async function () {
      try {
        await onAutoConnectRequest();
      } catch (error) {
        onConnectError(error, 'wallet');
        // Drop the error. It will be caught by `handleError` anyway.
      } finally {
        dispatch({ type: AdapterActionKind.UNCONNECTING });
        isConnectingRef.current = false;
      }
    })();
  }, [connected, onAutoConnectRequest, onConnectError, wallet]);

  const handleRequestInstall = (value: boolean) => {
    setIsNotInstalled(value);
  };

  //Func handle
  const handleConnect = useCallback(
    async (callbackAddChain?: (error: Error) => Promise<void>) => {
      if (isConnectingRef.current || isDisconnectingRef.current || wallet?.adapter.connected) return;
      if (!wallet) throw handleErrorRef.current(new WalletNotSelectedError());
      const { adapter, readyState } = wallet;
      if (!(readyState === WalletReadyState.Installed || readyState === WalletReadyState.Loadable))
        setIsNotInstalled(true);
      isConnectingRef.current = true;
      dispatch({ type: AdapterActionKind.CONNECTING });
      try {
        await adapter.connect(walletActive?.chainId as string, callbackAddChain);
      } catch (e) {
        onConnectError(e, 'wallet');
      } finally {
        dispatch({ type: AdapterActionKind.UNCONNECTING });
        isConnectingRef.current = false;
      }
    },
    [onConnectError, wallet, walletActive?.chainId],
  );

  const handleDisconnect = useCallback(async () => {
    if (isDisconnectingRef.current) return;
    if (!adapter) return;
    isDisconnectingRef.current = true;
    dispatch({ type: AdapterActionKind.DISCONNECTING });
    try {
      await adapter.disconnect();
    } finally {
      dispatch({ type: AdapterActionKind.UNDISCONNECTING });
      isDisconnectingRef.current = false;
    }
  }, [adapter]);

  // useEffect(() => {
  //   if (!selectedBlockChain) return;
  //   const isServer = typeof window === 'undefined';
  //   const isDapp = isServer ? false : (window as any)?.coin98?.isMobile;
  //   if (!isDapp) return;
  //   if ((window as any)?.coin98?.type !== selectedBlockChain) {
  //     handleDisconnect();
  //   }
  // }, [handleDisconnect, selectedBlockChain]);

  const handleSwitchNetwork = useCallback(
    async (chainId: string, callBackAddChain?: (error: Error) => Promise<void>) => {
      if (!adapter) throw new Error();
      if (!connected) throw new Error();
      if (chainId === selectedChainId) return;
      switch (adapter?.chain) {
        case 'solana':
        case 'cosmos':
        case 'near':
          return;
        case 'evm':
          return await (adapter as AdapterEVM).switchNetwork(chainId, callBackAddChain);
      }
    },
    [adapter, connected, selectedChainId],
  );

  // Send TransactionSolana
  async function handleSendTransaction(
    transaction: TransactionOrVersionedTransaction<SupportedTransactionVersions | any>,
    connection: Connection,
    options?: SendTransactionOptions,
  ): Promise<WalletReturnType<TransactionSignature, string>>;

  // Send TransactionEVM
  async function handleSendTransaction(transaction: Transaction): Promise<WalletReturnType<string[], string>>;

  // Send TransactionCosmos
  async function handleSendTransaction(transaction: TransactionCosmos): Promise<WalletReturnType<string, string>>;

  // Send TransactionNear
  async function handleSendTransaction(transaction: any): Promise<WalletReturnType<string, string>>;

  async function handleSendTransaction(
    transaction: any,
    connection?: Connection,
    options?: SendTransactionOptions,
  ): Promise<WalletReturnType<TransactionSignature, string> | WalletReturnType<string[] | string, string>> {
    if (!adapter) throw new Error();
    if (!connected) throw new Error();

    switch (adapter?.chain) {
      case 'solana':
        return await (adapter as AdapterSolana).sendTransaction(transaction, connection!, options);
      case 'evm':
        return await (adapter as AdapterEVM).sendTransaction(transaction);
      case 'cosmos':
        return await (adapter as AdapterCosmos).sendTransaction(transaction);
      case 'near':
        return await (adapter as any).signAndSendTransaction(transaction);
      default:
        return await (adapter as AdapterEVM).sendTransaction(transaction);
    }
  }
  // Send Transaction Overload
  const sendTransaction =
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback(handleSendTransaction, [adapter, connected]);

  // SignAndSendTransaction on Near
  async function handleSendTransactions(transactions: any) {
    if (!adapter) throw new Error();
    if (!connected) throw new Error();

    switch (adapter?.chain) {
      case 'near':
        return await (adapter as any).signAndSendTransactions(transactions);
      default:
        throw new Error(`Not support this function on ${selectedBlockChain}`);
    }
  }

  // Send Transaction Overload
  const sendTransactions =
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback(handleSendTransactions, [adapter, connected]);

  // Sign a transaction if the wallet supports it
  const signTransaction: SignerWalletAdapterSolanaProps['signTransaction'] | undefined = useMemo(() => {
    return adapter && 'signTransaction' in adapter
      ? async transaction => {
          if (!connected) throw handleErrorRef.current(new WalletNotConnectedError(), adapter);
          return await adapter.signTransaction(transaction); // 2 thằng đều có signTransaction nên ko gọi được vì nó ko tương thích với nhau
        }
      : undefined;
  }, [adapter, connected]);

  // Sign multiple transactions if the wallet supports it
  const signAllTransactions: SignerWalletAdapterSolanaProps['signAllTransactions'] | undefined = useMemo(
    () =>
      adapter && 'signAllTransactions' in adapter
        ? async transactions => {
            if (!connected) throw handleErrorRef.current(new WalletNotConnectedError(), adapter);
            return await adapter.signAllTransactions(transactions);
          }
        : undefined,
    [adapter, connected],
  );

  // Sign Message Solana
  async function handleSignMessage(message: Uint8Array | string): Promise<WalletReturnType<Uint8Array, string>>;

  // Sign Message EVM
  async function handleSignMessage(message: string): Promise<WalletReturnType<string[], string>>;

  // Sign Message Cosmos
  async function handleSignMessage(message: Uint8Array | string): Promise<WalletReturnType<string, string>>;

  async function handleSignMessage(
    message: string,
    recipient: string,
    nonce: Buffer,
    callbackUrl?: string,
    state?: string,
  ): Promise<WalletReturnType<string, string>>;

  //Sign Message Overload
  async function handleSignMessage(
    message: string | Uint8Array,
    recipient?: string,
    nonce?: Buffer,
    callbackUrl?: string,
    state?: string,
  ) {
    if (adapter && 'signMessage' in adapter) {
      switch (adapter.chain) {
        case 'solana':
          if (!connected) throw handleErrorRef.current(new WalletNotConnectedError(), adapter);
          return await (adapter as BaseMessageSignerWalletAdapterSolana).signMessage(message);
        case 'evm':
          if (!connected) throw handleErrorRef.current(new WalletNotConnectedError(), adapter);
          return await (adapter as BaseMessageSignerWalletAdapterEVM).signMessage(message as string);
        case 'cosmos':
          if (!connected) throw handleErrorRef.current(new WalletNotConnectedError(), adapter);
          return await (adapter as unknown as BaseMessageSignerWalletAdapterCosmos).signMessage(
            message as string | Uint8Array,
          );
        case 'near':
          if (!connected) throw handleErrorRef.current(new WalletNotConnectedError(), adapter);
          return await (adapter as unknown as BaseMessageSignerWalletAdapterNear).signMessage({
            message,
            recipient,
            nonce,
            callbackUrl,
            state,
          } as SignMessageParams);
        default:
          return undefined;
      }
    }
    {
      return undefined;
    }
  }

  // Sign an arbitrary message if the wallet supports it
  const signMessage = useMemo(() => handleSignMessage, [handleSignMessage]);

  async function handleSignTypedData(
    msgParams: TypedMessageV3<any> | TypedMessageV4<any> | TypedMessage[],
    type: 'v1' | 'v3' | 'v4',
  ): Promise<WalletReturnType<string, string>> {
    if (!adapter) throw new Error();
    if (!connected) throw new Error();

    switch (adapter?.chain) {
      case 'cosmos':
      case 'solana':
      case 'near':
        throw new Error();
      case 'evm':
        if (type === 'v1') return await (adapter as AdapterEVM).signTypedData(msgParams as TypedMessage[]);
        if (type === 'v3') return await (adapter as AdapterEVM).signTypedDataV3(msgParams as TypedMessageV3<any>);
        if (type === 'v4') return await (adapter as AdapterEVM).signTypedDataV4(msgParams as TypedMessageV4<any>);
      default:
        throw new Error();
    }
  }

  const signTypedData =
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback(handleSignTypedData, [adapter, connected]);

  async function handleWatchAsset(params: WatchAssetType): Promise<WalletReturnType<boolean, string>> {
    if (!adapter) throw new Error();
    if (!connected) throw new Error();

    switch (adapter?.chain) {
      case 'cosmos':
      case 'solana':
      case 'near':
        throw new Error();
      case 'evm':
        if (isFullySignerEVM(adapter.id)) return await (adapter as BaseFullySignerWalletAdapterEVM).watchAsset(params);
        throw new Error('This function is not supported');
      default:
        throw new Error();
    }
  }

  // watchAsset if the wallet supports it
  const watchAsset = useCallback(handleWatchAsset, [adapter, connected]);

  async function handleEthSign(message: string): Promise<WalletReturnType<string, string>> {
    if (!adapter) throw new Error();
    if (!connected) throw new Error();

    switch (adapter?.chain) {
      case 'cosmos':
      case 'solana':
      case 'near':
        throw new Error();
      case 'evm':
        if (isFullySignerEVM(adapter.id)) return await (adapter as BaseFullySignerWalletAdapterEVM).ethSign(message);
        throw new Error('This function is not supported');
      default:
        throw new Error();
    }
  }

  // ethSign if the wallet supports it
  const ethSign = useCallback(handleEthSign, [adapter, connected]);

  async function handleGetEncryptionPublicKey(): Promise<WalletReturnType<string, string>> {
    if (!adapter) throw new Error();
    if (!connected) throw new Error();

    switch (adapter?.chain) {
      case 'cosmos':
      case 'solana':
      case 'near':
        throw new Error();
      case 'evm':
        if (isFullySignerEVM(adapter.id))
          return await (adapter as BaseFullySignerWalletAdapterEVM).getEncryptionPublicKey();
        throw new Error('This function is not supported');
      default:
        throw new Error();
    }
  }

  // getEncryptionPublicKey if the wallet supports it
  const getEncryptionPublicKey = useCallback(handleGetEncryptionPublicKey, [adapter, connected]);

  async function handleEthDecrypt(message: string, address?: string): Promise<WalletReturnType<unknown, string>> {
    if (!adapter) throw new Error();
    if (!connected) throw new Error();

    switch (adapter?.chain) {
      case 'cosmos':
      case 'solana':
      case 'near':
        throw new Error();
      case 'evm':
        if (isFullySignerEVM(adapter.id))
          return await (adapter as BaseFullySignerWalletAdapterEVM).ethDecrypt(message, address);
        throw new Error('This function is not supported');
      default:
        throw new Error();
    }
  }

  // getEncryptionPublicKey if the wallet supports it
  const ethDecrypt = useCallback(handleEthDecrypt, [adapter, connected]);

  const handleGetAccount = useCallback((): Account | undefined => {
    if (!adapter) throw new Error();
    if (!connected) throw new Error();
    switch (adapter?.chain) {
      case 'solana':
      case 'cosmos':
      case 'evm':
        throw new Error('This function is not supported');
      case 'near':
        return (adapter as AdapterNear).getAccounts();
    }
  }, [adapter, connected]);

  return (
    <WalletContext.Provider
      value={{
        autoConnect: !!onAutoConnectRequest,
        wallets,
        enables,
        wallet,
        publicKey,
        address,
        connected,
        connecting,
        disconnecting,
        selectedBlockChain,
        isNotInstalled,
        provider,
        selectedChainId,
        selectWallet: onSelectWallet,
        disconnect: handleDisconnect,
        connect: handleConnect,
        switchNetwork: handleSwitchNetwork,
        requestInstall: handleRequestInstall,
        sendTransaction,
        signTransaction,
        signAllTransactions,
        signMessage,
        signTypedData,
        sendTransactions,
        ethSign,
        watchAsset,
        getEncryptionPublicKey,
        ethDecrypt,
        getAccounts: handleGetAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
