import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { toast } from "sonner";

export default function PWAInstallButton() {
  const { isInstallable, install } = usePWAInstall();

  if (!isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      toast.success("App installation started!");
    } else {
      toast.error("Installation was cancelled");
    }
  };

  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      className="w-full justify-start"
    >
      <Download className="h-4 w-4 mr-2" />
      Install App
    </Button>
  );
}

