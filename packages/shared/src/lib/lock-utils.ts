import CryptoJS from "crypto-js";
import { getSettingsLocalFirst, saveSettingsLocalFirst } from "./local-sync";

export const DEFAULT_AUTO_LOCK_TIMEOUT_MS = 5 * 60_000;

export type LockSettings = {
  pinHash: string | null;
};

/**
 * Hash a PIN using SHA256
 */
export const hashPin = (pin: string): string => {
  return CryptoJS.SHA256(pin).toString();
};

/**
 * Validate PIN format (must be exactly 4 digits)
 */
export const validatePin = (pin: string): boolean => {
  return /^\d{4}$/.test(pin);
};

/**
 * Load PIN hash for a user
 */
export const loadPinHash = async (userId: string): Promise<string | null> => {
  const settings = await loadLockSettings(userId);
  return settings.pinHash;
};

/**
 * Load lock PIN from the local store, hydrating from the cloud if needed.
 */
export const loadLockSettings = async (
  userId: string
): Promise<LockSettings> => {
  try {
    const settings = await getSettingsLocalFirst(userId);
    if (settings) {
      return { pinHash: settings.lockPinHash || null };
    }

    return { pinHash: null };
  } catch (error) {
    console.error("Error loading lock settings:", error);
    throw new Error("Failed to load lock settings");
  }
};

/**
 * Save PIN hash locally first, then sync.
 */
export const savePinHash = async (
  userId: string,
  pin: string
): Promise<string> => {
  if (!validatePin(pin)) {
    throw new Error("PIN must be exactly 4 digits");
  }

  const hash = hashPin(pin);
  await saveSettingsLocalFirst(userId, { lockPinHash: hash });
  return hash;
};

/**
 * Update PIN hash locally first, then sync.
 */
export const updatePinHash = async (
  userId: string,
  oldPin: string,
  newPin: string,
  currentHash: string
): Promise<string> => {
  if (!validatePin(oldPin) || !validatePin(newPin)) {
    throw new Error("PIN must be exactly 4 digits");
  }

  const oldPinHash = hashPin(oldPin);
  if (oldPinHash !== currentHash) {
    throw new Error("Current PIN is incorrect");
  }

  const newPinHash = hashPin(newPin);
  await saveSettingsLocalFirst(userId, { lockPinHash: newPinHash });
  return newPinHash;
};

/**
 * Verify PIN against stored hash
 */
export const verifyPin = (pin: string, storedHash: string): boolean => {
  if (!validatePin(pin)) {
    return false;
  }

  const inputHash = hashPin(pin);
  return inputHash === storedHash;
};

/**
 * Delete PIN hash locally first, then sync.
 */
export const deletePinHash = async (userId: string): Promise<void> => {
  await saveSettingsLocalFirst(userId, { lockPinHash: null });
};
