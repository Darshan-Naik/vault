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
    <li className={cn("opacity-0 animate-fade-in")}>
      <button
        onClick={() => onClick(vault)}
        className={cn(
          "group text-left w-full rounded-xl p-3 flex items-center gap-3",
          "bg-card/50 border border-transparent",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
            active
              ? "bg-primary/20 text-primary"
              : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "block font-medium truncate transition-colors",
              active
                ? "text-foreground"
                : "text-foreground/80 group-hover:text-foreground"
            )}
          >
            {vault.title}
          </span>
          <span className="block text-xs text-muted-foreground truncate">
            {typeLabels[vault.type] || vault.type}
          </span>
        </div>

        {/* Arrow */}
        <ChevronRight
          className={cn(
            "flex-shrink-0 h-4 w-4 transition-all duration-200",
            active
              ? "text-primary opacity-100 translate-x-0"
              : "text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
          )}
        />
      </button>
    </li>
  );
};

export default VaultListItem;
