// export const DEFAULT_MAIN_CHAINS = [
//   // mainnets
//   'eip155:1',
//   'eip155:10',
//   'eip155:100',
//   'eip155:137',
//   'eip155:324',
//   'eip155:42161',
//   'eip155:42220',
//   'cosmos:cosmoshub-4',
//   'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
// ];

export const SUPPORTED_CHAINS: { [key: string]: any } = {
  '0x1': 'eip155:1', //Ethereum
  '0x5': 'eip155:5', //Goerli
  '0xaa36a7': 'eip155:11155111', //Sepolia
  '0xa': 'eip155:10', //Optimism
  '0x1a4': 'eip155:420', //Optimism Goerli
  '0xa4b1': 'eip155:42161', // Arbitrum
  '0x89': 'eip155:137', // Polygon
  '0x38': 'eip155:56', //Binance Smart Chain
  '0x58': 'eip155:88', // Tomo Chain
  '0x61': 'eip155:97', // Binance Smart Chain Test
  solana: 'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
  'solana-dev': 'solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K',
};

export const DEFAULT_CHAINS = { ...SUPPORTED_CHAINS };

export const DEFAULT_LOGGER = 'debug';
export const DEFAULT_PROJECT_ID = 'dcdc4211d22a611a057f84d2cdc7cdf5';
export const DEFAULT_RELAY_URL = 'wss://relay.walletconnect.com';
export const DEFAULT_APP_METADATA = {
  name: 'Coin98 Dapp',
  description: 'C98 App for WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

export enum DEFAULT_EIP155_METHODS {
  ETH_SEND_TRANSACTION = 'eth_sendTransaction',
  PERSONAL_SIGN = 'personal_sign',
}

export enum DEFAULT_EIP_155_EVENTS {
  ETH_CHAIN_CHANGED = 'chainChanged',
  ETH_ACCOUNTS_CHANGED = 'accountsChanged',
}

/**
 * COSMOS
 */
export enum DEFAULT_COSMOS_METHODS {
  COSMOS_SIGN_DIRECT = 'cosmos_signDirect',
  COSMOS_SIGN_AMINO = 'cosmos_signAmino',
}

export enum DEFAULT_COSMOS_EVENTS {}

/**
 * SOLANA
 */
export enum DEFAULT_SOLANA_METHODS {
  SOL_SIGN_TRANSACTION = 'solana_signTransaction',
  SOL_SIGN_MESSAGE = 'solana_signMessage',
}

export enum DEFAULT_SOLANA_EVENTS {}
