import Head from 'next/head';
import {
  evmChains,
  Button,
  ChainInfo,
  useWalletModal,
  viction,
  bsc,
  seiNetwork,
} from '@coin98t/wallet-adapter-react-ui';
import { useWallet } from '@coin98t/wallet-adapter-react';

import React, { useEffect, useState } from 'react';
import { AdapterCosmos, TransactionCosmos } from '@coin98t/wallet-adapter-base';
import dynamic from 'next/dynamic';
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction as TransactionSolana,
  TransactionInstruction,
} from '@solana/web3.js';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { calculateFee, MsgSendEncodeObject } from '@cosmjs/stargate';
// import { WalletModalC98 } from '@/components/WalletModalC98';

import Web3 from 'web3';
import { type Transaction } from 'web3-types';
import Link from 'next/link';

const WalletModalC98 = dynamic(async () => (await import('@coin98t/wallet-adapter-react-ui')).WalletModalC98, {
  ssr: false,
});
// const defaultChains: ChainInfo[] = [
//   {
//     ...ether,
//     // imgUrl: 'https://static.wikia.nocookie.net/projectcrusade/images/d/dd/Marumaro.png',
//   },
//   {
//     ...bsc,
//     // imgUrl:
//     //   'https://static.wixstatic.com/media/dad1c6_5ffabfcd4df244a89f7bb83d23e5e6f7~mv2.png/v1/fill/w_400,h_400,al_c,lg_1,q_95,enc_auto/346_hugotwo_thumbnail_webp.png',
//   },
//   bscTest,
//   solana,
//   seiNetwork,
//   matic,
//   stargazeTestnet,
//   viction,
// ];

const defaultChains: ChainInfo[] = [seiNetwork, bsc, viction];

export default function TestFinalModal() {
  const { publicKey, address, selectedChainId, selectedBlockChain, disconnect, connected } = useWallet();
  const { visible, openWalletModal } = useWalletModal();

  const renderContent = () => {
    if (selectedBlockChain === 'evm' && (selectedChainId as any) === '0x61') return <ContentBNBTest />;
    if (selectedBlockChain === 'evm') return <ContentEvm />;
    if (selectedBlockChain === 'cosmos' && (selectedChainId as any) === 'atlantic-2') return <ContentSeiTest />;
    if (selectedBlockChain === 'cosmos') return <ContentCosmos />;
    if (selectedBlockChain === 'solana') return <ContentSolana />;
  };

  const handleChangeTheme = (darkTheme: boolean) => {
    if (darkTheme) {
      localStorage.setItem('theme', 'dark');

      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');

      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const wallet = window?.coin98?.provider!;
      // const wallet = (window as any).ethereum!;
    };

    init();
  }, []);

  return (
    <>
      <Head>
        <title>Dapp Multiple Chain Test</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="h-screen py-6 px-24 dark:bg-black">
        <h1 className="text-2xl text-rose-900 p-2 flex justify-end">Test Modal Page</h1>
        <div className="flex justify-between items-center">
          {/* <Link href="/">
            <div className="flex gap-4 items-center">
              <img
                className="w-[55px] border-[1px] rounded-2xl border-[#333]"
                src="https://cryptologos.cc/logos/coin98-c98-logo.png?v=024"
                alt="c98"
              />
              <h2 className="text-[25px] font-bold">Adapter C98</h2>
            </div>
          </Link> */}

          <div>
            {/* <WalletMultiButtonDynamic /> */}

            {!connected && <Button onClick={() => openWalletModal()}>Connect Wallet</Button>}
            {connected && <Button onClick={disconnect}>Disconnect</Button>}

            {/* <div className={`${visible ? 'visible ' : 'invisible'}`}> */}
            <WalletModalC98 isC98Theme enableChains={defaultChains} activeChainId={'0x1'} />
            {/* <WalletModalSelect
                enableChains={defaultChains}
                // isC98Theme
                layoutClass={`${
                  visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                } bg-[#00212C] text-white rounded-xl transition-all p-10`}
                overlayClass={`${visible ? 'bg-transparent backdrop-blur-sm opacity-90' : 'opacity-0'} transition-all`}
                // titleModal={
                //   <div className="text-white relative">
                //     <img
                //       src="https://starship.c98staging.dev/assets/images/other/confirmconnect.png"
                //       alt=""
                //       className="absolute -top-[120px] left-[50%] -translate-x-1/2 w-40 h-40"
                //     />
                //     <h1 className="text-3xl pt-14 text-center"> Connect Wallet</h1>
                //     <div className="text-center mt-3 text-[#9FA3A7] round">
                //       By connecting a wallet, you agree to Coin98 Terms of Service and consent to its Privacy Policy
                //     </div>
                //   </div>
                // }
                // titleNetworks="Choose network"
                // titleWallets="Choose wallet"
                // renderListChains={(chainData, isActive) => {
                //   return (
                //     <div className="flex items-center flex-col">
                //       <img src={chainData.imgUrl} alt="" style={{ width: '50px', height: '50px' }} />
                //       <p>{chainData.name}</p>
                //       {isActive && <p>*</p>}
                //     </div>
                //   );
                // }}
                // renderListWallets={(iconUrl, walletName) => {
                //   return (
                //     <div className="flex items-center flex-col">
                //       <img src={iconUrl} alt="" style={{ width: '50px', height: '50px' }} />
                //       <p>{walletName}</p>
                //     </div>
                //   );
                // }}
              /> */}
            {/* </div> */}
          </div>
        </div>

        <div className="mt-20"> {connected && renderContent()}</div>
        <Link href="/" passHref className="flex mt-40 justify-center">
          <button className="p-2.5 border-2 rounded-lg hover:bg-slate-300 hover:border-black duration-200 cursor-pointer">
            Go to Test Function Page{' '}
          </button>
        </Link>

        {/* <Button
          onClick={() => {
            handleChangeTheme(false);
          }}
        >
          Change Theme
        </Button> */}
      </div>
    </>
  );
}

