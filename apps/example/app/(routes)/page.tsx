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

export const revalidate = 0;

const HomePage = () => {
  const { selectedChainId, selectedBlockChain, disconnect, connected, address, publicKey, wallet } = useWallet();
  const { openWalletModal } = useWalletModal();
  const [isLightMode, setIsLightMode] = useState(false);
  const renderContent = () => {
    if (selectedBlockChain === 'evm' && (selectedChainId as any) === '0x61') return <ContentBNBTest />;
    if (selectedBlockChain === 'evm') return <ContentEvm />;
    if (selectedBlockChain === 'cosmos' && (selectedChainId as any) === 'atlantic-2') {
      return <ContentSeiTest />;
    }
    if (selectedBlockChain === 'cosmos') return <ContentCosmos />;
    if (selectedBlockChain === 'solana') return <ContentSolana />;
  };

  const handleChangeTheme = (darkTheme: boolean) => {
    if (darkTheme) {
      localStorage.setItem('theme', 'dark');

      document.documentElement.setAttribute('data-theme', 'dark');

      setIsLightMode(false);
    } else {
      localStorage.setItem('theme', 'light');

      document.documentElement.setAttribute('data-theme', 'light');
      setIsLightMode(true);
    }
  };

  useEffect(() => {
    const getIsLightMode =
      localStorage.getItem('theme') === 'light' || document.documentElement.getAttribute('data-theme') === 'light';

    document.documentElement.setAttribute('data-theme', getIsLightMode ? 'light' : 'dark');

    setIsLightMode(getIsLightMode);
  }, []);

  return (
    <div className="layout min-h-screen text-textPrimary">
      <Container>
        <div>
          <div className="flex items-center gap-4 justify-center">
            <h1 className="text-center text-3xl font-bold">Coin98 Wallet Adapter Tester</h1>
            <img
              src="https://inventory.coin98.com/images/c98logo.png"
              alt="logo"
              className="rounded-full w-14 h-14 border-[2px] border-black"
            />
          </div>

          <div className="mt-8 flex justify-end gap-2">
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
                handleChangeTheme(isLightMode ? true : false);
              }}
            />
          </div>

          {connected && (
            <div>
              <div className="mt-10 text-[20px]">
                <h4 className="font-bold">Wallet Information:</h4>
                <div className="mt-8 border-[2px] border-black p-4 rounded-md bg-[#fff] text-textSecondary">
                  <div>
                    Wallet Name: <span className="text-[#3085C3] pl-2">{wallet?.adapter.name}</span>
                  </div>
                  {address && (
                    <div>
                      Address: <span className="text-[#3085C3] pl-2">{address}</span>
                    </div>
                  )}
                  {publicKey && (
                    <div>
                      Publickey: <span className="text-[#3085C3] pl-2">{publicKey?.toBase58()}</span>
                    </div>
                  )}
                  {selectedChainId && (
                    <div>
                      Network:
                      <span className="text-[#3085C3] pl-2">{selectedChainId}</span>
                    </div>
                  )}
                  <div>
                    Blockchain:
                    <span className="text-[#3085C3] pl-2">{selectedBlockChain}</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 text-[20px]">
                <h4 className="font-bold">Example Actions:</h4>
                <div className="mt-2"> {connected && renderContent()}</div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default HomePage;
