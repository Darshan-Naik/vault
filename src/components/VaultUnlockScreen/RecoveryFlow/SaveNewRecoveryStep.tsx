import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Timer, AlertTriangle, Shield } from "lucide-react";

type Props = {
  newRecoveryKey: string;
  masterKey: string;
  onComplete: (masterKey: string) => void;
};

const LOCK_DURATION = 60; // 60 seconds

function SaveNewRecoveryStep({ newRecoveryKey, masterKey, onComplete }: Props) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(LOCK_DURATION);
  const [isLocked, setIsLocked] = useState(true);

  // Countdown timer
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyRecoveryKey = async () => {
    try {
      await navigator.clipboard.writeText(newRecoveryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = newRecoveryKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleComplete = () => {
    onComplete(masterKey);
  };

  const canContinue = !isLocked && confirmed;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="rounded-lg p-8 bg-card border border-border shadow-elevated">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-foreground mb-2">
              Password Reset Successful
            </h1>
            <p className="text-sm text-muted-foreground">
              Your password has been reset. Save your new recovery key below.
            </p>
          </div>

          {/* Timer Warning */}
          {isLocked && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
              <Timer className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-500">
                Please wait {formatTime(countdown)} before continuing
              </span>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-6">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">
              <p className="font-medium mb-1">Critical: Save This Key Now</p>
              <p>
                Your old recovery key is now invalid. This new key is the only
                way to recover your vault if you forget your password. Store it
                in a secure location.
              </p>
            </div>
          </div>

          {/* Recovery Key */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Your New Recovery Key
            </label>
            <div className="relative">
              <div className="p-4 rounded-lg bg-muted/50 border border-border font-mono text-sm break-all select-all">
                {newRecoveryKey}
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
              I have saved my new recovery key in a safe place. I understand
              that my old recovery key is now invalid and cannot be used.
            </span>
          </label>

          {/* Continue button */}
          <Button
            onClick={handleComplete}
            disabled={!canContinue}
            className="w-full h-10"
          >
            {isLocked ? (
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <span>Wait {formatTime(countdown)}</span>
              </div>
            ) : (
              "Continue to Vault"
            )}
          </Button>

          {/* Security note */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              Your vault is now protected with your new password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SaveNewRecoveryStep;

