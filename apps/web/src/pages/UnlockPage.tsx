import { useNavigate, useLocation } from "react-router-dom";
import { useVaultKey } from "@/components/VaultKeyProvider";
import { useLock } from "@/components/LockProvider";
import PasswordUnlock from "@/components/VaultUnlockScreen/PasswordUnlock";
import { useEffect, useRef } from "react";

export default function UnlockPage() {
    const { unlock, unlockWithMasterKey } = useVaultKey();
    const { bypassLock, isBiometricEnabled, unlockWithBiometric } = useLock();
    const navigate = useNavigate();
    const location = useLocation();
    const hasTriggeredRef = useRef(false);

    // Navigate back to where the user was before being redirected to unlock
    const returnTo = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

    const handleUnlock = async (password: string): Promise<boolean> => {
        const success = await unlock(password);
        if (success) {
            bypassLock();
            navigate(returnTo, { replace: true });
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
            navigate(returnTo, { replace: true });
            return true;
        }
        return false;
    };

    // Auto-trigger biometric on mount if enabled
    useEffect(() => {
        if (isBiometricEnabled && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            handleBiometricUnlock();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isBiometricEnabled]);

    return (
        <PasswordUnlock
            onUnlock={handleUnlock}
            onForgotPassword={() => navigate("/recovery")}
            isBiometricEnabled={isBiometricEnabled}
            onBiometricUnlock={handleBiometricUnlock}
        />
    );
}
