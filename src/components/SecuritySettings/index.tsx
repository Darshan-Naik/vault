import { useState, useEffect } from "react";
import { useVaultKey } from "../VaultKeyProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  EyeOff,
  Key,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  Shield,
  Timer,
} from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Tab = "password" | "recovery";

const LOCK_DURATION = 30; // 30 seconds

function SecuritySettings({ open, onOpenChange }: Props) {
  const { changePassword, resetRecoveryKey } = useVaultKey();

  const [tab, setTab] = useState<Tab>("password");

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Recovery key state
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);
  const [newRecoveryKey, setNewRecoveryKey] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [isResettingRecovery, setIsResettingRecovery] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // 60-second lock for recovery key
  const [countdown, setCountdown] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Countdown timer for recovery key lock
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

  const resetPasswordForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const resetRecoveryForm = () => {
    setRecoveryPassword("");
    setNewRecoveryKey("");
    setRecoveryError("");
    setShowRecoveryPassword(false);
    setCopied(false);
    setConfirmed(false);
    setCountdown(0);
    setIsLocked(false);
  };

  const handleClose = () => {
    // Prevent closing if recovery key is shown and locked
    if (newRecoveryKey && isLocked) {
      return;
    }
    resetPasswordForm();
    resetRecoveryForm();
    onOpenChange(false);
  };

  const handleChangePassword = async () => {
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const success = await changePassword(oldPassword, newPassword);
      if (success) {
        toast.success("Password changed successfully");
        resetPasswordForm();
        onOpenChange(false);
      } else {
        setPasswordError("Incorrect current password");
      }
    } catch {
      setPasswordError("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleResetRecoveryKey = async () => {
    setRecoveryError("");

    setIsResettingRecovery(true);

    try {
      const newKey = await resetRecoveryKey(recoveryPassword);
      if (newKey) {
        setNewRecoveryKey(newKey);
        // Start 60-second lock
        setCountdown(LOCK_DURATION);
        setIsLocked(true);
      } else {
        setRecoveryError("Incorrect password");
      }
    } catch {
      setRecoveryError("Failed to reset recovery key");
    } finally {
      setIsResettingRecovery(false);
    }
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

  const handleFinishRecoveryReset = () => {
    toast.success("Recovery key has been reset");
    resetRecoveryForm();
    onOpenChange(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const canFinishRecovery = !isLocked && confirmed;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          // Prevent closing by clicking outside if recovery key is shown and locked
          if (newRecoveryKey && isLocked) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing by escape key if recovery key is shown and locked
          if (newRecoveryKey && isLocked) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center">
              <Shield className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <DialogTitle className="text-lg">Security Settings</DialogTitle>
              <DialogDescription className="text-sm">
                Manage your vault password and recovery key
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs - hide when showing recovery key */}
        {!newRecoveryKey && (
          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
            <button
              onClick={() => {
                setTab("password");
                resetRecoveryForm();
              }}
              disabled={isChangingPassword || isResettingRecovery}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                tab === "password"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="w-4 h-4" />
              Password
            </button>
            <button
              onClick={() => {
                setTab("recovery");
                resetPasswordForm();
              }}
              disabled={isChangingPassword || isResettingRecovery}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                tab === "recovery"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Key className="w-4 h-4" />
              Recovery Key
            </button>
          </div>
        )}

        {/* Password Tab */}
        {tab === "password" && (
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showOldPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 chars)"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span>{passwordError}</span>
              </div>
            )}

            <Button
              onClick={handleChangePassword}
              disabled={
                isChangingPassword ||
                !oldPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="w-full"
            >
              {isChangingPassword ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Changing...
                </div>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        )}

        {/* Recovery Key Tab */}
        {tab === "recovery" && (
          <div className="space-y-4 py-2">
            {!newRecoveryKey ? (
              <>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-500">
                    <p className="font-medium mb-1">Warning</p>
                    <p>
                      Resetting your recovery key will invalidate your current
                      one. Make sure to save the new key securely.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Enter Password to Reset Recovery Key
                  </label>
                  <div className="relative">
                    <Input
                      type={showRecoveryPassword ? "text" : "password"}
                      value={recoveryPassword}
                      onChange={(e) => setRecoveryPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowRecoveryPassword(!showRecoveryPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showRecoveryPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {recoveryError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{recoveryError}</span>
                  </div>
                )}

                <Button
                  onClick={handleResetRecoveryKey}
                  disabled={isResettingRecovery || !recoveryPassword}
                  className="w-full"
                >
                  {isResettingRecovery ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    "Generate New Recovery Key"
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* Timer Warning */}
                {isLocked && (
                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Timer className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-500">
                      Please wait {formatTime(countdown)} before closing
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-destructive">
                    <p className="font-medium mb-1">Zero-Knowledge Security</p>
                    <p>
                      Save this key now. It will not be shown again. We do not
                      store your recovery key. Without it, you cannot recover
                      your vault if you forget your password.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Your New Recovery Key
                  </label>
                  <div className="relative">
                    <div className="p-3 rounded-lg bg-muted/50 border border-border font-mono text-sm break-all select-all">
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

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    I have saved my new recovery key in a safe place.
                  </span>
                </label>

                <Button
                  onClick={handleFinishRecoveryReset}
                  disabled={!canFinishRecovery}
                  className="w-full"
                >
                  {isLocked ? (
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      <span>Wait {formatTime(countdown)}</span>
                    </div>
                  ) : (
                    "Done"
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SecuritySettings;
