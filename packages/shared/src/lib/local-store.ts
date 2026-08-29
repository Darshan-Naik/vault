export type ChangeKind = "meta" | "vaults" | "settings";

export type LocalUserMeta = {
  userId: string;
  salt: string;
  encryptedMasterKeyByPassword: string;
  encryptedMasterKeyByRecoveryKey: string;
  encryptedUserID: string;
  createdAt: number;
  updatedAt: number;
  dirty: boolean;
};

export type LocalVaultRecord = {
  userId: string;
  id: string;
  payload: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  deleted: boolean;
  dirty: boolean;
};

export type LocalSettingsRecord = {
  userId: string;
  lockPinHash: string | null;
  autoLockTimeoutMs: number;
  biometricCredentialIds: string[];
  updatedAt: number;
  dirty: boolean;
};

const DB_NAME = "vault-local-first";
const DB_VERSION = 1;

const listeners = new Map<string, Set<() => void>>();

const channel =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("vault-local-first")
    : null;

channel?.addEventListener("message", (event: MessageEvent) => {
  const data = event.data as { kind?: ChangeKind; userId?: string } | null;
  if (!data?.kind || !data.userId) return;
  emit(data.kind, data.userId);
});

function listenerKey(kind: ChangeKind, userId: string) {
  return `${kind}:${userId}`;
}

function emit(kind: ChangeKind, userId: string) {
  listeners.get(listenerKey(kind, userId))?.forEach((cb) => cb());
}

export function subscribeLocalChange(
  kind: ChangeKind,
  userId: string,
  cb: () => void
): () => void {
  const key = listenerKey(kind, userId);
  const set = listeners.get(key) ?? new Set<() => void>();
  set.add(cb);
  listeners.set(key, set);
  return () => {
    set.delete(cb);
  };
}

export function notifyLocalChange(kind: ChangeKind, userId: string) {
  emit(kind, userId);
  try {
    channel?.postMessage({ kind, userId });
  } catch {
    // BroadcastChannel can fail in some workers; same-tab listeners already ran.
  }
}

const openDb = (): Promise<IDBDatabase> => {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available"));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "userId" });
      }
      if (!db.objectStoreNames.contains("vaults")) {
        const vaults = db.createObjectStore("vaults", {
          keyPath: ["userId", "id"],
        });
        vaults.createIndex("byUser", "userId", { unique: false });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "userId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const withStore = async <T>(
  storeName: "meta" | "vaults" | "settings",
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const request = fn(tx.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getLocalMeta = (userId: string) =>
  withStore("meta", "readonly", (store) => store.get(userId)) as Promise<
    LocalUserMeta | undefined
  >;

export const putLocalMeta = (record: LocalUserMeta) =>
  withStore("meta", "readwrite", (store) => store.put(record)).then(() => {
    notifyLocalChange("meta", record.userId);
  });

export const getLocalSettings = (userId: string) =>
  withStore("settings", "readonly", (store) => store.get(userId)) as Promise<
    LocalSettingsRecord | undefined
  >;

export const putLocalSettings = (record: LocalSettingsRecord) =>
  withStore("settings", "readwrite", (store) => store.put(record)).then(() => {
    notifyLocalChange("settings", record.userId);
  });

export const putLocalVault = (record: LocalVaultRecord) =>
  withStore("vaults", "readwrite", (store) => store.put(record)).then(() => {
    notifyLocalChange("vaults", record.userId);
  });

export const deleteLocalVault = (userId: string, vaultId: string) =>
  withStore("vaults", "readwrite", (store) =>
    store.delete([userId, vaultId])
  ).then(() => {
    notifyLocalChange("vaults", userId);
  });

export const listLocalVaults = async (
  userId: string
): Promise<LocalVaultRecord[]> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("vaults", "readonly");
    const store = tx.objectStore("vaults");
    const index = store.index("byUser");
    const request = index.getAll(userId);
    request.onsuccess = () =>
      resolve((request.result as LocalVaultRecord[]) ?? []);
    request.onerror = () => reject(request.error);
  });
};

export const listActiveLocalVaults = async (userId: string) => {
  const all = await listLocalVaults(userId);
  return all
    .filter((vault) => !vault.deleted)
    .sort((a, b) => a.createdAt - b.createdAt);
};

export const applyVaultWrites = async (
  userId: string,
  puts: LocalVaultRecord[],
  deletes: Array<[string, string]>
) => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("vaults", "readwrite");
    const store = tx.objectStore("vaults");
    for (const record of puts) {
      store.put(record);
    }
    for (const key of deletes) {
      store.delete(key);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  notifyLocalChange("vaults", userId);
};
