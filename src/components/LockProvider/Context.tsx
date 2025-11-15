import { createContext } from "react";

export const LockContext = createContext<{
  isLocked: boolean;
  unlock: (key: string) => boolean;
  lock: () => void;
  hasLockKey: boolean;
  setLockKey: (key: string) => void;
  updateLockKey: (oldKey: string, newKey: string) => boolean;
}>({
  isLocked: false,
  unlock: () => false,
  lock: () => {},
  hasLockKey: false,
  setLockKey: () => {},
  updateLockKey: () => false,
});

