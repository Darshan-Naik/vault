/**
 * Secure biometric storage using WebAuthn PRF entropy
 * This ensures the master key is only decryptable using hardware-backed keys
 */

const DB_NAME = "vault-biometric-db";
const STORE_NAME = "secure-storage";
const DB_VERSION = 1;

/**
 * Simple IndexedDB wrapper for secure storage
 */
const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const idbGet = async (key: string): Promise<any> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const idbSet = async (key: string, value: any): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

const idbDelete = async (key: string): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

/**
 * Derive an AES-GCM key from PRF entropy using HKDF
 */
const deriveKeyFromEntropy = async (entropy: ArrayBuffer): Promise<CryptoKey> => {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    entropy,
    "HKDF",
    false,
    ["deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(0), // We use a fixed salt in PRF call, so empty here is fine
      info: new TextEncoder().encode("vault-master-key-encryption"),
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

/**
 * Save the master key locally, encrypted with hardware-backed PRF entropy
 */
export const saveMasterKeyLocally = async (
  userId: string,
  masterKey: string,
  entropy: ArrayBuffer
): Promise<void> => {
  const key = await deriveKeyFromEntropy(entropy);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedMasterKey = new TextEncoder().encode(masterKey);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedMasterKey
  );

  // Store IV and ciphertext in IndexedDB
  await idbSet(`mk:${userId}`, {
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(ciphertext)),
  });
};

/**
 * Load the master key using hardware-backed PRF entropy
 */
export const loadMasterKeyLocally = async (
  userId: string,
  entropy: ArrayBuffer
): Promise<string | null> => {
  const data = await idbGet(`mk:${userId}`);
  if (!data || !data.iv || !data.ciphertext) {
    return null;
  }

  try {
    const key = await deriveKeyFromEntropy(entropy);
    const iv = new Uint8Array(data.iv);
    const ciphertext = new Uint8Array(data.ciphertext);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Failed to decrypt master key with PRF entropy:", error);
    return null;
  }
};

/**
 * Clear the locally stored master key
 */
export const clearMasterKeyLocally = async (userId: string): Promise<void> => {
  await idbDelete(`mk:${userId}`);
};

/**
 * Check if a biometric secret exists for this user
 */
export const hasBiometricSecret = async (userId: string): Promise<boolean> => {
  const data = await idbGet(`mk:${userId}`);
  return !!data;
};
