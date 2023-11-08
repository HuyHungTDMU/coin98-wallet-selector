import {
  BaseMessageSignerWalletAdapterCosmos,
  EventEmitter,
  OfflineSigner,
  StdFee,
  TransactionCosmos,
  TypeConnectError,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletName,
  WalletNotConnectedError,
  WalletReturnType,
  WalletSendTransactionError,
  WalletSignMessageError,
} from '@coin98t/wallet-adapter-base';
import {
  scopePollingDetectionStrategy,
  WalletAccountError,
  WalletDisconnectionError,
  WalletNotReadyError,
  WalletReadyState,
  BroadcastMode,
  Key,
  StdSignature,
} from '@coin98t/wallet-adapter-base';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { toAscii, toUtf8 } from '@cosmjs/encoding';
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import { calculateFee } from '@cosmjs/stargate';
import { finExtensionInfo } from './registry';

interface FinWalletEvents {
  connect(...args: unknown[]): unknown;
  disconnect(...args: unknown[]): unknown;
  accountsChanged(...args: unknown[]): unknown;
  networkChanged(data: IntegrationEvent): unknown;
}

interface IntegrationEvent {
  id: string | number;
  name: string;
  data: any;
  origin?: string[];
}

interface FinWallet extends EventEmitter<FinWalletEvents> {
  enable(chainIds: string | string[]): Promise<void>;
  disable(chainIds?: string | string[]): Promise<void>;
  getKey(chainId: string): Promise<Key>;
  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature>;
  verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature,
  ): Promise<boolean>;
  getOfflineSigner(chainId: string): OfflineSigner | null;
  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array>;
}

interface FinWindow extends Window {
  fin?: FinWallet;
}

declare const window: FinWindow;

export interface FinWalletAdapterConfig {}

export const FinWalletName = 'Fin' as WalletName<'Fin'>;

