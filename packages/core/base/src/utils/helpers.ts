import { ProposalTypes } from '@walletconnect/types';
import {
  DEFAULT_CHAINS,
  DEFAULT_COSMOS_EVENTS,
  DEFAULT_COSMOS_METHODS,
  DEFAULT_EIP155_METHODS,
  DEFAULT_EIP_155_EVENTS,
  DEFAULT_SOLANA_EVENTS,
  DEFAULT_SOLANA_METHODS,
} from '../constants';

export const getSupportedRequiredMethodsByNamespace = (namespace: string) => {
  switch (namespace) {
    case 'eip155':
      return Object.values(DEFAULT_EIP155_METHODS);
    case 'cosmos':
      return Object.values(DEFAULT_COSMOS_METHODS);
    case 'solana':
      return Object.values(DEFAULT_SOLANA_METHODS);
    default:
      throw new Error(`No default required methods for namespace: ${namespace}`);
  }
};

export const getNamespacesFromChains = (chains: string[]) => {
  const supportedNamespaces: string[] = [];
  chains.forEach(chainId => {
    const [namespace] = chainId.split(':');
    if (!supportedNamespaces.includes(namespace)) {
      supportedNamespaces.push(namespace);
    }
  });

  return supportedNamespaces;
};

export const getSupportedEventsByNamespace = (namespace: string) => {
  switch (namespace) {
    case 'eip155':
      return Object.values(DEFAULT_EIP_155_EVENTS);
    case 'cosmos':
      return Object.values(DEFAULT_COSMOS_EVENTS);
    case 'solana':
      if (!DEFAULT_SOLANA_EVENTS) return [];
      return Object.values(DEFAULT_SOLANA_EVENTS);
    default:
      throw new Error(`No default events for namespace: ${namespace}`);
  }
};

export const getRequiredNamespaces = (chains: string[]): ProposalTypes.RequiredNamespaces => {
  const selectedNamespaces = getNamespacesFromChains(chains);
  console.log('selected required namespaces:', selectedNamespaces);
  return Object.fromEntries(
    selectedNamespaces.map(namespace => [
      namespace,
      {
        methods: getSupportedRequiredMethodsByNamespace(namespace),
        chains: chains.filter(chain => chain.startsWith(namespace)),
        events: getSupportedEventsByNamespace(namespace) as any[],
      },
    ]),
  );
};

export const getNetworkFromChainId = (chainId?: string) => {
  if (!chainId) return;
  return DEFAULT_CHAINS[chainId];
};
