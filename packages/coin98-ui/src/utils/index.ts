import { ChainInfo } from '../types';

export const getSelectedNetwork = (chainId: string | undefined, listChains: ChainInfo[]) => {
  if (!chainId)
    return {
      blockChainName: listChains[0].blockChainName,
      chainId: listChains[0].chainId,
    };

  const res = listChains.find(chain => chain.chainId === chainId);

  return {
    blockChainName: res ? res.blockChainName : listChains[0].blockChainName,
    chainId: res ? res.chainId : listChains[0].chainId,
  };
};
