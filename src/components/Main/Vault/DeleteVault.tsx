import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeleteVault } from "@/lib/query";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { TVault } from "@/lib/types";

type DeleteVaultProps = {
  vault: TVault;
  handleVaultSelect: (vault?: TVault, force?: boolean) => void;
};

const DeleteVault = ({ vault, handleVaultSelect }: DeleteVaultProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: deleteVault, isPending } = useDeleteVault();
  const { user } = useAuth();

  const handleDelete = async () => {
    try {
      await deleteVault({
        userId: user?.uid as string,
        vaultId: vault.id,
      });
      toast.success(`${vault.title} deleted successfully`);
      handleVaultSelect(undefined, true);
      setOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete vault");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Delete vault</TooltipContent>
      </Tooltip>
      
      <DialogContent className="glass border-border/50 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Delete Vault</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Are you sure you want to delete <strong className="text-foreground">{vault.title}</strong>? 
            This action cannot be undone and all associated data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="border-border/50"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              "Delete Vault"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteVault;
