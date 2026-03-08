import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useVaultKey } from "./VaultKeyProvider";

/**
 * Route guard for public-only pages (e.g. /login).
 * Redirects authenticated users to the appropriate page.
 */
export default function PublicRoute() {
    const { user, loading } = useAuth();
    const { isLoading: vaultKeyLoading, isSetup, isUnlocked } = useVaultKey();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <div className="flash-loading">
                    <img src="/logo.jpeg" alt="Vault" />
                </div>
            </div>
        );
    }

    if (user) {
        // User is authenticated — send them to the right place
        if (vaultKeyLoading) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                    <div className="flash-loading">
                        <img src="/logo.jpeg" alt="Vault" />
                    </div>
                </div>
            );
        }
        if (!isSetup) return <Navigate to="/setup" replace />;
        if (!isUnlocked) return <Navigate to="/unlock" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
