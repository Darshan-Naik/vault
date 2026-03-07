import { Shield, Zap, Copy } from 'lucide-react';

interface PromptViewProps {
    currentHostname: string;
    matchedCredentials: any[];
    onUseCredential: (cred: any) => void;
    onOpenFullVault: () => void;
    hasFields: boolean;
    isSaveMode?: boolean;
    pendingSave?: any;
    onSave?: () => void;
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
    if (isSaveMode) {
        return (
            <div className="flex-1 flex flex-col p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                <div className="mb-4 text-center">
                    <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">Save to Vault</p>
                </div>

                <div className="flex-1 flex flex-col gap-3 justify-center items-center">
                    <div className="h-12 w-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-emerald-500 mb-2 border border-neutral-800">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div className="text-center mb-6">
                        <h3 className="text-sm font-bold text-white/90">Save login for {currentHostname}?</h3>
                        <p className="text-[10px] text-neutral-500 mt-1">{pendingSave?.uid || '(No username found)'}</p>
                    </div>

                    <div className="w-full flex flex-col gap-3 px-2">
                        <button
                            onClick={onSave}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold py-3 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 text-xs uppercase tracking-widest"
                        >
                            Save Password
                        </button>
                        <button
                            onClick={onDismiss}
                            className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold py-2.5 rounded-full transition-all text-[10px] uppercase tracking-widest"
                        >
                            Not Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">

            <div className="mb-4 text-center">
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

            <div className="flex flex-col gap-3 shrink-0">
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
