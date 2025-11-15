import { useState } from "react";
import { signOut } from "firebase/auth";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { auth } from "@/firebase";
import { Vault } from "lucide-react";
import LockSettingsDialog, { ButtonLabel } from "@/components/LockSettings/Dialog";

const Header = () => {
  const { user } = useAuth();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);

  const handleSignOut = () => {
    signOut(auth);
  };

  const handleLockSettingsClick = () => {
    setPopoverOpen(false);
    setLockDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center py-2 px-4 border-b sticky top-0 bg-background shadow-md">
        <div className="text-xl font-bold flex gap-2 items-center">
          <Vault className="h-6 w-6" />
          <p>Vault</p>
        </div>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.photoURL || undefined}
                alt={user?.displayName || "User"}
              />
              <AvatarFallback className="border">
                {user?.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <PopoverContent className="w-60">
              <div className="flex flex-col gap-2">
                <p className="font-semibold">{user?.displayName}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="pt-2 w-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleLockSettingsClick}
                  >
                    <ButtonLabel />
                  </Button>
                </div>
                <div className="pt-2 w-full">
                  <Button
                    onClick={handleSignOut}
                    variant="destructive"
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </PopoverTrigger>
        </Popover>
      </div>
      <LockSettingsDialog open={lockDialogOpen} onOpenChange={setLockDialogOpen} />
    </>
  );
};

export default Header;
