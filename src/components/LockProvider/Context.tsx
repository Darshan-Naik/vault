import { createContext } from "react";

export const LockContext = createContext<{
  isLocked: boolean;
  unlock: (key: string) => boolean;
  lock: () => void;
  hasLockKey: boolean;
  setLockKey: (key: string) => Promise<void>;
  updateLockKey: (oldKey: string, newKey: string) => Promise<boolean>;
  resetLockKey: () => Promise<void>;
}>({
  isLocked: false,
  unlock: () => false,
  lock: () => {},
  hasLockKey: false,
  setLockKey: async () => {},
  updateLockKey: async () => false,
  resetLockKey: async () => {},
});

