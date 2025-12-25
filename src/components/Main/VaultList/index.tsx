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
    <div>
      {isLoading ? (
        <VaultsSkeleton />
      ) : vaults && vaults.length > 0 ? (
        <ul className="space-y-1">
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
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-lg bg-card border border-border flex items-center justify-center mb-3">
            <FileKey2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-medium text-foreground mb-1">No vaults yet</h4>
          <p className="text-xs text-muted-foreground">
            Create your first vault to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default VaultList;
