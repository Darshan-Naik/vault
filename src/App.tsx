import Auth from "./components/Auth";
import { useAuth } from "./components/AuthProvider";
import { useLock } from "./components/LockProvider";
import Main from "./components/Main";
import LockScreen from "./components/LockScreen";
import { Shield } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 gradient-radial" />

      {/* Loading content */}
      <div className="relative animate-fade-in">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse-slow" />

          {/* Icon container */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center pulse-glow">
            <Shield className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Loading text */}
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold text-gradient mb-2">Vault</h2>
          <div className="flex items-center justify-center gap-1">
            <div
              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
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
