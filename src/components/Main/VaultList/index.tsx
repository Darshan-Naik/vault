import { TVault } from "@/lib/types";
import VaultsSkeleton from "./VaultsSkeleton";
import VaultListItem from "./VaultListItem";
import { FileKey2 } from "lucide-react";

type VaultListProps = {
  vaults?: TVault[];
  isLoading?: boolean;
  handleVaultSelect: (Vault: TVault) => void;
  selectedVault?: TVault;
};

const VaultList = ({
  vaults,
  isLoading,
  handleVaultSelect,
  selectedVault,
}: VaultListProps) => {
  return (
    <div className="px-3 pb-4">
      {isLoading ? (
        <VaultsSkeleton />
      ) : vaults && vaults.length > 0 ? (
        <ul className="space-y-1.5">
          {vaults.map((vault) => (
            <VaultListItem
              active={selectedVault?.id === vault.id}
              key={vault.id}
              vault={vault}
              onClick={handleVaultSelect}
            />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <FileKey2 className="w-8 h-8 text-primary/50" />
          </div>
          <h4 className="font-medium text-foreground mb-1">No vaults yet</h4>
          <p className="text-sm text-muted-foreground">
            Create your first vault to start storing your secrets securely.
          </p>
        </div>
      )}
    </div>
  );
};

export default VaultList;
