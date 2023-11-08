import { useWallet } from '@coin98t/wallet-adapter-react';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { ChainInfo } from '../types';
import { useWalletModal } from '../useWalletModal';
import { extendTailwindMerge } from 'tailwind-merge';

const NetWorksList = ({
  listNetworks,
  titleNetworks,
  selectedNetwork,
  handleSelectedChain,
  renderListChains,
}: {
  listNetworks: ChainInfo[];
  titleNetworks: string | ReactNode;
  selectedNetwork: { blockChainName: string; chainId: string; id: number | string } | undefined;
  handleSelectedChain: (blockChainName: string, chainId: string, id: number | string) => void;
  renderListChains?: (chainData: ChainInfo, isActive: boolean) => ReactNode;
}) => {
  const { enables, requestInstall } = useWallet();
  const { visible } = useWalletModal();

  const [value, setValue] = useState('');
  const [data, setData] = useState(listNetworks);

  const ref = useRef<any>(null);

  const handleClick = () => {
    ref?.current?.focus();
  };

  const handleSearch = useCallback(() => {
    const results = listNetworks.filter(network => {
      return network.name.toString().toLowerCase().includes(value.toString().toLowerCase());
    });
    setData(results);
  }, [listNetworks, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleResetSearch = () => {
    setValue('');
  };

  const renderChainNode = (item: ChainInfo, isActive: boolean) => {
    if (renderListChains) {
      return renderListChains(item, isActive);
    }
    return <ChainItem item={item} isActive={isActive} />;
  };

  useEffect(() => {
    handleSearch();
  }, [handleSearch, value]);

  useEffect(() => {
    if (visible) return;
    handleResetSearch();
  }, [visible]);

  return (
    <div className="c98-w-[200px] lg:c98-block c98-hidden">
      <h3 className="c98-text-subTitle c98-text-[16px] c98-font-medium">1. {titleNetworks}</h3>
      <div className="c98-overflow-y-auto c98-mt-[12px] c98-bg-bkg-secondary c98-rounded-[16px] c98-p-[16px] c98-h-[334px]">
        <div
          className="c98-p-[8px] c98-flex c98-justify-center c98-items-center c98-gap-[8px] c98-rounded-[24px] c98-bg-bkg-primary"
          onClick={() => handleClick()}
        >
          <img
            className="c98-w-[20px] c98-h-[20px] c98-pointer-events-none svg-icon"
            src="data:image/svg+xml;base64,PCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMTYgMTYiPgo8dGl0bGU+YXBwX3NlYXJjaF9sZWZ0PC90aXRsZT4KPHBhdGggZD0iTTEzIDEyLjZsLTEuNzMzLTEuNzMzYzAuODY3LTEgMS40LTIuMjY3IDEuNC0zLjczMyAwLTMuMDY3LTIuNTMzLTUuNi01LjYtNS42cy01LjYgMi40NjctNS42IDUuNiAyLjUzMyA1LjYgNS42IDUuNmMxLjMzMyAwIDIuNDY3LTAuNDY3IDMuNDY3LTEuMmwxLjczMyAxLjczM2MwLjIgMC4yIDAuNTMzIDAuMiAwLjczMyAwczAuMi0wLjQ2NyAwLTAuNjY3ek0yLjUzMyA3LjEzM2MwLTIuNTMzIDIuMDY3LTQuNiA0LjYtNC42czQuNiAyLjA2NyA0LjYgNC42LTIuMDY3IDQuNi00LjYgNC42LTQuNi0yLjA2Ny00LjYtNC42eiI+PC9wYXRoPgo8L3N2Zz4K"
            alt=""
          />
          <input
            ref={ref}
            type="text"
            placeholder="Search..."
            className="c98-w-full c98-bg-bkg-primary c98-text-[12px] c98-font-normal c98-outline-none c98-placeholder-subTitle"
            value={value}
            onChange={handleChange}
          />
          {!!value && (
            <img
              src="data:image/svg+xml;base64,PCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMTYgMTYiPgo8dGl0bGU+YXBwX2Nsb3NlPC90aXRsZT4KPHBhdGggZD0iTTguNzMzIDhsMy42NjctMy42NjdjMC4yLTAuMiAwLjItMC41MzMgMC0wLjczM3MtMC41MzMtMC4yLTAuNzMzIDBsLTMuNjY3IDMuNjY3LTMuNjY3LTMuNmMtMC4yLTAuMi0wLjUzMy0wLjItMC43MzMgMHMtMC4yIDAuNTMzIDAgMC43MzNsMy42NjcgMy42NjctMy42NjcgMy42NjdjLTAuMiAwLjItMC4yIDAuNTMzIDAgMC43MzMgMC4wNjcgMC4wNjcgMC4yIDAuMTMzIDAuMzMzIDAuMTMzczAuMjY3LTAuMDY3IDAuMzMzLTAuMTMzbDMuNjY3LTMuNjY3IDMuNjY3IDMuNjY3YzAuMDY3IDAuMDY3IDAuMiAwLjEzMyAwLjMzMyAwLjEzM3MwLjI2Ny0wLjA2NyAwLjMzMy0wLjEzM2MwLjItMC4yIDAuMi0wLjUzMyAwLTAuNzMzbC0zLjUzMy0zLjczM3oiPjwvcGF0aD4KPC9zdmc+Cg=="
              alt=""
              className="c98-w-[16px] c98-h-[16px] c98-cursor-pointer svg-icon"
              onClick={() => handleResetSearch()}
            />
          )}
        </div>

        <div className="c98-mt-[12px]">
          {!!data.length ? (
            data.map(item => {
              const isEnabledBlockChain = enables.includes(item.blockChainName);
              if (!isEnabledBlockChain) return;
              const isActive = selectedNetwork?.id === item.id;
              return (
                <div
                  key={`${item.chainId}-${item.id}`}
                  className="c98-cursor-pointer"
                  onClick={e => {
                    e.preventDefault();
                    handleSelectedChain(item.blockChainName, item.chainId, item.id);
                    requestInstall(false);
                  }}
                >
                  {renderChainNode(item, isActive)}
                </div>
              );
            })
          ) : (
            <div className="c98-text-center c98-flex-1 c98-text-[#858585] c98-text-[12px]">No network found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetWorksList;

const ChainItem = ({ item, isActive }: { item: ChainInfo; isActive: boolean }) => {
  const customTwMerge = extendTailwindMerge({
    // ↓ Add values to existing theme scale or create a new one
    prefix: 'c98-',
  });

  return (
    <div
      className={customTwMerge(
        'c98-p-[8px] c98-flex c98-gap-[8px] c98-rounded-[24px] c98-bg-bkg-third c98-mt-[4px] c98-items-center c98-cursor-pointer svg-hover',
        isActive && 'c98-bg-[#CDA349] c98-bg-opacity-25 c98-text-[#CDA349] svg-active',
      )}
    >
      <img src={item.imgUrl} alt="Coin98 Adapter" className="c98-w-[20px] c98-h-[20px] svg-icon" />
      <p>{item.name}</p>
    </div>
  );
};
