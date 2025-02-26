import { TVault } from "@/lib/types";
import Credential from "./Credential";
import { iconMap } from "@/lib/configs";
import Bank from "./Bank";
import Card from "./Card";
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

type VaultProps = {
  vault: TVault;
  handleVaultSelect: (vault?: TVault, force?: boolean) => void;
  isEdit: boolean;
  setIsEdit: (flag: boolean) => void;
};
const Vault = ({ vault, handleVaultSelect, isEdit, setIsEdit }: VaultProps) => {
  const [vaultData, setVaultData] = useState<TVault>(vault);
  const Icon = iconMap[vault.type];
  const { mutateAsync: updateVault } = useUpdateVault();

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
      className="flex-1 sm:px-8 px-4 py-2"
      key={isEdit ? "vault-edit" : "vault"}
    >
      <div className="border-b w-full mb-4 p-2 items-center flex justify-between">
        <div className="flex items-center gap-2">
          <ChevronLeft
            className="h-5 w-5 sm:hidden"
            onClick={() => handleVaultSelect(undefined)}
          />
          <p
            className="font-medium text-xl"
            contentEditable={isEdit}
            onInput={(e) => {
              handleChange("title", e.currentTarget.textContent || "");
            }}
            suppressContentEditableWarning={true}
          >
            {vault.title}
          </p>
        </div>
        <div className="flex gap-4">
          {isEdit ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      setIsEdit(false);
                      setVaultData(vault);
                    }}
                    disabled={!vaultData.title.trim()}
                    className="disabled:opacity-20"
                  >
                    <X className="w-5 h-5 text-secondary-foreground opacity-70 hover:opacity-100 transition-opacity" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-md">Cancel</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleSave}
                    disabled={!vaultData.title.trim()}
                    className="disabled:opacity-20"
                  >
                    <Save className="w-5 h-5 text-secondary-foreground opacity-70 hover:opacity-100 transition-opacity" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-md">Save</p>
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setIsEdit(true)}>
                  <Edit className="w-5 h-5 text-secondary-foreground opacity-70 hover:opacity-100 transition-opacity" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-md">Edit</p>
              </TooltipContent>
            </Tooltip>
          )}
          {!isEdit && (
            <DeleteVault vault={vault} handleVaultSelect={handleVaultSelect} />
          )}
        </div>
      </div>
      <div className="flex justify-between flex-wrap">
        {vault.type === "CREDENTIAL" && (
          <Credential
            vault={vault}
            isEdit={isEdit}
            handleChange={handleChange}
          />
        )}
        {vault.type === "BANK" && (
          <Bank vault={vault} isEdit={isEdit} handleChange={handleChange} />
        )}
        {vault.type === "CARD" && (
          <Card vault={vault} isEdit={isEdit} handleChange={handleChange} />
        )}
        <Icon className="p-20 w-80 h-80 opacity-20 sm:block hidden" />
      </div>
    </div>
  );
};

export default Vault;
