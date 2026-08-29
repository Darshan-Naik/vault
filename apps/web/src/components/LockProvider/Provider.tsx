import { useEffect, useState, useCallback, useRef } from "react";
import { LockContext } from "./Context";
import { auth } from "@vault/shared";
import { onAuthStateChanged } from "firebase/auth";
import { useAuth } from "../AuthProvider";
import {
  loadLockSettings,
  savePinHash,
  updatePinHash,
  verifyPin,
  deletePinHash,
  DEFAULT_AUTO_LOCK_TIMEOUT_MS,
} from "@vault/shared";
import {
  isBiometricAvailable as checkBiometricAvailable,
  loadBiometricCredentials,
  registerBiometric,
  deleteBiometricCredential,
  authenticateWithBiometric,
  loadMasterKeyLocally,
} from "@vault/shared";
import { signOut } from "firebase/auth";

export function LockProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Start locked by default to prevent flash of unlocked content while PIN hash loads
  const [isLocked, setIsLocked] = useState(true);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isSettingsUnavailable, setIsSettingsUnavailable] = useState(false);
  const [pinHash, setPinHash] = useState<string | null>(null);
  const lastActivityRef = useRef(Date.now());

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
    let cancelled = false;

    const loadUserSettings = async () => {
      if (!user?.uid) {
        setPinHash(null);
        setBiometricCredentialIds([]);
        setIsLocked(false);
        setIsSettingsUnavailable(false);
        setIsSettingsLoading(false);
        return;
      }

      setIsSettingsLoading(true);
      try {
        const [lockSettings, credentialIds] = await Promise.all([
          loadLockSettings(user.uid),
          loadBiometricCredentials(user.uid),
        ]);
        if (cancelled) return;
        setPinHash(lockSettings.pinHash);
        setBiometricCredentialIds(credentialIds);
        // If PIN hash exists, start locked; otherwise start unlocked
        setIsLocked(!!lockSettings.pinHash);
        setIsSettingsUnavailable(false);
        setIsSettingsLoading(false);
      } catch (error) {
        console.error("Error loading user settings:", error);
        if (cancelled) return;
        // Stay locked so PIN protection cannot be skipped when offline.
        setIsLocked(true);
        setIsSettingsUnavailable(true);
        setIsSettingsLoading(false);
      }
    };

    loadUserSettings();

    const retry = () => {
      if (user?.uid) {
        loadUserSettings();
      }
    };

    window.addEventListener("online", retry);

    return () => {
      cancelled = true;
      window.removeEventListener("online", retry);
    };
  }, [user?.uid]);

  const hasLockKey = useCallback(() => {
    return !!pinHash;
  }, [pinHash]);

  const lock = useCallback(() => {
    setIsLocked(true);
  }, []);

  // Bypass lock - used after password unlock to skip PIN for this session
  const bypassLock = useCallback(() => {
    setIsLocked(false);
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
  const enableBiometric = useCallback(async (): Promise<ArrayBuffer | null> => {
    if (!user?.uid || !user?.email) {
      throw new Error("User must be authenticated to enable biometric");
    }

    if (!biometricAvailable) {
      throw new Error(
        "Biometric authentication is not available on this device"
      );
    }

    try {
      const entropy = await registerBiometric(user.uid, user.email);
      if (entropy) {
        // Reload all credentials (including the newly added one)
        const credentialIds = await loadBiometricCredentials(user.uid);
        setBiometricCredentialIds(credentialIds);
        
        if (entropy.byteLength === 0) {
          return await authenticateWithBiometric(user.uid);
        }
      }
      return entropy;
    } catch (error) {
      console.error("Error enabling biometric:", error);
      throw error;
    }
  }, [user?.uid, user?.email, biometricAvailable]);

  // Disable biometric on this device only
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

  // Unlock using this device's passkey
  const unlockWithBiometric = useCallback(async (): Promise<string | boolean> => {
    if (biometricCredentialIds.length === 0 || !user?.uid) {
      return false;
    }

    try {
      const entropy = await authenticateWithBiometric(user.uid);
      if (entropy) {
        setIsLocked(false);
        // Load master key from secure IndexedDB using PRF entropy
        const masterKey = await loadMasterKeyLocally(user.uid, entropy);
        return masterKey || true;
      }
      return false;
    } catch (error) {
      console.error("Error unlocking with biometric:", error);
      return false;
    }
  }, [biometricCredentialIds, user?.uid]);

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

  // Lock after inactivity — not immediately on tab/app switch, so copying
  // a field into another tab does not lock the vault mid-workflow.
  useEffect(() => {
    if (!hasLockKey() || isLocked) return;

    lastActivityRef.current = Date.now();
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const clearIdleTimer = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }
    };

    const isIdleExpired = () =>
      Date.now() - lastActivityRef.current >= DEFAULT_AUTO_LOCK_TIMEOUT_MS;

    const scheduleIdleLock = () => {
      clearIdleTimer();

      const remaining = Math.max(
        DEFAULT_AUTO_LOCK_TIMEOUT_MS - (Date.now() - lastActivityRef.current),
        0
      );
      idleTimer = setTimeout(() => {
        if (isIdleExpired()) {
          lock();
        } else {
          scheduleIdleLock();
        }
      }, remaining);
    };

    const onActivity = () => {
      if (document.hidden) return;
      lastActivityRef.current = Date.now();
      scheduleIdleLock();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        scheduleIdleLock();
        return;
      }

      if (isIdleExpired()) {
        lock();
        return;
      }

      lastActivityRef.current = Date.now();
      scheduleIdleLock();
    };

    const activityEvents = [
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "pointerdown",
    ] as const;

    activityEvents.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true })
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);
    scheduleIdleLock();

    return () => {
      clearIdleTimer();
      activityEvents.forEach((event) =>
        window.removeEventListener(event, onActivity)
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasLockKey, lock, isLocked]);

  const value = {
    isLocked,
    isSettingsLoading,
    isSettingsUnavailable,
    unlock,
    lock,
    bypassLock,
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
