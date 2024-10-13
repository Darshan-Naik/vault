import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { encryptedKeys } from "@/lib/configs";
import { cn } from "@/lib/utils";
import { Copy, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
type ValueCardProps = {
  label: string;
  value?: string | number;
  id: string;
  isEditable?: boolean;
  className?: string;
  handleChange: (id: string, value: string) => void;
};
const ValueCard = ({
  label,
  value,
  id,
  isEditable,
  className,
  handleChange,
}: ValueCardProps) => {
  const [show, setShow] = useState(false);

  const copyToClipboard = () => {
    if (value?.toString()) {
      navigator.clipboard.writeText(value.toString()).then(() => {
        toast.success("Copied to clipboard");
      });
    }
  };

  const isEncrypted = encryptedKeys.includes(id);

  return (
    <div>
      <p className="text-xs w-fit text-secondary-foreground italic">{label}</p>
      {value ? (
        <div className="flex">
          <p
            className={cn(
              "text-sm w-fit p-2 border rounded-md bg-white pr-5 min-w-80",
              className
            )}
            contentEditable={
              isEditable && (!isEncrypted || (isEncrypted && show))
            }
            suppressContentEditableWarning={true}
            onInput={(e) => handleChange(id, e.currentTarget.textContent || "")}
          >
            {isEncrypted && !show ? value.toString().replace(/./g, "*") : value}
          </p>
          {isEncrypted && !show && (
            <div className="p-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setShow(true)}>
                    <Eye className="w-4 h-4 text-secondary-foreground opacity-50 hover:opacity-100 transition-opacity" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-md">Show</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          <div className="p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 text-secondary-foreground opacity-50 hover:opacity-100 transition-opacity" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-md">Copy</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      ) : (
        <p
          className={cn(
            "text-gray-400 text-xs italic",
            isEditable &&
              "text-sm w-fit p-2 border rounded-md bg-white pr-5 min-w-80 text-black"
          )}
          contentEditable={isEditable}
          suppressContentEditableWarning={true}
          onInput={(e) => handleChange(id, e.currentTarget.textContent || "")}
        >
          {isEditable ? "" : "N/A"}
        </p>
      )}
    </div>
  );
};

export default ValueCard;
