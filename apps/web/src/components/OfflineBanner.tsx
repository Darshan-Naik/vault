import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] border-t border-border bg-card/95 backdrop-blur-md px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <WifiOff className="h-3.5 w-3.5 text-foreground" />
        <span>Working on this device. Changes will sync when you're back online.</span>
      </div>
    </div>
  );
}
