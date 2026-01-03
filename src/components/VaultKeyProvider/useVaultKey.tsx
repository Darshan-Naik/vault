import { useContext } from "react";
import { VaultKeyContext } from "./Context";

export function useVaultKey() {
  const context = useContext(VaultKeyContext);
  if (!context) {
    throw new Error("useVaultKey must be used within a VaultKeyProvider");
  }
  return context;
}
