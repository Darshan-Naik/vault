import { useState } from "react";
import { useVaultKey } from "../VaultKeyProvider";
import { useLock } from "../LockProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Lock,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
  Shield,
  ArrowLeft,
} from "lucide-react";

type Mode = "password" | "recovery";

function VaultUnlockScreen() {
  const { unlock, unlockWithRecovery } = useVaultKey();
  const { bypassLock } = useLock();

  const [mode, setMode] = useState<Mode>("password");
  const [password, setPassword] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleUnlock = async () => {
    setError("");
    setIsLoading(true);

    try {
      const success =
        mode === "password"
          ? await unlock(password)
          : await unlockWithRecovery(recoveryKey.trim());

      if (success) {
        // Bypass PIN lock since user just authenticated with password
        bypassLock();
      } else {
        setError(
          mode === "password"
            ? "Incorrect password. Please try again."
            : "Invalid recovery key. Please check and try again."
        );
        setShake(true);
        setTimeout(() => setShake(false), 500);
        if (mode === "password") {
          setPassword("");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock vault");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleUnlock();
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError("");
    setPassword("");
    setRecoveryKey("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="rounded-lg p-8 bg-card border border-border shadow-elevated">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`relative ${shake ? "animate-shake" : ""}`}>
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-sm">
                {mode === "password" ? (
                  <Lock className="h-8 w-8 text-primary" />
                ) : (
                  <Key className="h-8 w-8 text-primary" />
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-foreground mb-2">
              {mode === "password" ? "Unlock Vault" : "Recovery Mode"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "password"
                ? "Enter your password to access your vault"
                : "Enter your recovery key to unlock your vault"}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {mode === "password" ? (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your password"
                    className="pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">
                    Recovery Key
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode("password")}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back to password
                  </button>
                </div>
                <Textarea
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey && !isLoading) {
                      handleUnlock();
                    }
                  }}
                  placeholder="Paste your recovery key here"
                  className="font-mono text-sm min-h-[100px] resize-none"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Press Ctrl+Enter to unlock
                </p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div
                className={`flex items-center gap-2 text-sm text-destructive ${
                  shake ? "animate-shake" : ""
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <Button
              onClick={handleUnlock}
              disabled={
                isLoading ||
                (mode === "password" ? !password : !recoveryKey.trim())
              }
              className="w-full h-10"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Unlocking...</span>
                </div>
              ) : (
                "Unlock"
              )}
            </Button>

            {/* Switch to recovery mode */}
            {mode === "password" && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchMode("recovery")}
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                >
                  Forgot password? Use recovery key
                </button>
              </div>
            )}
          </div>

          {/* Security note */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              Protected by end-to-end encryption
            </p>
          </div>
        </div>
      </div>

      {/* CSS for shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default VaultUnlockScreen;
