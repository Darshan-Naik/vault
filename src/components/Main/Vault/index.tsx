import { TVault } from "@/lib/types";
import { iconMap, typeLabels } from "@/lib/configs";
import ConfiguredVaultView from "./ConfiguredVaultView";
import { ChevronLeft, Edit, Save, X } from "lucide-react";
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

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      key={isEdit ? "vault-edit" : "vault"}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          {/* Back button and title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => handleVaultSelect(undefined)}
              className="md:hidden flex-shrink-0 w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-card/80 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div
              className={cn(
                "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
                "bg-card border border-border shadow-sm"
              )}
            >
              {Icon && <Icon className="h-4 w-4 text-foreground" />}
            </div>

            <div className="min-w-0">
              {isEdit ? (
                <input
                  type="text"
                  value={vaultData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="text-base font-semibold bg-transparent border-b border-primary/50 focus:border-primary outline-none w-full pb-1"
                  placeholder="Vault title"
                />
              ) : (
                <h1 className="text-base font-semibold truncate">
                  {vault.title}
                </h1>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {typeLabels[vault.type] || vault.type}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {isEdit ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setIsEdit(false);
                        setVaultData(vault);
                      }}
                      className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-card/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
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
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        "bg-primary hover:bg-primary/90 text-primary-foreground",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {isPending ? (
                        <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
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
                      className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-card/80 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Edit vault</TooltipContent>
                </Tooltip>

                <DeleteVault
                  vault={vault}
                  handleVaultSelect={handleVaultSelect}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content - rendered from config */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl">
          <ConfiguredVaultView
            vault={vaultData}
            isEdit={isEdit}
            handleChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Vault;
