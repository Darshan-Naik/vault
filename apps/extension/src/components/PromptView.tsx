import { Shield, Zap, Copy, Eye, EyeOff } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface PromptViewProps {
    currentHostname: string;
    matchedCredentials: any[];
    onUseCredential: (cred: any) => void;
    onOpenFullVault: () => void;
    hasFields: boolean;
    isSaveMode?: boolean;
    pendingSave?: any;
    onSave?: (updatedTitle: string) => void;
    onDismiss?: () => void;
}

export const PromptView: React.FC<PromptViewProps> = ({
    currentHostname,
    matchedCredentials,
    onUseCredential,
    onOpenFullVault,
    hasFields,
    isSaveMode,
    pendingSave,
    onSave,
    onDismiss
}) => {
    const [editedTitle, setEditedTitle] = useState(pendingSave?.title || currentHostname || "");
    const [showPassword, setShowPassword] = useState(false);

    // Sync title when pendingSave is loaded
    useEffect(() => {
        if (pendingSave?.title) {
            setEditedTitle(pendingSave.title);
        }
    }, [pendingSave]);

    if (isSaveMode) {
        return (
            <div className="flex-1 flex flex-col p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                <div className="mb-2 text-center">
                    <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Save to Vault</p>
                    <p className="text-[10px] text-neutral-500 truncate">{currentHostname}</p>
                </div>

                <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
                    <div className="space-y-4">
                        <div className="space-y-1.5 px-0.5">
                            <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider ml-1">Title</label>
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                placeholder="e.g. My Account"
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5 px-0.5">
                            <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider ml-1">Username</label>
                            <div className="w-full bg-neutral-900/30 border border-neutral-800/50 rounded-xl px-4 py-2.5 text-sm text-neutral-300 truncate font-mono">
                                {pendingSave?.uid || '—'}
                            </div>
                        </div>

                        <div className="space-y-1.5 px-0.5">
                            <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <div className="w-full bg-neutral-900/30 border border-neutral-800/50 rounded-xl px-4 py-2.5 text-sm text-neutral-300 font-mono flex items-center justify-between">
                                    <span className="truncate">
                                        {showPassword ? pendingSave?.password : '••••••••••••'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-neutral-600 hover:text-neutral-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-2.5 mt-auto pt-4">
                        <button
                            onClick={() => onSave?.(editedTitle)}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold py-3 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 text-xs uppercase tracking-widest"
                        >
                            Save to Vault
                        </button>
                        <button
                            onClick={onDismiss}
                            className="w-full text-neutral-500 hover:text-neutral-300 font-bold py-1 transition-all text-[10px] uppercase tracking-widest"
                        >
                            Not Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden gap-4">

            <div className="text-center">
                <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">Vault for {currentHostname}</p>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar px-1">
                {matchedCredentials.map((cred) => (
                    <div
                        key={cred.id}
                        className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-4 flex flex-col gap-3 group hover:border-emerald-500/40 transition-all shadow-xl shadow-black/40 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-emerald-500 transition-colors shrink-0 border border-neutral-700/50">
                                <Shield className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-white/90 truncate">{cred.title}</h3>
                                <p className="text-[10px] text-neutral-500 truncate">{cred.uid || 'No username set'}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => onUseCredential(cred)}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold py-2.5 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 text-xs uppercase tracking-widest"
                        >
                            {hasFields ? (
                                <>Fill <Zap className="h-3 w-3 fill-current text-white" /></>
                            ) : (
                                <>Copy <Copy className="h-3 w-3 text-white" /></>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={onOpenFullVault}
                className="text-[8px] text-neutral-700 hover:text-neutral-400 uppercase tracking-[0.3em] font-black transition-colors text-center"
            >
                Open Full Vault
            </button>
        </div>
    );
};
