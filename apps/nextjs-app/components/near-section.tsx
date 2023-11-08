'use client';
import CustomButton from '@/components/ui/custom-button';
import { useWallet } from '@coin98t/wallet-adapter-react';

import { utils } from 'near-api-js';
import { useEffect, useState } from 'react';
import ResultTxt from './ui/resultTxt';
import CardMethod from '@/components/ui/card-method';

export default function NearSection() {
  const [account, setAccount] = useState<any>();
  const [resultSendTrans, setResultSendTrans] = useState('');
  const [resultSendTranss, setResultSendTranss] = useState('');
  const [resultSignMessage, setResultSignMessage] = useState('');
  const { sendTransaction, wallet, sendTransactions, signMessage } = useWallet();

  const handleSignMessage = async () => {
    const message = 'test message to sign';
    const nonce = Buffer.from(Array.from(Array(32).keys()));
    const recipient = 'guest-book.testnet';
    const res = await window.nightly.near.signMessage({ message, nonce, recipient });
    console.log('🚀 ~ file: near-section.tsx:22 ~ handleSignMessage ~ res:', res);

    // const res = await signMessage(message, recipient, nonce);

    setResultSignMessage(res.data as string);
  };

  const handleSendTransaction = async () => {
    // const wallet = window.coin98.near;

    // const provider = new JsonRpcProvider({ url: 'https://rpc.mainnet.near.org' });
    // const blockInfo = await provider.query(`access_key/${account.accountId}/${account.publicKey.split(':')[1]}`, '');
    // const blockHash = utils.serialize.base_decode(blockInfo.block_hash);
    // // @ts-expect-error
    // const action = transactions.transfer(utils.format.parseNearAmount('0.0001'));

    // const publicKey = await wallet.signer.getPublicKey(account.accountId, 'mainnet');
    // const tx = transactions.createTransaction(
    //   account.accountId,
    //   publicKey,
    //   '8f02dd0da4b1b13cbf4f42c3f59911a897c550d3c50015f25e96ef37016ba9f5',
    //   // @ts-expect-error
    //   ++blockInfo.nonce,
    //   [action],
    //   blockHash,
    // );

    // // @ts-expect-error

    // const action = transactions.transfer(utils.format.parseNearAmount('0.0001'));
    const txTransfer = {
      signerId: account.accountId,
      receiverId: 'f313c2ecf0cd186a9933c383492e9845e021e9f75a728614615f4ad4d6b0a44a',
      actions: [
        {
          type: 'Transfer',
          params: {
            deposit: utils.format.parseNearAmount('0.00001')!,
          },
        },
      ],
    };

    const tx = {
      signerId: account.accountId!,
      receiverId: 'guest-book.testnet',
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: 'addMessage',
            args: { text: 'helllo' },
            gas: utils.format.parseNearAmount('0.00000000003')!,
            deposit: utils.format.parseNearAmount('0')!,
          },
        },
      ],
    };

    const res: any = await sendTransaction(txTransfer as any);

    setResultSendTrans(res.data?.transaction?.hash);
  };

  const handleSendTransactions = async () => {
    // const wallet = window.coin98.near;

    // const provider = new JsonRpcProvider({ url: 'https://rpc.mainnet.near.org' });
    // const blockInfo = await provider.query(`access_key/${account.accountId}/${account.publicKey.split(':')[1]}`, '');
    // const blockHash = utils.serialize.base_decode(blockInfo.block_hash);
    // // @ts-expect-error
    // const action = transactions.transfer(utils.format.parseNearAmount('0.0001'));

    // const publicKey = await wallet.signer.getPublicKey(account.accountId, 'mainnet');
    // const tx = transactions.createTransaction(
    //   account.accountId,
    //   publicKey,
    //   '8f02dd0da4b1b13cbf4f42c3f59911a897c550d3c50015f25e96ef37016ba9f5',
    //   // @ts-expect-error
    //   ++blockInfo.nonce,
    //   [action],
    //   blockHash,
    // );

    // // @ts-expect-error

    // const action = transactions.transfer(utils.format.parseNearAmount('0.0001'));
    // const txTransfer = {
    //   signerId: account.accountId,
    //   receiverId: 'f313c2ecf0cd186a9933c383492e9845e021e9f75a728614615f4ad4d6b0a44a',
    //   actions: [
    //     {
    //       type: 'Transfer',
    //       params: {
    //         deposit: utils.format.parseNearAmount('0.00001')!,
    //       },
    //     },
    //   ],
    // };

    const transactions: Array<any> = [];

    for (let i = 0; i < 2; i += 1) {
      transactions.push({
        signerId: account.accountId!,
        receiverId: 'guest-book.testnet',
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'addMessage',
              args: {
                text: `ChiPoPo (${i + 1}/2)`,
              },
              gas: utils.format.parseNearAmount('0.00000000003')!,
              deposit: utils.format.parseNearAmount('0')!,
            },
          },
        ],
      });
    }
    const res = await sendTransactions(transactions as any);
    let arrayHash: any = [];

    res.data.filter((element: any) => {
      arrayHash.push(element.transaction.hash);
    });

    setResultSendTranss(arrayHash.toString());
  };

  useEffect(() => {
    if (wallet) {
      const data = (wallet as any).adapter.getAccounts();
      setAccount(data);
    }
  }, [account]);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
      <CardMethod title="Send transaction">
        <CustomButton
          title="Send"
          onClick={() => {
            handleSendTransaction();
          }}
          className="mt-6"
        />
        {resultSendTrans && <ResultTxt txt={resultSendTrans} />}
      </CardMethod>

      <CardMethod title="Send mutiple transaction">
        <CustomButton
          title="Send mutiple"
          onClick={() => {
            handleSendTransactions();
          }}
          className="mt-6"
        />
        {resultSendTranss && <ResultTxt txt={resultSendTranss} />}
      </CardMethod>

      <CardMethod title="Sign message">
        <CustomButton
          title="Sign"
          onClick={() => {
            handleSignMessage();
          }}
          className="mt-6"
        />
        {resultSignMessage && <ResultTxt txt={resultSignMessage} />}
      </CardMethod>
    </div>
  );
}
