import { useState } from "react";
import { useVaultKey } from "../VaultKeyProvider";
import PasswordSetupStep from "./PasswordSetupStep";
import RecoveryKeyStep from "./RecoveryKeyStep";

type Step = "password" | "recovery";

function SetupScreen() {
  const { setup } = useVaultKey();

  const [step, setStep] = useState<Step>("password");
  const [recoveryKey, setRecoveryKey] = useState("");

  const handlePasswordSetup = async (password: string) => {
    const result = await setup(password);
    setRecoveryKey(result.recoveryKey);
    setStep("recovery");
  };

  const handleRecoveryComplete = () => {
    // The vault is already unlocked after setup, this just closes the recovery screen
    // The App component will detect isUnlocked and show Main
  };

  if (step === "recovery") {
    return (
      <RecoveryKeyStep
        recoveryKey={recoveryKey}
        onComplete={handleRecoveryComplete}
      />
    );
  }

  return <PasswordSetupStep onSetup={handlePasswordSetup} />;
}

export default SetupScreen;
