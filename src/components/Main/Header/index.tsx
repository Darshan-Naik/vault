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
import { Shield, LogOut, Settings, ChevronDown } from "lucide-react";
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
      <header className="sticky top-0 z-50 w-full">
        {/* Blur background */}
        <div className="absolute inset-0 glass" />
        
        <div className="relative flex justify-between items-center py-3 px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gradient">Vault</span>
              <span className="text-[10px] text-muted-foreground -mt-1 hidden sm:block">
                Secure Password Manager
              </span>
            </div>
          </div>
          
          {/* User menu */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors group">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  <AvatarImage
                    src={user?.photoURL || undefined}
                    alt={user?.displayName || "User"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {user?.displayName?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </PopoverTrigger>
            
            <PopoverContent className="w-72 p-0 glass border-border/50" align="end">
              {/* User info header */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage
                      src={user?.photoURL || undefined}
                      alt={user?.displayName || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                      {user?.displayName?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {user?.displayName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Menu items */}
              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-11 px-3 hover:bg-white/5"
                  onClick={handleLockSettingsClick}
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <ButtonLabel />
                </Button>
                
                <div className="h-px bg-border/50 my-2" />
                
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-11 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>
      
      <LockSettingsDialog open={lockDialogOpen} onOpenChange={setLockDialogOpen} />
    </>
  );
};

export default Header;
