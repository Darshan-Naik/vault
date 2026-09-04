export type TCustomField = {
  id: string;
  label: string;
  value: string;
  isSecret?: boolean;
};

export type VaultFieldValue = string | TCustomField[];

type TVaultMeta = {
  id: string;
  note?: string;
  title: string;
  customFields?: TCustomField[];
};

export type TVault = TCard | TCredential | TBank;

export type TCard = TVaultMeta & {
  type: "CARD";
  number: number;
  cvv?: number;
  pin?: number;
  expiry?: string;
};

export type TCredential = TVaultMeta & {
  type: "CREDENTIAL";
  uid: string;
  password?: string;
  masterPassword?: string;
  url?: string;
};

export type TBank = TVaultMeta & {
  type: "BANK";
  accountNumber: number;
  customerId?: string;
  username?: string;
  password?: string;
  masterPassword?: string;
  ifsc?: string;
};

// User metadata stored in Firestore for encryption key management
export type TUserMeta = {
  userId: string;
  salt: string;
  encryptedMasterKeyByPassword: string;
  encryptedMasterKeyByRecoveryKey: string;
  encryptedUserID: string; // Used to verify correct decryption
  createdAt?: Date;
  updatedAt?: Date;
};
