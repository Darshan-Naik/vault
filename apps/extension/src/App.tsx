import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { LockedView } from './components/LockedView';
import { UnlockedView } from './components/UnlockedView';
import { PromptView } from './components/PromptView';
import { useAuth } from './hooks/useAuth';
import { useVault } from './hooks/useVault';
import { ExtensionAction } from './types/actions';
import { messenger } from './utils/messenger';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [allVaults, setAllVaults] = useState<any[]>([]);
  const [showFullVault, setShowFullVault] = useState(false);

  const [currentHostname, setCurrentHostname] = useState<string>('');
  const isPopupMode = useMemo(() => new URLSearchParams(window.location.search).get('mode') === 'popup', []);
  const targetTabIdFromMsg = useMemo(() => {
    const tid = new URLSearchParams(window.location.search).get('tabId');
    return tid ? parseInt(tid) : null;
  }, []);
  const [targetTabId, setTargetTabId] = useState<number | null>(targetTabIdFromMsg);

  // 2. Custom Hooks & State
  const { user, loading: authLoading } = useAuth();
  const {
    isUnlocked,
    setIsUnlocked,
    setSessionMasterKey,
    matchedCredentials,
    refresh: refreshSession
  } = useVault(currentHostname);

  // 3. Tab & Hostname Detection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hostParam = urlParams.get('hostname');

    if (hostParam) {
      setCurrentHostname(hostParam);
      // If in popup mode, tell the content script we are ready
      if (isPopupMode && targetTabId) {
        chrome.tabs.sendMessage(targetTabId, { action: ExtensionAction.PROMPT_READY });
      }
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab?.url) {
          try {
            const hostname = new URL(tab.url).hostname;
            setCurrentHostname(hostname);
            if (!targetTabId) setTargetTabId(tab.id || null);
          } catch (e) { }
        }
      });
    }
  }, [isPopupMode, targetTabId]);

  useEffect(() => {
    if (isUnlocked) {
      messenger.getAllVaults().then((resp) => {
        if (resp?.vaults) setAllVaults(resp.vaults);
      });
    }
  }, [isUnlocked]);

  // 4. Filtered list for search
  const otherVaults = useMemo(() => {
    const matchedIds = new Set(matchedCredentials.map(m => m.id));
    return allVaults.filter(v =>
      !matchedIds.has(v.id) &&
      (v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.url?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allVaults, matchedCredentials, searchQuery]);

  // 5. Handlers
  const handleUnlock = (password: string) => {
    setIsUnlocking(true);
    messenger.unlockAndGet({ masterPassword: password, hostname: currentHostname })
      .then((response) => {
        setIsUnlocking(false);
        if (response?.success) {
          // If we have matches and it was an "Unlock & Fill" intent, autofill the first one
          if (response.credentials && response.credentials.length > 0) {
            handleUseCredential(response.credentials[0]);
          } else {
            refreshSession();
          }
        } else {
          alert(response?.error || "Unlock failed");
        }
      });
  };

  const handleUseCredential = (cred: any) => {
    const finalTabId = targetTabId;
    messenger.getSessionState().then((resp) => {
      if (resp.isUnlocked) {
        const sendAutofill = (tabId: number) => {
          chrome.tabs.sendMessage(tabId, { action: ExtensionAction.FORCE_AUTOFILL, payload: cred });
          window.close();
        };

        if (finalTabId) {
          sendAutofill(finalTabId);
        } else {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) sendAutofill(tabs[0].id);
          });
        }
      }
    });
  };

  const handleLock = () => {
    messenger.lockVault().then(() => {
      setIsUnlocked(false);
      setSessionMasterKey(null);
      setAllVaults([]);
    });
  };

  const handleOpenApp = () => {
    chrome.tabs.create({ url: 'https://vault.darshannaik.com' });
  };

  if (authLoading) {
    return (
      <div className="h-[450px] w-[320px] bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-[450px] w-[320px] bg-neutral-950 flex flex-col items-center justify-center p-8 text-center border border-neutral-800">
        <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mb-6 border border-neutral-800">
          <img src="/pwa-192x192.png" className="h-10 w-10 opacity-50 grayscale" alt="Vault" />
        </div>
        <h1 className="text-xl font-bold mb-2">Welcome to Vault</h1>
        <p className="text-sm text-neutral-500 mb-8">Please log in to the web app to access your secure vault from the extension.</p>
        <button
          onClick={handleOpenApp}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
        >
          Login to Web App
        </button>
      </div>
    );
  }

  const isCompact = isPopupMode && !showFullVault;

  return (
    <div className={`${isCompact ? 'h-[220px]' : 'h-[450px]'} w-[320px] bg-neutral-950 text-neutral-100 flex flex-col font-sans overflow-hidden border border-neutral-800 shadow-2xl`}>
      {!isCompact && (
        <Header
          isUnlocked={isUnlocked}
          onLock={handleLock}
          onOpenApp={handleOpenApp}
        />
      )}

      {!isUnlocked ? (
        <LockedView
          currentHostname={currentHostname}
          hasMatches={matchedCredentials.length > 0}
          isUnlocking={isUnlocking}
          onUnlock={handleUnlock}
        />
      ) : isPopupMode && !showFullVault ? (
        <PromptView
          currentHostname={currentHostname}
          matchedCredentials={matchedCredentials}
          onUseCredential={handleUseCredential}
          onOpenFullVault={() => setShowFullVault(true)}
        />
      ) : (
        <UnlockedView
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          matchedCredentials={matchedCredentials}
          otherVaults={otherVaults}
          onUseCredential={handleUseCredential}
        />
      )}
    </div>
  );
};

export default App;
