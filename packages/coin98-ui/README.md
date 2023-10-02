### Readme C98 adapter

### Quick Start

#### Installation

```bash
npm install @coin98t/wallet-adapter-react
```

#### Install wallet adapter EVM

```bash
npm install @coin98t/wallet-adapter-coin98 @coin98t/wallet-adapter-metamask
```

#### Install wallet adapter Solana

```bash
npm install @coin98t/wallet-adapter-coin98 @coin98t/wallet-adapter-phantom
```

#### Install wallet adapter Comos

```bash
npm install @coin98t/wallet-adapter-coin98 @coin98t/wallet-adapter-keplr @coin98t/wallet-adapter-fin
```

### Supported

```bash
Supported BlockChain: ethereum, solana, cosmos.
```

```bash
 Supported Wallet: MetaMask, Coin98, Keplr, Fin, Phantom.
```

```bash
Supported Chain (Wallets Modal UI)
 - Ethereum: binanceSmartTest, binanceSmart, polygon, ether
 - Solana
 - Cosmos: Sei Network Testnet
```

### Using for Base UI

```jsx mdx:preview
import { useWallet, WalletProvider, BLOCKCHAINS_DATA, CHAINS_ID, WALLETS_NAME } from '@coin98t/wallet-adapter-react';

import { Coin98WalletAdapter } from '@coin98t/wallet-adapter-coin98';
import { MetaMaskWalletAdapter } from '@coin98t/wallet-adapter-metamask';
import { KeplrWalletAdapter } from '@coin98t/wallet-adapter-keplr';
import { FinWalletAdapter } from '@coin98t/wallet-adapter-fin';
import { PhantomWalletAdapter } from '@coin98t/wallet-adapter-phantom';

const App = () => {
  const enables = [BLOCKCHAINS_DATA.cosmos, BLOCKCHAINS_DATA.ethereum, BLOCKCHAINS_DATA.solana];
  const wallets = [
    Coin98WalletAdapter,
    MetaMaskWalletAdapter,
    KeplrWalletAdapter,
    FinWalletAdapter,
    PhantomWalletAdapter,
  ];

  return (
    <WalletProvider wallets={wallets} enables={enables} autoConnect>
      <Content />
    </WalletProvider>
  );
};

const Content = () => {
  const { address, signMessage, sendTransaction, wallet, chainIdWallet, disconnect, select } = useWallet();

  const handleConnectWallet = (walletName: string, chainName: string) => {
    select(walletName, chainName);
  };

  return (
    <>
      <div>
        {!connected && (
          <button onClick={() => handleConnectWallet(WALLETS_NAME.coin98Cosmos, CHAINS_ID.seiTestnet)}>
            Connect Wallet
          </button>
        )}
      </div>
      <div>{connected && <button onClick={disconnect}>Disconnect</button>}</div>
      {connected && <div>{/* Handle for Dapp */}</div>}
    </>
  );
};
```

### Using for C98 Wallets Modal UI

```bash
npm install @coin98t/wallet-adapter-react-ui
```

```jsx mdx:preview
import {
  bsc,
  Button,
  ether,
  IChainsData,
  polygon,
  seiNetwork,
  solana,
  useWalletModal,
  WalletModalSelect,
} from '@coin98t/wallet-adapter-react-ui';
import { useWallet, WalletProvider, BLOCKCHAINS_DATA, CHAINS_ID, WALLETS_NAME } from '@coin98t/wallet-adapter-react';

//Import css for component from @coin98t/wallet-adapter-react-ui package
import '@coin98t/wallet-adapter-react-ui/styles.css';

import { Coin98WalletAdapter } from '@coin98t/wallet-adapter-coin98';
import { MetaMaskWalletAdapter } from '@coin98t/wallet-adapter-metamask';
import { KeplrWalletAdapter } from '@coin98t/wallet-adapter-keplr';
import { FinWalletAdapter } from '@coin98t/wallet-adapter-fin';
import { PhantomWalletAdapter } from '@coin98t/wallet-adapter-phantom';

const App = () => {
  const enables = [BLOCKCHAINS_DATA.cosmos, BLOCKCHAINS_DATA.ethereum, BLOCKCHAINS_DATA.solana];
  const wallets = [
    Coin98WalletAdapter,
    MetaMaskWalletAdapter,
    KeplrWalletAdapter,
    FinWalletAdapter,
    PhantomWalletAdapter,
  ];

  return (
    <WalletProvider wallets={wallets} enables={enables} autoConnect>
      <WalletModalProvider>
        <Content />
      </WalletModalProvider>
    </WalletProvider>
  );
};

const Content = () => {
  const { publicKey, address, selectedChainId, selectedBlockChain, wallet, disconnect, connected } = useWallet();
  const { visible, openWalletModal } = useWalletModal();

  const defaultChains: ChainInfo[] = [
    {
      ...ether,
      imgUrl: 'https://static.wikia.nocookie.net/projectcrusade/images/d/dd/Marumaro.png',
    },
    {
      ...bsc,
      imgUrl:
        'https://static.wixstatic.com/media/dad1c6_5ffabfcd4df244a89f7bb83d23e5e6f7~mv2.png/v1/fill/w_400,h_400,al_c,lg_1,q_95,enc_auto/346_hugotwo_thumbnail_webp.png',
    },
    solana,
    seiNetwork,
    polygon,
  ];
  const renderContent = () => {
    if (selectedBlockChain === 'evm' && selectedChainId === CHAINS_ID.binanceSmartTest)
      return <div>{/*Handle for BNB Testnet */}</div>;
  };
  if (selectedBlockChain === 'evm') return <div>{/*Handle for EVM */}</div>;
  if (selectedBlockChain === 'cosmos') return <div>{/*Handle for Cosmos*/}</div>;
  if (selectedBlockChain === 'solana') return <div>{/*Handle for Solana*/}</div>;
};

return (
  <>
    <div>{!connected && <button onClick={openWalletModal}>Connect Wallet</button>}</div>
    <div>{connected && <button onClick={disconnect}>Disconnect</button>}</div>
    {visible && <WalletModalSelect enableChains={defaultChains} isC98Theme />}
    <div> {connected && renderContent()}</div>
  </>
);
```

### Note

```bash
- Use variable "publicKey" to replace for "address" with solana Blockchain.
- Use variable "selectedBlockChain" to detect selected blockchain.
- Use variable "selectedChainId" to detect network selected
- You can import WalletMultiButton component from @coin98t/wallet-adapter-react-ui package to connect and disconnect wallet
- With NextJS:
  const WalletMultiButtonDynamic = dynamic(async () => (await import('@coin98t/wallet-adapter-react-ui')).WalletMultiButton,{ ssr: false },)
```

### License

Licensed under the MIT License.
