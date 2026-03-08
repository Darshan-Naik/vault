import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useVaultKey } from "./VaultKeyProvider";
import { useLock } from "./LockProvider";

function LoadingScreen() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="flash-loading">
                <img src="/logo.jpeg" alt="Vault" />
            </div>
        </div>
    );
}

export default function ProtectedRoute() {
    const { user, loading: authLoading } = useAuth();
    const { isLoading: vaultKeyLoading, isSetup, isUnlocked } = useVaultKey();
    const { isLocked } = useLock();
    const location = useLocation();

    // Show loading while checking auth or vault key status
    if (authLoading || (user && vaultKeyLoading)) {
        return <LoadingScreen />;
    }

    // Not authenticated — redirect to login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Authenticated but vault not set up — only allow /setup
    if (!isSetup) {
        if (location.pathname !== "/setup") {
            return <Navigate to="/setup" replace />;
        }
        return <Outlet />;
    }

    // Vault set up but not unlocked — only allow /unlock and /recovery
    if (!isUnlocked) {
        if (location.pathname !== "/unlock" && location.pathname !== "/recovery") {
            return <Navigate to="/unlock" state={{ from: location }} replace />;
        }
        return <Outlet />;
    }

    // PIN locked — only allow /lock
    if (isLocked) {
        if (location.pathname !== "/lock") {
            return <Navigate to="/lock" state={{ from: location }} replace />;
        }
        return <Outlet />;
    }

    // If user is fully unlocked but on an auth-flow page, redirect back to where they came from
    if (["/setup", "/unlock", "/recovery", "/lock"].includes(location.pathname)) {
        const savedFrom = (location.state as { from?: { pathname: string } })?.from?.pathname;
        return <Navigate to={savedFrom || "/"} replace />;
    }

    // Fully authenticated and unlocked — render the page
    return <Outlet />;
}
