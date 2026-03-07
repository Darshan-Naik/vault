import { createContext } from "react";

export type SetupResult = {
  recoveryKey: string;
  masterKey: string;
};

export type ResetPasswordResult = {
  masterKey: string;
  newRecoveryKey: string;
};

export type VaultKeyContextType = {
  // State
  isLoading: boolean;
  isSetup: boolean; // Whether user has set up their vault password
  isUnlocked: boolean; // Whether vault is currently unlocked (master key in memory)
  masterKey: string | null;

  // Actions
  setup: (password: string) => Promise<SetupResult>;
  confirmSetup: (masterKey: string) => Promise<void>; // Called after user saves recovery key
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;

  // Password & Recovery Key Management
  changePassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  resetRecoveryKey: (password: string) => Promise<string | null>;

  // Password Reset with Recovery Key (forgot password flow)
  // Returns new recovery key on success, does NOT set master key (user must save recovery key first)
  resetPasswordWithRecovery: (
    recoveryKey: string,
    newPassword: string
  ) => Promise<ResetPasswordResult | null>;

  // Called after user saves recovery key during password reset flow
  confirmPasswordReset: (masterKey: string) => void;

  // Validate recovery key without unlocking
  validateRecoveryKey: (recoveryKey: string) => Promise<boolean>;
};

export const VaultKeyContext = createContext<VaultKeyContextType>({
  isLoading: true,
  isSetup: false,
  isUnlocked: false,
  masterKey: null,
  setup: async () => ({ recoveryKey: "", masterKey: "" }),
  confirmSetup: async () => {},
  unlock: async () => false,
  lock: () => {},
  changePassword: async () => false,
  resetRecoveryKey: async () => null,
  resetPasswordWithRecovery: async () => null,
  confirmPasswordReset: () => {},
  validateRecoveryKey: async () => false,
});
