import { useWallet } from '@coin98t/wallet-adapter-react';
import { useState } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-core';
import CustomButton from './ui/custom-button';
import ResultTxt from './ui/resultTxt';

const ContentEvm = () => {
  //Constant
  const web3 = new Web3('https://mainnet.infura.io/v3/bdb2da6e58a24ecda1c49f112e7bad4d');
  const recipientAddress = '0x78Bd80570641Ea71E5837F282e8BB4dB93615B95';

  //Hook
  const { signMessage, sendTransaction, address, selectedChainId, signTypedData } = useWallet();
  const [resultMessage, setResultMessage] = useState('');
  const [resultSendToken, setResultSendToken] = useState('');
  const [resultSendTrans, setResultSendTrans] = useState('');
  const [resultSigTypedData, setResultSigTypedData] = useState<string>('');
  const [resultSigTypedDatav3, setResultSigTypedDatav3] = useState<string>('');
  const [resultSigTypedDatav4, setResultSigTypedDatav4] = useState<string>('');

  const handleSignMessage = async () => {
    const res = await signMessage('ChiPoPo');
    setResultMessage((res.data as any) || res.error);
  };

  const handleSendToken = async () => {
    const transactionParameters: TransactionConfig = {
      to: recipientAddress,
      from: address!,
      value: '0x' + Number(0.00001 * 1e18).toString(16),
      data: '0x',
      chainId: selectedChainId as any,
    };

    const resSend = await sendTransaction(transactionParameters as any);
    setResultSendToken((resSend.data as any) || resSend.error);
  };

  const handleSendTransaction = async () => {
    setResultSendTrans('This function just work on BNB Testnet. Please change network from your wallet!');
  };

  const handleSignTypedDataV4 = async () => {
    const msgParams = {
      domain: {
        chainId: parseInt(selectedChainId as string),
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
      },
      message: {
        contents: 'Hello, Bob!',
        from: {
          name: 'Cow',
          wallets: ['0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826', '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'],
        },
        to: [
          {
            name: 'Bob',
            wallets: [
              '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
              '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
              '0xB0B0b0b0b0b0B000000000000000000000000000',
            ],
          },
        ],
      },
      primaryType: 'Mail',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Group: [
          { name: 'name', type: 'string' },
          { name: 'members', type: 'Person[]' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallets', type: 'address[]' },
        ],
      },
    };

    const res = await signTypedData(msgParams as any, 'v4');
    setResultSigTypedDatav4((res.data as string) || (res.error as string));
  };

  const handleSignTypedData = async () => {
    const msgParams = [
      {
        type: 'string',
        name: 'Message',
        value: 'Hi, Alice!',
      },
      {
        type: 'uint32',
        name: 'A number',
        value: '1337',
      },
    ];

    const res = await signTypedData(msgParams, 'v1');
    setResultSigTypedData((res.data as string) || (res.error as string));
  };
  const handleSignTypedDataV3 = async () => {
    const msgParams = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: parseInt(selectedChainId as string),
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      message: {
        from: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    };

    const res = await signTypedData(msgParams as any, 'v3');
    setResultSigTypedDatav3((res.data as string) || (res.error as string));
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <CustomButton onClick={() => handleSignMessage()} title="Sign Message" className="mt-6" />
        <ResultTxt txt={resultMessage} />
      </div>

      <div>
        <CustomButton onClick={() => handleSendToken()} title="Send Token" className="mt-6" />
        <ResultTxt txt={resultSendToken} />
      </div>

      <div>
        <CustomButton onClick={() => handleSendTransaction()} title="Send Transaction" className="mt-6" />
        <ResultTxt txt={resultSendTrans} />
      </div>

      <div>
        <CustomButton onClick={() => handleSignTypedData()} title="Sign Typed Data" className="mt-6" />
        <ResultTxt txt={resultSigTypedData} />
      </div>

      <div>
        <CustomButton onClick={() => handleSignTypedDataV3()} title="Sign Typed Data v3" className="mt-6" />
        <ResultTxt txt={resultSigTypedDatav3} />
      </div>

      <div>
        <CustomButton onClick={() => handleSignTypedDataV4()} title="Sign Typed Data v4" className="mt-6" />
        <ResultTxt txt={resultSigTypedDatav4} />
      </div>
    </div>
  );
};

export default ContentEvm;
