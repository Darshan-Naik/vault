import { useState, useEffect, useRef } from "react";
import { useVaultKey } from "../VaultKeyProvider";
import { useLock } from "../LockProvider";
import PasswordUnlock from "./PasswordUnlock";
import RecoveryFlow from "./RecoveryFlow";

type Mode = "password" | "recovery";

function VaultUnlockScreen() {
  const {
    unlock,
    unlockWithMasterKey,
    resetPasswordWithRecovery,
    confirmPasswordReset,
    validateRecoveryKey,
  } = useVaultKey();
  const { bypassLock, isBiometricEnabled, unlockWithBiometric } = useLock();

  const [mode, setMode] = useState<Mode>("password");
  const hasTriggeredRef = useRef(false);

  // Auto-trigger biometric on mount if enabled
  useEffect(() => {
    if (isBiometricEnabled && mode === "password" && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      handleBiometricUnlock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBiometricEnabled, mode]);

  const handleUnlock = async (password: string): Promise<boolean> => {
    const success = await unlock(password);
    if (success) {
      // Bypass PIN lock since user just authenticated with password
      bypassLock();
    }
    return success;
  };

  const handleBiometricUnlock = async (): Promise<boolean> => {
    const result = await unlockWithBiometric();
    if (result) {
      if (typeof result === "string") {
        unlockWithMasterKey(result);
      }
      bypassLock();
      return true;
    }
    return false;
  };

  const handleValidateRecoveryKey = async (
    recoveryKey: string
  ): Promise<boolean> => {
    return validateRecoveryKey(recoveryKey);
  };

  const handleResetPassword = async (
    recoveryKey: string,
    newPassword: string
  ) => {
    const result = await resetPasswordWithRecovery(recoveryKey, newPassword);
    return result;
  };

  const handleRecoveryComplete = (masterKey: string) => {
    // Now that user has saved the new recovery key, unlock the vault
    confirmPasswordReset(masterKey);
    // Bypass PIN lock since user just completed password reset
    bypassLock();
  };

  if (mode === "recovery") {
    return (
      <RecoveryFlow
        onValidateRecoveryKey={handleValidateRecoveryKey}
        onResetPassword={handleResetPassword}
        onComplete={handleRecoveryComplete}
        onBack={() => setMode("password")}
      />
    );
  }

  return (
    <PasswordUnlock
      onUnlock={handleUnlock}
      onForgotPassword={() => setMode("recovery")}
      isBiometricEnabled={isBiometricEnabled}
      onBiometricUnlock={handleBiometricUnlock}
    />
  );
}

export default VaultUnlockScreen;
