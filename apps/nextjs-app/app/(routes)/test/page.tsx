'use client';
import CustomButton from '@/components/ui/custom-button';
import { JsonRpcProvider } from 'near-api-js/lib/providers';

import { transactions, utils } from 'near-api-js';
import { useState } from 'react';
import { PublicKey } from 'near-api-js/lib/utils';

export default function Home() {
  const [account, setAccount] = useState<any>();
  const handleConnect = async () => {
    const wallet = window.nightly.near;
    await wallet.connect({ prefix: 'near_selector', contractId: '' });

    const { accountId, publicKey } = wallet.account;

    if (!accountId) {
      return [];
    }

    // const publicKey = await wallet.signer.getPublicKey(accountId, 'mainnet');
    setAccount({
      accountId,
      publicKey: publicKey ? publicKey.toString() : undefined,
    });
  };

  const handleSendTransaction = async () => {
    const wallet = window.coin98.near;

    const provider = new JsonRpcProvider({ url: 'https://rpc.mainnet.near.org' });
    const blockInfo = await provider.query(`access_key/${account.accountId}/${account.publicKey.split(':')[1]}`, '');
    const blockHash = utils.serialize.base_decode(blockInfo.block_hash);
    // @ts-expect-error
    const action = transactions.transfer(utils.format.parseNearAmount('0.0001'));

    const publicKey = await wallet.signer.getPublicKey(account.accountId, 'mainnet');
    const tx = transactions.createTransaction(
      account.accountId,
      publicKey,
      '8f02dd0da4b1b13cbf4f42c3f59911a897c550d3c50015f25e96ef37016ba9f5',
      // @ts-expect-error
      ++blockInfo.nonce,
      [action],
      blockHash,
    );

    const params = {
      transactions: [tx],
      receiver: account.accountId,
    };

    await wallet.request({ method: 'near_signAndSendTransaction', params });
    // const signedTx = await wallet.signTransaction(tx);
    // const id = (await provider.sendTransactionAsync(signedTx)) as unknown as string;
    // console.log(id);

    // const tx = {
    //   signerId: account!,
    //   receiverId: 'guest-book.testnet',
    //   actions: [
    //     {
    //       type: 'FunctionCall',
    //       params: {
    //         methodName: 'addMessage',
    //         args: { text: 'helllo' },
    //         gas: utils.format.parseNearAmount('0.00000000003')!,
    //         deposit: utils.format.parseNearAmount('0')!,
    //       },
    //     },
    //   ].map(action => createAction(action)),
    // };
  };

  const handleSignMessage = async () => {
    const message = 'test message to sign';
    const nonce = Buffer.from(Array.from(Array(32).keys()));
    const recipient = 'guest-book.testnet';
    const res = await window.nightly.near.signMessage({ message, nonce, recipient });
    console.log('🚀 ~ file: near-section.tsx:22 ~ handleSignMessage ~ res:', res);

    // const res = await signMessage(message, recipient, nonce);
  };

  return (
    <main className="overflow-hidden">
      {!account && (
        <CustomButton
          title="Connect wallet"
          onClick={() => {
            handleConnect();
          }}
        />
      )}
      {account && <div>{account.accountId}</div>}
      <CustomButton
        title="Send transaction"
        onClick={() => {
          handleSendTransaction();
        }}
      />

      <div>
        <CustomButton
          title="Sign message"
          onClick={() => {
            handleSignMessage();
          }}
        />
      </div>
    </main>
  );
}
