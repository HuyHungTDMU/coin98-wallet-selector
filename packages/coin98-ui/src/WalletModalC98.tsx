import { WalletReadyState } from '@coin98t/wallet-adapter-base';
import { useWallet, Wallet } from '@coin98t/wallet-adapter-react';
import React, { CSSProperties, FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { bsc, ether, seiNetwork, solana, viction } from './chainsData';
import { ChainInfo } from './types';
import { useWalletModal } from './useWalletModal';
import classNames from 'classNames';
import NetWorksList from './components/NetworksList';
import WalletsList from './components/WalletsList';
import { getSelectedNetwork } from './utils';

export interface WalletModalC98Props {
  className?: string;
  container?: string;
  enableChains?: ChainInfo[];
  activeChainId?: string;
  titleModal?: string | ReactNode;
  titleWallets?: string | ReactNode;
  titleNetworks?: string | ReactNode;
  layoutClass?: string;
  layoutStyle?: CSSProperties;
  overlayStyle?: CSSProperties;
  overlayClass?: string;
  isC98Theme?: boolean;
  renderListChains?: (chainData: ChainInfo, isActive: boolean) => ReactNode;
  renderListWallets?: (walletIcon: string, walletName: string) => ReactNode;
}

export const WalletModalC98: FC<WalletModalC98Props> = props => {
  const {
    enableChains = [ether, bsc, solana, seiNetwork, viction],
    activeChainId,
    titleModal = 'Connect Wallet',
    titleWallets = 'Choose Wallet',
    titleNetworks = 'Choose Network',
    overlayClass,
    overlayStyle,
    layoutStyle,
    layoutClass,
    isC98Theme,
    renderListChains,
    renderListWallets,
  } = props;

  const { setVisible, visible } = useWalletModal();
  const { wallets } = useWallet();
  const listChains = enableChains;
  const [selectedNetwork, setSelectedNetwork] = useState<{
    blockChainName: string;
    chainId: string;
    id: number | string;
  }>(getSelectedNetwork(activeChainId, listChains));

  const overlayClassCustomized = useMemo(
    () =>
      classNames(
        'c98-fixed c98-inset-0 c98-z-[99999] center-all c98-duration-200',
        {
          'c98-bg-transparent custom-backdrop-blur c98-text-textHeading': isC98Theme,
          'c98-visivle c98-opacity-100': visible,
          'c98-invisible c98-opacity-0': !visible,
        },
        overlayClass,
      ),
    [isC98Theme, overlayClass, visible],
  );

  const layoutClassCustomized = classNames(
    {
      'c98-bg-bkg-primary c98-rounded-[16px] c98-p-[40px] c98-drop-shadow-md c98-w-[792px] c98-border-[#333]':
        isC98Theme,
    },
    layoutClass,
  );

  const [listedWallets, collapsedWallets] = useMemo(() => {
    const installed: Wallet[] = [];
    const loadable: Wallet[] = [];
    const notDetected: Wallet[] = [];

    for (const wallet of wallets) {
      if (wallet.readyState === WalletReadyState.NotDetected) {
        notDetected.push(wallet);
      } else if (wallet.readyState === WalletReadyState.Loadable) {
        loadable.push(wallet);
      } else if (wallet.readyState === WalletReadyState.Installed) {
        installed.push(wallet);
      }
    }

    let listed: Wallet[] = [];
    let collapsed: Wallet[] = [];

    if (installed.length) {
      listed = installed;
      collapsed = [...loadable, ...notDetected];
    } else if (loadable.length) {
      listed = loadable;
      collapsed = notDetected;
    } else {
      collapsed = notDetected;
    }
    return [listed, collapsed];
  }, [wallets]);

  const hideModal = useCallback(() => {
    setTimeout(() => setVisible(false), 150);
  }, [setVisible]);

  const handleClose = useCallback(
    (event?: MouseEvent) => {
      event?.preventDefault();
      hideModal();
    },
    [hideModal],
  );

  const handleSelectedChain = (blockChainName: string, chainId: string, id: number | string) => {
    setSelectedNetwork({ blockChainName, chainId, id });
  };

  const renderMultipleChainModal = () => {
    return (
      <div className="c98-flex c98-gap-[8px] c98-justify-between c98-mt-[24px]">
        <NetWorksList
          listNetworks={listChains}
          titleNetworks={titleNetworks}
          renderListChains={renderListChains}
          handleSelectedChain={handleSelectedChain}
          selectedNetwork={selectedNetwork}
        />
        <WalletsList
          listNetworks={listChains}
          listedWallets={listedWallets}
          collapsedWallets={collapsedWallets}
          titleWallets={titleWallets}
          handleClose={handleClose}
          renderListWallets={renderListWallets}
          selectedNetwork={selectedNetwork}
        />
      </div>
    );
  };

  useEffect(() => {
    setSelectedNetwork(getSelectedNetwork(activeChainId, listChains));
  }, [activeChainId, listChains]);

  return (
    <div
      className={overlayClassCustomized}
      style={overlayStyle}
      onClick={(e: any) => {
        handleClose(e);
      }}
      id="wrapper"
    >
      <div className={layoutClassCustomized} style={layoutStyle} onClick={e => e.stopPropagation()}>
        {typeof titleModal === 'string' && (
          <div className="c98-flex c98-justify-between c98-items-center">
            <h2 className="c98-font-semibold c98-text-[24px]">{titleModal}</h2>
            <button
              className="c98-cursor-pointer hover:c98-scale-105 svg-hover c98-duration-200"
              onClick={() => {
                hideModal();
              }}
            >
              <img
                src="data:image/svg+xml;base64,PCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMTYgMTYiPgo8dGl0bGU+YXBwX2Nsb3NlPC90aXRsZT4KPHBhdGggZD0iTTguNzMzIDhsMy42NjctMy42NjdjMC4yLTAuMiAwLjItMC41MzMgMC0wLjczM3MtMC41MzMtMC4yLTAuNzMzIDBsLTMuNjY3IDMuNjY3LTMuNjY3LTMuNmMtMC4yLTAuMi0wLjUzMy0wLjItMC43MzMgMHMtMC4yIDAuNTMzIDAgMC43MzNsMy42NjcgMy42NjctMy42NjcgMy42NjdjLTAuMiAwLjItMC4yIDAuNTMzIDAgMC43MzMgMC4wNjcgMC4wNjcgMC4yIDAuMTMzIDAuMzMzIDAuMTMzczAuMjY3LTAuMDY3IDAuMzMzLTAuMTMzbDMuNjY3LTMuNjY3IDMuNjY3IDMuNjY3YzAuMDY3IDAuMDY3IDAuMiAwLjEzMyAwLjMzMyAwLjEzM3MwLjI2Ny0wLjA2NyAwLjMzMy0wLjEzM2MwLjItMC4yIDAuMi0wLjUzMyAwLTAuNzMzbC0zLjUzMy0zLjczM3oiPjwvcGF0aD4KPC9zdmc+Cg=="
                alt=""
                className="c98-w-[24px] c98-h-[24px] svg-icon"
              />
            </button>
          </div>
        )}
        {typeof titleModal === 'object' && titleModal}
        {renderMultipleChainModal()}
      </div>
    </div>
  );
};
