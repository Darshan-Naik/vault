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

  // Get type label for subtitle
  const typeLabels: Record<string, string> = {
    CREDENTIAL: "Login Credential",
    BANK: "Bank Account",
    CARD: "Payment Card",
  };

  return (
    <li>
      <button
        onClick={() => onClick(vault)}
        className={cn(
          "group text-left w-full rounded-lg px-3 py-2.5 flex items-center gap-3",
          "transition-all duration-200",
          active
            ? "bg-card border border-border shadow-sm"
            : "hover:bg-card/60 border border-transparent hover:border-border/30 hover:shadow-sm"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200",
            active
              ? "bg-primary/15 text-primary shadow-sm shadow-primary/10"
              : "bg-card/80 border border-border text-muted-foreground group-hover:text-foreground group-hover:bg-card group-hover:shadow-sm"
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "block text-sm font-medium truncate transition-colors",
              active
                ? "text-foreground"
                : "text-foreground/90 group-hover:text-foreground"
            )}
          >
            {vault.title}
          </span>
          <span className="block text-xs text-muted-foreground truncate mt-0.5">
            {typeLabels[vault.type] || vault.type}
          </span>
        </div>

        {/* Arrow */}
        <ChevronRight
          className={cn(
            "flex-shrink-0 h-3.5 w-3.5 transition-all duration-150",
            active
              ? "text-muted-foreground opacity-100"
              : "text-muted-foreground/50 opacity-0 group-hover:opacity-100"
          )}
        />
      </button>
    </li>
  );
};

export default VaultListItem;
