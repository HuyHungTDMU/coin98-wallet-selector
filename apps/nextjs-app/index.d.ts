export {};

declare global {
  interface Window {
    coin98: any;
    nightly: any;
    keplr: any;
    ethereum: any;
    [key: string]: any;
  }
}
