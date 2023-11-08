import { useWallet } from '@coin98t/wallet-adapter-react';
import { useState } from 'react';
import CustomButton from './ui/custom-button';
import ResultTxt from './ui/resultTxt';
import { BigNumberInBase, DEFAULT_STD_FEE } from '@injectivelabs/utils';
import { MsgSend } from '@injectivelabs/sdk-ts';
import { TransactionCosmos } from '@coin98t/wallet-adapter-base';
import CardMethod from '@/components/ui/card-method';

const ContentInjectiveTestnet = () => {
  const { address, signMessage, sendTransaction } = useWallet();
  const [resultMessage, setResultMessage] = useState('');
  const [resultSendTrans, setResultSendTrans] = useState('');

  const denom = 'inj';

  const recipientAddress: string = 'inj1zvnwg0r450s474xvp3gh7ujvpwjsjj6ctz6qya';

  const handleSignMessage = async () => {
    try {
      const res = await signMessage('hello');
      setResultMessage(Buffer.from(res.data as any).toString('hex'));
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendTransaction = async () => {
    try {
      if (sendTransaction) {
        /** Preparing the transaction */
        const amount = {
          amount: new BigNumberInBase(0.01).toWei().toFixed(),
          denom,
        };
        const msg = MsgSend.fromJSON({
          amount,
          srcInjectiveAddress: address || '',
          dstInjectiveAddress: recipientAddress,
        });

        const transaction: TransactionCosmos = {
          rpcUrl: '',
          instructions: [{ contractAddress: '', msg }],
          memo: '',
          fee: DEFAULT_STD_FEE,
          denom: denom,
        };

        const res = await sendTransaction(transaction as any);
        setResultSendTrans((res as any).data as string);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
      <CardMethod title="Sign Message">
        <CustomButton title="Sign" onClick={() => handleSignMessage()} className="mt-6" />
        {resultMessage && <ResultTxt txt={resultMessage} />}
      </CardMethod>

      <CardMethod title="Send Transaction">
        <CustomButton title="Send" onClick={() => handleSendTransaction()} className="mt-6" />
        {resultSendTrans && <ResultTxt txt={resultSendTrans} />}
      </CardMethod>
    </div>
  );
};

export default ContentInjectiveTestnet;
