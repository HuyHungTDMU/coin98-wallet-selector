import { useWallet } from '@coin98t/wallet-adapter-react';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { ChainInfo } from '../types';
import { useWalletModal } from '../useWalletModal';

const NetWorksList = ({
  listNetworks,
  titleNetworks,
  selectedNetwork,
  handleSelectedChain,
  renderListChains,
}: {
  listNetworks: ChainInfo[];
  titleNetworks: string | ReactNode;
  selectedNetwork: { blockChainName: string; chainId: string } | undefined;
  handleSelectedChain: (blockChainName: string, chainId: string) => void;
  renderListChains?: (chainData: ChainInfo, isActive: boolean) => ReactNode;
}) => {
  const { enables } = useWallet();
  const { visible } = useWalletModal();

  const [value, setValue] = useState('');
  const [data, setData] = useState(listNetworks);

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
    <div className="c98-w-[200px]">
      <h3 className="c98-text-[#606060] c98-text-[16px] c98-font-medium">1. {titleNetworks}</h3>
      <div className="c98-overflow-y-auto c98-mt-3 c98-bg-[#202020] c98-rounded-2xl c98-p-4 c98-h-[334px]">
        <div className="c98-p-2 c98-flex c98-justify-center c98-items-center c98-gap-2 c98-rounded-3xl c98-bg-[#151515]">
          <img
            className="c98-w-5 c98-h-5 c98-pointer-events-none"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATbSURBVHgB7ZztddowFIYvkK+fbFBvUDaIMwHdoHSCNBMEJgiZIGSCNhPEmSB0gjgTwL98EvreVO5JjSTLINsS1XOODzmysZ1X90OWryAKBAKBQCAQ8JIWNchyuey+vLxErVari78jbsPfqdg339vbm5Lj1CogxIrxcQhx+LOHrWvwtSmOTyHs1e7ubpIJ7AqVCyhE60OEAZkJVkSC7RLWOSEHqExAFg6ineLPmKqBrXKys7Nz2aRVWhfw4eEh6nQ6F1SdcHlSbKOmLNKqgM/Pz8f4GFI5V02xzUWc488uJxVxjl6Z8yBGHtVtjVYEFNn0B5lZXYLjb9rtdgL3m7JouoPRKSxiD9/p49gvBeeev729jQ4ODsbkC+yy+CfvsC012wzbWCSUTa81KLoernNKPsDWYSDemC2ULGMg5AW5jIHl3Qr3q/oext6JaCBerTFIWOPMG3fWiff4+PidGkDXqU3dkxTuUY3lDahBNCLOsmftRhFJQyre09PTkBxAiChz52tqGpWLuCJeBg+XnHNlEahl1ndHDsKdqnBl60MqI1TW50RsUSCGUpV6S9vkIJEcIsmuiWvzcx/BvZ1I2o5rt0IOwL5ZX4bs3m3GwkIL5KxG8kkCp60vA/c4yrdhIqNPdcG95av1Zcis0JYbF1qgoremPlhfBk+f5dsw1CmaGjPCJInEkrYb8gh09k9J8yFZQCugajZFcUPOIl6P5iduY7KAVkC4byRr55lk8gx0epJrimzEQa2Ai8VCZoFp0TS8i0Cse0lztQKKlzt5UvIQvCtJ822vr68RbYhWwMaeGysA4WjFayBqtRaoIKUtQeFhpVhHwK2BC5hoQ9YRMKItQebWpc9RsD+VtEXkIVU9ehZl4VTSHJGHwNo+59tsjGfXEVD5hOIyEguc2xjPagVU9RDSf0weIabk8p1u5WmqyAK5h9KVL9U5n2aBTqcTS5p/kQVMsvCVpK3n0yAbhtCXtFmZECkUUHGhLuKgO2/7NbD7orPzc39cS5iQBQoFFBdaCbYQ9it5ANxXVhuTkCWMBtLowXNJc9R0KUcRInkMJLvOqU443inKJWYux0Iub6u6xMPIAkXtsqzXuq5Wg4pq2IFk1yU1gcYKl5hXs/KCxhaaKq1mC4xUrzidKR8TyEo6nHkVq6pS4B534QYVcc+dCjJN/V3jIqrEc66CTFV/l91s3ZMNolMb8Yy1ZqR5cI0JhRPF7gjbbV3ZmTsTg2VODrHiEOdWeP5FUcT4T+9vurhGhVgddVZw/ffN6YU3BiLydmFLSCHcqSYO1yqilbVyPA6ES59R8Wx1iuPOeZ1cmdXoQjQea/Lzd1xwOJ9XVZIyRPgZkUWsrdYUy1x5waFpAuEJCq7ymi4Wi/v8Cx4O/Nj3if4IFpmckOMyLzRkr8B3pRZnW0Tr64V5sA0xeNlrRPWRQJRvH5NFXSJafy/MFgCLOoIF1fHMyRn2COFgZZ3w/v7+EPcgFQntQ1sxsdLfTGC35jW+FVgkCzcymRSt2hJr+9UO8RsKnAi4sLHsQPs9XiLGXcGyJmXfplUpYiO/G8NZFZm7x+VzXJ8ikkX+mHvhllMbvx+jEzFLPhTQoxqzIvGt/YLpvyouUiUWxOgZBczJWeL1NtVB1koQLhAIBAKBQCAQCAQCgfL8BkvmmBAU0okFAAAAAElFTkSuQmCC"
            alt=""
          />
          <input
            type="text"
            placeholder="Search..."
            className="c98-w-full c98-bg-[#151515] c98-text-[12px] c98-font-normal c98-outline-none"
            value={value}
            onChange={handleChange}
          />
          {!!value && (
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMTSURBVHgB7dzvcdpAEAXwJYD46hLkDtxBnA7SQZwOkgpCKnAJIRUkHVCCkwpwB843/g5k19aOGQziJJ2kXfR+Mzd4bI1Hfo9DIJ1MBAAAAAAAAAAAAAAAAAAA0EGr1epmvV7f7na7K/JEdph3/J7/gBmPBx535Mh8Pk95n6c8dtmYbTabT+RFFvxuf3Ah38iBLPw3+8/jqY6Z8I4ikynLD+nh93nnx9ZLkPD7/f6Ujuw/u+JZcEORRS8gj+USzoRfmx5Flr3+z/jLk9O11+uNh8PhdzIiMPzHJEmuKbLoM4DD/ccPX/O2sTQTQsPnJ8wH8kTe+Rw5kJk6MOcccPfHjJ8wKXlkuYSLD1+FlMDjBzWoM+ErSyV0LnxloYTOhq/aLKHz4as2SkD4B5osAeGfEFLCcrn8VeUEmIfwo5+KKGL1cpr63DP9j3wKzT5hByvyCZd/9yO1pNUCRB0leAlftF6AiFmCp/CFiQJEjBK8hS/MFCCqlOAxfGGqAFGmBK/hC3MFiMASngNdLBbkNXxhsgARWkL2mOZtYzV8YbYAEVhCHtPhC9MFiAolmA9fmC9AlCjBRfjCRQGiQAluwheNrguqIkmSCYf6O3DzQueN2uSmALl4z2ctPwZsmvK2Uy8Lal28BGXhj6mYUmdRm2Z+BpQMX8jS8nsyzvQMqBD+vgkfPz6TUWZnQED48m7nmrf5Sfnkypv5mWCKhF/kMiJfupycu7zp5f6E1hUNX6GECMqGr1BCBVXDVyEl8CnsLwSvYoWvQkpwddNdnWKHr1BCgLrCVyEl8Ih+450LdYevAkp46lwJTYWvQkrozNrQpsNXASVc/gLdtsJXnS6h7fBVJ0uwEr7qVAnWwlcBJTx4uap2ktXw1UWXYD18FVDClLzxEr4KKKHRG8krye7LchO+OldC9n+Qoot+SXIwGKQ5Pza7aGo0Gt3lXd7cbre3VIPoBfAfcWoZiPkVa3kleFlp9+zIdHb1vvrY/lNNaluWsnpZy/mep+5ffmZNrC+QOuR9/wEAAAAAAAAAAAAAAAAAoH3/AfGasqik1x13AAAAAElFTkSuQmCC"
              alt=""
              className="c98-w-4 c98-h-4 c98-cursor-pointer"
              onClick={() => handleResetSearch()}
            />
          )}
        </div>

        <div className="c98-mt-3">
          {!!data.length ? (
            data.map(item => {
              const isEnabledBlockChain = enables.includes(item.blockChainName);
              if (!isEnabledBlockChain) return;
              const isActive = selectedNetwork?.chainId === item.chainId;
              return (
                <div
                  key={item.chainId}
                  className="c98-cursor-pointer"
                  onClick={e => {
                    e.preventDefault();
                    handleSelectedChain(item.blockChainName, item.chainId);
                  }}
                >
                  {renderChainNode(item, isActive)}
                </div>
              );
            })
          ) : (
            <div className="c98-text-center c98-flex-1">No results found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetWorksList;

const ChainItem = ({ item, isActive }: { item: ChainInfo; isActive: boolean }) => {
  return (
    <div
      className={`c98-p-2 c98-flex c98-gap-2 c98-rounded-3xl c98-bg-[#252525] c98-mt-1 c98-items-center c98-cursor-pointer svg-hover ${
        isActive && 'c98-bg-[#CDA349] c98-bg-opacity-25 c98-text-[#CDA349] svg-active'
      }`}
    >
      <img src={item.imgUrl} alt="Coin98 Adapter" className="c98-w-5 c98-h-5" />
      <p>{item.name}</p>
    </div>
  );
};
