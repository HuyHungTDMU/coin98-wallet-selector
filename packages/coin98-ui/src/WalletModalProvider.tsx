import { FC, ReactNode } from 'react';
import React, { useState } from 'react';
import { WalletModalContext } from './useWalletModal.js';
import { WalletModalC98Props } from './WalletModalC98';
import { Adapter } from '@coin98t/wallet-adapter-base';

export interface WalletModalProviderProps extends WalletModalC98Props {
  children: ReactNode;
}

export type WalletSelected = {
  adapter: Adapter;
  chainId: string;
};

export const WalletModalProvider: FC<WalletModalProviderProps> = ({ children, ...props }) => {
  const [visible, setVisible] = useState(false);

  const openWalletModal = () => {
    setVisible(true);
  };
  return (
    <WalletModalContext.Provider
      value={{
        visible,
        setVisible,
        openWalletModal,
      }}
    >
      {children}
      {/* {visible && <WalletModal {...props} />} */}
      {/* {visible && <WalletModalSelect {...props} />} */}
    </WalletModalContext.Provider>
  );
};
