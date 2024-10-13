import { useAuth } from "@/components/AuthProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteVault } from "@/lib/query";
import { TVault } from "@/lib/types";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type DeleteVaultProps = {
  vault: TVault;
  handleVaultSelect: (vault?: TVault) => void;
};

const DeleteVault = ({ vault, handleVaultSelect }: DeleteVaultProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { mutateAsync: deleteVault, isPending } = useDeleteVault();
  const { user } = useAuth();

  const handleDelete = async () => {
    try {
      await deleteVault({
        userId: user?.uid as string,
        vaultId: vault.id,
      });
      handleVaultSelect(undefined);
      toast.success(`${vault?.title.trim()} deleted successfully`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={() => setIsOpen(true)}>
              <Trash className="w-5 h-5 text-secondary-foreground opacity-50 hover:opacity-100 transition-opacity" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-md">Delete</p>
          </TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete vault</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">
            Are you sure you want to delete{" "}
            <span className="font-medium">{vault.title.trim()}</span>?
          </p>
        </div>
        <DialogFooter>
          <div className="flex sm:justify-end space-x-2 justify-evenly">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="sm:w-24 w-40"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isPending}
              className="sm:w-24 w-40"
              variant="destructive"
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteVault;
