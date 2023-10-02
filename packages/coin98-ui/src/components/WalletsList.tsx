import {BLOCKCHAINS_DATA, useWallet, Wallet} from '@coin98t/wallet-adapter-react';
import {ReactNode, useEffect, useState} from 'react';
import {ChainInfo, ChainInfoBase} from '../types';
import {WalletSelected} from '../WalletModalProvider';
import {Controls, Player} from '@lottiefiles/react-lottie-player';
import {Adapter, TypeConnectError} from '@coin98t/wallet-adapter-base';

const WalletsList = ({
                         listedWallets,
                         collapsedWallets,
                         titleWallets,
                         selectedNetwork,
                         listNetworks,
                         handleClose,
                         renderListWallets,
                     }: {
    listedWallets: Wallet[];
    listNetworks: ChainInfo[];
    collapsedWallets: Wallet[];
    titleWallets: string | ReactNode;
    selectedNetwork: { blockChainName: string; chainId: string } | undefined;
    handleClose: (event?: MouseEvent) => void;
    renderListWallets?: (walletIcon: string, walletName: string) => ReactNode;
}) => {
    return (
        <div className="c98-w-[488px] c98-flex c98-flex-col">
            <h3 className="c98-text-subTitle c98-text-[16px] c98-font-medium">2. {titleWallets}</h3>
            <div
                className="c98-overflow-y-auto c98-w-full c98-mt-[12px] c98-bg-bkg-secondary c98-rounded-[16px] c98-flex-1 c98-max-h-[334px]">
                {!!listedWallets.length || !!collapsedWallets.length ? (
                    <ListWaleltContent
                        listedWallets={listedWallets}
                        collapsedWallets={collapsedWallets}
                        selectedNetwork={selectedNetwork}
                        listNetworks={listNetworks}
                        handleClose={handleClose}
                    />
                ) : (
                    <div className="center-all c98-mt-[12px]">No results found</div>
                )}
            </div>
        </div>
    );
};

const ListWaleltContent = ({
                               listedWallets,
                               collapsedWallets,
                               listNetworks,
                               selectedNetwork,
                               renderListWallets,
                               handleClose,
                           }: {
    listedWallets: Wallet[];
    collapsedWallets?: Wallet[];
    listNetworks: ChainInfo[];
    selectedNetwork: { blockChainName: string; chainId: string } | undefined;
    handleClose: (event?: MouseEvent) => void;
    renderListWallets?: (walletIcon: string, walletName: string) => ReactNode;
}) => {
    const {selectWallet, connecting, connected, isUninstall} = useWallet();
    const [walletActive, selectWalletActive] = useState<Adapter>();

    const PROVIDERS: { [key: string]: any } = {
        coin98_ether: (window as any)?.coin98?.provider,
        coin98_cosmos: (window as any)?.coin98?.keplr,
        coin98_solana: (window as any)?.coin98?.sol,
        metamask_ether: (window as any)?.ethereum,
        phantom_solana: (window as any)?.phantom?.solana,
        fin_cosmos: (window as any)?.fin,
        keplr_cosmos: (window as any)?.keplr,
    };

    const renderProvider = (walletId: string) => {
        return PROVIDERS[walletId];
    };

    const handleWalletClick = (e: MouseEvent, seletedWallet: WalletSelected) => {
        // if (connecting) {
        //   return e.preventDefault();
        // }
        const {adapter, chainId} = seletedWallet;
        selectWalletActive(adapter);
        selectWallet(adapter.id, chainId, async (error: any, typeError: TypeConnectError) => {
            const wallet = renderProvider(adapter.id);
            if (typeError === 'network') {
                // add network cosmos
                if (selectedNetwork?.blockChainName === BLOCKCHAINS_DATA.cosmos) {
                    const suggestChain = listNetworks.find(chain => chain.chainId === chainId);
                    if (wallet) {
                        return await wallet.experimentalSuggestChain(suggestChain);
                    }
                }

                //add network ether
                if (selectedNetwork?.blockChainName === BLOCKCHAINS_DATA.ethereum) {
                    if (wallet) {
                        const suggestChain = listNetworks.find(chain => chain.chainId === chainId);
                        const {
                            id,
                            blockChainName,
                            name,
                            imgUrl,
                            ...suggestChainPossible
                        } = suggestChain as ChainInfoBase;
                        try {
                            return await wallet.request({
                                method: 'wallet_addEthereumChain',
                                params: [suggestChainPossible],
                            });
                        } catch (error) {
                            throw error;
                        }
                    }
                }
            }
            return;
        });
    };

    const renderWalletNode = (walletIcon: string, walletName: string, walletId: string) => {
        const isActive = walletId === walletActive?.id;
        if (renderListWallets) {
            return renderListWallets(walletIcon, walletName);
        }
        return <WalletItem icon={walletIcon} name={walletName} isActive={isActive}/>;
    };

    useEffect(() => {
        if (!connecting && connected) handleClose();
    }, [connecting, connected, handleClose]);

    return (
        <div>
            {!isUninstall && (
                <div className="c98-py-[48px] c98-px-[20px] c98-grid c98-grid-cols-4 c98-gap-x-[24px] c98-gap-y-[40px]">
                    {!!listedWallets?.length &&
                        listedWallets.map((wallet, idx) => {
                            if (wallet.adapter.chain === selectedNetwork?.blockChainName) {
                                return (
                                    <div
                                        key={idx}
                                        onClick={(e: any) =>
                                            handleWalletClick(e, {
                                                adapter: wallet.adapter,
                                                chainId: selectedNetwork.chainId
                                            })
                                        }
                                    >
                                        {renderWalletNode(wallet.adapter.icon, wallet.adapter.name, wallet.adapter.id)}
                                    </div>
                                );
                            }
                        })}
                    {!!collapsedWallets?.length &&
                        collapsedWallets.map((wallet, idx) => {
                            if (wallet.adapter.chain === selectedNetwork?.blockChainName) {
                                return (
                                    <div
                                        key={idx}
                                        onClick={(e: any) =>
                                            handleWalletClick(e, {
                                                adapter: wallet.adapter,
                                                chainId: selectedNetwork.chainId
                                            })
                                        }
                                    >
                                        {renderWalletNode(wallet.adapter.icon, wallet.adapter.name, wallet.adapter.id)}
                                    </div>
                                );
                            }
                        })}
                </div>
            )}
            <div className="c98-col-span-4 c98-p-[24px]">
                {isUninstall && (
                    <InstallWalletDisplay
                        icon={walletActive?.icon as string}
                        url={walletActive?.url as string}
                        name={walletActive?.name as string}
                    />
                )}
            </div>
        </div>
    );
};

