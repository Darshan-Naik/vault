import React from 'react';
import { Search, Globe, Shield, Zap } from 'lucide-react';

interface UnlockedViewProps {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    matchedCredentials: any[];
    otherVaults: any[];
    onUseCredential: (cred: any) => void;
}

export const UnlockedView: React.FC<UnlockedViewProps> = ({
    searchQuery,
    setSearchQuery,
    matchedCredentials,
    otherVaults,
    onUseCredential
}) => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-800 bg-neutral-900/30">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search your vault..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {matchedCredentials.length > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-500 uppercase tracking-widest">
                            <Zap className="h-3 w-3 fill-emerald-500" />
                            Matching Current Site
                        </div>
                        <div className="space-y-1">
                            {matchedCredentials.map((cred) => (
                                <CredentialItem
                                    key={cred.id}
                                    cred={cred}
                                    isMatch={true}
                                    onUse={() => onUseCredential(cred)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    {matchedCredentials.length > 0 && <div className="px-3 py-2 text-xs font-bold text-neutral-500 uppercase tracking-widest mt-4">Other Items</div>}
                    {otherVaults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-neutral-600">
                            <Shield className="h-10 w-10 mb-3 opacity-20" />
                            <p className="text-sm">No items found</p>
                        </div>
                    ) : (
                        otherVaults.map((vault) => (
                            <CredentialItem
                                key={vault.id}
                                cred={vault}
                                isMatch={false}
                                onUse={() => onUseCredential(vault)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const CredentialItem = ({ cred, onUse, isMatch }: any) => (
    <div className={`group relative flex items-center justify-between p-3 rounded-2xl border transition-all ${isMatch
        ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
        : 'hover:bg-neutral-800/50 border-transparent hover:border-neutral-700/50 shadow-sm'
        }`}>
        <div className="flex items-center gap-3 min-w-0">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${isMatch ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-800 text-neutral-400 group-hover:text-emerald-500'
                }`}>
                {cred.type === 'CREDENTIAL' ? <Globe className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
                <h3 className="text-sm font-medium text-white truncate">{cred.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-neutral-500 truncate max-w-[150px]">{cred.url || 'No URL'}</p>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-1">
            <button
                onClick={onUse}
                className={`py-1.5 px-3 italic items-center flex gap-2 rounded-full transition-all shadow-sm text-[10px] font-bold uppercase tracking-wider ${isMatch ? 'bg-emerald-600 text-white' : 'bg-neutral-800/50 text-neutral-400 hover:bg-emerald-600 hover:text-white'
                    }`}
                title="Autofill"
            >
                Fill <Zap className={`h-3 w-3 ${isMatch ? 'fill-current' : ''}`} />
            </button>
        </div>
    </div>
);
