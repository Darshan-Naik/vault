import Auth from "./components/Auth";
import { useAuth } from "./components/AuthProvider";
import { useLock } from "./components/LockProvider";
import Main from "./components/Main";
import LockScreen from "./components/LockScreen";
import { Shield } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      {/* Loading content */}
      <div className="relative">
        {/* Icon container */}
        <div className="relative w-14 h-14 rounded-lg bg-card border border-border flex items-center justify-center">
          <Shield className="w-7 h-7 text-foreground" />
        </div>

        {/* Loading text */}
        <div className="mt-5 text-center">
          <h2 className="text-base font-semibold text-foreground mb-3">Vault</h2>
          <div className="flex items-center justify-center gap-1">
            <div
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();
  const { isLocked } = useLock();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Auth />;
  }

  if (isLocked) {
    return <LockScreen />;
  }

  return <Main />;
}

export default App;
