import { createContext } from "react";

export const LockContext = createContext<{
  isLocked: boolean;
  unlock: (key: string) => boolean;
  lock: () => void;
  bypassLock: () => void; // Bypass lock after password unlock
  hasLockKey: boolean;
  setLockKey: (key: string) => Promise<void>;
  updateLockKey: (oldKey: string, newKey: string) => Promise<boolean>;
  resetLockKey: () => Promise<void>;
  // Biometric authentication
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  enableBiometric: () => Promise<ArrayBuffer | null>;
  disableBiometric: () => Promise<void>;
  unlockWithBiometric: () => Promise<string | boolean>;
}>({
  isLocked: false,
  unlock: () => false,
  lock: () => {},
  bypassLock: () => {},
  hasLockKey: false,
  setLockKey: async () => {},
  updateLockKey: async () => false,
  resetLockKey: async () => {},
  // Biometric authentication defaults
  isBiometricAvailable: false,
  isBiometricEnabled: false,
  enableBiometric: async () => null,
  disableBiometric: async () => {},
  unlockWithBiometric: async () => false,
});