export default WalletsList;

const InstallWalletDisplay = ({icon, url, name}: { icon: string; url: string; name: string }) => {
    const {requestInstall} = useWallet();

    const handleOpenWindow = () => {
        window.open(url, '_blank');
    };

    return (
        <div className="center-all c98-flex-col c98-h-full">
            <div
                className="c98-flex c98-gap-[4px] c98-justify-between c98-items-center c98-self-start svg-hover-color c98-cursor-pointer"
                onClick={() => requestInstall(false)}
            >
                <img
                    src="data:image/svg+xml;base64,PCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMTYgMTYiPgo8dGl0bGU+YXBwX2Fycm93X2xlZnQ8L3RpdGxlPgo8cGF0aCBkPSJNMTAuODM2IDIuODI3YzAuMTk5IDAuMTk1IDAuMjE3IDAuNSAwLjA1NCAwLjcxNGwtMC4wNTQgMC4wNjItNC40ODUgNC4zOTcgNC40ODUgNC4zOTdjMC4xOTkgMC4xOTUgMC4yMTcgMC41IDAuMDU0IDAuNzE0bC0wLjA1NCAwLjA2MmMtMC4xOTkgMC4xOTUtMC41MSAwLjIxMy0wLjcyOSAwLjA1M2wtMC4wNjMtMC4wNTMtNC44ODEtNC43ODVjLTAuMTk5LTAuMTk1LTAuMjE3LTAuNS0wLjA1NC0wLjcxNGwwLjA1NC0wLjA2MiA0Ljg4MS00Ljc4NWMwLjIxOS0wLjIxNCAwLjU3My0wLjIxNCAwLjc5MiAweiI+PC9wYXRoPgo8L3N2Zz4K"
                    alt=""
                    className="c98-w-[20px] c98-h-[20px] svg-icon-color"
                />
                <button className="c98-text-[16px] c98-text-[#CDA349]">Back</button>
            </div>
            <img className="c98-w-[64px] c98-h-[64px] c98-mt-[28px]" src={icon} alt=""/>
            <p className="c98-mt-[16px] c98-text-[14px] c98-max-w-[300px] c98-text-center">
                {name} Wallet extension is not installed in your browser.
            </p>
            <button
                className="c98-bg-[#CDA349] c98-py-[10px] c98-px-[56px] c98-rounded-[56px] c98-text-[16px] c98-text-[#fff] c98-font-medium c98-mt-[32px] c98-cursor-pointer hover:c98-bg-[#ddb54c] c98-duration-200"
                onClick={() => handleOpenWindow()}
            >
                Install Now
            </button>
        </div>
    );
};

const WalletItem = ({icon, name, isActive}: { icon: string; name: string; isActive: boolean }) => {
    const {connecting} = useWallet();
    const isConnecting = isActive && connecting;
    return (
        <div
            // className={`c98-w-full ${
            //   connecting ? 'c98-cursor-not-allowed' : 'c98-cursor-pointer hover:c98-text-[#CDA349] hover:c98-scale-105'
            // }`}
            className="c98-w-full c98-cursor-pointer hover:c98-text-[#CDA349] hover:c98-scale-105 c98-duration-200"
        >
            <div className="c98-relative">
                {isConnecting && (
                    <div
                        className="c98-w-[40px] c98-h-[40px] c98-absolute c98-inset-0 center-all c98-mx-auto c98-my-auto c98-z-10">
                        <Player src={require('../images/loading98.json')} className="c98-w-[80px] c98-h-[80px]" loop
                                autoplay>
                            <Controls visible={true} buttons={['play', 'repeat', 'frame', 'debug']}/>
                        </Player>
                    </div>
                )}

                {isConnecting && (
                    <div
                        className="c98-w-[40px] c98-absolute c98-h-[40px] c98-inset-0 c98-bg-bkg-secondary c98-mx-auto c98-my-auto c98-opacity-60"/>
                )}

                <img
                    src={icon}
                    alt="Coin98 Adapter"
                    className={`c98-w-[40px] c98-h-[40px] c98-mx-auto c98-my-0 c98-text-center`}
                />
            </div>

            <p
                className={`c98-text-[12px] c98-overflow-hidden c98-mx-auto c98-my-0 c98-text-ellipsis c98-text-center c98-mt-[8px] ${
                    isConnecting && 'c98-text-[#CDA349]'
                }`}
            >
                {isConnecting ? 'Connecting' : name}
            </p>
        </div>
    );
};
