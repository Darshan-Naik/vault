import Header from "./Header";
import { useAuth } from "../AuthProvider";
import { useVaults } from "@/lib/query";
import VaultList from "./VaultList";
import AddNew from "./AddNew";
import { useState } from "react";
import { TVault } from "@/lib/types";
import Vault from "./Vault";
import { Vault as VaultIcon } from "lucide-react";
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
      <div className="flex-1 flex overflow-hidden">
        <div
          className={cn(
            "flex flex-col w-full  p-4 gap-3 sm:w-80 overflow-hidden sm:border-r",
            selectedVault && "sm:flex hidden"
          )}
        >
          <AddNew />
          <VaultList
            vaults={vaults}
            isLoading={isLoading}
            handleVaultSelect={handleVaultSelect}
            selectedVault={selectedVault}
          />
        </div>
        {selectedVault ? (
          <div className="flex-1">
            <Vault
              vault={selectedVault}
              handleVaultSelect={handleVaultSelect}
              isEdit={isEdit}
              setIsEdit={setIsEdit}
              key={selectedVault.id}
            />
          </div>
        ) : (
          <div className="flex-1 justify-center items-center hidden sm:flex">
            <VaultIcon className="w-1/2 h-1/2 opacity-10" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
