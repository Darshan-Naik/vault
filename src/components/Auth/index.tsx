import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { auth } from "@/firebase";
import { Shield, Lock, KeyRound } from "lucide-react";

function Auth() {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const provider: GoogleAuthProvider = new GoogleAuthProvider();

  const handleGoogleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 gradient-radial" />

      {/* Floating decorative elements */}
      <div className="absolute top-1/4 left-1/4 opacity-20 animate-float hidden sm:block">
        <Lock
          className="w-16 h-16 text-primary"
          style={{ animationDelay: "0s" }}
        />
      </div>
      <div
        className="absolute top-1/3 right-1/4 opacity-15 animate-float hidden sm:block"
        style={{ animationDelay: "1s" }}
      >
        <Shield className="w-20 h-20 text-primary" />
      </div>
      <div
        className="absolute bottom-1/4 left-1/3 opacity-10 animate-float hidden sm:block"
        style={{ animationDelay: "2s" }}
      >
        <KeyRound className="w-14 h-14 text-primary" />
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-2xl blur-xl" />

        <div className="relative rounded-2xl p-8 md:p-10 vault-glow bg-card/80 backdrop-blur-xl border border-border/50">
          {/* Logo and branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-6 pulse-glow">
              <Shield className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">
              Vault
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Your secrets, secured with end-to-end encryption
            </p>
          </div>

          {/* Sign in button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-300 hover:shadow-glow"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </div>
            )}
          </Button>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 animate-slide-in-left">
          <Alert
            variant="destructive"
            className="bg-card border-destructive/50"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}

export default Auth;
