import { encode } from '@/lib/utils';
import { useWallet } from '@coin98t/wallet-adapter-react';

import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Transaction as TransactionSolana,
  Connection,
} from '@solana/web3.js';
import { useEffect, useState } from 'react';
import CustomButton from './ui/custom-button';
import ResultTxt from './ui/resultTxt';

const ContentSolana = () => {
  //Constant
  const connection = new Connection(
    'https://rough-white-cloud.solana-mainnet.discover.quiknode.pro/917d316c92433f9d91a7c0c16299df93e2883054/',
  );
  const lamports = 0.001;
  let recipientAddress = 'E619HMmBYhwJiHweBUFHbso23s84WcFUUEaYqG2XUZzF';

  // Hook
  const { signMessage, sendTransaction, signTransaction, publicKey } = useWallet();
  const [resultMessage, setResultMessage] = useState('');
  const [resultSend, setResultSend] = useState('');
  const [resultSendTrans, setResultSendTrans] = useState('');
  const [resultSignTrans, setResultSignTrans] = useState('');

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

      const transaction = new TransactionSolana({
        feePayer: publicKey,
        recentBlockhash: hash.blockhash,
      }).add(
        new TransactionInstruction({
          data: Buffer.from('Hello, from the Coin98 Wallet Adapter example app!'),
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        }),
      );

      const resSig = await signTransaction?.(transaction);
      console.log('verifySignatures', resSig?.verifySignatures());
      setResultSignTrans(encode(transaction.signature as any));
    } catch (error) {
      console.log('error sigTransaction', error);
    }
  };

  const handleSendToken = async () => {
    try {
      if (!publicKey) throw new Error();

      let lamportsI = LAMPORTS_PER_SOL * lamports;

      let hash = await connection.getRecentBlockhash();

      const transaction = new TransactionSolana({
        feePayer: publicKey,
        recentBlockhash: hash.blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipientAddress),
          lamports: lamportsI,
        }),
      );

      const resSend = await sendTransaction(transaction, connection);
      setResultSend(resSend.data as any);
    } catch (error) {
      console.log('error sendToken', error);
    }
  };

  const handleSendTransaction = async () => {
    try {
      let hash = await connection.getRecentBlockhash();

      const transaction = new TransactionSolana({
        feePayer: publicKey,
        recentBlockhash: hash.blockhash,
      }).add(
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
    <div className="grid grid-cols-2 gap-6">
      <div>
        <CustomButton onClick={() => handleSignMessage()} title="Sign Message" />
        <ResultTxt txt={resultMessage} />
      </div>

      <div>
        <CustomButton onClick={() => handleSendToken()} title="Send Token" className="mt-2" />
        <ResultTxt txt={resultSend} />
      </div>

      <div>
        <CustomButton onClick={() => handleSendTransaction()} title="Send Transaction" className="mt-2" />
        <ResultTxt txt={resultSendTrans} />
      </div>

      <div>
        <CustomButton onClick={() => handleSignTransaction()} title="Sign Transaction" className="mt-2" />
        <ResultTxt txt={resultSignTrans} />
      </div>
    </div>
  );
};

export default ContentSolana;
