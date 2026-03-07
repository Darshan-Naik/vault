import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, AlertTriangle, Shield } from "lucide-react";

type Props = {
  onUnlock: (password: string) => Promise<boolean>;
  onForgotPassword: () => void;
};

function PasswordUnlock({ onUnlock, onForgotPassword }: Props) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleUnlock = async () => {
    setError("");
    setIsLoading(true);

    try {
      const success = await onUnlock(password);

      if (!success) {
        setError("Incorrect password. Please try again.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setPassword("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock vault");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && password) {
      handleUnlock();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 bg-background overflow-y-auto">
      <div className="w-full max-w-sm my-auto">
        <div className="rounded-lg p-4 sm:p-8 bg-card border border-border shadow-elevated">
          {/* Icon */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className={`relative ${shake ? "animate-shake" : ""}`}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-sm">
                <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
              Unlock Vault
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter your password to access your vault
            </p>
          </div>

          {/* Form */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your password"
                  className="pr-10 h-9 sm:h-10 text-sm"
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

            {/* Error message */}
            {error && (
              <div
                className={`flex items-center gap-2 text-xs sm:text-sm text-destructive ${
                  shake ? "animate-shake" : ""
                }`}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <Button
              onClick={handleUnlock}
              disabled={isLoading || !password}
              className="w-full h-9 sm:h-10 text-sm"
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

            {/* Forgot password link */}
            <div className="text-center pt-1 sm:pt-2">
              <button
                type="button"
                onClick={onForgotPassword}
                disabled={isLoading}
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Forgot password? Use recovery key
              </button>
            </div>
          </div>

          {/* Security note */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              Protected by end-to-end encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordUnlock;
