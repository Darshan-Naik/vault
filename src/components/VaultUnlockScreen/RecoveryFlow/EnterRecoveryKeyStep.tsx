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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="rounded-lg p-8 bg-card border border-border shadow-elevated">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`relative ${shake ? "animate-shake" : ""}`}>
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center shadow-sm">
                <Key className="h-8 w-8 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-foreground mb-2">
              Password Recovery
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your recovery key to reset your password
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-500">
              <p className="font-medium mb-1">One-Time Use</p>
              <p>
                After resetting your password, your current recovery key will be
                invalidated. A new recovery key will be generated that you must
                save.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">
                  Recovery Key
                </label>
                <button
                  type="button"
                  onClick={onBack}
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
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleSubmit();
                  }
                }}
                placeholder="Paste your recovery key here"
                className="font-mono text-sm min-h-[100px] resize-none"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                Press Ctrl+Enter to continue
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!recoveryKey.trim() || isLoading}
              className="w-full h-10"
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
