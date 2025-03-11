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
          className="justify-start bg-white text-black"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add new
        </Button>
      </DialogTrigger>
      <DialogContent>
        <AddNewContent handleClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default AddNew;
