import React from 'react';
import { KeyRound, Lock, ExternalLink } from 'lucide-react';

interface HeaderProps {
    isUnlocked: boolean;
    onLock: () => void;
    onOpenApp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    isUnlocked,
    onLock,
    onOpenApp
}) => {
    return (
        <header className="flex items-center justify-between py-2.5 px-4 border-b border-neutral-800 bg-neutral-950/50 sticky top-0 z-10 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-emerald-500" />
                <h1 className="font-semibold tracking-tight text-white/90">
                    Vault
                </h1>
            </div>
            <div className="flex items-center gap-3">
                {isUnlocked && (
                    <button onClick={onLock} title="Lock Vault">
                        <Lock className="h-4 w-4 text-neutral-500 hover:text-white transition-colors" />
                    </button>
                )}
                <button onClick={onOpenApp} title="Open Web App">
                    <ExternalLink className="h-4 w-4 text-neutral-500 hover:text-white transition-colors" />
                </button>
            </div>
        </header>
    );
};
