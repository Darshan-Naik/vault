import { db } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc, deleteField } from "firebase/firestore";
import CryptoJS from "crypto-js";

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
 * Get user settings document reference
 */
const getUserSettingsRef = (userId: string) => {
  return doc(db, "user-settings", userId);
};

/**
 * Load PIN hash from Firestore for a user
 */
export const loadPinHash = async (userId: string): Promise<string | null> => {
  try {
    const userSettingsRef = getUserSettingsRef(userId);
    const userSettingsSnap = await getDoc(userSettingsRef);
    
    if (userSettingsSnap.exists()) {
      const data = userSettingsSnap.data();
      return data.lockPinHash || null;
    }
    
    return null;
  } catch (error) {
    console.error("Error loading PIN hash:", error);
    throw new Error("Failed to load PIN");
  }
};

/**
 * Save PIN hash to Firestore for a user
 */
export const savePinHash = async (userId: string, pin: string): Promise<string> => {
  if (!validatePin(pin)) {
    throw new Error("PIN must be exactly 4 digits");
  }

  const hash = hashPin(pin);
  
  try {
    const userSettingsRef = getUserSettingsRef(userId);
    await setDoc(userSettingsRef, { lockPinHash: hash }, { merge: true });
    return hash;
  } catch (error) {
    console.error("Error setting PIN:", error);
    throw new Error("Failed to set PIN");
  }
};

/**
 * Update PIN hash in Firestore for a user
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
  
  try {
    const userSettingsRef = getUserSettingsRef(userId);
    await updateDoc(userSettingsRef, { lockPinHash: newPinHash });
    return newPinHash;
  } catch (error) {
    console.error("Error updating PIN:", error);
    throw new Error("Failed to update PIN");
  }
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
 * Delete PIN hash from Firestore for a user
 */
export const deletePinHash = async (userId: string): Promise<void> => {
  try {
    const userSettingsRef = getUserSettingsRef(userId);
    await updateDoc(userSettingsRef, { lockPinHash: deleteField() });
  } catch (error) {
    console.error("Error deleting PIN hash:", error);
    throw new Error("Failed to delete PIN");
  }
};

