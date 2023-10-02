import { Adapter } from '@coin98t/wallet-adapter-base';

export interface AdapterInjection {
  getAdapter: (chains: string[], options?: any) => Adapter[];
}
