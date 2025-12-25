import { useState } from "react";
import { toast } from "sonner";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddVault } from "@/lib/query";
import { useAuth } from "@/components/AuthProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vaultTypes, iconMap, getDefaultValues } from "@/lib/configs";
import { TVault } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import ConfiguredForm from "./ConfiguredForm";
import { Shield } from "lucide-react";

type AddNewContentProps = {
  handleClose: () => void;
};

const AddNewContent = ({ handleClose }: AddNewContentProps) => {
  const [data, setData] = useState<TVault>({
    type: "CREDENTIAL",
    id: "",
    title: "",
    ...getDefaultValues("CREDENTIAL"),
  } as TVault);
  const { mutateAsync: addVault, isPending } = useAddVault();
  const { user } = useAuth();

  const handleSubmit = async () => {
    try {
      await addVault({
        userId: user?.uid as string,
        vaultData: data as TVault,
      });
      handleClose();
      toast.success(`${data?.title.trim()} added successfully`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  const handleChange = (key: string, value: string) => {
    setData((prevData: TVault | undefined) => {
      const newData = prevData ? { ...prevData } : ({} as TVault);
      
      // When type changes, reset to new type's default values
      if (key === "type" && value !== prevData?.type) {
        const defaults = getDefaultValues(value);
        return {
          type: value,
          id: newData.id,
          title: newData.title,
          note: newData.note,
          ...defaults,
        } as TVault;
      }
      
      (newData as TVault & { [key: string]: unknown })[key] = value;
      return newData;
    });
  };

  const SelectedIcon = iconMap[data.type];

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center">
            {SelectedIcon ? (
              <SelectedIcon className="w-4 h-4 text-foreground" />
            ) : (
              <Shield className="w-4 h-4 text-foreground" />
            )}
          </div>
          <div>
            <DialogTitle className="text-lg">Add New Vault</DialogTitle>
            <DialogDescription className="text-sm">
              Securely store your sensitive information
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="py-4 space-y-4">
        {/* Type selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Vault Type
          </label>
          <Select
            onValueChange={(value) => handleChange("type", value)}
            value={data?.type}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {vaultTypes.map((item) => {
                const Icon = iconMap[item.value as keyof typeof iconMap];
                return (
                  <SelectItem key={item.value} value={item.value}>
                    <div className="flex items-center gap-2">
                      {Icon && (
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span>{item.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Title
          </label>
          <Input
            placeholder="e.g., Google Account, Chase Bank"
            value={data?.title}
            onChange={(e) => handleChange("title", e.target.value)}
            autoFocus
            maxLength={200}
          />
        </div>

        {/* Type-specific fields - rendered from config */}
        <ConfiguredForm
          type={data.type}
          data={data as Record<string, unknown>}
          handleChange={handleChange}
        />

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Notes (Optional)
          </label>
          <Textarea
            placeholder="Add any additional notes..."
            value={data?.note}
            onChange={(e) => handleChange("note", e.target.value)}
            className="resize-none h-20"
            maxLength={500}
          />
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={handleClose} className="sm:w-24">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending || !data.title.trim()}
          className="sm:w-32"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Adding...
            </div>
          ) : (
            "Add Vault"
          )}
        </Button>
      </DialogFooter>
    </>
  );
};

export default AddNewContent;
