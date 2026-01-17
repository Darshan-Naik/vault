import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "@/components/AuthProvider/Provider.tsx";
import { VaultKeyProvider } from "@/components/VaultKeyProvider";
import { LockProvider } from "@/components/LockProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { registerSW } from "virtual:pwa-register";


registerSW({
  immediate: false, 
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <VaultKeyProvider>
        <LockProvider>
          <TooltipProvider>
            <div className="h-screen bg-gray-100 w-screen overflow-hidden">
              <App />
              <Toaster />
            </div>
          </TooltipProvider>
        </LockProvider>
      </VaultKeyProvider>
    </AuthProvider>
  </StrictMode>
);
