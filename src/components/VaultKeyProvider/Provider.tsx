import { useEffect, useState, useCallback } from "react";
import { VaultKeyContext } from "./Context";
import { useAuth } from "../AuthProvider";
import { TUserMeta } from "@/lib/types";
import {
  getUserMeta,
  createUserMeta,
  unlockWithPassword,
  unlockWithRecoveryKey,
} from "@/lib/user-meta";

export function VaultKeyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [userMeta, setUserMeta] = useState<TUserMeta | null>(null);
  const [masterKey, setMasterKey] = useState<string | null>(null);

  // Load user metadata when user is available
  useEffect(() => {
    const loadUserMeta = async () => {
      if (!user?.uid) {
        setUserMeta(null);
        setMasterKey(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const meta = await getUserMeta(user.uid);
        setUserMeta(meta);
      } catch (error) {
        console.error("Error loading user metadata:", error);
        setUserMeta(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserMeta();
  }, [user?.uid]);

  // Clear state when user logs out
  useEffect(() => {
    if (!user) {
      setUserMeta(null);
      setMasterKey(null);
    }
  }, [user]);

  // Setup - create new user vault with password
  const setup = useCallback(
    async (password: string): Promise<{ recoveryKey: string }> => {
      if (!user?.uid) {
        throw new Error("User must be authenticated to setup vault");
      }

      const { recoveryKey, masterKey: newMasterKey } = await createUserMeta(
        user.uid,
        password
      );

      // Reload user metadata
      const meta = await getUserMeta(user.uid);
      setUserMeta(meta);
      setMasterKey(newMasterKey);

      return { recoveryKey };
    },
    [user?.uid]
  );

  // Unlock with password
  const unlock = useCallback(
    async (password: string): Promise<boolean> => {
      if (!userMeta) {
        return false;
      }

      const key = await unlockWithPassword(userMeta, password);
      if (key) {
        setMasterKey(key);
        return true;
      }
      return false;
    },
    [userMeta]
  );

  // Unlock with recovery key
  const unlockWithRecovery = useCallback(
    async (recoveryKey: string): Promise<boolean> => {
      if (!userMeta) {
        return false;
      }

      const key = await unlockWithRecoveryKey(userMeta, recoveryKey);
      if (key) {
        setMasterKey(key);
        return true;
      }
      return false;
    },
    [userMeta]
  );

  // Lock - clear master key from memory
  const lock = useCallback(() => {
    setMasterKey(null);
  }, []);

  // Lock when app goes to background (if PIN lock is not used, this provides basic protection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && masterKey) {
        // Optionally lock when going to background
        // Uncomment if you want auto-lock on visibility change
        // lock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [masterKey, lock]);

  const value = {
    isLoading,
    isSetup: !!userMeta,
    isUnlocked: !!masterKey,
    masterKey,
    setup,
    unlock,
    unlockWithRecovery,
    lock,
  };

  return (
    <VaultKeyContext.Provider value={value}>
      {children}
    </VaultKeyContext.Provider>
  );
}
