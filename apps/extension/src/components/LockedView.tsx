import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LockedViewProps {
    currentHostname: string;
    hasMatches: boolean;
    isUnlocking: boolean;
    onUnlock: (password: string) => void;
}

export const LockedView: React.FC<LockedViewProps> = ({
    currentHostname,
    hasMatches,
    isUnlocking,
    onUnlock,
}) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password && !isUnlocking) {
            onUnlock(password);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="mb-6 text-center">
                <h2 className="text-xl mb-0.5 tracking-tight">
                    Unlock Vault
                </h2>
                {hasMatches && (
                    <p className="text-xs text-emerald-500 font-medium tracking-wider">Vault for {currentHostname}</p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-5">
                <input
                    type="password"
                    placeholder="Master Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isUnlocking}
                    autoFocus
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-3 py-1.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all text-center text-sm"
                />
                <button
                    type="submit"
                    disabled={!password || isUnlocking}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-semibold py-2 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 text-sm"
                >
                    {isUnlocking ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        hasMatches ? "Unlock & Fill" : "Unlock Vault"
                    )}
                </button>
            </form>

        </div>
    );
};
