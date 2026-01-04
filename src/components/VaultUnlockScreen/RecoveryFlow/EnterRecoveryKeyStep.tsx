import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Key, ArrowLeft, AlertTriangle } from "lucide-react";

type Props = {
  onValidate: (recoveryKey: string) => Promise<boolean>;
  onSuccess: (recoveryKey: string) => void;
  onBack: () => void;
};

function EnterRecoveryKeyStep({ onValidate, onSuccess, onBack }: Props) {
  const [recoveryKey, setRecoveryKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async () => {
    if (!recoveryKey.trim()) {
      setError("Please enter your recovery key");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const isValid = await onValidate(recoveryKey.trim());

      if (isValid) {
        onSuccess(recoveryKey.trim());
      } else {
        setError("Invalid recovery key. Please check and try again.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setRecoveryKey("");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to validate recovery key"
      );
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
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center shadow-sm">
                <Key className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
              Password Recovery
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter your recovery key to reset your password
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4 sm:mb-6">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-500">
              <p className="font-medium mb-1">One-Time Use</p>
              <p>
                After resetting, your current recovery key will be invalidated.
                A new one will be generated.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">
                  Recovery Key
                </label>
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back
                </button>
              </div>
              <Textarea
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleSubmit();
                  }
                }}
                placeholder="Paste your recovery key here"
                className="font-mono text-xs sm:text-sm min-h-[80px] sm:min-h-[100px] resize-none"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1.5 sm:mt-2 hidden sm:block">
                Press Ctrl+Enter to continue
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!recoveryKey.trim() || isLoading}
              className="w-full h-9 sm:h-10 text-sm"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Validating...</span>
                </div>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnterRecoveryKeyStep;
