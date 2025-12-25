import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { encryptedKeys } from "@/lib/configs";
import { cn } from "@/lib/utils";
import { Copy, Eye, EyeOff, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ValueCardProps = {
  label: string;
  value?: string | number;
  id: string;
  isEditable?: boolean;
  className?: string;
  handleChange: (id: string, value: string) => void;
  multiline?: boolean;
};

const ValueCard = ({
  label,
  value,
  id,
  isEditable,
  className,
  handleChange,
  multiline,
}: ValueCardProps) => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (value?.toString()) {
      navigator.clipboard.writeText(value.toString()).then(() => {
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const isEncrypted = encryptedKeys.includes(id);
  const displayValue =
    isEncrypted && !show ? value?.toString().replace(/./g, "•") : value;

  return (
    <div className="group">
      {/* Label */}
      <label className="text-xs font-medium text-muted-foreground mb-2 block">
        {label}
      </label>

      {value || isEditable ? (
        <div
          className={cn(
            "relative rounded-lg border border-border bg-card/80 overflow-hidden transition-all duration-200 shadow-sm",
            "hover:border-border/80 hover:bg-card hover:shadow-md",
            isEditable && "border-primary/50 shadow-md shadow-primary/5"
          )}
        >
          {/* Value display/input */}
          {isEditable ? (
            multiline ? (
              <textarea
                value={value?.toString() || ""}
                onChange={(e) => handleChange(id, e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}`}
                className={cn(
                  "w-full bg-transparent px-3 py-2.5 text-sm outline-none resize-none",
                  "placeholder:text-muted-foreground/50",
                  className
                )}
                rows={4}
              />
            ) : (
              <input
                type={isEncrypted && !show ? "password" : "text"}
                value={value?.toString() || ""}
                onChange={(e) => handleChange(id, e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}`}
                className={cn(
                  "w-full bg-transparent px-3 py-2.5 text-sm outline-none pr-20",
                  "placeholder:text-muted-foreground/50"
                )}
              />
            )
          ) : (
            <div
              className={cn(
                "px-3 py-2.5 text-sm text-foreground pr-20",
                multiline && "whitespace-pre-wrap",
                className
              )}
            >
              {displayValue || (
                <span className="text-muted-foreground italic">Not set</span>
              )}
            </div>
          )}

          {/* Action buttons - always visible on mobile, hover on desktop */}
          {!multiline && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isEncrypted && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShow(!show)}
                      className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200",
                        "text-muted-foreground hover:text-foreground hover:bg-card hover:shadow-sm",
                        // Always visible on mobile (md:), hover-based on desktop
                        "opacity-100 md:opacity-0 md:group-hover:opacity-100",
                        show && "!opacity-100 text-primary"
                      )}
                    >
                      {show ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{show ? "Hide" : "Show"}</TooltipContent>
                </Tooltip>
              )}

              {value && !isEditable && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={copyToClipboard}
                      className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                        "text-muted-foreground hover:text-foreground hover:bg-card/80",
                        // Always visible on mobile (md:), hover-based on desktop
                        "opacity-100 md:opacity-0 md:group-hover:opacity-100",
                        copied && "!opacity-100 text-primary"
                      )}
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* Copy button for multiline - always visible on mobile */}
          {multiline && value && !isEditable && (
            <div className="absolute right-2 top-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={copyToClipboard}
                    className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                      "text-muted-foreground hover:text-foreground hover:bg-card/80",
                      // Always visible on mobile (md:), hover-based on desktop
                      "opacity-100 md:opacity-0 md:group-hover:opacity-100",
                      copied && "!opacity-100 text-primary"
                    )}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      ) : (
        <div className="px-3 py-2.5 rounded-lg border border-border bg-card">
          <span className="text-sm text-muted-foreground">Not set</span>
        </div>
      )}
    </div>
  );
};

export default ValueCard;
