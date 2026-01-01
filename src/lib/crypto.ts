import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import CryptoJS from "crypto-js";
import { encryptedKeys } from "./configs";

const encryptionCache: { [key: string]: string } = {};
const decryptionCache: { [key: string]: string } = {};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const encrypt = (value: string | number, sign: string) => {
  const cacheKey = `${value}-${sign}`;
  if (encryptionCache[cacheKey]) {
    return encryptionCache[cacheKey];
  }

  const key = CryptoJS.enc.Utf8.parse(sign);
  const iv = CryptoJS.enc.Utf8.parse(sign);
  const strValue = String(value);

  const encrypted = CryptoJS.AES.encrypt(strValue, key, { iv: iv }).toString();
  encryptionCache[cacheKey] = encrypted;
  return encrypted;
};

export const decrypt = (encryptedValue: string, sign: string) => {
  const cacheKey = `${encryptedValue}-${sign}`;
  if (decryptionCache[cacheKey]) {
    return decryptionCache[cacheKey];
  }

  const key = CryptoJS.enc.Utf8.parse(sign);
  const iv = CryptoJS.enc.Utf8.parse(sign);

  const decrypted = CryptoJS.AES.decrypt(encryptedValue, key, { iv: iv });
  const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
  decryptionCache[cacheKey] = decryptedStr;
  return decryptedStr;
};

export const decryptData = <T>(data: T, sign: string) => {
  const decryptedData = { ...data };
  for (const key in decryptedData) {
    if (encryptedKeys.includes(key)) {
      decryptedData[key] = decrypt(
        decryptedData[key] as string,
        sign
      ) as T[Extract<keyof T, string>];
    }
  }
  return decryptedData;
};

export const encryptData = <T>(data: T, sign: string) => {
  const encryptedData = { ...data };
  for (const key in encryptedData) {
    if (encryptedKeys.includes(key)) {
      encryptedData[key] = encrypt(
        encryptedData[key] as string | number,
        sign
      ) as T[Extract<keyof T, string>];
    }
  }
  return encryptedData;
};

export const hash = (value: string,salt: string) => {
  return CryptoJS.PBKDF2(
    value, 
    salt,
    {
      keySize: 256 / 32,
      iterations: 310_000,
      hasher: CryptoJS.algo.SHA256,
    }
  ).toString(CryptoJS.enc.Base64);
};

export const verifyHash = (value: string,hashedValue: string,salt: string) => {
  return hash(value,salt) === hashedValue;
};

export const generateUID = (length= 32) => {
  const bytes = CryptoJS.lib.WordArray.random(length);
  return bytes
    .toString(CryptoJS.enc.Hex)
    .toUpperCase()
    .match(/.{1,4}/g)!
    .join("-");
};