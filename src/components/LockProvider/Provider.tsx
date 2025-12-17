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
  deletePinHash,
} from "@/lib/lock-utils";
import {
  isBiometricAvailable as checkBiometricAvailable,
  loadBiometricCredentials,
  registerBiometric,
  deleteBiometricCredential,
  authenticateWithBiometric,
} from "@/lib/biometric-utils";
import { signOut } from "firebase/auth";

export function LockProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Start locked by default to prevent flash of unlocked content while PIN hash loads
  const [isLocked, setIsLocked] = useState(true);
  const [pinHash, setPinHash] = useState<string | null>(null);

  // Biometric state (supports multiple devices)
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricCredentialIds, setBiometricCredentialIds] = useState<
    string[]
  >([]);

  // Check biometric availability on mount
  useEffect(() => {
    const checkBiometric = async () => {
      const available = await checkBiometricAvailable();
      setBiometricAvailable(available);
    };
    checkBiometric();
  }, []);

  // Load PIN hash and biometric credentials from Firestore when user is available
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user?.uid) {
        setPinHash(null);
        setBiometricCredentialIds([]);
        setIsLocked(false);
        return;
      }

      try {
        const [hash, credentialIds] = await Promise.all([
          loadPinHash(user.uid),
          loadBiometricCredentials(user.uid),
        ]);
        setPinHash(hash);
        setBiometricCredentialIds(credentialIds);
        // If PIN hash exists, start locked; otherwise start unlocked
        setIsLocked(!!hash);
      } catch (error) {
        console.error("Error loading user settings:", error);
        setPinHash(null);
        setBiometricCredentialIds([]);
        setIsLocked(false);
      }
    };

    loadUserSettings();
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

      const isNewPin = !pinHash;
      const hash = await savePinHash(user.uid, key);
      setPinHash(hash);
      // Only lock the app when setting a new PIN (not updating existing)
      if (isNewPin) {
        lock();
      }
    },
    [lock, user?.uid, pinHash]
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
      } catch {
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

  const resetLockKey = useCallback(async () => {
    if (!user?.uid) {
      throw new Error("User must be authenticated to reset PIN");
    }

    try {
      // Delete PIN hash and biometric credentials from Firestore
      await deletePinHash(user.uid);
      if (biometricCredentialIds.length > 0) {
        await deleteBiometricCredential(user.uid);
      }
      setPinHash(null);
      setBiometricCredentialIds([]);
      setIsLocked(false);
      // Sign out the user
      await signOut(auth);
    } catch (error) {
      console.error("Error resetting lock key:", error);
      throw error;
    }
  }, [user?.uid, biometricCredentialIds.length]);

  // Enable biometric authentication (registers this device)
  const enableBiometric = useCallback(async (): Promise<boolean> => {
    if (!user?.uid || !user?.email) {
      throw new Error("User must be authenticated to enable biometric");
    }

    if (!biometricAvailable) {
      throw new Error(
        "Biometric authentication is not available on this device"
      );
    }

    try {
      const success = await registerBiometric(user.uid, user.email);
      if (success) {
        // Reload all credentials (including the newly added one)
        const credentialIds = await loadBiometricCredentials(user.uid);
        setBiometricCredentialIds(credentialIds);
      }
      return success;
    } catch (error) {
      console.error("Error enabling biometric:", error);
      throw error;
    }
  }, [user?.uid, user?.email, biometricAvailable]);

  // Disable biometric authentication (removes all devices)
  const disableBiometric = useCallback(async (): Promise<void> => {
    if (!user?.uid) {
      throw new Error("User must be authenticated to disable biometric");
    }

    try {
      await deleteBiometricCredential(user.uid);
      setBiometricCredentialIds([]);
    } catch (error) {
      console.error("Error disabling biometric:", error);
      throw error;
    }
  }, [user?.uid]);

  // Unlock using biometric (works with any registered device)
  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    if (biometricCredentialIds.length === 0) {
      return false;
    }

    try {
      const success = await authenticateWithBiometric(biometricCredentialIds);
      if (success) {
        setIsLocked(false);
      }
      return success;
    } catch (error) {
      console.error("Error unlocking with biometric:", error);
      return false;
    }
  }, [biometricCredentialIds]);

  // Clear lock state when user logs out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User logged out, clear lock state, PIN hash, and biometric credentials
        setIsLocked(false);
        setPinHash(null);
        setBiometricCredentialIds([]);
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
    resetLockKey,
    // Biometric (supports multiple devices)
    isBiometricAvailable: biometricAvailable,
    isBiometricEnabled: biometricCredentialIds.length > 0,
    enableBiometric,
    disableBiometric,
    unlockWithBiometric,
  };

  return <LockContext.Provider value={value}>{children}</LockContext.Provider>;
}
