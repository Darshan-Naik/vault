import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from "@/components/AuthProvider/Provider.tsx";
import { VaultKeyProvider } from "@/components/VaultKeyProvider";
import { LockProvider } from "@/components/LockProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { registerSW } from "virtual:pwa-register";


registerSW({
  immediate: true,
});

function AppShell() {
  const isOnline = useOnlineStatus();

  return (
    <div className={`min-h-screen bg-background w-full ${isOnline ? "" : "pb-12"}`}>
      <RouterProvider router={router} />
      <Toaster />
      <OfflineBanner />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <VaultKeyProvider>
        <LockProvider>
          <TooltipProvider>
            <AppShell />
          </TooltipProvider>
        </LockProvider>
      </VaultKeyProvider>
    </AuthProvider>
  </StrictMode>
);
