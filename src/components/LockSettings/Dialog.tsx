import { useState, useEffect, useCallback } from "react";
import { useLock } from "../LockProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PinInput } from "@/components/ui/pin-input";
import {
  Lock,
  Shield,
  AlertTriangle,
  Fingerprint,
  Scan,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getBiometricName } from "@/lib/biometric-utils";

interface LockSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ButtonLabel() {
  const { hasLockKey } = useLock();
  return <>{hasLockKey ? "Update PIN" : "Set PIN"}</>;
}

export default function LockSettingsDialog({
  open,
  onOpenChange,
}: LockSettingsDialogProps) {
  const {
    hasLockKey,
    setLockKey,
    isBiometricAvailable,
    isBiometricEnabled,
    enableBiometric,
    disableBiometric,
  } = useLock();
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  const biometricName = getBiometricName();
  const isFaceId = biometricName === "Face ID";

  const resetForm = useCallback(() => {
    setNewPin("");
    setConfirmPin("");
    setError("");
  }, []);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleSavePin = async () => {
    setError("");

    if (newPin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    if (newPin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    try {
      await setLockKey(newPin);
      toast.success(
        hasLockKey ? "PIN updated successfully" : "PIN set successfully"
      );
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save PIN");
    }
  };

  const handleConfirmPinComplete = () => {
    if (newPin.length === 4 && confirmPin.length === 4) {
      handleSavePin();
    }
  };

  const handleToggleBiometric = async () => {
    setIsBiometricLoading(true);
    setError("");

    try {
      if (isBiometricEnabled) {
        await disableBiometric();
        toast.success(`${biometricName} disabled`);
      } else {
        const success = await enableBiometric();
        if (success) {
          toast.success(`${biometricName} enabled`);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : `Failed to ${
              isBiometricEnabled ? "disable" : "enable"
            } ${biometricName}`;
      setError(message);
      toast.error(message);
    } finally {
      setIsBiometricLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center">
              <Lock className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {hasLockKey ? "Update PIN" : "Set Lock PIN"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Quick unlock when returning to the app
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground text-center block">
              {hasLockKey ? "New PIN" : "Enter PIN"}
            </label>
            <PinInput
              value={newPin}
              onChange={(value) => {
                setNewPin(value);
                setError("");
              }}
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground text-center block">
              Confirm PIN
            </label>
            <PinInput
              value={confirmPin}
              onChange={(value) => {
                setConfirmPin(value);
                setError("");
              }}
              onComplete={handleConfirmPinComplete}
            />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-sm text-destructive animate-fade-in">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Biometric toggle - only show when PIN is already set */}
          {hasLockKey && isBiometricAvailable && (
            <div className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleToggleBiometric}
                disabled={isBiometricLoading}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-card/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center">
                    {isFaceId ? (
                      <Scan className="w-4 h-4 text-foreground" />
                    ) : (
                      <Fingerprint className="w-4 h-4 text-foreground" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-foreground">
                      {biometricName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isBiometricEnabled
                        ? "Enabled"
                        : "Quick unlock with biometrics"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isBiometricLoading ? (
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : isBiometricEnabled ? (
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Info box */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your vault automatically locks when you leave the app. Use this
              PIN for quick unlock instead of entering your full password each
              time.
            </p>
          </div>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <Shield className="w-3 h-3" />
            <span>Your PIN is encrypted and stored securely</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSavePin}
              className="flex-1"
              disabled={newPin.length !== 4 || confirmPin.length !== 4}
            >
              {hasLockKey ? "Update PIN" : "Set PIN"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
