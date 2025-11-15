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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";

function LockScreen() {
  const { unlock } = useLock();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

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
          <Alert variant="destructive" className="mt-4 mx-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  );
}

export default LockScreen;