export class FinWalletAdapterCosmos extends BaseMessageSignerWalletAdapterCosmos {
  id = 'fin_cosmos';
  chain = 'cosmos';
  name = FinWalletName;
  url = 'https://finwallet.com/download';
  icon =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcng9IjEyIiBmaWxsPSJ1cmwoI3BhdHRlcm4wKSIvPgo8ZGVmcz4KPHBhdHRlcm4gaWQ9InBhdHRlcm4wIiBwYXR0ZXJuQ29udGVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgd2lkdGg9IjEiIGhlaWdodD0iMSI+Cjx1c2UgeGxpbms6aHJlZj0iI2ltYWdlMF8zNDlfMTAwNyIgdHJhbnNmb3JtPSJzY2FsZSgwLjAwNDE2NjY3KSIvPgo8L3BhdHRlcm4+CjxpbWFnZSBpZD0iaW1hZ2UwXzM0OV8xMDA3IiB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFQQUFBQUR3Q0FJQUFBQ3hOMzdGQUFBS29tbERRMUJKUTBNZ1VISnZabWxzWlFBQVNJbVZsZ2RVVTlrV2hzKzk2U0doQlpCTzZFMlFUZ0FwSWJUUWU3TVJrZ0NoaEJBU0ZGUnNESTdnV0JBUkFYVkVSMEVVSEFzZ1kwRkVzVEFJMk91QWlJQTZEaFpFUWVYZHdDSTQ4OVo3YjcyZGRYSyt1KzgrKyt4OTFybHIvUUNROFN5QklCMldCeUNETHhLRyszcFNZK1BpcWJnaGdFRitzc2dnc2RqWkFucG9hQ0JBYkhiK3UzMjhDeURKZk10Q2t1dmYzLzlYVStCd3M5a0FRS0VJSjNLeTJSa0luMExHYzdaQUtBSUFWWTc0OVplTEJCSStpN0NTRUNrUTRXNEpKOC93Y3drbnp2Q242WmpJY0FZQWFCSUFlQktMSlV3R2dLU0srS2s1N0dRa0Q0bUdzQldmdytNam5JS3dXMFpHSmdmaEdvUk5rQmdCd3BMOHRNVHY4aVQvTFdlaU5DZUxsU3psbVY2bURlL0Z5eGFrczNML3orUDQzNWFSTHA3ZHd3aElHaEQ2aFV0bTVNenVwMlVHU0ptZkdCd3l5enpPZFB3MHA0ajlvbWFabmMySW4yVU95eXRBdWpZOU9IQ1drM2crVEdrZUVUTnlscm5aM2hHekxNd01sKzZWSkdUUVo1a2xuTnRYbkJZbDlhZHdtZEw4ZVNtUk1iT2N3NHNPbnVYc3RJaUF1UmlHMUM4VWgwdnI1L0o5UGVmMjlaSDJucEg5WGI4OHBuU3RLQ1hTVDlvN2E2NStMcDgrbHpNN1Zsb2JoK3ZsUFJjVEpZMFhpRHlsZXduU1E2WHgzSFJmcVQ4N0owSzZWb1JjeUxtMW9kSXpUR1g1aDg0eUNBSTJ3QkdFQVNvSUZYRlhpQ1FOTURJRnVVSmVjb3FJU2tlK0xDNlZ5V2RienFmYVdObllBaUQ1VG1ldXdmdjcwOThmcElLZjg2MUxBc0JaY2oveTUzekJPUUEwbWdBZzkzTE9aelNCUEo4QW9PMHlXeXpNbWZHaEpYOFlRQVJ5UUFtb0FXMmdEMHlBQlZLZEEzQUJIc0FiK0lNUUVBbml3RkxBQmlrZ0F3akJjckFLckFPRm9CaHNBenRCQmRnSERvQWFjQXljQUUzZ0xMZ0lyb0Fib0J2Y0FZOUFIeGdFcjhBbytBZ21JUWpDUVdTSUFxbEJPcEFoWkE3WlFEVElEZktHQXFGd0tBNUtnSkloUGlTR1ZrRWJvR0tvQktxQTlrTzEwSy9RR2VnaWRBM3FnUjVBL2RBSTlBNmFnRkV3Q1ZhQ3RXQWplQUZNZytsd0FCd0pMNEdUNFN3NER5NkF0OERsY0RWOEZHNkVMOEkzNER0d0gvd0tIa01CbEF4S0JhV0xza0RSVUF4VUNDb2VsWVFTb3ZKUlJhZ3lWRFdxSHRXQzZrRGRRdldoWHFNK283Rm9DcHFLdGtDN29QM1FVV2cyT2d1ZGo5Nk1ya0RYb0J2UjdlaGI2SDcwS1BvYmhvelJ4SmhqbkRGTVRDd21HYk1jVTRncHd4ekNuTVpjeHR6QkRHSStZckZZRmF3eDFoSHJoNDNEcG1KWFlqZGo5MkFic0szWUh1d0FkZ3lIdzZuaHpIR3V1QkFjQ3lmQ0ZlSjI0NDdpTHVCNmNZTzRUM2dadkE3ZUJ1K0RqOGZ6OGV2eFpmZ2orUFA0WHZ3UWZwSWdUekFrT0JOQ0NCeENMbUVyNFNDaGhYQ1RNRWlZSkNvUWpZbXV4RWhpS25FZHNaeFlUN3hNZkV4OEx5TWpveWZqSkJNbXc1TlpLMU11YzF6bXFreS96R2VTSXNtTXhDQXRKb2xKVzBpSFNhMmtCNlQzWkRMWmlPeEJqaWVMeUZ2SXRlUkw1S2ZrVDdJVVdVdFpwaXhIZG8xc3BXeWpiSy9zR3ptQ25LRWNYVzZwWEo1Y21keEp1WnR5citVSjhrYnlESG1XZkw1OHBmd1orWHZ5WXdvVUJXdUZFSVVNaGMwS1J4U3VLUXdyNGhTTkZMMFZPWW9GaWdjVUx5a09VRkFVZlFxRHdxWnNvQnlrWEtZTUttR1ZqSldZU3FsS3hVckhsTHFVUnBVVmxlMlVvNVZYS0ZjcW4xUHVVMEdwR0trd1ZkSlZ0cXFjVUxtck1qRlBheDU5SG5mZXBubjE4M3JuamF0cXFIcW9jbFdMVkJ0VTc2aE9xRkhWdk5YUzFMYXJOYWs5VVVlcm02bUhxUzlYMzZ0K1dmMjFocEtHaXdaYm8wampoTVpEVFZqVFRETmNjNlhtQWMxT3pURXRiUzFmTFlIV2JxMUxXcSsxVmJROXRGTzFTN1hQYTQvb1VIVGNkSGc2cFRvWGRGNVNsYWwwYWpxMW5OcE9IZFhWMVBYVEZldnUxKzNTbmRRejFvdlNXNi9Yb1BkRW42aFAwMC9TTDlWdjB4ODEwREVJTWxobFVHZncwSkJnU0ROTU1keGwyR0U0Ym1Sc0ZHTzAwYWpKYU5oWTFaaHBuR2RjWi96WWhHemlicEpsVW0xeTJ4UnJTak5OTTkxajJtMEdtOW1icFpoVm10MDBoODBkekhubWU4eDc1bVBtTzgzbno2K2VmOCtDWkVHM3lMR29zK2kzVkxFTXRGeHYyV1Q1Wm9IQmd2Z0YyeGQwTFBobVpXK1ZiblhRNnBHMW9yVy85WHJyRnV0M05tWTJiSnRLbTl1MlpGc2YyelcyemJadjdjenR1SFo3N2U3YlUreUQ3RGZhdDlsL2RYQjBFRHJVTzR3NEdqZ21PRlk1M3FNcDBVSnBtMmxYblRCT25rNXJuTTQ2ZlhaMmNCWTVuM0QreThYQ0pjM2xpTXZ3UXVPRjNJVUhGdzY0NnJteVhQZTc5cmxSM1JMY2ZuYnJjOWQxWjdsWHV6L3owUGZnZUJ6eUdLS2IwbFBwUitsdlBLMDhoWjZuUGNjWnpvelZqRll2bEpldlY1RlhsN2VpZDVSM2hmZFRIejJmWko4Nm4xRmZlOStWdnExK0dMOEF2KzErOTVoYVREYXpsam5xNytpLzJyODlnQlFRRVZBUjhDelFMRkFZMkJJRUIva0g3UWg2SEd3WXpBOXVDZ0VoekpBZElVOUNqVU96UW44THc0YUZobFdHdlFpM0RsOFYzaEZCaVZnV2NTVGlZNlJuNU5iSVIxRW1VZUtvdG1pNTZNWFJ0ZEhqTVY0eEpURjlzUXRpVjhmZWlGT1A0OFUxeCtQaW8rTVB4WTh0OGw2MGM5SGdZdnZGaFl2dkxqRmVzbUxKdGFYcVM5T1hubHNtdDR5MTdHUUNKaUVtNFVqQ0YxWUlxNW8xbHNoTXJFb2NaVFBZdTlpdk9CNmNVczRJMTVWYndoMUtjazBxU1JwT2RrM2VrVHlTNHA1U2x2S2F4K0JWOE42bStxWHVTeDFQQzBrN25EYVZIcFBla0lIUFNNZzR3MWZrcC9IYk03VXpWMlQyQ013RmhZSytMT2VzblZtandnRGhvV3dvZTBsMnMwZ0pFVVNkWWhQeEQrTCtITGVjeXB4UHk2T1huMXloc0lLL29qUFhMSGRUN2xDZVQ5NHZLOUVyMlN2YlZ1bXVXcmVxZnpWOTlmNThLRDh4djIyTi9wcUNOWU5yZmRmV3JDT3VTMXYzKzNxcjlTWHJQMnlJMmRCU29GV3d0bURnQjk4ZjZncGxDNFdGOXphNmJOejNJL3BIM285ZG0ydzM3ZDcwclloVGRMM1lxcmlzK010bTl1YnJQMW4vVlA3VDFKYWtMVjFiSGJidTNZYmR4dDkyZDd2Nzlwb1NoWks4a29FZFFUc2FTNm1sUmFVZmRpN2JlYTNNcm16Zkx1SXU4YTYrOHNEeTV0MEd1N2Z0L2xLUlVuR24wck95b1VxemFsUFYrQjdPbnQ2OUhudnI5Mm50Szk0MzhUUHY1L3Y3ZmZjM1ZodFZseDNBSHNnNThPSmc5TUdPWDJpLzFCNVNQMVI4Nk90aC91RyttdkNhOWxySDJ0b2pta2UyMXNGMTRycVJvNHVQZGgvek90WmNiMUcvdjBHbG9mZzRPQzQrL3ZMWGhGL3ZuZ2c0MFhhU2RyTCtsT0dwcXRPVTAwV05VR051NDJoVFNsTmZjMXh6enhuL00yMHRMaTJuZjdQODdmQlozYk9WNTVUUGJUMVBQRjl3ZnVwQzNvV3hWa0hyNjR2SkZ3ZmFsclU5dWhSNzZYWjdXSHZYNVlETFY2LzRYTG5VUWUrNGNOWDE2dGxyenRmT1hLZGRiN3JoY0tPeDA3N3o5Ty8ydjUvdWN1aHF2T2w0czduYnFidWxaMkhQK1Y3MzNvdTN2RzVkdWMyOGZlTk84SjJldTFGMzc5OWJmSy92UHVmKzhJUDBCMjhmNWp5Y2ZMVDJNZVp4MFJQNUoyVlBOWjlXLzJINlIwT2ZROSs1ZnEvK3ptY1J6eDROc0FkZVBjOSsvbVd3NEFYNVJkbVF6bER0c00zdzJSR2ZrZTZYaTE0T3ZoSzhtbnhkK0tmQ24xVnZUTjZjK3N2anI4N1IyTkhCdDhLM1UrODJ2MWQ3Zi9pRDNZZTJzZEN4cHg4elBrNk9GMzFTKzFUem1mYTVZeUptWW1oeStSZmNsL0t2cGw5YnZnVjhlenlWTVRVbFlBbFowMUlBaFF3NENkRVM3dzREUUk0RGdJTG9ZdUtpR1IwOWJkQ005cDhtOEo5NFJtdFBtd01BRFdzQmtNaEZSaXNBZFJJTmdqekxJaHpxQVVDa0I0QnRiYVZqVnZOTzYzT0phU0xheVZnVlVRN1FVdzZoRVB6RFpyVDdkM1gvY3diU3JIK2Ivd1d6Q3dEbjAyeUZjUUFBQURobFdFbG1UVTBBS2dBQUFBZ0FBWWRwQUFRQUFBQUJBQUFBR2dBQUFBQUFBcUFDQUFRQUFBQUJBQUFBOEtBREFBUUFBQUFCQUFBQThBQUFBQUQySUFqeEFBQVdZa2xFUVZSNEFlMmRRV3dWeHhuSEU4QzROalpRbXhBYkV4SWhtU0pGNmlGUnI2R25Ya0JLYjAyVjVCYlU1bEtwU08yUlNPa3RrVWh2UWFLM3BFcHlTeVI4ckJTNGh4c1NpYVdJRW9NZHdKYXhEWlp0blBiM1BNbG0yZmZldnQyWmZUdmZ6SDZXOVRSdmQyZDI1di85OW52ZnpNN09QdjJiMld0UDZaOHFFSXNDdTJKcGlMWkRGV2dwb0VBckIxRXBvRUJIWlU1dGpBS3RERVNsZ0FJZGxUbTFNUXEwTWhDVkFncDBWT2JVeGlqUXlrQlVDaWpRVVpsVEc2TkFLd05SS2FCQVIyVk9iWXdDclF4RXBZQUNIWlU1dFRFS3RESVFsUUlLZEZUbTFNWW8wTXBBVkFvbzBGR1pVeHVqUUNzRFVTbWdRRWRsVG0yTUFxME1SS1dBQWgyVk9iVXhDclF5RUpVQ0NuUlU1dFRHS05ES1FGUUtLTkJSbVZNYm8wQXJBMUVwb0VCSFpVNXRqQUt0REVTbGdBSWRsVG0xTVFxME1oQ1ZBZ3AwVk9iVXhpalF5a0JVQ2lqUVVabFRHNk5BS3dOUkthQkFSMlZPYll3Q3JReEVwWUFDSFpVNXRURUt0RElRbFFJS2RGVG0xTWJzVVFrY0ZSamR0WHR5WU8rUlBYc25XcCtESTd0M1QrN1p5MFlTbE16MlRQbXJQMnp6djdiZCt1Ui9ZV3Z6enVPTm5jL05iemJXTXdmcjE3SUtLTkJsRlhzS1dGOGVHZ0hmbDRaR1R3d090U09iWHlMWitYK3FpL0F3ZmVmeDV1ekdvMnZyYTZRaFByODAzWnRSNEdsOWsyeEdrWTVmUWZEVXZnTW5Cb2RmR1RsUWx1Q09CUmJjQ05Pem0rdFgxcFlONkFWek5ma3dCVHJQK25oaTNQQkxReU1rOG82clpkOVg2MnRYSGk0YnoxM0xDWU04aVFMZHdXejQ0TlA3eDAvdkg2dlRHWGVvUjVkTjg0ODNyNnc5K0hUNUxzRkpsME9hdTFtQi90bjJ4QlZBZkdyZlFRbisrT2RxZFUvaHMyZFdGaSt2TG5VL3BIRjdGT2lXeVJtWE9MTi8vTFdEejdTNmE2SDk0YkNKUXk0dHpxdkR4blJOQnhwbi9OYllaQ2d1T2Y5YW0xbGRVcXliQzNSTUtLZEJiempXVFFTYUFPUDhzOC9INFpYVEtLZlRqY1c2V1VBVElwOGRteVJXVHRzKzRuUURzVzRRMEs4ZFBIeDJiQ0xFYnAvTEpVZVhrY0M2T1NNaGpRQzZDVEZHUHZSZy9mYmNiQk9HUWVLZmJZZGovdUtGRitPT21QTnBaaStYOU9jdnZFaTQxZlBJMEErSTJVT3JZMjZuTTNwWEhhMkh4akYvZk94a3d4MXpPOUJjNUI4ZE94bHh0emhPb0psT2RPN1FWTlA2ZiszNGR0eUNMT2NPSFowZUhPcTROL1NOY1FMTnJlQlhiMTV2UWgvSWdqOW1nTHp4M1kzWlNCOG1pRG1HeHRpblI4Zk9qay9LbkRSbndhSmpGaDRYdUxRMC8rbnlQY2R5SkdlUEhHZ2p2V0lOeWt3M0JlWG9INEZwQk5BSjFreXBhMW8zMFV3eHZmTHdRZlFvR3lzM0NHalRZTHI1cDBZT25Ca2Q1M0ZBc3lYS1R6aSt0cjQ2czdMVXRJNUU0NEJPOElYc1h3ME9NUjR5UFRnTTNLRVBpZUNBV3c4Z2Jqemlzem4rT0xGbWttZ3UwSWtFSmdIUXJFWmdzSWIxOUY0V0pHQTcveE1EZ3laUmczY0hVUDdudHphNUZiSzIvZGg4WmZHRGRNWFdmanJHN0UzdmFteTZ5OVAwemRPanhVU1prU3pJQm10R2N4bENjZmZ4bkQzeHI5OXNyZ051MDBLRnFvaFREMTJWa2svQk4zQ3p6c0dKdmEwWXBtZTVJSHQxWjMwQ1JzMFYzNTV5RlR4QWdTNG9WTG5EQ0ZwYWl4OE1qL0RJTGI0OHlZd25Kc0M5OW1pMXlXRnVva1kvRWdwMFAxUjlva3dHQ29FYnJJR1l3WWNuOXVtWHFoVUlER2greWsvc0hXck9kUFdxelYydVBDN0ZsUisydzdwSkhsS25rTi94OXllUG15RUlaYm9jbStXUFpxaisvTFBIZ3B0dUd0TGtwSXRIcHczTlBPTGFoTG5xNVNHc0xBZnlRalBGSWZoN2s4ZlQzWURLenRHZmdvSUJtaG1QaG1hakEwOEhzaVVnb2Z0anZ1cExSVktFUmQ2a2FNSzhnTnhIR0VDZkdSMXJuNVBPRnFidzYweTZoRHozQkM3ajR0UjBSNm5iTjdxZnJoOGxCQUEwS3YvMW1hTWRHOCt1aGp3cTE3SDUxVzdFRGVNZ3VrMzhaMjhRdmlPQVVRNGVjVTBIR3gydFNOL2x3cjA1eHNVNjd0V04rUW93bWxIa0dSYkdITisrUFp0ZmxQZTl1NmYrOGlmdmxjaXBBSTZCbGNaekRqQzdpUHgrTi9yTEl3T0RqREZ4ODZMbjhYcUFVUUNVVFE5N2ZNOUFUMDJPRExTbXVIQmZzK2VSSGc4UTdhRnh6TGpuc3VwOCtmREJaOHQzOVJaR3ZtNmdiTGRLNWV1eUg5OFNEZlRIejUwc01pbWlvK1VJUWxneFNLZEpaTVRocDR6bjRYZGVyOUY3dGtrbXIva3FQUENRZTJPRmtRMXJtcEVlNzg2UEtRa013RlIzeUc2eXo4WWZWL1Z1RFlwaXhFUHNnNGxDUFRRNEpyZFJPdm9KdTQwd1RaRE5hOVJNcUIzbExFM0dJcGpBemFkNXpSelRTSko1M25haXRlZWlsL0w3bTlkbDlsV0VlbWdlMWU0NXN0RXVkTTh0ZUJmK2V4NldQc0JNN0dTaVBSc0pZK2EzZnJ3WW1MN2NQNHNTR0VBaHMxYjRuQndZSE5uVkFyVGJpdy9UdGEwblRmWG9yRis0UDFmUDZVcWRSU0xRb0V5OFVhb1ovVHZZREw2YXo4eFpZQnJjaVdmdzkrN3hERmNhWThDOE9RNmYydkYwbWJQNy9ib1RkVWg4YTVIRWtJUFlWdzdReGJtQmFWNjdkblh0UWZIWitvRExBd0hNbWFhM2dOc3JmaTRKUjlKZWdjUFM0b0RHUFZzTTFVa3djRklISXBQODE2NkJMeENMZlcxYzBwQ2VpVC9mbnBVMkxDME82RURkYzBmYkU1T3d2RXN5ZElnUER1dTFjUjBibGQ0bzBFbkxBam9DOTV5MmQ1TEc4UFFnaVpLRGl5dVNKblJMU0hQU3NpWW5NYmpSVGJpZ3Q0UHliL2NkaUk5bWpNSndoeWpUQ0FKYTFPQ0dLQ05Kcm95MG54MUJRTWZxbmlYaldFbmRSRTJWRmdRMDEzb2wrbW9oTlN2QTVCQTUwWlFVb0JsNEp1U28yUko2dWtvVU1LTTNsUlRsWG9nVW9FL3ZIM2R2akpiZ1N3R0cxWDJkT25OZUVVRGptelhleUJnbXJLK1lUOGp0ZWhGQXMyQnpXUGJUMnJZcndEMmo5bzMxYnhFQk5HdWExTjl5UFdPMUN2QjJoR29MdEN2TlA5REVHeTRUK2UyYXJia3FWd0E3ZG50aXZQSno1UlRvSDJpTk4zTE1FOVl1N29aNnI3QUFvTVYwa0wwYkkvUUs4SlNYOXlaNEJwb2hUQjNmOEE1QlZSWEFsTjd2c0hnR0dpbUxUNGV2U25jdHAwOEtNQkc4NlVBenFmTHR1VmxsdWsrRTFWa3NORXN3cFg4UExVU0lPbTBmMzdua0dORS8wRmpYeU1IekhmRlp1Z2t0d25BU2ZMT1JXZ1RRUHpKOWU1WlZ2SnBBUUV4dE5FOWh5UWthcFFDTmpZbW4vejcvN2FXbCtaanNIWGRiZUdLU0I3Lzd0ejZKaFhyaTF1VzR0TFJ3WjJ1VHlmNUNKcnRZYU5xRUxFRDh3YjA1Z1crNkVlU2hFdzVtVnBlSXlmZ3RTN1pvUXBRQ21PYk5XemNFMG94S3NwNzZ6cGp0OU9pWXV1cU1KbjYvNHBpSkNjV3UxQ2dkYU9ySGxKY3orOGVrUFZyc2x5b3Zad2RsSW1aUUZoVXh0MHNoMmtNbjFRWHJzK01UVEJYUXdEclJwTFpFS0NnYlFjSUEydFNWMjZxdjdEdnd4NE9IZGJwcFBUUVRLN05hMzh6S2tuQ3ZuRllqSktDVGV1T3dtWFRLYzJ3NnNTblJwTUlFSEllN1JIeVFRQ2ZHTTVQMVdIOTJlbkNZdEhydVJKbFNDVzZMY0xkdllXdkR2T2NnSUgvYzNzeXdnVzV2RDBFMmk0U3pIYjVaSjd6OWdGSmJXR09jY2xoeW5OOEVyaGJTcGJKWGRUQ0VzZUw2TjV2ckxMZHVsbDUzTDVucEJoUWIzenNNeE4xWWNUUVZ6cVovdDJGaGVucnYwS21SVnFqVGI3aWhEYTlaZHNGcFIvVWl5QjZiaDY3TkpJeVI4MWhvUDRKNFF0aVpsVVZlSWhyMFQzOXRoc2ljU0lIT0NGTHVxeGxQck9xcDlablZ4VStXNyttc3czSTJlUEpvQmZwSlBheSt1V01OeXBjV0Yvb1hMRmsxSzhoTUNuUmxaaVBDZm0veWVObGJQM1RPM3YzK3Y0UVpsZFdqMlFWSm5Kd1VxRVVJRlhoN1g2bnByOXhNZnVQV0RhVzVRb3Q3QTdxcXVMTkNMU29waXVtdmY1di90bWQvamdNNDdNTDkyejJQcktSV05SZmk4U1ZtM29BK01maUxXS2NjTVVDQjM4MEppQWt6bUg3SllUVnpWcy9wemgwNit2S3d0NlcrdlFITjAxWm54eVlzZ3M1NnJPSjRGdk9VWkVlbWMzWTVudFI3ZHNibVA1eWFaa0gvTDllOFhhdmVnRFp2MjJieHFBK1BUa3RZRTYxeUdqcUMyM0ZqNWFmMlVpQkQ4aDhmTzhrblFaVEhIeDl2UUxlYXZiYU05SXg1L2Z1NWsxR0dId2JmeTZ1TGhqQTZmM0tlanE0UWVod3pZUWErR1ZOUzdOV0hMYlA2K3ZNNWJNZWtvb3RUMDBuTE1mK2x4WG1aRC9Za2xkUkVSZ0ZjTXU5S05TaWJYWFIyUFhwb24wRFQvdjhjLzNWbVVvUmluU0ZHN0ZkUWZtdHNrczkwRFRIZnF6ZXZwN2ZVblBZOE9ZbUIyRXl3d2JYT0ZjK2poSGpyNUtYQ05ZdWlwOHRSQUFmRVl2Mk11bmFjck10RTZweThOZXp5N0tGUkJ5ZWQwMDRHUTY2dUxTdlpPUkxWczh0d3pFTVYrZE5vdWJYVWNXeW5ua3B5RnM4ZW1xNGhmYWFjbXl3TWc1aGx0UGt0KzNwamZYYmprUmtlWVZxd1grRnFzNUNYRTNFRG43bmdmRTRNTUJGOG1ONU9rVnY2ekVqeGJoVFBRR090eXl0TE9VQW41aVFVNGIvT05lSzUyTXhsSStFbndqaEl3eFpwL2hObDVDU1lYK1c5TXY2QkpweklkOUsrTkdweE16akVMNnk1aWhoMCs5ZlNmUDN6TGpyMnZYeHBrbk5lQ2U2WjZubU9vWTFBdU40dlhuZ3hSeXc1dTRqcC8zbHZycDRmVnRNL3pnd2p5SkVpVXhQdjBiT3BqN2NiSzJrNVdrTjFnYXpSaUxmKzZOakpHbDdYVGhobWJyeWxoUktiWnJTcW5vdThwd0lpZ0thVzhwZmtTYVFrRk9IR1dHYTBNZGxiU1lMQ3p6OTdUR2FnM041QS9KR2N4Y0drQUUwUGpIbnU3V0tKM2NMTXFqNHhUYkVVTHJiaDdSWGpqb0VROTB6ZHBBQk5WYmhmV24rWHE5MDh4YmYwZytuZ2FLWXZLR3EyZ2lDZ0lRa25qYXN1anBUM0k2dGxPamlhVzUwZkFVTjFhUXhrQVkxQVRHMUoxMDkrdWlxbWc2TVowNGdLTmd3cXNvQ21UZ3hMMDJXV3ozRzZodTVNQjBuemtzU3BrZUtBQmhTZXRBc3JtS2JPTGt5SFNETUc0dW5KOUZVdEpDMFJhS1RoN1VGeU9zNEZUV1hIZElnMEV4bitRK3FRbEZDZzZScUcrSEJIV2FZRHBWbXlhWVFDalZQRURTQmNXSU1lVkxzNDAwcHp3WisrVW9mSkJkb3cvV2RocjhFckltNFJwa09rR2VmQ0dKVHdVRkEwME5ERDdPZjhOUzZLRUZiL01mbE1oMGh6NndmejlxejhoU1JGekxickNSenp6bGp0b01nYzg1NUYxWGtBNXYvZy9seDZ4Q2FVdWFBWmxVejRKOXczbXpxSEFUUjFoZW4zSjQ5M2ZJNHRvNzYwci94U1F6WXpqWGkxUUNqempkSWFVdm1BQnAyQ0FkcElmTzdRMUdzSEQ2ZmwxblJmRmVBbUYrUE5BWFhOL1QreFVzb2UzSFBoaDQvWm02Vnk2Y0VXQ2dDeDhKZkdkbXhVWUI3YXRDSFFrTHFqQVdSdURDdk1TR3NvZlpRalhkY2tUUitsN0VyTVNWNU41Q3RnSFBNYjMrV3RucHBmZ3QrOVFYcm9SREpjOWJsbnBsZ3NJdG1pQ1JjRkdKRGhubllRb3huZG1oazIwS1pWdkpDS2xaYUNHOVRyWmhJdjIvblJpK1BOR0RFQXJWaTdYQU9nSE5NYW1mRUFuV0RkcDljSHVrQWpNeThCaHBlVlJ2cXFSbXhBRzdHSXJjK09UN3cwTktweFNEczlkUHZNaXozVHR6RGJEd3QwUzV4QUo4YmdWak5MWlNyWkNCSTN4NG5GSXdjNmFTZjN6Rmx4RUxKSk5NZHRBekZ1bUNWdWViQ05vZVZFallnVFRRRTZiVUltVklBMUwzYUI3SW1Cd1dTV1JZZ1RMVXk3QUpmL3RlMXRSdHdXdGpaMlBqY2hPT2dCdUxUSmlxZWJDSFJ4ZFhLT2JGMFNlNGRPalJ5c2RrRlVIQ29CcnE2SG5hTjgvaTRGT2wrZjNudUpaSGpsZ0hzWUU4MUljRy9KK25sRWtMZSsreWxJNmJMeHB1N1AyRUV6aFVRNTdGQmFVTGNNQ3JTYmZqdTVEWTVFc1habGtkSDlrckE3ZFh5NUZPaHFiQXJUMXV2anlGbUx0aG90dkphaVFGY212L1dLd0RNclM1VlZvdkVGaFFGMEVBTnFSQTRXWTczRXpVRU1yakdxRThURkVnYlFyK3c3OEU0Vkl3bjlOZ2t2NlNwN0Nvc3NaVS9oZUR6ZWhFZUVHTXh4TEtlZTdHRUFQYk82dExyOW1IZEJzQUNBK3dCWi81UzE2QmRhWk9sZi9UTWxnektDZjk1Ni9jMy81S3pSbjZsazVtc3d6eFR5cUNZM3JsbnY0c3orTWQ0RXg5MkhJSDZwTTNLSDhoV1VlUmlaVjhtUW9MOHJjMTNHam1JR0F6U2VqR1Y3ek9vY0Jtc0dnS1d0VDh3c3Y0NHE1Mnc4TWxBNlMwNXA3cnZTS0ZPYTQ0aWtlMzNLbGhBTTBFWmNtTDQ0Tlkzb29NT0RLdndUalZ4ZVdSUnlTMkp5WUxDc0FmYUplWVVtTXhQL2NQQnc1azYrL0xXL01vS0hCRFJWWjJXd0MvZm02Q0FtelRCWTQwZytXYjU3ZGUxQmNISEk2QzdQSnFCUGNuci9PSk5zMnpzbkYrN1BXWXpiSktieGt2Q3Nwa1diY2NuOFROTlpTZWR0UFMxNzZDai9HSUQzMHZxYUxjbmFTT2xhRlVuN0Nqa1lodVBoWXNZdXVyM1lNOFJGT1JBOFBLQ3B0T21qWkpnMjlHQ25jNE90WldqdzJXRDkxYVBXVk9EYTNEYXhrS2xHOGMrUjhsbUtGNTQ1RWgvY21oUStQTXBudXo5T0h3ek5BWFVFMHpVUEVtZ2FrTU8wYVY0U1pQTVZ1TC9lV0dmRWw0Z0Z1UHYzTTJvQnRFV1d0UDN5MDFEYm11YmEraC9HRXhjOGwxbitLNzlrc1h0REJScEJlektkaUE3Yy9LZTdPMkE5djdYSnlNbEM2L014Q1diSG0rUFhkbTc0V1RqMWdyZ2t0VW9TWUdkM3VsUDdEaVNGak96ZVRRV0l5RW0wMmp1d045OEhKeGt6Q1FJMjFsdkxiQXpvYThCQW8zSnhwak1td2RnNTlvWnZGbHJIbldkeTVYKzFDS0R6Qzh6Wmk5LzljR2UwSitjWWkxM1EvTzczdHl3eXlza1N4cDNDSEwxZ3V2SVgzK1BxM2puODgwQkt6dG5UdTZ3OXRNV1ZjUDd3ODlhblM5YzVuVWJHMEdtbU9jRURUUnY2d1RRdU1HM3NJbWxyd2l6NmhSYlhRSDRUd3UwRlp0b1ZBOUEwQ2FZWk5NMjB6ZVVyL2NpeTJhMXZrVmhjQ1FSRlphdVhjenpTbWVBdDU1aFFka1VDTkhJemUrYjE2dGJNWFAycGoxamNrTllqeWhidU51bkNGcTlleHlPNU1IaHpTaWdUanpvMkliTXhIcUJwR04yNHFwNWxxdFlGWmtUUGZMWHcwQlkvSUptVDhwVkMzcngxUThpc2dmYnEyVzJKQ21oakpKYU90bjRhS2hHUnNid2tYVERCWUZuQkl6T0hqZTR1ZlR1R3liU1pRc3ArUmFJUVh5L1dzNWxoRDl0MWE1NTVjd1czRWkyY255bVQ4ZWx1aFhmYmJqRXp5UlJsRVh3eldONnRHajIzOCtOREZ6Q21NQ1BkNU5nOGROSTJET2JpZ2VvTk9VcTdGZXZxY1plVU1DTldtckYrdEVEVE5tSkU2emRYV0JCajBiY3psNTlGYi9KTytSOFF6b1ZqRHZkZEUwYXJucDh4QTIwYXo0RFVxemV2bDcyM2JER01ZQjNlV0l4RDk3UnI1Z0I2ZnFBY3pkaGNwblhwcjZWLzdOS1pRMGtiVjEzcXpSVVd3d2pXUUZ0a1hDZzhUQjUzeE54T1lDT0FOczFtSWpWVFNWa0kvY3pvZUxzUWpsdXNoempNZWN2T1R5b1ljcGg1Y3hiaGs2TWFIclBISDNLa3hjWHZNbDJCQ0lSWk9PbnQ3V25tNHJWdnpObGlNZlNXVTVyN0xtSU0rZytNOWpTS1puUnJGdEFHbENKWWw0MjVMY0tHTkxWbE81UTVFUkVvYy9PUC83Sk5TTmNuM0hTRFFvNk1rUXpXbHhZWEtnbENYSUV1ZjFNRzE1czVLU2pIOXhLZ2pOVjZmbTB1MEVhYU5OYkpxMWh5L0Y4M1FTMXVqblFycXVEMkJHZ1N4TW9za05kTWw1eVJxK2xBR3prTTFxUVpDZUd0Y0JtTmlueTFHRXRPRjFzMjVDQXZBNHRmYmExZGViZ015azBMbE5QU1pkSUs5Qk9DTUJMQ2YrYW4vSWtqdW55eHlKSXV5U0k3VWJKeW5OYlFwSnZZS1d4WEliUEZBaFRIbXlNV2d5UVdsY3cwTThxdkNuUTFacldlbVdST1gzOElYazJ6NVpXaVFJdXd5WkU5cGRjUUUxRnZlWlhRR0xvYW0zeTJmSmYrR1RmOHpJc1BpWWxaVG9DaTI1OHROMk1SZE9tSUdlaU1ybTAvWmt2Wko4eXJxWFNNcFNqUTFWajF5NGNQcWlsSVMzRlRRRU1PTi8wMHR6QUZGR2hoQnRIcXVDbWdRTHZwcDdtRkthQkFDek9JVnNkTkFRWGFUVC9OTFV3QkJWcVlRYlE2YmdvbzBHNzZhVzVoQ2lqUXdneWkxWEZUUUlGMjAwOXpDMU5BZ1JabUVLMk9td0lLdEp0K21sdVlBZ3EwTUlOb2Rkd1VVS0RkOU5QY3doUlFvSVVaUkt2anBvQUM3YWFmNWhhbWdBSXR6Q0JhSFRjRkZHZzMvVFMzTUFVVWFHRUcwZXE0S2FCQXUrbW51WVVwb0VBTE00aFd4MDBCQmRwTlA4MHRUQUVGV3BoQnREcHVDaWpRYnZwcGJtRUtLTkRDREtMVmNWTkFnWGJUVDNNTFUwQ0JGbVlRclk2YkFncTBtMzZhVzVnQ0NyUXdnMmgxM0JSUW9OMzAwOXpDRkZDZ2hSbEVxK09tZ0FMdHBwL21GcWFBQWkzTUlGb2ROd1VVYURmOU5MY3dCUlJvWVFiUjZyZ3BvRUM3NmFlNWhTbWdRQXN6aUZiSFRRRUYyazAvelMxTUFRVmFtRUcwT200S0tOQnUrbWx1WVFyOEgxM1ZWb1NrcFJFd0FBQUFBRWxGVGtTdVFtQ0MiLz4KPC9kZWZzPgo8L3N2Zz4K';

