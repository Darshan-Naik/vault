import { useState } from "react";
import { toast } from "sonner";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { vaultTypes } from "@/lib/configs";
import { TVault } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import Credential from "./Credential";
import Bank from "./Bank";
import Card from "./Card";
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

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Vault</DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-3">
        <Select
          onValueChange={(value) => handleChange("type", value)}
          value={data?.type}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {vaultTypes.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Title"
          value={data?.title}
          onChange={(e) => handleChange("title", e.target.value)}
          autoFocus
          maxLength={200}
        />
        {data?.type === "CREDENTIAL" && (
          <Credential data={data} handleChange={handleChange} />
        )}
        {data.type === "BANK" && (
          <Bank data={data} handleChange={handleChange} />
        )}
        {data.type === "CARD" && (
          <Card data={data} handleChange={handleChange} />
        )}

        <Textarea
          placeholder="Note"
          value={data?.note}
          onChange={(e) => handleChange("note", e.target.value)}
          className="resize-none h-20"
          maxLength={500}
        />
      </div>
      <DialogFooter>
        <div className="flex sm:justify-end space-x-2 justify-evenly">
          <Button
            variant="outline"
            onClick={handleClose}
            className="sm:w-24 w-40"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !data.title.trim()}
            className="sm:w-24 w-40"
          >
            {isPending ? "Adding..." : "Add"}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
};

export default AddNewContent;
