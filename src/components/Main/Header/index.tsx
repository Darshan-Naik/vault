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
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/90 backdrop-blur-2xl shadow-sm">
        <div className="flex justify-between items-center h-14 px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-sm">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-semibold text-foreground tracking-tight">Vault</span>
          </div>
          
          {/* User menu */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-card/80 transition-all duration-200 group shadow-interactive">
                <Avatar className="h-7 w-7 ring-1 ring-border/50">
                  <AvatarImage
                    src={user?.photoURL || undefined}
                    alt={user?.displayName || "User"}
                  />
                  <AvatarFallback className="bg-card border border-border text-foreground text-xs font-medium">
                    {user?.displayName?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </PopoverTrigger>
            
            <PopoverContent className="w-64 p-1 bg-card border-border shadow-elevated" align="end">
              {/* User info header */}
              <div className="px-3 py-2.5 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user?.photoURL || undefined}
                      alt={user?.displayName || "User"}
                    />
                    <AvatarFallback className="bg-secondary text-foreground text-sm font-medium">
                      {user?.displayName?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Menu items */}
              <div className="p-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2.5 h-9 px-2.5 text-sm"
                  onClick={handleLockSettingsClick}
                >
                  <Settings className="w-4 h-4" />
                  <ButtonLabel />
                </Button>
                
                <div className="h-px bg-border my-1" />
                
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full justify-start gap-2.5 h-9 px-2.5 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
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
