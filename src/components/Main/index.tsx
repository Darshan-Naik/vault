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
      <Header />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={cn(
            "flex flex-col w-full md:w-72 lg:w-80 overflow-hidden md:border-r border-border",
            "bg-background",
            selectedVault && "hidden md:flex"
          )}
        >
          {/* Sidebar header with Add button */}
          <div className="px-6 py-5 space-y-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground tracking-tight">Vaults</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {vaults?.length || 0} items
                </p>
              </div>
            </div>
            <AddNew />
          </div>
          
          {/* Vault list */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
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
          <main className="flex-1 overflow-hidden">
            <Vault
              vault={selectedVault}
              handleVaultSelect={handleVaultSelect}
              isEdit={isEdit}
              setIsEdit={setIsEdit}
              key={selectedVault.id}
            />
          </main>
        ) : (
          <main className="flex-1 hidden md:flex flex-col items-center justify-center p-12">
            {/* Empty state */}
            <div className="text-center max-w-sm">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-card border border-border mb-6">
                <Shield className="w-8 h-8 text-muted-foreground" />
              </div>
              
              <h3 className="text-lg font-medium text-foreground mb-2">
                Select a vault
              </h3>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                Choose a vault from the sidebar to view its contents, or create a new one to get started.
              </p>
              
              {/* Quick tips */}
              <div className="space-y-4 text-left">
                {[
                  { icon: Lock, text: "All data is encrypted before leaving your device" },
                  { icon: Plus, text: "Add credentials, cards, and bank details" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-md bg-card border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                      <tip.icon className="w-3 h-3 text-foreground" />
                    </div>
                    <span className="leading-relaxed">{tip.text}</span>
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
