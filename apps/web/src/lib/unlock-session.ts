const MASTER_KEY = "vault:session:masterKey";
const PIN_KEY = "vault:session:pinUnlocked";

type SessionRecord<T> = {
  userId: string;
} & T;

function read<T>(key: string): SessionRecord<T> | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as SessionRecord<T>;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or storage full — unlock simply won't survive refresh.
  }
}

function remove(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function loadSessionMasterKey(userId: string): string | null {
  const record = read<{ masterKey: string }>(MASTER_KEY);
  if (!record || record.userId !== userId || !record.masterKey) {
    return null;
  }
  return record.masterKey;
}

export function saveSessionMasterKey(userId: string, masterKey: string) {
  write(MASTER_KEY, { userId, masterKey });
}

export function clearSessionMasterKey() {
  remove(MASTER_KEY);
}

export function isSessionPinUnlocked(userId: string): boolean {
  const record = read<{ unlocked: boolean }>(PIN_KEY);
  return !!record && record.userId === userId && record.unlocked === true;
}

export function saveSessionPinUnlocked(userId: string, unlocked: boolean) {
  write(PIN_KEY, { userId, unlocked });
}

export function clearUnlockSession() {
  remove(MASTER_KEY);
  remove(PIN_KEY);
}
