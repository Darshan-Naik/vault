import { useState } from "react";
import EnterRecoveryKeyStep from "./EnterRecoveryKeyStep";
import NewPasswordStep from "./NewPasswordStep";
import SaveNewRecoveryStep from "./SaveNewRecoveryStep";

type Step = "recovery-key" | "new-password" | "save-new-recovery";

type Props = {
  onValidateRecoveryKey: (recoveryKey: string) => Promise<boolean>;
  onResetPassword: (
    recoveryKey: string,
    newPassword: string
  ) => Promise<{ masterKey: string; newRecoveryKey: string } | null>;
  onComplete: (masterKey: string) => void;
  onBack: () => void;
};

function RecoveryFlow({
  onValidateRecoveryKey,
  onResetPassword,
  onComplete,
  onBack,
}: Props) {
  const [step, setStep] = useState<Step>("recovery-key");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newRecoveryKey, setNewRecoveryKey] = useState("");
  const [masterKey, setMasterKey] = useState("");

  const handleRecoveryKeyValidated = (validatedKey: string) => {
    setRecoveryKey(validatedKey);
    setStep("new-password");
  };

  const handlePasswordResetSuccess = (
    newMasterKey: string,
    generatedRecoveryKey: string
  ) => {
    setMasterKey(newMasterKey);
    setNewRecoveryKey(generatedRecoveryKey);
    setStep("save-new-recovery");
  };

  const handleInvalidRecoveryKey = () => {
    setRecoveryKey("");
    setStep("recovery-key");
  };

  const handleBackToRecoveryKey = () => {
    setStep("recovery-key");
  };

  if (step === "recovery-key") {
    return (
      <EnterRecoveryKeyStep
        onValidate={onValidateRecoveryKey}
        onSuccess={handleRecoveryKeyValidated}
        onBack={onBack}
      />
    );
  }

  if (step === "new-password") {
    return (
      <NewPasswordStep
        recoveryKey={recoveryKey}
        onResetPassword={onResetPassword}
        onSuccess={handlePasswordResetSuccess}
        onBack={handleBackToRecoveryKey}
        onInvalidRecoveryKey={handleInvalidRecoveryKey}
      />
    );
  }

  return (
    <SaveNewRecoveryStep
      newRecoveryKey={newRecoveryKey}
      masterKey={masterKey}
      onComplete={onComplete}
    />
  );
}

export default RecoveryFlow;
