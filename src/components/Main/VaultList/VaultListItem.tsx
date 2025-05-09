import { iconMap } from "@/lib/configs";
import { TVault } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

type VaultListItemProps = {
  vault: TVault;
  onClick: (vault: TVault) => void;
  active?: boolean;
};

const VaultListItem = ({ vault, onClick, active }: VaultListItemProps) => {
  const Icon = iconMap[vault.type];
  return (
    <li key={vault.id}>
      <button
        onClick={() => onClick(vault)}
        className={cn(
          "group text-left w-full rounded-md border px-2 py-1 flex items-center gap-2 transition-color shadow-sm",
          active && "border-white"
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span className="flex-1 truncate">{vault.title}</span>
        <ChevronRight
          className={cn(
            "h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity",
            active && "opacity-100"
          )}
        />
      </button>
    </li>
  );
};

export default VaultListItem;
