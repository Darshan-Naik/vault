import { useNavigate, useLocation } from "react-router-dom";
import { useVaultKey } from "@/components/VaultKeyProvider";
import { useLock } from "@/components/LockProvider";
import PasswordUnlock from "@/components/VaultUnlockScreen/PasswordUnlock";

export default function UnlockPage() {
    const { unlock } = useVaultKey();
    const { bypassLock } = useLock();
    const navigate = useNavigate();
    const location = useLocation();

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

    return (
        <PasswordUnlock
            onUnlock={handleUnlock}
            onForgotPassword={() => navigate("/recovery")}
        />
    );
}
