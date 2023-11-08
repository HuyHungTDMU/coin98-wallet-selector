import { FC, ReactNode, useEffect } from 'react';
import React, { useState } from 'react';
import { WalletModalContext } from './useWalletModal.js';
import { WalletModalC98Props } from './WalletModalC98';
import { Adapter } from '@coin98t/wallet-adapter-base';

export interface WalletModalProviderProps extends WalletModalC98Props {
  children: ReactNode;
  theme?: 'dark' | 'light';
}

export type WalletSelected = {
  adapter: Adapter;
  chainId: string;
};

export const WalletModalProvider: FC<WalletModalProviderProps> = ({ children, theme, ...props }) => {
  const [visible, setVisible] = useState(false);
  const [themeActive, setThemeActive] = useState<'dark' | 'light'>(theme ?? 'dark');

  const openWalletModal = () => {
    setVisible(true);
  };

  const switchTheme = (themeName: 'dark' | 'light') => {
    setThemeActive(themeName);
  };

  useEffect(() => {
    if (themeActive === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [themeActive]);

  return (
    <WalletModalContext.Provider
      value={{
        visible,
        setVisible,
        openWalletModal,
        switchTheme,
      }}
    >
      {children}
      {/* {visible && <WalletModal {...props} />} */}
      {/* {visible && <WalletModalSelect {...props} />} */}
    </WalletModalContext.Provider>
  );
};
