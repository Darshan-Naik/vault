import Auth from "./components/Auth";
import { useAuth } from "./components/AuthProvider";
import { useLock } from "./components/LockProvider";
import { useVaultKey } from "./components/VaultKeyProvider";
import Main from "./components/Main";
import LockScreen from "./components/LockScreen";
import SetupScreen from "./components/SetupScreen";
import VaultUnlockScreen from "./components/VaultUnlockScreen";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flash-loading">
        <img src="/logo.jpeg" alt="Vault" />
      </div>
    </div>
  );
}

function App() {
  const { user, loading: authLoading } = useAuth();
  const { isLocked } = useLock();
  const { isLoading: vaultKeyLoading, isSetup, isUnlocked } = useVaultKey();

  // Show loading screen while checking auth or vault key status
  if (authLoading || (user && vaultKeyLoading)) {
    return <LoadingScreen />;
  }

  // Not authenticated - show login
  if (!user) {
    return <Auth />;
  }

  // Authenticated but vault not set up - show setup screen
  if (!isSetup) {
    return <SetupScreen />;
  }

  // Vault set up but not unlocked - show unlock screen
  if (!isUnlocked) {
    return <VaultUnlockScreen />;
  }

  // PIN lock screen (if enabled)
  if (isLocked) {
    return <LockScreen />;
  }

  // Fully authenticated and unlocked
  return <Main />;
}

export default App;
