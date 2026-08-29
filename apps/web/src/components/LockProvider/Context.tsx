import { createContext } from "react";
import { DEFAULT_AUTO_LOCK_TIMEOUT_MS } from "@vault/shared";

export const LockContext = createContext<{
  isLocked: boolean;
  unlock: (key: string) => boolean;
  lock: () => void;
  bypassLock: () => void; // Bypass lock after password unlock
  hasLockKey: boolean;
  setLockKey: (key: string) => Promise<void>;
  updateLockKey: (oldKey: string, newKey: string) => Promise<boolean>;
  resetLockKey: () => Promise<void>;
  autoLockTimeoutMs: number;
  setAutoLockTimeout: (timeoutMs: number) => Promise<void>;
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
  autoLockTimeoutMs: DEFAULT_AUTO_LOCK_TIMEOUT_MS,
  setAutoLockTimeout: async () => {},
  // Biometric authentication defaults
  isBiometricAvailable: false,
  isBiometricEnabled: false,
  enableBiometric: async () => null,
  disableBiometric: async () => {},
  unlockWithBiometric: async () => false,
});
