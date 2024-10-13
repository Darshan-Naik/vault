import { KeyRound, Landmark, CreditCard } from "lucide-react";

export const vaultTypes = [
  {
    label: "Password",
    value: "CREDENTIAL",
  },
  {
    label: "Card",
    value: "CARD",
  },
  {
    label: "Bank account",
    value: "BANK",
  },
];

export const encryptedKeys = [
  "uid",
  "password",
  "masterPassword",
  "accountNumber",
  "number",
  "cvv",
  "pin",
];

export const iconMap = {
  CREDENTIAL: KeyRound,
  BANK: Landmark,
  CARD: CreditCard,
};
