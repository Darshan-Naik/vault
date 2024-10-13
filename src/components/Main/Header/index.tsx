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

const Header = () => {
  const { user } = useAuth();

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="flex justify-between items-center py-2 px-4 border-b sticky top-0 bg-white shadow-md">
      <div className="text-xl font-bold flex gap-2 items-center">
        <Vault className="h-6 w-6" />
        <p>Vault</p>
      </div>
      <Popover>
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
              <div className="pt-4 w-full">
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
  );
};

export default Header;
