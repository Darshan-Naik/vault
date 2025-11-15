import { useEffect, useState, useCallback } from "react";
import { LockContext } from "./Context";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAuth } from "../AuthProvider";
import {
  loadPinHash,
  savePinHash,
  updatePinHash,
  verifyPin,
} from "@/lib/lock-utils";

export function LockProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [pinHash, setPinHash] = useState<string | null>(null);

  // Load PIN hash from Firestore when user is available
  useEffect(() => {
    const loadUserPinHash = async () => {
      if (!user?.uid) {
        setPinHash(null);
        setIsLocked(false);
        return;
      }

      try {
        const hash = await loadPinHash(user.uid);
        setPinHash(hash);
        // Always start unlocked on page load
        setIsLocked(false);
      } catch (error) {
        console.error("Error loading PIN hash:", error);
        setPinHash(null);
        setIsLocked(false);
      }
    };

    loadUserPinHash();
  }, [user?.uid]);

  const hasLockKey = useCallback(() => {
    return !!pinHash;
  }, [pinHash]);

  const lock = useCallback(() => {
    setIsLocked(true);
  }, []);

  const setLockKey = useCallback(
    async (key: string) => {
      if (!user?.uid) {
        throw new Error("User must be authenticated to set PIN");
      }

      try {
        const hash = await savePinHash(user.uid, key);
        setPinHash(hash);
        // After setting lock key, lock the app
        lock();
      } catch (error) {
        throw error;
      }
    },
    [lock, user?.uid]
  );

  const updateLockKey = useCallback(
    async (oldKey: string, newKey: string): Promise<boolean> => {
      if (!user?.uid || !pinHash) {
        return false;
      }

      try {
        const newHash = await updatePinHash(user.uid, oldKey, newKey, pinHash);
        setPinHash(newHash);
        return true;
      } catch (error) {
        return false;
      }
    },
    [pinHash, user?.uid]
  );

  const unlock = useCallback(
    (key: string): boolean => {
      if (!pinHash) {
        return false;
      }

      const isValid = verifyPin(key, pinHash);
      if (isValid) {
        setIsLocked(false);
        return true;
      }
      return false;
    },
    [pinHash]
  );

  // Clear lock state when user logs out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User logged out, clear lock state and PIN hash
        setIsLocked(false);
        setPinHash(null);
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

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasLockKey, lock]);

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

