import { useState } from "react";
import { useVaultKey } from "../VaultKeyProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Eye,
  EyeOff,
  Key,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";

type Step = "password" | "recovery";

function SetupScreen() {
  const { setup } = useVaultKey();

  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
      return "Password must be at least 8 characters";
    }
    return "";
  };

  const handleSetup = async () => {
    setError("");

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const result = await setup(password);
      setRecoveryKey(result.recoveryKey);
      setStep("recovery");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to setup vault");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRecoveryKey = async () => {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = recoveryKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (step === "recovery") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <div className="rounded-lg p-8 bg-card border border-border shadow-elevated">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center">
                <Key className="h-8 w-8 text-amber-500" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Save Your Recovery Key
              </h1>
              <p className="text-sm text-muted-foreground">
                This key is the only way to recover your vault if you forget
                your password. Store it somewhere safe.
              </p>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-6">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">
                <p className="font-medium mb-1">Important</p>
                <p>
                  Without this key, you cannot recover your data if you forget
                  your password. We cannot help you.
                </p>
              </div>
            </div>

            {/* Recovery Key */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Your Recovery Key
              </label>
              <div className="relative">
                <div className="p-4 rounded-lg bg-muted/50 border border-border font-mono text-sm break-all select-all">
                  {recoveryKey}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleCopyRecoveryKey}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Confirmation checkbox */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">
                I have saved my recovery key in a safe place. I understand that
                I cannot recover my data without it.
              </span>
            </label>

            {/* Continue button */}
            <Button
              onClick={() => {
                /* Already unlocked after setup */
              }}
              disabled={!confirmed}
              className="w-full h-10"
            >
              Continue to Vault
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="rounded-lg p-8 bg-card border border-border shadow-elevated">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-sm">
              <Shield className="h-7 w-7 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Create Vault Password
            </h1>
            <p className="text-sm text-muted-foreground">
              This password protects all your vault data with end-to-end
              encryption
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Password field */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  className="pr-10"
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

            {/* Confirm password field */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <Button
              onClick={handleSetup}
              disabled={isLoading || !password || !confirmPassword}
              className="w-full h-10"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Setting up...</span>
                </div>
              ) : (
                "Create Vault"
              )}
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-center text-muted-foreground mt-6">
            Your password never leaves your device. We use PBKDF2 with 310,000
            iterations for key derivation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SetupScreen;
