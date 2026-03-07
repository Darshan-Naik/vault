import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

type Props = {
  recoveryKey: string;
  onResetPassword: (
    recoveryKey: string,
    newPassword: string
  ) => Promise<{ masterKey: string; newRecoveryKey: string } | null>;
  onSuccess: (masterKey: string, newRecoveryKey: string) => void;
  onBack: () => void;
  onInvalidRecoveryKey: () => void;
};

function NewPasswordStep({
  recoveryKey,
  onResetPassword,
  onSuccess,
  onBack,
  onInvalidRecoveryKey,
}: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsLoading(true);

    try {
      const result = await onResetPassword(recoveryKey, newPassword);

      if (result) {
        onSuccess(result.masterKey, result.newRecoveryKey);
      } else {
        setError("Invalid recovery key. Please check and try again.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        onInvalidRecoveryKey();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
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
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
              Set New Password
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Create a strong password for your vault
            </p>
          </div>

          {/* Form */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
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

            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2 block">
                Confirm Password
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newPassword && confirmPassword) {
                    handleSubmit();
                  }
                }}
                placeholder="Confirm new password"
                className="h-9 sm:h-10 text-sm"
              />
            </div>

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

            <Button
              onClick={handleSubmit}
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full h-9 sm:h-10 text-sm"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Resetting...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>

            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="w-full text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back to recovery key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewPasswordStep;

