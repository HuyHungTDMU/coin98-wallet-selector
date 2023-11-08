'use client';
import ContentBNBTest from '@/components/bnbtestnet-section';
import ContentEvm from '@/components/evm-section';
import ContentSolana from '@/components/solana-section';
import Container from '@/components/ui/container';
import CustomButton from '@/components/ui/custom-button';
import { useWallet } from '@coin98t/wallet-adapter-react';
import { useWalletModal } from '@coin98t/wallet-adapter-react-ui';
import { LogOut, MoonStar, Sun, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import ContentSeiTest from '@/components/seitestnet-section';
import ContentCosmos from '@/components/cosmos-section';
import NearSection from '@/components/near-section';
import ContentInjectiveTestnet from '@/components/injective-testnet-section';
import ContentInjective from '@/components/injective-section';

export const revalidate = 0;

const HomePage = () => {
  const { selectedChainId, selectedBlockChain, disconnect, connected, address, publicKey, wallet } = useWallet();
  const { openWalletModal, switchTheme } = useWalletModal();
  const [isLightMode, setIsLightMode] = useState(false);
  const renderContent = () => {
    if (selectedBlockChain === 'evm' && (selectedChainId as any) === '0x61') return <ContentBNBTest />;
    if (selectedBlockChain === 'evm' && (selectedChainId as any) === 'injective-1') return <ContentInjective />;
    if (selectedBlockChain === 'evm') return <ContentEvm />;
    if (selectedBlockChain === 'cosmos' && (selectedChainId as any) === 'atlantic-2') {
      return <ContentSeiTest />;
    }
    if (selectedBlockChain === 'cosmos' && (selectedChainId as any) === 'injective-888') {
      return <ContentInjectiveTestnet />;
    }
    if (selectedBlockChain === 'cosmos' && (selectedChainId as any) === 'injective-1') {
      return <ContentInjective />;
    }
    if (selectedBlockChain === 'cosmos') return <ContentCosmos />;
    if (selectedBlockChain === 'solana') return <ContentSolana />;
    if (selectedBlockChain === 'near') return <NearSection />;
  };

  const handleChangeTheme = (darkTheme: boolean) => {
    if (darkTheme) {
      localStorage.setItem('theme', 'dark');

      // document.documentElement.setAttribute('data-theme', 'dark');
      switchTheme('dark');
      setIsLightMode(false);
    } else {
      localStorage.setItem('theme', 'light');

      // document.documentElement.setAttribute('data-theme', 'light');
      switchTheme('light');
      setIsLightMode(true);
    }
  };

  useEffect(() => {
    const getIsLightMode =
      localStorage.getItem('theme') === 'light' || document.documentElement.getAttribute('data-theme') === 'light';
    switchTheme(getIsLightMode ? 'light' : 'dark');
    // document.documentElement.setAttribute('data-theme', getIsLightMode ? 'light' : 'dark');

    setIsLightMode(getIsLightMode);
  }, []);

  return (
    <div className="relative layout min-h-screen bg-[#0f0f0f] text-textPrimary">
      <img
        src="https://connect.coin98.com/assets/bg_header.png"
        alt=""
        className="absolute z-0 top-0 left-0 h-[300px] sm:h-[400px] xl:h-[446px] w-screen object-center object-cover"
      />

      <div className="mx-auto max-w-7xl px-8 py-10 h-[300px] sm:h-[400px] xl:h-[446px] justify-center flex flex-col">
        <div className="text-textPrimary z-10 flex-col flex justify-center">
          <img src="https://connect.coin98.com/assets/images/logos/Coin98TextLogo.svg" className="w-36" alt="" />

          <div className="text-[2.8rem]">
            <span className="text-[#E5B842]">Coin98</span> Connect
          </div>
          <div className="">E2E Test Dapps</div>
        </div>
      </div>

      <Container>
        <div className="flex justify-end items-center gap-4 border-b border-[#414141] pb-5">
          {!connected && (
            <CustomButton
              onClick={() => openWalletModal()}
              title="Connect Wallet"
              icon={<Wallet size={20} className="ml-2" />}
            />
          )}
          {connected && (
            <CustomButton icon={<LogOut size={20} className="ml-2" />} title="Disconnect" onClick={disconnect} />
          )}
          <CustomButton
            icon={isLightMode ? <MoonStar size={20} /> : <Sun size={20} />}
            onClick={() => {
              handleChangeTheme(isLightMode);
            }}
          />
        </div>

        {connected && (
          <div>
            <div className="mt-10 text-[20px]">
              <h4 className="text-3xl uppercase">{selectedBlockChain}</h4>
              <div className="mt-4 flex flex-col lg:flex-row gap-3 text-xs font-normal">
                <div className="border border-[#FDD05A] text-[#FDD05A] px-3 py-2 rounded-full">
                  Wallet Name: <span className="text-[#fff] pl-2">{wallet?.adapter.name}</span>
                </div>
                {address && (
                  <div className="border border-[#FDD05A] text-[#FDD05A] px-3 py-2 rounded-full">
                    Account: <span className="text-[#fff] pl-2">{address}</span>
                  </div>
                )}
                {publicKey && (
                  <div className="border border-[#FDD05A] text-[#FDD05A] px-3 py-2 rounded-full">
                    Publickey: <span className="text-[#fff] pl-2">{publicKey?.toBase58()}</span>
                  </div>
                )}
                {selectedChainId && (
                  <div className="border border-[#FDD05A] text-[#FDD05A] px-3 py-2 rounded-full">
                    Chain ID:
                    <span className="text-[#fff] pl-2">{selectedChainId}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">{connected && renderContent()}</div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default HomePage;