  private _connecting: boolean;
  private _wallet: FinWallet | null;
  private _address: string | null;
  private _chainId: string | null;
  private _offlineSigner: OfflineSigner | null;
  private _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  constructor(config: FinWalletAdapterConfig = {}) {
    super();
    this._connecting = false;
    this._wallet = null;
    this._address = null;
    this._chainId = null;
    this._offlineSigner = null;

    if (this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.fin) {
          this._readyState = WalletReadyState.Installed;
          this.emit('readyStateChange', this._readyState);
          return true;
        }
        return false;
      });
    }
  }

  get address() {
    return this._address;
  }

  get chainId() {
    return this._chainId;
  }

  get connecting() {
    return this._connecting;
  }

  get connected() {
    return !!this._address;
  }

  get readyState() {
    return this._readyState;
  }

  get offlineSigner() {
    return this._offlineSigner;
  }

  get provider() {
    return this._wallet;
  }

  async autoConnect(chainId: string) {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();
      this._connecting = true;

      const wallet = window.fin!;
      let address: string;
      let offlineSigner: OfflineSigner | null;

      try {
        const { bech32Address } = await wallet.getKey(chainId);
        address = bech32Address;
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      try {
        offlineSigner = wallet.getOfflineSigner(chainId);
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      this._wallet = wallet;
      this._address = address;
      this._chainId = chainId;
      this._offlineSigner = offlineSigner;

      wallet.on('accountsChanged', this._onAccountsChange);
      wallet.on('networkChanged', this._onNetworkChange);

      this.emit('changeChainId', chainId);
      this.emit('connect', address);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async connect(
    chainId: string,
    callback?: (error: Error, typeError: TypeConnectError) => Promise<void>,
  ): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();
      this._connecting = true;

      const wallet = window.fin!;
      let address: string;
      let offlineSigner: OfflineSigner | null;

      try {
        /// connect wallet
        await wallet.enable(chainId);
      } catch (error: any) {
        if (this._rejectMatched(error as Error)) {
          throw new WalletConnectionError(error?.message, error);
        }
        // call back add chain
        await callback?.(error as Error, 'network');
        await wallet.enable(chainId);
      }

      try {
        const { bech32Address } = await wallet.getKey(chainId);
        address = bech32Address;
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      try {
        offlineSigner = wallet.getOfflineSigner(chainId);
      } catch (error: any) {
        throw new WalletAccountError(error?.message, error);
      }

      this._wallet = wallet;
      this._address = address!;
      this._chainId = chainId;
      this._offlineSigner = offlineSigner;

      wallet.on('accountsChanged', this._onAccountsChange);
      wallet.on('networkChanged', this._onNetworkChange);

      this.emit('changeChainId', chainId);
      this.emit('connect', address!);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(chainId?: string | string[]): Promise<void> {
    const wallet = this._wallet;
    if (wallet) {
      wallet.off('accountsChanged', this._onAccountsChange);
      wallet.off('networkChanged', this._onNetworkChange);

      this._wallet = null;
      this._address = null;
      this._chainId = null;
      this._offlineSigner = null;

      // try {
      //   await wallet.disable(chainId);
      // } catch (error: any) {
      //   this.emit('error', new WalletDisconnectionError(error?.message, error));
      // }
    }
    this.emit('disconnect');
  }

  async signMessage(message: string | Uint8Array): Promise<WalletReturnType<string, string>> {
    try {
      const wallet = this._wallet;
      const chainId = this._chainId;
      const from = this._address;

      if (!wallet) throw new WalletNotConnectedError();
      try {
        if (typeof message === 'string') {
          message = toAscii(message);
        }
        const { signature } = await wallet.signArbitrary(chainId!, from!, message);
        return { data: signature, error: null, isError: false };
      } catch (error: any) {
        console.log(error);
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.message, isError: true };
    }
  }

  // async sendTransaction(transaction: Uint8Array): Promise<WalletReturnType<string, string>> {
  //   try {
  //     const wallet = this._wallet;
  //     const chainId = this._chainId;
  //     if (!wallet || !chainId) throw new WalletNotConnectedError();

  //     try {
  //       console.log('transaction', transaction);
  //       const res = await wallet.sendTx(chainId, transaction, 'sync' as BroadcastMode);
  //       console.log('res', res);
  //       const hash = Buffer.from(res).toString('hex').toUpperCase();
  //       return { data: hash, error: null, isError: false };
  //     } catch (error: any) {
  //       throw new WalletSendTransactionError(error?.message, error);
  //     }
  //   } catch (error: any) {
  //     console.log('error Transaction', error);
  //     this.emit('error', error);
  //     return { data: null, error: error?.error?.message, isError: true };
  //   }
  // }

  // Send Transaction CosmosJS
  async sendTransaction(transaction: TransactionCosmos): Promise<WalletReturnType<string, string>> {
    try {
      const wallet = this._wallet;
      const offlineSigner = this._offlineSigner;
      let client;
      let usedFee: StdFee | 'auto' | number;

      if (!wallet) throw new WalletNotConnectedError();

      try {
        client = await SigningCosmWasmClient.connectWithSigner(transaction.rpcUrl, offlineSigner as any);
      } catch (error: any) {
        console.log(error);
        throw new WalletSendTransactionError(error?.message, error);
      }

      if (!transaction.fee) {
        const signAndBroadcastMessages = transaction.instructions.map(i => ({
          typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
          value: MsgExecuteContract.fromPartial({
            sender: this._address!,
            contract: i.contractAddress,
            msg: toUtf8(JSON.stringify(i.msg)),
            funds: [...(i.funds || [])],
          }),
        }));

        const gasEstimation = await client.simulate(this._address!, signAndBroadcastMessages, transaction.memo);
        const multiplier = 1.3;
        usedFee = calculateFee(Math.round(gasEstimation * multiplier), '0.0025' + transaction.denom);
      } else {
        usedFee = transaction.fee;
      }

      try {
        const result = await client.executeMultiple(
          this._address!,
          transaction.instructions,
          usedFee,
          transaction.memo || '',
        );

        return { data: result as any, error: null, isError: false };
      } catch (error: any) {
        throw new WalletSendTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      return { data: null, error: error?.message, isError: true };
    }
  }

  private _onAccountsChange = async (data: any) => {
    const wallet = this._wallet;
    const address = this._address;
    if (!wallet) return;

    if (address === data.bech32Address) return;
    if (!data.bech32Address) {
      return this.disconnect();
    }
    this._address = data.bech32Address;
    this.emit('connect', data.bech32Address);
  };

  private _onNetworkChange = async (data: IntegrationEvent) => {
    const currentChainId = this._chainId;
    const chainId: string = data.id as string;
    if (!currentChainId || currentChainId === chainId) return;
    this._chainId = chainId;
    this.emit('changeChainId', chainId);
  };

  private _rejectMatched(e: Error) {
    return finExtensionInfo.rejectMessage.source === e.message;
  }
}
