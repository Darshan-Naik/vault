import { useState } from "react";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { auth } from "@/firebase";

function Auth() {
  const [error, setError] = useState<string>("");

  const provider: GoogleAuthProvider = new GoogleAuthProvider();

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center">Vault</CardTitle>
          <CardDescription className="text-center">
            Store your passwords securely
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button onClick={handleGoogleSignIn} className="w-full">
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="w-full">
          <p className=" w-full text-center text-sm italic text-muted-foreground">
            Your data is end-to-end encrypted
          </p>
        </CardFooter>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  );
}

export default Auth;