const ContentCosmos = () => {
  // Hook
  const { address, signMessage, sendTransaction, wallet, selectedChainId } = useWallet();
  const [resultMessage, setResultMessage] = useState('');
  const [resultSendToken, setResultSendToken] = useState('');
  const [resultSendTrans, setResultSendTrans] = useState('');

  const isSei = selectedChainId === 'pacific-1';
  const denom = isSei ? 'usei' : 'ustars';
  // Constant
  const CONTRACT_ADDRESS = 'sei1y6t2swnwjewa07hxeuv3pvxd9x9vc8chtwtfz8awpyex0tuurp9qkdzq66';
  const rpcUrl = 'https://rpc.wallet.pacific-1.sei.io/';

  const recipientAddress: string = isSei
    ? 'sei1jehf5qknmr5y530pvy2hrmjp6d95n4nvwqtaav'
    : 'stars1uwrs0tzxllcvdtavx2xx39m48yenaqpt8jndzr';

  const handleSignMessage = async () => {
    try {
      const res = await signMessage('hello');
      setResultMessage(Buffer.from(res.data as any).toString('hex'));
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendToken = async () => {
    const offlineSigner = (wallet?.adapter as AdapterCosmos).offlineSigner;
    const client = await SigningCosmWasmClient.connectWithSigner(rpcUrl, offlineSigner! as any);

    const transferAmount = { amount: '5000', denom: denom };

    const sendMsg: MsgSendEncodeObject = {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: {
        fromAddress: address!,
        toAddress: recipientAddress,
        amount: [transferAmount],
      },
    };

    try {
      const gasEstimation = await client.simulate(address!, [sendMsg], '');
      const multiplier = 1.3;
      const fee = calculateFee(Math.round(gasEstimation * multiplier), '0.0025' + denom);
      try {
        const result = await client.sendTokens(address!, recipientAddress, [transferAmount], fee, '');
        if (result.code === 0) {
          setResultSendToken(result.transactionHash);
        } else {
          console.log(`Error sending Tokens ${result.rawLog}`);
        }
      } catch (error) {
        throw error;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendTransaction = async () => {
    if (!address) return;

    const txMessage = isSei
      ? {
          transfer: {
            recipient: recipientAddress,
            amount: '100',
          },
        }
      : {
          attributes: {
            key: '_contract_address',
            value: 'stars13we0myxwzlpx8l5ark8elw5gj5d59dl6cjkzmt80c5q5cv5rt54qm2r0mx',
          },
        };

    const transaction: TransactionCosmos = {
      rpcUrl: rpcUrl,
      instructions: [{ contractAddress: CONTRACT_ADDRESS, msg: txMessage }],
      memo: '',
      denom: denom,
    };

    try {
      const res = await sendTransaction(transaction);
      console.log('res', res);
      setResultSendTrans((res as any).data.transactionHash);
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    window.addEventListener('keplr_keystorechange', () => {
      console.log('Key store in Keplr is changed. You may need to refetch the account info.');
    });

    () =>
      window.removeEventListener('keplr_keystorechange', () => {
        console.log('Key store in Keplr is changed. You may need to refetch the account info.');
      });
  }, []);
  return (
    <div>
      <h1 className="text-[40px] font-bold text-center">Sei Network</h1>
      <div className="grid grid-cols-2 gap-4 my-10">
        <div className="flex gap-2">
          <h2 className="font-bold text-[16px]"> Address:</h2>
          <p className="break-all text-[#277BC0]">{address}</p>
        </div>
        <div className="flex gap-2">
          <h2 className="font-bold text-[16px]">NetworkId:</h2>
          <p className="break-all text-[#277BC0]">{selectedChainId}</p>
        </div>
      </div>
      <div className="grid grid-cols-2  gap-16 pt-10 border-t-4">
        <div>
          <Button onClick={() => handleSignMessage()}>Sign Message</Button>
          {resultMessage && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-[#277BC0] w-3/4">{resultMessage}</p>
            </div>
          )}
        </div>

        <div>
          <Button onClick={() => handleSendToken()}>Send Token</Button>
          {resultSendToken && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-[#277BC0] w-3/4">{resultSendToken}</p>
            </div>
          )}
        </div>

        <div>
          <Button onClick={() => handleSendTransaction()}>Send Transaction</Button>
          {resultSendTrans && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-[#277BC0] w-3/4">{resultSendTrans}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ContentSeiTest = () => {
  // Hook
  const { address, signMessage, sendTransaction, wallet, selectedChainId } = useWallet();
  const [resultMessage, setResultMessage] = useState('');
  const [resultSendToken, setResultSendToken] = useState('');
  const [resultSendTrans, setResultSendTrans] = useState('');

  const isSei = selectedChainId === 'atlantic-2';
  const denom = isSei ? 'usei' : 'ustars';
  // Constant
  const CONTRACT_ADDRESS = 'sei1js8sp93fvyvjz4wqpkhj7qfxyvxydh3xcgt94em6kw3upusej4tsnnkdzk';
  const rpcUrl = isSei ? 'https://sei-testnet-rpc.polkachu.com/' : 'https://stargaze-testnet-rpc.polkachu.com/';
  const recipientAddress: string = isSei
    ? 'sei1jlfpyhc2d8va4kjtnm8ts5pjemx7qrmlhlfdaj'
    : 'stars1uwrs0tzxllcvdtavx2xx39m48yenaqpt8jndzr';

  const handleSignMessage = async () => {
    try {
      const res = await signMessage('hello');
      setResultMessage(Buffer.from(res.data as any).toString('hex'));
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendToken = async () => {
    const offlineSigner = (wallet?.adapter as AdapterCosmos).offlineSigner;
    const client = await SigningCosmWasmClient.connectWithSigner(rpcUrl, offlineSigner! as any);

    const transferAmount = { amount: '5000', denom: denom };

    const sendMsg: MsgSendEncodeObject = {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: {
        fromAddress: address!,
        toAddress: recipientAddress,
        amount: [transferAmount],
      },
    };

    try {
      const gasEstimation = await client.simulate(address!, [sendMsg], '');
      const multiplier = 1.3;
      const fee = calculateFee(Math.round(gasEstimation * multiplier), '0.0025' + denom);
      try {
        const result = await client.sendTokens(address!, recipientAddress, [transferAmount], fee, '');
        if (result.code === 0) {
          setResultSendToken(result.transactionHash);
        } else {
          console.log(`Error sending Tokens ${result.rawLog}`);
        }
      } catch (error) {
        throw error;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendTransaction = async () => {
    if (!address) return;

    const txMessage = isSei
      ? {
          transfer: {
            recipient: recipientAddress,
            amount: '100',
          },
        }
      : {
          attributes: {
            key: '_contract_address',
            value: 'stars13we0myxwzlpx8l5ark8elw5gj5d59dl6cjkzmt80c5q5cv5rt54qm2r0mx',
          },
        };

    const transaction: TransactionCosmos = {
      rpcUrl: rpcUrl,
      instructions: [{ contractAddress: CONTRACT_ADDRESS, msg: txMessage }],
      memo: '',
      denom: denom,
    };

    try {
      const res = await sendTransaction(transaction);
      console.log('res', res);
      setResultSendTrans((res as any).data.transactionHash);
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    window.addEventListener('keplr_keystorechange', () => {
      console.log('Key store in Keplr is changed. You may need to refetch the account info.');
    });

    () =>
      window.removeEventListener('keplr_keystorechange', () => {
        console.log('Key store in Keplr is changed. You may need to refetch the account info.');
      });
  }, []);
  return (
    <div>
      <h1 className="text-[40px] font-bold text-center">Sei Network</h1>
      <div className="grid grid-cols-2 gap-4 my-10">
        <div className="flex gap-2">
          <h2 className="font-bold text-[16px]"> Address:</h2>
          <p className="break-all text-[#277BC0]">{address}</p>
        </div>
        <div className="flex gap-2">
          <h2 className="font-bold text-[16px]">NetworkId:</h2>
          <p className="break-all text-[#277BC0]">{selectedChainId}</p>
        </div>
      </div>
      <div className="grid grid-cols-2  gap-16 pt-10 border-t-4">
        <div>
          <Button onClick={() => handleSignMessage()}>Sign Message</Button>
          {resultMessage && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-[#277BC0] w-3/4">{resultMessage}</p>
            </div>
          )}
        </div>

        <div>
          <Button onClick={() => handleSendToken()}>Send Token</Button>
          {resultSendToken && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-[#277BC0] w-3/4">{resultSendToken}</p>
            </div>
          )}
        </div>

        <div>
          <Button onClick={() => handleSendTransaction()}>Send Transaction</Button>
          {resultSendTrans && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-[#277BC0] w-3/4">{resultSendTrans}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ContentSolana = () => {
  //Constant
  const connection = new Connection(
    'https://rough-white-cloud.solana-mainnet.discover.quiknode.pro/917d316c92433f9d91a7c0c16299df93e2883054/',
  );
  const lamports = 0.001;
  let recipientAddress = 'E619HMmBYhwJiHweBUFHbso23s84WcFUUEaYqG2XUZzF';

  // Hook
  const { signMessage, sendTransaction, signTransaction, publicKey, selectedChainId, wallet } = useWallet();
  const [resultMessage, setResultMessage] = useState('');
  const [resultSend, setResultSend] = useState('');
  const [resultSendTrans, setResultSendTrans] = useState('');

  const handleSignMessage = async () => {
    try {
      const response = await signMessage?.(new TextEncoder().encode('ChiPoPo'));

      setResultMessage(Buffer.from(response.data as any).toString('hex'));
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignTransaction = async () => {
    try {
      let hash = await connection.getRecentBlockhash();

      const transaction = new TransactionSolana({ feePayer: publicKey, recentBlockhash: hash.blockhash }).add(
        new TransactionInstruction({
          data: Buffer.from('Hello, from the Coin98 Wallet Adapter example app!'),
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        }),
      );

      const resSig = await signTransaction?.(transaction);
      console.log('resSig', resSig);
    } catch (error) {
      console.log('error sigTransaction', error);
    }
  };

  const handleSendToken = async () => {
    try {
      if (!publicKey) throw new Error();

      let lamportsI = LAMPORTS_PER_SOL * lamports;

      let hash = await connection.getRecentBlockhash();
      console.log('zoo send token');

      const transaction = new TransactionSolana({ feePayer: publicKey, recentBlockhash: hash.blockhash }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipientAddress),
          lamports: lamportsI,
        }),
      );

      console.log('transaction', transaction);

      const resSend = await sendTransaction(transaction, connection);
      console.log('resSend', resSend);
      setResultSend(resSend.data as any);
    } catch (error) {
      console.log('error sendToken', error);
    }
  };

  const handleSendTransaction = async () => {
    try {
      let hash = await connection.getRecentBlockhash();

      const transaction = new TransactionSolana({ feePayer: publicKey, recentBlockhash: hash.blockhash }).add(
        new TransactionInstruction({
          data: Buffer.from('Hello, from the Coin98 Wallet Adapter example app!'),
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        }),
      );

      const resSend = await sendTransaction(transaction, connection);
      setResultSendTrans(resSend.data as any);
    } catch (error) {
      console.log('error sendTransaction', error);
    }
  };

  useEffect(() => {
    window.addEventListener('keplr_keystorechange', () => {
      console.log('Key store in Keplr is changed. You may need to refetch the account info.');
    });

    () =>
      window.removeEventListener('keplr_keystorechange', () => {
        console.log('Key store in Keplr is changed. You may need to refetch the account info.');
      });
  }, []);
  return (
    <div>
      <h1 className="text-[40px] font-bold text-center ">Solana</h1>

      <div className="grid grid-cols-2 gap-4 my-10">
        <div className="flex gap-2">
          <h2 className="font-bold text-[16px]"> Address:</h2>
          <p className="break-all text-[#277BC0]">{publicKey?.toBase58()}</p>
        </div>
        <div className="flex gap-2">
          <h2 className="font-bold text-[16px]">NetworkId:</h2>
          <p className="break-all text-[#277BC0]">{selectedChainId}</p>
        </div>
      </div>
      <div className="grid grid-cols-2  gap-16 pt-10 border-t-4">
        <div>
          <Button onClick={() => handleSignMessage()}>Sign Message</Button>
          {resultMessage && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-[#277BC0] w-3/4">{resultMessage}</p>
            </div>
          )}
        </div>

        <div>
          <Button onClick={() => handleSendToken()}>Send Token</Button>
          {resultSend && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-[#277BC0] w-3/4">{resultSend}</p>
            </div>
          )}
        </div>

        <div>
          <Button onClick={() => handleSendTransaction()}>Send Transaction</Button>
          {resultSendTrans && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-[#277BC0] w-3/4">{resultSendTrans}</p>
            </div>
          )}
        </div>

        <div>
          <Button onClick={() => handleSignTransaction()}>Sign Transaction</Button>
        </div>
      </div>
    </div>
  );
};

const ContentEvm = () => {
  //Constant
  const web3 = new Web3('https://mainnet.infura.io/v3/bdb2da6e58a24ecda1c49f112e7bad4d');
  const recipientAddress = '0x78Bd80570641Ea71E5837F282e8BB4dB93615B95';

  //Hook
  const { signMessage, sendTransaction, address, selectedChainId } = useWallet();
  const [resultMessage, setResultMessage] = useState('');
  const [resultSendToken, setResultSendToken] = useState('');
  const [resultSendTrans, setResultSendTrans] = useState('');

  const handleSignMessage = async () => {
    const res = await signMessage('ChiPoPo');
    console.log('res', res);
    setResultMessage(res.data as any);
  };

  const handleSendToken = async () => {
    const transactionParameters: Transaction = {
      to: recipientAddress,
      from: address!,
      value: '0x' + Number(0.001 * 1e18).toString(16),
      data: '0x',
      chainId: selectedChainId as any,
    };

    const resSend = await sendTransaction(transactionParameters as any);
    setResultSendToken(resSend.data as any);
  };

  const handleSendTransaction = async () => {
    setResultSendTrans('This function just work on BNB Testnet. Please change network from your wallet!');
    // const contract = new web3.eth.Contract(abi as any, contractAddress);
    // const data = await contract.methods['set']('ChiPoPo').encodeABI();
    // const transactionParameters: Transaction = {
    //   to: contractAddress,
    //   from: address!,
    //   value: '0x',
    //   data: data || '0x',
    //   chainId: selectedChainId as any,
    // };
    // const resSend = await sendTransaction(transactionParameters as any);
    // console.log('res send Token', resSend);
  };

  return (
    <div>
      <h1 className="text-[40px] font-bold text-center">EVM Mainnet</h1>
      <div className="grid grid-cols-2 gap-4 my-10">
        <div className="flex gap-2">
          <h2 className="font-bold text-[16px]">Address:</h2>
          <p className="break-all text-[#277BC0]">{address}</p>
        </div>
        <div className="flex gap-2">
          <h2 className="font-bold text-[16px]">Network Id:</h2>
          <p className="break-all text-[#277BC0]">{selectedChainId}</p>
        </div>
      </div>
      <div className="grid grid-cols-2  gap-16 pt-10 border-t-4">
        <div>
          <Button onClick={() => handleSignMessage()}>Sign Message</Button>
          {resultMessage && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-[#277BC0] w-3/4">{resultMessage}</p>
            </div>
          )}
        </div>

        <div>
          <Button onClick={() => handleSendToken()}>Send Token</Button>
          {resultSendToken && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-[#277BC0] w-3/4">{resultSendToken}</p>
            </div>
          )}
        </div>

        <div>
          <Button onClick={() => handleSendTransaction()}>Send Transaction</Button>
          {resultSendTrans && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-red-500 w-3/4">{resultSendTrans}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ContentBNBTest = () => {
  //Constant
  const contractAddress = '0xc06fdEbA4F7Fa673aCe5E5440ab3d495133EcE7a';
  const web3Test = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
  const recipientAddress = '0x78Bd80570641Ea71E5837F282e8BB4dB93615B95';
  const abi = [
    {
      inputs: [],
      name: 'get',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'string', name: 'data', type: 'string' }],
      name: 'set',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  //Hook
  const { signMessage, sendTransaction, address, selectedChainId } = useWallet();
  const [resultMessage, setResultMessage] = useState('');
  const [resultSendToken, setResultSendToken] = useState('');
  const [resultSendTrans, setResultSendTrans] = useState('');

  const handleSignMessage = async () => {
    const res = await signMessage('ChiPoPo');
    setResultMessage(res.data as any);
  };

  const handleSendToken = async () => {
    const transactionParameters: Transaction = {
      to: recipientAddress,
      from: address!,
      value: '0x' + Number(0.0000001 * 1e18).toString(16),
      data: '0x',
      chainId: selectedChainId as any,
    };

    const resSend = await sendTransaction(transactionParameters as any);
    setResultSendToken(resSend.data as any);
  };

  const handleSendTransaction = async () => {
    const contract = new web3Test.eth.Contract(abi as any, contractAddress);
    const data = await contract.methods['set']('ChiPoPo').encodeABI();

    const transactionParameters: Transaction = {
      to: contractAddress,
      from: address!,
      value: '0x0',
      data: data || '0x',
      chainId: selectedChainId as any,
    };

    const resSend = await sendTransaction(transactionParameters as any);
    setResultSendTrans(resSend.data as any);
  };

  return (
    <div>
      <h1 className="text-[40px] font-bold text-center">BNB Testnet</h1>
      <div className="grid grid-cols-2 gap-4 my-10">
        <div className="flex gap-2">
          <h2 className="font-bold text-[16px]"> Address:</h2>
          <p className="break-all text-[#277BC0]">{address}</p>
        </div>
        <div className="flex gap-2">
          <h2 className="font-bold text-[16px]">Network Id:</h2>
          <p className="break-all text-[#277BC0]">{selectedChainId}</p>
        </div>
      </div>
      <div className="grid grid-cols-2  gap-16 pt-10 border-t-4">
        <div>
          <Button onClick={() => handleSignMessage()}>Sign Message</Button>
          {resultMessage && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-[#277BC0] w-3/4">{resultMessage}</p>
            </div>
          )}
        </div>

        <div>
          <Button onClick={() => handleSendToken()}>Send Token</Button>
          {resultSendToken && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-[#277BC0] w-3/4">{resultSendToken}</p>
            </div>
          )}
        </div>

        <div>
          <Button onClick={() => handleSendTransaction()}>Send Transaction</Button>
          {resultSendTrans && (
            <div className="mt-6">
              <h2 className="font-bold text-[16px]">Result:</h2>
              <p className="break-all text-[#277BC0] w-3/4">{resultSendTrans}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
