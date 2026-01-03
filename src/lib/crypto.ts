import CryptoJS from "crypto-js";
import { encryptedKeys } from "./configs";

// Constants for encryption
const IV_LENGTH = 16; // 128 bits for AES
const KEY_LENGTH = 32; // 256 bits for AES-256

/**
 * Derives an AES key from a Base64 or UTF-8 string.
 * If the input is Base64 (from PBKDF2), it's parsed directly.
 * Otherwise, it's hashed to ensure proper key length.
 */
const deriveKey = (keyInput: string): CryptoJS.lib.WordArray => {
  // Try to parse as Base64 first (from PBKDF2 output)
  try {
    const parsed = CryptoJS.enc.Base64.parse(keyInput);
    // If parsed successfully and has content, use it
    if (parsed.sigBytes > 0) {
      // Ensure we have exactly 256 bits (32 bytes) for AES-256
      if (parsed.sigBytes >= KEY_LENGTH) {
        parsed.sigBytes = KEY_LENGTH;
        return parsed;
      }
    }
  } catch {
    // Not valid Base64, fall through to hash
  }

  // For non-Base64 inputs, derive a proper key using SHA-256
  return CryptoJS.SHA256(keyInput);
};

/**
 * Encrypts a value using AES-256-CBC with:
 * - Random IV for each encryption (prevents pattern detection)
 * - Proper key derivation (fixes key size issues)
 *
 * Output format: iv:ciphertext (all Base64 encoded)
 */
export const encrypt = (value: string | number, keyInput: string): string => {
  const key = deriveKey(keyInput);

  // Generate a random IV for each encryption
  const iv = CryptoJS.lib.WordArray.random(IV_LENGTH);

  const strValue = String(value);

  const encrypted = CryptoJS.AES.encrypt(strValue, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const ciphertext = encrypted.toString();

  // Format: iv:ciphertext
  const ivBase64 = iv.toString(CryptoJS.enc.Base64);
  return `${ivBase64}:${ciphertext}`;
};

/**
 * Decrypts a value encrypted with the encrypt function.
 */
export const decrypt = (encryptedValue: string, keyInput: string): string => {
  const key = deriveKey(keyInput);

  // Parse the encrypted format: iv:ciphertext
  const parts = encryptedValue.split(":");

  if (parts.length !== 2) {
    // Invalid format
    return "";
  }

  const [ivBase64, ciphertext] = parts;
  const iv = CryptoJS.enc.Base64.parse(ivBase64);

  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
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

export const hash = (value: string, salt: string) => {
  return CryptoJS.PBKDF2(value, salt, {
    keySize: 256 / 32,
    iterations: 310_000,
    hasher: CryptoJS.algo.SHA256,
  }).toString(CryptoJS.enc.Base64);
};

export const verifyHash = (
  value: string,
  hashedValue: string,
  salt: string
) => {
  return hash(value, salt) === hashedValue;
};

export const generateUID = (length = 32) => {
  const bytes = CryptoJS.lib.WordArray.random(length);
  return bytes
    .toString(CryptoJS.enc.Hex)
    .toUpperCase()
    .match(/.{1,4}/g)!
    .join("-");
};
