import { Network } from './types';

export const getNetworkPreset = (networkId: string): Network => {
  switch (networkId) {
    case 'near-mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.near.org',
        indexerUrl: 'https://api.kitwallet.app',
      };
    case 'near-testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
        indexerUrl: 'https://testnet-api.kitwallet.app',
      };
    default:
      throw Error(`Failed to find config for: '${networkId}'`);
  }
};

export const resolveNetwork = (network: string): Network => {
  return getNetworkPreset(network);
};
