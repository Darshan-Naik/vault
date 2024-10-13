export type TVault = TCard | TCredential | TBank;

export type TCard = {
  type: "CARD";
  number: number;
  cvv?: number;
  pin?: number;
  expiry?: string;
  id: string;
  note?: string;
  title: string;
};

export type TCredential = {
  type: "CREDENTIAL";
  uid: string;
  password?: string;
  masterPassword?: string;
  url?: string;
  id: string;
  note?: string;
  title: string;
};

export type TBank = {
  type: "BANK";
  accountNumber: number;
  password?: string;
  masterPassword?: string;
  ifsc?: string;
  id: string;
  note?: string;
  title: string;
};
