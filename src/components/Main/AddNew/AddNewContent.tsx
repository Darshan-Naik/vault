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
import { vaultTypes, iconMap } from "@/lib/configs";
import { TVault } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import Credential from "./Credential";
import Bank from "./Bank";
import Card from "./Card";
import { Shield } from "lucide-react";

type AddNewContentProps = {
  handleClose: () => void;
};

const AddNewContent = ({ handleClose }: AddNewContentProps) => {
  const [data, setData] = useState<TVault>({
    type: "CREDENTIAL",
    uid: "",
    password: "",
    url: "",
    id: "",
    title: "",
  });
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
      (newData as TVault & { [key: string]: unknown })[key] = value;
      return newData;
    });
  };

  const SelectedIcon = iconMap[data.type];

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
            {SelectedIcon ? (
              <SelectedIcon className="w-5 h-5 text-primary" />
            ) : (
              <Shield className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <DialogTitle className="text-xl">Add New Vault</DialogTitle>
            <DialogDescription className="text-sm">
              Securely store your sensitive information
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="py-4 space-y-4">
        {/* Type selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
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

        {/* Type-specific fields */}
        <div className="space-y-4">
          {data?.type === "CREDENTIAL" && (
            <Credential data={data} handleChange={handleChange} />
          )}
          {data.type === "BANK" && (
            <Bank data={data} handleChange={handleChange} />
          )}
          {data.type === "CARD" && (
            <Card data={data} handleChange={handleChange} />
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
