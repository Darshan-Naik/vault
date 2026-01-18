import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import AddNewContent from "./AddNewContent";

const AddNew = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="default"
          className="w-full gap-2 h-9 text-sm"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Vault</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-screen overflow-y-auto">
        <AddNewContent handleClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default AddNew;
