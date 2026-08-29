import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function VaultUnavailableScreen() {
  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-card border border-border mb-5">
          <WifiOff className="w-6 h-6 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-semibold text-foreground mb-2">
          This device doesn't have a local vault yet
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {isOnline
            ? "We're having trouble loading your encrypted vault. Check your connection and try again."
            : "Connect once so this device can store your vault locally. After that, Vault is offline-first — every feature works without a network."}
        </p>
      </div>
    </div>
  );
}
