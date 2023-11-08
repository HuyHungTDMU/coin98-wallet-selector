export interface Network {
  /**
   * Network ID (e.g. `testnet`).
   */
  networkId: string;
  /**
   * URL for RPC requests.
   */
  nodeUrl: string;
  /**
   * URL for creating accounts.
   */
  helperUrl: string;
  /**
   * URL for the NEAR explorer.
   */
  explorerUrl: string;
  /**
   * URL for the NEAR indexer.
   */
  indexerUrl: string;
}
