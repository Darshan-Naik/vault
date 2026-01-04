import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Key, Copy, Check, AlertTriangle, Timer } from "lucide-react";

type Props = {
  recoveryKey: string;
  onComplete: () => Promise<void>;
};

const LOCK_DURATION = 60; // 60 seconds

function RecoveryKeyStep({ recoveryKey, onComplete }: Props) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(LOCK_DURATION);
  const [isLocked, setIsLocked] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer - locks the screen for 60 seconds
  useEffect(() => {
    if (countdown <= 0) {
      setIsLocked(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

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

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      await onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const canContinue = !isLocked && confirmed && !isLoading;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 bg-background overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        <div className="rounded-lg p-4 sm:p-8 bg-card border border-border shadow-elevated">
          {/* Icon */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center">
              <Key className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
              Save Your Recovery Key
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              This key is the only way to recover your vault if you forget your
              password. Store it somewhere safe.
            </p>
          </div>

          {/* Timer Warning */}
          {isLocked && (
            <div className="flex items-center justify-center gap-2 p-2 sm:p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-3 sm:mb-4">
              <Timer className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-amber-500">
                Please wait {formatTime(countdown)} before continuing
              </span>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-4 sm:mb-6">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-destructive">
              <p className="font-medium mb-1">Zero-Knowledge Security</p>
              <p>
                We do not store your password or recovery key. Without this key,
                there is no way to recover your data if you forget your
                password.
              </p>
            </div>
          </div>

          {/* Recovery Key */}
          <div className="mb-4 sm:mb-6">
            <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
              Your Recovery Key
            </label>
            <div className="relative">
              <div className="p-3 sm:p-4 pr-16 sm:pr-20 rounded-lg bg-muted/50 border border-border font-mono text-xs sm:text-sm break-all select-all">
                {recoveryKey}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                onClick={handleCopyRecoveryKey}
                disabled={isLoading}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Confirmation checkbox */}
          <label
            className={`flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6 ${
              isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 sm:mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary disabled:cursor-not-allowed flex-shrink-0"
            />
            <span className="text-xs sm:text-sm text-muted-foreground">
              I have saved my recovery key in a safe place and understand that
              no one can help me recover my data without this key.
            </span>
          </label>

          {/* Continue button */}
          <Button
            onClick={handleComplete}
            disabled={!canContinue}
            className="w-full h-9 sm:h-10 text-sm"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Setting up...</span>
              </div>
            ) : isLocked ? (
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <span>Wait {formatTime(countdown)}</span>
              </div>
            ) : (
              "Continue to Vault"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RecoveryKeyStep;
