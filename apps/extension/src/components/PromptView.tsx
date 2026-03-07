import React from 'react';
import { Globe, Shield, Zap } from 'lucide-react';

interface PromptViewProps {
    currentHostname: string;
    matchedCredentials: any[];
    onUseCredential: (cred: any) => void;
    onDismiss: () => void;
    onOpenFullVault: () => void;
}

export const PromptView: React.FC<PromptViewProps> = ({
    currentHostname,
    matchedCredentials,
    onUseCredential,
    onDismiss,
    onOpenFullVault
}) => {
    return (
        <div className="flex-1 flex flex-col p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <div className="flex flex-col items-center text-center mb-4 shrink-0">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-2 border border-emerald-500/20 shadow-inner">
                    <Globe className="h-5 w-5 text-emerald-500" />
                </div>
                <h2 className="text-lg font-black tracking-tight text-white/90">Vault Suggestion</h2>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5 font-bold italic">Match found for {currentHostname}</p>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar px-1">
                {matchedCredentials.map((cred) => (
                    <div
                        key={cred.id}
                        className="bg-neutral-900/40 border border-neutral-800/60 rounded-xl p-3 flex flex-col gap-3 group hover:border-emerald-500/40 transition-all shadow-xl shadow-black/40 backdrop-blur-sm"
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
                            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 italic shadow-lg shadow-emerald-900/20 text-sm"
                        >
                            Fill <Zap className="h-3.5 w-3.5 fill-current text-white" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 shrink-0">
                <button
                    onClick={onDismiss}
                    className="w-full text-neutral-500 hover:text-white text-[11px] font-bold py-1 transition-colors tracking-wide uppercase"
                >
                    Dismiss
                </button>
                <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent w-full" />
                <button
                    onClick={onOpenFullVault}
                    className="text-[8px] text-neutral-700 hover:text-neutral-400 uppercase tracking-[0.3em] font-black transition-colors text-center"
                >
                    Open Full Vault
                </button>
            </div>
        </div>
    );
};
