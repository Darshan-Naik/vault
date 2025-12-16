import Header from "./Header";
import { useAuth } from "../AuthProvider";
import { useVaults } from "@/lib/query";
import VaultList from "./VaultList";
import AddNew from "./AddNew";
import { useState } from "react";
import { TVault } from "@/lib/types";
import Vault from "./Vault";
import { Shield, Lock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Main = () => {
  const [selectedVault, setSelectedVault] = useState<TVault>();
  const [isEdit, setIsEdit] = useState(false);

  const { user } = useAuth();
  const { data: vaults, isLoading } = useVaults(user?.uid);

  const handleVaultSelect = (vault?: TVault, force?: boolean) => {
    if (isEdit && !force) {
      toast.message("Please save the changes");
      return;
    }
    setSelectedVault(vault);
    setIsEdit(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden w-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 gradient-radial pointer-events-none" />
      
      <Header />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={cn(
            "flex flex-col w-full md:w-80 lg:w-96 overflow-hidden md:border-r border-border/50",
            "bg-card/30 backdrop-blur-sm",
            selectedVault && "hidden md:flex"
          )}
        >
          {/* Sidebar header with Add button */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">My Vaults</h2>
                <p className="text-xs text-muted-foreground">
                  {vaults?.length || 0} items stored
                </p>
              </div>
            </div>
            <AddNew />
          </div>
          
          {/* Vault list */}
          <div className="flex-1 overflow-hidden">
            <VaultList
              vaults={vaults}
              isLoading={isLoading}
              handleVaultSelect={handleVaultSelect}
              selectedVault={selectedVault}
            />
          </div>
        </aside>
        
        {/* Main content area */}
        {selectedVault ? (
          <main className="flex-1 overflow-hidden animate-fade-in">
            <Vault
              vault={selectedVault}
              handleVaultSelect={handleVaultSelect}
              isEdit={isEdit}
              setIsEdit={setIsEdit}
              key={selectedVault.id}
            />
          </main>
        ) : (
          <main className="flex-1 hidden md:flex flex-col items-center justify-center p-8">
            {/* Empty state */}
            <div className="text-center max-w-md animate-fade-in">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse-slow" />
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <Shield className="w-12 h-12 text-primary/40" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Select a vault
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Choose a vault from the sidebar to view its contents, or create a new one to get started.
              </p>
              
              {/* Quick tips */}
              <div className="space-y-3 text-left">
                {[
                  { icon: Lock, text: "All data is encrypted before leaving your device" },
                  { icon: Plus, text: "Add credentials, cards, and bank details" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <tip.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default Main;
