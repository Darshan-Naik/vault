import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Settings } from "lucide-react";
import { toast } from "sonner";

interface LockSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ButtonLabel() {
  const { hasLockKey } = useLock();
  return (
    <>
      <Settings className="h-4 w-4 mr-2" />
      {hasLockKey ? "Update PIN" : "Set PIN"}
    </>
  );
}

export default function LockSettingsDialog({
  open,
  onOpenChange,
}: LockSettingsDialogProps) {
  const { hasLockKey, setLockKey, updateLockKey } = useLock();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setError("");
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSetPin = async () => {
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
      toast.success("PIN set successfully");
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set PIN");
    }
  };

  const handleUpdatePin = async () => {
    setError("");

    if (currentPin.length !== 4) {
      setError("Please enter your current 4-digit PIN");
      return;
    }

    if (newPin.length !== 4) {
      setError("New PIN must be exactly 4 digits");
      return;
    }

    if (newPin !== confirmPin) {
      setError("New PINs do not match");
      return;
    }

    try {
      const success = await updateLockKey(currentPin, newPin);
      if (!success) {
        setError("Current PIN is incorrect");
        setCurrentPin("");
        return;
      }

      toast.success("PIN updated successfully");
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update PIN");
    }
  };

  const handleNewPinComplete = () => {
    // Auto-submit if updating and current pin is already entered
    if (hasLockKey && currentPin.length === 4 && confirmPin.length === 4) {
      handleUpdatePin();
    }
  };

  const handleConfirmPinComplete = () => {
    if (hasLockKey) {
      if (currentPin.length === 4) {
        handleUpdatePin();
      }
    } else {
      handleSetPin();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {hasLockKey ? "Update PIN" : "Set PIN"}
          </DialogTitle>
          <DialogDescription>
            {hasLockKey
              ? "Enter your current PIN and set a new one"
              : "Set a 4-digit PIN to secure your app when it goes to background"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {hasLockKey && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-center block">
                Current PIN
              </label>
              <PinInput
                value={currentPin}
                onChange={(value) => {
                  setCurrentPin(value);
                  setError("");
                }}
                autoFocus
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-center block">
              {hasLockKey ? "New PIN" : "PIN"}
            </label>
            <PinInput
              value={newPin}
              onChange={(value) => {
                setNewPin(value);
                setError("");
              }}
              onComplete={handleNewPinComplete}
              autoFocus={!hasLockKey}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-center block">
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
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
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
              onClick={hasLockKey ? handleUpdatePin : handleSetPin}
              className="flex-1"
              disabled={
                newPin.length !== 4 ||
                confirmPin.length !== 4 ||
                (hasLockKey && currentPin.length !== 4)
              }
            >
              {hasLockKey ? "Update" : "Set"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

