import { useState } from "react";
import { useVaultKey } from "../VaultKeyProvider";
import PasswordSetupStep from "./PasswordSetupStep";
import RecoveryKeyStep from "./RecoveryKeyStep";

type Step = "password" | "recovery";

function SetupScreen() {
  const { setup, confirmSetup } = useVaultKey();

  const [step, setStep] = useState<Step>("password");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [masterKey, setMasterKey] = useState("");

  const handlePasswordSetup = async (password: string) => {
    const result = await setup(password);
    // Store keys temporarily - state won't be set until user confirms
    setRecoveryKey(result.recoveryKey);
    setMasterKey(result.masterKey);
    setStep("recovery");
  };

  const handleRecoveryComplete = async () => {
    // Now that user has saved their recovery key, confirm the setup
    // This sets userMeta and masterKey in the provider
    await confirmSetup(masterKey);
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
