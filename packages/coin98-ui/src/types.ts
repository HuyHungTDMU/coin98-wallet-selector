export interface ChainInfoBase {
  id: number | string;
  blockChainName: 'evm' | 'solana' | 'cosmos' | 'near';
  name: string;
  chainId: string;
  imgUrl: string;
}

export interface ChainInfoCosmos extends ChainInfoBase {
  readonly rpc: string;
  readonly rest: string;
  readonly chainId: string;
  readonly chainName: string;
  readonly stakeCurrency: Currency;
  readonly bip44: BIP44;
  readonly alternativeBIP44s?: BIP44[];
  readonly bech32Config: Bech32Config;
  readonly currencies: AppCurrency[];
  readonly feeCurrencies: FeeCurrency[];
  [key: string]: any;
}

export interface ChainInfoEVM extends ChainInfoBase {
  chainId: string;
  chainName: string;

  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: number;
  };
  rpcUrls: string[];
  [key: string]: any;
}

export type ChainInfo = ChainInfoEVM | ChainInfoCosmos | ChainInfoBase;

export interface BIP44 {
  readonly coinType: number;
}

export interface Bech32Config {
  readonly bech32PrefixAccAddr: string;
  readonly bech32PrefixAccPub: string;
  readonly bech32PrefixValAddr: string;
  readonly bech32PrefixValPub: string;
  readonly bech32PrefixConsAddr: string;
  readonly bech32PrefixConsPub: string;
}

export declare type WithGasPriceStep<T> = T & {
  /**
   * This is used to set the fee of the transaction.
   * If this field is empty, it just use the default gas price step (low: 0.01, average: 0.025, high: 0.04).
   */
  readonly gasPriceStep?: {
    readonly low: number;
    readonly average: number;
    readonly high: number;
  };
};

export declare type FeeCurrency = WithGasPriceStep<AppCurrency>;

export declare type AppCurrency = Currency | CW20Currency | Secret20Currency | IBCCurrency;

/**
 * The currency that is supported on the chain natively.
 */
export interface Currency {
  readonly coinDenom: string;
  readonly coinMinimalDenom: string;
  readonly coinDecimals: number;
  /**
   * This is used to fetch asset's fiat value from coingecko.
   * You can get id from https://api.coingecko.com/api/v3/coins/list.
   */
  readonly coinGeckoId?: string;
  readonly coinImageUrl?: string;
}
/**
 * The currency that is supported on the cosmwasm.
 * This should be the CW-20 that confirms the standard.
 * And, in this case, `coinMinimalDenom` must start with the type and contract address of currency such as "cw20:coral1vv6hruqu...3sfhwh:ukeplr".
 */
export interface CW20Currency extends Currency {
  readonly type: 'cw20';
  readonly contractAddress: string;
}
export interface Secret20Currency extends Currency {
  readonly type: 'secret20';
  readonly contractAddress: string;
  readonly viewingKey: string;
}
/**
 * IBCCurrency is the currency that is sent from the other chain via IBC.
 * This will be handled as similar to the native currency.
 * But, this has more information abounr IBC channel and paths.
 */
export interface IBCCurrency extends Currency {
  readonly paths: {
    portId: string;
    channelId: string;
  }[];
  /**
   * The chain id that the currency is from.
   * If that chain is unknown, this will be undefined.
   */
  readonly originChainId: string | undefined;
  readonly originCurrency: Currency | CW20Currency | Secret20Currency | undefined;
}
