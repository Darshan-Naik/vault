import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/components/AuthProvider/Provider.tsx";
import { LockProvider } from "@/components/LockProvider";
import QueryProvider from "@/components/QueryProvider/index.tsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <LockProvider>
        <QueryProvider>
          <TooltipProvider>
            <div className="h-screen bg-gray-100 w-screen overflow-hidden">
              <App />
              <Toaster />
            </div>
          </TooltipProvider>
        </QueryProvider>
      </LockProvider>
    </AuthProvider>
  </StrictMode>
);
