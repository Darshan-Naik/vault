import { useState, useEffect } from "react";
import { useLock } from "../LockProvider";
import { PinInput } from "@/components/ui/pin-input";
import {
  Lock,
  Shield,
  AlertTriangle,
  KeyRound,
  Fingerprint,
  Scan,
} from "lucide-react";
import { getBiometricName } from "@/lib/biometric-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function LockScreen() {
  const { unlock, resetLockKey, isBiometricEnabled, unlockWithBiometric } =
    useLock();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [shake, setShake] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  const biometricName = getBiometricName();
  const isFaceId = biometricName === "Face ID";

  // Check if device is mobile (auto-trigger biometric only on mobile)
  const isMobileDevice = () => {
    return /iphone|ipad|android|mobile/i.test(navigator.userAgent);
  };

  // Auto-trigger biometric on mount only on mobile devices
  useEffect(() => {
    if (isBiometricEnabled && isMobileDevice()) {
      handleBiometricUnlock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBiometricUnlock = async () => {
    if (!isBiometricEnabled || isBiometricLoading) return;

    setIsBiometricLoading(true);
    setError("");

    try {
      const success = await unlockWithBiometric();
      if (!success) {
        setError(
          `${biometricName} authentication failed. Please use your PIN.`
        );
      }
    } catch {
      setError(`${biometricName} authentication failed. Please use your PIN.`);
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handlePinComplete = (value: string) => {
    setError("");
    const success = unlock(value);
    if (!success) {
      setError("Incorrect PIN. Please try again.");
      setPin("");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handlePinChange = (value: string) => {
    setPin(value);
    setError("");
  };

  const handleResetLockKey = async () => {
    setIsResetting(true);
    try {
      await resetLockKey();
    } catch (error) {
      console.error("Failed to reset lock key:", error);
      setError("Failed to reset lock PIN. Please try again.");
      setIsResetting(false);
      setShowResetDialog(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 gradient-radial" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 opacity-10 hidden md:block">
        <Shield className="w-32 h-32 text-primary animate-pulse-slow" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-10 hidden md:block">
        <KeyRound
          className="w-24 h-24 text-primary animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-2xl blur-xl" />

        <div className="relative rounded-2xl p-8 vault-glow bg-card/80 backdrop-blur-xl border border-border/50">
          {/* Lock icon with pulse */}
          <div className="flex justify-center mb-6">
            <div className={`relative ${shake ? "animate-shake" : ""}`}>
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
                <Lock className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Vault Locked
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your 4-digit PIN to unlock
            </p>
          </div>

          {/* PIN Input */}
          <div
            className={`transition-all duration-300 ${
              shake ? "animate-shake" : ""
            }`}
          >
            <PinInput
              value={pin}
              onChange={handlePinChange}
              onComplete={handlePinComplete}
              autoFocus={!isBiometricEnabled}
            />
          </div>

          {/* Biometric unlock button */}
          {isBiometricEnabled && (
            <div className="mt-6 flex flex-col items-center gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/50 w-16" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  or
                </span>
                <div className="h-px flex-1 bg-border/50 w-16" />
              </div>
              <button
                type="button"
                onClick={handleBiometricUnlock}
                disabled={isBiometricLoading}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="relative">
                  {isBiometricLoading ? (
                    <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : isFaceId ? (
                    <Scan className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                  ) : (
                    <Fingerprint className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                  )}
                </div>
                <span className="text-sm font-medium text-primary">
                  {isBiometricLoading ? "Verifying..." : `Use ${biometricName}`}
                </span>
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-destructive animate-fade-in">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Reset link */}
          {error && error.includes("Incorrect PIN") && (
            <div className="mt-4 text-center animate-fade-in">
              <button
                type="button"
                onClick={() => setShowResetDialog(true)}
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
              >
                Forgot your PIN? Reset it
              </button>
            </div>
          )}

          {/* Security note */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              Protected by end-to-end encryption
            </p>
          </div>
        </div>
      </div>

      {/* Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle className="text-xl">Reset Lock PIN</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              <span className="block mb-3">
                Are you sure you want to reset your lock PIN? This will:
              </span>
              <ul className="space-y-2">
                {[
                  "Remove your current lock PIN",
                  "Log you out of your account",
                  "Require you to set up a new PIN",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                    {item}
                  </li>
                ))}
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              disabled={isResetting}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetLockKey}
              disabled={isResetting}
            >
              {isResetting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                  Resetting...
                </div>
              ) : (
                "Reset & Logout"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

export default LockScreen;
