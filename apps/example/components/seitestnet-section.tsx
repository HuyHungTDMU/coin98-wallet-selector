import { useWallet } from '@coin98t/wallet-adapter-react';
import { useEffect, useState } from 'react';

import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { calculateFee, MsgSendEncodeObject } from '@cosmjs/stargate';
import { AdapterCosmos, TransactionCosmos } from '@coin98t/wallet-adapter-base';
import CustomButton from './ui/custom-button';
import ResultTxt from './ui/resultTxt';

const ContentSeiTest = () => {
  console.log('zoo cosmos testnet');
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
    <div className="grid grid-cols-2 gap-6">
      <div>
        <CustomButton title="Sign Message" onClick={() => handleSignMessage()} />
        <ResultTxt txt={resultMessage} />
      </div>

      <div>
        <CustomButton title="Send Token" onClick={() => handleSendToken()} className="mt-2" />
        <ResultTxt txt={resultSendToken} />
      </div>

      <div>
        <CustomButton title="Send Transaction" onClick={() => handleSendTransaction()} className="mt-2" />
        <ResultTxt txt={resultSendTrans} />
      </div>
    </div>
  );
};

export default ContentSeiTest;
