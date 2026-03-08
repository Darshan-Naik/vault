import { useNavigate, useLocation } from "react-router-dom";
import { useVaultKey } from "@/components/VaultKeyProvider";
import { useLock } from "@/components/LockProvider";
import RecoveryFlow from "@/components/VaultUnlockScreen/RecoveryFlow";

export default function RecoveryPage() {
    const {
        resetPasswordWithRecovery,
        confirmPasswordReset,
        validateRecoveryKey,
    } = useVaultKey();
    const { bypassLock } = useLock();
    const navigate = useNavigate();
    const location = useLocation();
    const returnTo = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

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
        confirmPasswordReset(masterKey);
        bypassLock();
        navigate(returnTo, { replace: true });
    };

    return (
        <RecoveryFlow
            onValidateRecoveryKey={handleValidateRecoveryKey}
            onResetPassword={handleResetPassword}
            onComplete={handleRecoveryComplete}
            onBack={() => navigate("/unlock")}
        />
    );
}
