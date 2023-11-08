import { ChainInfo } from '../types';

export const getSelectedNetwork = (chainId: string | undefined, listChains: ChainInfo[]) => {
  if (!chainId)
    return {
      blockChainName: listChains[0].blockChainName,
      chainId: listChains[0].chainId,
      id: listChains[0].id,
    };

  const res = listChains.find(chain => chain.chainId === chainId);

  return {
    blockChainName: res ? res.blockChainName : listChains[0].blockChainName,
    chainId: res ? res.chainId : listChains[0].chainId,
    id: res ? res.id : listChains[0].id,
  };
};
