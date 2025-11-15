import { useState } from "react";
import { useLock } from "../LockProvider";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { PinInput } from "@/components/ui/pin-input";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

function LockScreen() {
  const { unlock, resetLockKey } = useLock();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handlePinComplete = (value: string) => {
    setError("");
    const success = unlock(value);
    if (!success) {
      setError("Incorrect PIN. Please try again.");
      setPin("");
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
      // User will be logged out, so component will unmount
    } catch (error) {
      console.error("Failed to reset lock key:", error);
      setError("Failed to reset lock PIN. Please try again.");
      setIsResetting(false);
      setShowResetDialog(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <Lock className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-center">App Locked</CardTitle>
          <CardDescription className="text-center">
            Enter your 4-digit PIN to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <PinInput
              value={pin}
              onChange={handlePinChange}
              onComplete={handlePinComplete}
              autoFocus
            />
          </div>
        </CardContent>

        {error && (
          <p className="text-sm text-destructive text-center mt-2 mx-4">
            {error}
          </p>
        )}

        {error && error.includes("Incorrect PIN") && (
          <div className="mt-1 mb-4 text-center">
            <button
              type="button"
              onClick={() => setShowResetDialog(true)}
              className="text-sm text-destructive hover:text-foreground underline underline-offset-4"
            >
              Reset Lock PIN
            </button>
          </div>
        )}
      </Card>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <DialogTitle>Reset Lock PIN</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to reset your lock PIN? This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remove your lock PIN</li>
                <li>Log you out of your account</li>
                <li>Require you to reconfigure your lock PIN</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetLockKey}
              disabled={isResetting}
            >
              {isResetting ? "Resetting..." : "Reset & Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LockScreen;
