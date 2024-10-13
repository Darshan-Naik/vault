import { TVault } from "@/lib/types";
import VaultsSkeleton from "./VaultsSkeleton";
import VaultListItem from "./VaultListItem";

type VaultListProps = {
  vaults?: TVault[];
  isLoading?: boolean;
  handleVaultSelect: (Vault: TVault) => void;
};

const VaultList = ({
  vaults,
  isLoading,
  handleVaultSelect,
}: VaultListProps) => {
  return (
    <div className="overflow-y-auto flex-1">
      <ul className="space-y-2">
        {isLoading ? (
          <VaultsSkeleton />
        ) : vaults && vaults.length > 0 ? (
          vaults.map((vault) => (
            <VaultListItem
              key={vault.id}
              vault={vault}
              onClick={handleVaultSelect}
            />
          ))
        ) : (
          <li className="text-gray-500 text-center">It's empty here</li>
        )}
      </ul>
    </div>
  );
};

export default VaultList;
