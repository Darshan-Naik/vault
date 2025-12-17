import { TVault } from "@/lib/types";
import Credential from "./Credential";
import { iconMap } from "@/lib/configs";
import Bank from "./Bank";
import Card from "./Card";
import { ChevronLeft, Edit, Save, X, Shield } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { useUpdateVault } from "@/lib/query";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import DeleteVault from "./DeleteVault";
import { cn } from "@/lib/utils";

type VaultProps = {
  vault: TVault;
  handleVaultSelect: (vault?: TVault, force?: boolean) => void;
  isEdit: boolean;
  setIsEdit: (flag: boolean) => void;
};

const Vault = ({ vault, handleVaultSelect, isEdit, setIsEdit }: VaultProps) => {
  const [vaultData, setVaultData] = useState<TVault>(vault);
  const Icon = iconMap[vault.type];
  const { mutateAsync: updateVault, isPending } = useUpdateVault();

  const { user } = useAuth();

  const handleChange = (key: string, value: string) => {
    setVaultData((prevData: TVault | undefined) => {
      const newData = prevData ? { ...prevData } : ({} as TVault);
      (newData as TVault & { [key: string]: unknown })[key] = value;
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      await updateVault({
        userId: user?.uid as string,
        vaultId: vaultData.id,
        vaultData: { ...vaultData },
        ...vaultData,
      });
      toast.success(`${vaultData?.title.trim()} updated successfully`);
      handleVaultSelect(vaultData, true);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  // Get type label
  const typeLabels: Record<string, string> = {
    CREDENTIAL: "Login Credential",
    BANK: "Bank Account",
    CARD: "Payment Card",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" key={isEdit ? "vault-edit" : "vault"}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 md:p-6 border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          {/* Back button and title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => handleVaultSelect(undefined)}
              className="md:hidden flex-shrink-0 w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className={cn(
              "flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
            )}>
              {Icon && <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />}
            </div>
            
            <div className="min-w-0">
              {isEdit ? (
                <input
                  type="text"
                  value={vaultData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="text-lg md:text-xl font-semibold bg-transparent border-b-2 border-primary/50 focus:border-primary outline-none w-full"
                  placeholder="Vault title"
                />
              ) : (
                <h1 className="text-lg md:text-xl font-semibold truncate">
                  {vault.title}
                </h1>
              )}
              <p className="text-xs text-muted-foreground">
                {typeLabels[vault.type] || vault.type}
              </p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isEdit ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setIsEdit(false);
                        setVaultData(vault);
                      }}
                      className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Cancel</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleSave}
                      disabled={!vaultData.title.trim() || isPending}
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                        "bg-primary/20 hover:bg-primary/30 text-primary",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {isPending ? (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Save changes</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsEdit(true)}
                      className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Edit vault</TooltipContent>
                </Tooltip>
                
                <DeleteVault vault={vault} handleVaultSelect={handleVaultSelect} />
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl">
          {vaultData.type === "CREDENTIAL" && (
            <Credential
              vault={vaultData}
              isEdit={isEdit}
              handleChange={handleChange}
            />
          )}
          {vaultData.type === "BANK" && (
            <Bank vault={vaultData} isEdit={isEdit} handleChange={handleChange} />
          )}
          {vaultData.type === "CARD" && (
            <Card vault={vaultData} isEdit={isEdit} handleChange={handleChange} />
          )}
        </div>
        
        {/* Decorative icon - desktop only */}
        <div className="hidden lg:block fixed bottom-8 right-8 opacity-5 pointer-events-none">
          <Shield className="w-64 h-64" />
        </div>
      </div>
    </div>
  );
};

export default Vault;
