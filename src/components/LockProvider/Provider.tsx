import { useEffect, useState, useCallback } from "react";
import { LockContext } from "./Context";
import CryptoJS from "crypto-js";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

const LOCK_KEY_STORAGE = "vault_lock_key_hash";
const LOCK_STATE_STORAGE = "vault_is_locked";

export function LockProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(() => {
    // Check if app was locked when it closed
    const wasLocked = localStorage.getItem(LOCK_STATE_STORAGE) === "true";
    return wasLocked;
  });

  const hasLockKey = useCallback(() => {
    return !!localStorage.getItem(LOCK_KEY_STORAGE);
  }, []);

  const hashKey = useCallback((key: string): string => {
    return CryptoJS.SHA256(key).toString();
  }, []);

  const lock = useCallback(() => {
    setIsLocked(true);
    localStorage.setItem(LOCK_STATE_STORAGE, "true");
  }, []);

  const setLockKey = useCallback(
    (key: string) => {
      // Validate PIN is exactly 4 digits
      if (!/^\d{4}$/.test(key)) {
        throw new Error("PIN must be exactly 4 digits");
      }
      const hash = hashKey(key);
      localStorage.setItem(LOCK_KEY_STORAGE, hash);
      // After setting lock key, lock the app
      lock();
    },
    [hashKey, lock]
  );

  const updateLockKey = useCallback(
    (oldKey: string, newKey: string): boolean => {
      // Validate both PINs are exactly 4 digits
      if (!/^\d{4}$/.test(oldKey) || !/^\d{4}$/.test(newKey)) {
        return false;
      }

      const storedHash = localStorage.getItem(LOCK_KEY_STORAGE);
      if (!storedHash) {
        return false;
      }

      const oldKeyHash = hashKey(oldKey);
      if (oldKeyHash !== storedHash) {
        return false;
      }

      const newKeyHash = hashKey(newKey);
      localStorage.setItem(LOCK_KEY_STORAGE, newKeyHash);
      return true;
    },
    [hashKey]
  );

  const unlock = useCallback(
    (key: string): boolean => {
      // Validate PIN is exactly 4 digits
      if (!/^\d{4}$/.test(key)) {
        return false;
      }

      const storedHash = localStorage.getItem(LOCK_KEY_STORAGE);
      if (!storedHash) {
        return false;
      }

      const inputHash = hashKey(key);
      if (inputHash === storedHash) {
        setIsLocked(false);
        localStorage.setItem(LOCK_STATE_STORAGE, "false");
        return true;
      }
      return false;
    },
    [hashKey]
  );

  // Clear lock state when user logs out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User logged out, clear lock state
        setIsLocked(false);
        localStorage.setItem(LOCK_STATE_STORAGE, "false");
      }
    });

    return unsubscribe;
  }, []);

  // Detect visibility changes (when app goes to background/foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasLockKey()) {
        // App went to background, lock it
        lock();
      }
    };

    const handleBeforeUnload = () => {
      if (hasLockKey()) {
        // App is closing, mark as locked
        localStorage.setItem(LOCK_STATE_STORAGE, "true");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Lock on initial load if lock key exists
    if (hasLockKey() && !isLocked) {
      // Check if we should lock on page load
      const shouldLock = localStorage.getItem(LOCK_STATE_STORAGE) === "true";
      if (shouldLock) {
        setIsLocked(true);
      }
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasLockKey, lock, isLocked]);

  const value = {
    isLocked,
    unlock,
    lock,
    hasLockKey: hasLockKey(),
    setLockKey,
    updateLockKey,
  };

  return (
    <LockContext.Provider value={value}>{children}</LockContext.Provider>
  );
}

