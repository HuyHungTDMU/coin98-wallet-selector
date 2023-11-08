export interface CreateAccountAction {
  type: 'CreateAccount';
}

export interface DeployContractAction {
  type: 'DeployContract';
  params: {
    code: Uint8Array;
  };
}

export interface FunctionCallAction {
  type: 'FunctionCall';
  params: {
    methodName: string;
    args: object;
    gas: string;
    deposit: string;
  };
}

export interface TransferAction {
  type: 'Transfer';
  params: {
    deposit: string;
  };
}

export interface StakeAction {
  type: 'Stake';
  params: {
    stake: string;
    publicKey: string;
  };
}

export type AddKeyPermission =
  | 'FullAccess'
  | {
      receiverId: string;
      allowance?: string;
      methodNames?: Array<string>;
    };

export interface AddKeyAction {
  type: 'AddKey';
  params: {
    publicKey: string;
    accessKey: {
      nonce?: number;
      permission: AddKeyPermission;
    };
  };
}

export interface DeleteKeyAction {
  type: 'DeleteKey';
  params: {
    publicKey: string;
  };
}

export interface DeleteAccountAction {
  type: 'DeleteAccount';
  params: {
    beneficiaryId: string;
  };
}

export type Action =
  | CreateAccountAction
  | DeployContractAction
  | FunctionCallAction
  | TransferAction
  | StakeAction
  | AddKeyAction
  | DeleteKeyAction
  | DeleteAccountAction;

export type ActionType = Action['type'];

export interface Transaction {
  signerId: string;
  receiverId: string;
  actions: Array<Action>;
}

export interface SignAndSendTransactionParams {
  /**
   * Account ID used to sign the transaction. Defaults to the first account.
   */
  signerId?: string;
  /**
   * Account ID to receive the transaction. Defaults to `contractId` defined in `init`.
   */
  receiverId: string;
  /**
   * NEAR Action(s) to sign and send to the network (e.g. `FunctionCall`). You can find more information on `Action` {@link https://github.com/near/wallet-selector/blob/main/packages/core/docs/api/transactions.md | here}.
   */
  actions: Array<Action>;
}
