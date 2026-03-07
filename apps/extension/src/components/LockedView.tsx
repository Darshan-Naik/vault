import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';

interface LockedViewProps {
    currentHostname: string;
    hasMatches: boolean;
    isUnlocking: boolean;
    isPopupMode: boolean;
    onUnlock: (password: string) => void;
    onDismiss: () => void;
}

export const LockedView: React.FC<LockedViewProps> = ({
    currentHostname,
    hasMatches,
    isUnlocking,
    isPopupMode,
    onUnlock,
    onDismiss
}) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password && !isUnlocking) {
            onUnlock(password);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            {isPopupMode && (
                <button
                    onClick={onDismiss}
                    className="absolute top-4 right-4 text-neutral-500 hover:text-white"
                >
                    ✕
                </button>
            )}

            <div className="mb-4 text-center">
                <h1 className="text-lg font-bold mb-0.5 tracking-tight">
                    {hasMatches ? "Login Detected" : "Vault Locked"}
                </h1>
                {hasMatches && (
                    <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">Matching for {currentHostname}</p>
                )}
            </div>

            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                <Lock className="h-6 w-6 text-emerald-500" />
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="space-y-2">
                    <input
                        type="password"
                        placeholder="Master Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isUnlocking}
                        autoFocus
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all text-center text-sm"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!password || isUnlocking}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 text-sm"
                >
                    {isUnlocking ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        hasMatches ? "Unlock & Fill" : "Unlock Vault"
                    )}
                </button>
            </form>

            <p className="mt-6 text-[10px] text-neutral-600 text-center leading-relaxed opacity-50 px-4">
                Vault does not store your master password.
            </p>
        </div>
    );
};
