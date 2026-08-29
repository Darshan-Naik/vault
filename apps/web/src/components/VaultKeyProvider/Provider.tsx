import { useEffect, useState, useCallback, useRef } from "react";
import { VaultKeyContext, SetupResult } from "./Context";
import { useAuth } from "../AuthProvider";
import { TUserMeta } from "@vault/shared";
import {
  getUserMeta,
  createUserMeta,
  unlockWithPassword,
  changePassword as changePasswordMeta,
  resetRecoveryKey as resetRecoveryKeyMeta,
  resetPasswordWithRecovery as resetPasswordWithRecoveryMeta,
  validateRecoveryKey as validateRecoveryKeyMeta,
  ensureUserSync,
  stopUserSync,
} from "@vault/shared";
import {
  clearSessionMasterKey,
  clearUnlockSession,
  loadSessionMasterKey,
  saveSessionMasterKey,
} from "@/lib/unlock-session";

export function VaultKeyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [userMeta, setUserMeta] = useState<TUserMeta | null>(null);
  const [masterKey, setMasterKey] = useState<string | null>(() =>
    user?.uid ? loadSessionMasterKey(user.uid) : null
  );
  const [isMetaUnavailable, setIsMetaUnavailable] = useState(false);

  // Load user metadata when user is available
  useEffect(() => {
    let cancelled = false;

    const loadUserMeta = async () => {
      if (!user?.uid) {
        setUserMeta(null);
        setMasterKey(null);
        setIsMetaUnavailable(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const meta = await getUserMeta(user.uid);
        if (cancelled) return;
        setUserMeta(meta);
        setIsMetaUnavailable(false);
      } catch (error) {
        console.error("Error loading user metadata:", error);
        if (cancelled) return;
        // Keep any previously loaded meta so a transient offline error
        // cannot send an existing user into first-time setup.
        setIsMetaUnavailable(true);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadUserMeta();

    const retry = () => {
      if (user?.uid) {
        loadUserMeta();
      }
    };

    window.addEventListener("online", retry);

    return () => {
      cancelled = true;
      window.removeEventListener("online", retry);
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }
    ensureUserSync(user.uid);
    return () => stopUserSync(user.uid);
  }, [user?.uid]);

  // Clear state when user logs out
  useEffect(() => {
    if (!user) {
      setUserMeta(null);
      setMasterKey(null);
      clearUnlockSession();
    }
  }, [user]);

  // Keep unlock across refresh; sessionStorage is cleared when the tab closes
  useEffect(() => {
    if (!user?.uid) return;
    if (masterKey) {
      saveSessionMasterKey(user.uid, masterKey);
    } else {
      clearSessionMasterKey();
    }
  }, [user?.uid, masterKey]);

  // Setup - create new user vault with password
  // Returns recovery key and master key, but doesn't set state yet
  const setup = useCallback(
    async (password: string): Promise<SetupResult> => {
      if (!user?.uid) {
        throw new Error("User must be authenticated to setup vault");
      }

      const { recoveryKey, masterKey: newMasterKey } = await createUserMeta(
        user.uid,
        password
      );

      // Return the keys but don't set state yet
      // State will be set when user confirms they saved the recovery key
      return { recoveryKey, masterKey: newMasterKey };
    },
    [user?.uid]
  );

  // Confirm setup - called after user saves recovery key
  const confirmSetup = useCallback(
    async (newMasterKey: string): Promise<void> => {
      if (!user?.uid) {
        throw new Error("User must be authenticated to confirm setup");
      }

      // Now load the metadata and set the master key
      const meta = await getUserMeta(user.uid);
      setUserMeta(meta);
      setMasterKey(newMasterKey);
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

  // Lock - clear master key from memory and this tab's session
  const lock = useCallback(() => {
    setMasterKey(null);
    clearSessionMasterKey();
  }, []);

  // Change password (requires old password)
  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string): Promise<boolean> => {
      if (!userMeta) {
        return false;
      }

      const success = await changePasswordMeta(
        userMeta,
        oldPassword,
        newPassword
      );
      if (success) {
        // Reload user metadata to get the updated encrypted key
        const meta = await getUserMeta(userMeta.userId);
        setUserMeta(meta);
      }
      return success;
    },
    [userMeta]
  );

  // Reset recovery key (requires password)
  const resetRecoveryKey = useCallback(
    async (password: string): Promise<string | null> => {
      if (!userMeta) {
        return null;
      }

      const newRecoveryKey = await resetRecoveryKeyMeta(userMeta, password);
      if (newRecoveryKey) {
        // Reload user metadata to get the updated encrypted key
        const meta = await getUserMeta(userMeta.userId);
        setUserMeta(meta);
      }
      return newRecoveryKey;
    },
    [userMeta]
  );

  // Reset password using recovery key (forgot password flow)
  // This invalidates the old recovery key and generates a new one
  // Does NOT set masterKey - user must save new recovery key first, then call confirmPasswordReset
  const resetPasswordWithRecovery = useCallback(
    async (
      recoveryKey: string,
      newPassword: string
    ): Promise<{ masterKey: string; newRecoveryKey: string } | null> => {
      if (!userMeta) {
        return null;
      }

      const result = await resetPasswordWithRecoveryMeta(
        userMeta,
        recoveryKey,
        newPassword
      );

      if (result) {
        // Reload user metadata but do NOT set master key yet
        // User must save the new recovery key first
        const meta = await getUserMeta(userMeta.userId);
        setUserMeta(meta);
        return result;
      }
      return null;
    },
    [userMeta]
  );

  // Called after user confirms saving their new recovery key during password reset
  const confirmPasswordReset = useCallback((newMasterKey: string) => {
    setMasterKey(newMasterKey);
  }, []);

  // Unlock with a known master key (used for biometric unlock)
  const unlockWithMasterKey = useCallback((key: string) => {
    setMasterKey(key);
  }, []);

  // Validate recovery key without unlocking
  const validateRecoveryKey = useCallback(
    async (recoveryKey: string): Promise<boolean> => {
      if (!userMeta) {
        return false;
      }
      return validateRecoveryKeyMeta(userMeta, recoveryKey);
    },
    [userMeta]
  );

  // Sync state with browser extension using postMessage
  // We use a ref to prevent aggressive locking on initial mount when masterKey is null
  const hasUnlockedInSession = useRef(false);

  useEffect(() => {
    if (masterKey && user?.uid) {
      hasUnlockedInSession.current = true;
      console.log("Vault Web App: Broadcasting VAULT_UNLOCKED to extension");
      window.postMessage(
        {
          type: "VAULT_UNLOCKED",
          payload: { userId: user.uid, masterKey },
        },
        "*"
      );
    } else if (hasUnlockedInSession.current) {
      // Only broadcast lock if we were previously unlocked in this session
      console.log("Vault Web App: Broadcasting VAULT_LOCKED to extension");
      window.postMessage(
        {
          type: "VAULT_LOCKED",
        },
        "*"
      );
      hasUnlockedInSession.current = false;
    }
  }, [masterKey, user?.uid]);

  const value = {
    isLoading,
    isSetup: !!userMeta,
    isUnlocked: !!masterKey,
    isMetaUnavailable: isMetaUnavailable && !userMeta,
    masterKey,
    setup,
    confirmSetup,
    unlock,
    lock,
    unlockWithMasterKey,
    changePassword,
    resetRecoveryKey,
    resetPasswordWithRecovery,
    confirmPasswordReset,
    validateRecoveryKey,
  };

  return (
    <VaultKeyContext.Provider value={value}>
      {children}
    </VaultKeyContext.Provider>
  );
}
