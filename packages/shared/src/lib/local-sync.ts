import { db } from "../firebase";
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  DocumentReference,
  getDocFromCache,
  getDoc,
  getDocs,
  getDocsFromCache,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import {
  LocalSettingsRecord,
  LocalUserMeta,
  LocalVaultRecord,
  deleteLocalVault,
  getLocalMeta,
  getLocalSettings,
  listLocalVaults,
  putLocalMeta,
  putLocalSettings,
  putLocalVault,
  applyVaultWrites,
} from "./local-store";
import { TUserMeta } from "./types";

const META_COLLECTION = "vault-db";
const SETTINGS_COLLECTION = "user-settings";
const DEFAULT_AUTO_LOCK_TIMEOUT_MS = 5 * 60_000;

const syncControls = new Map<string, () => void>();

export const toMillis = (value: unknown): number => {
  if (!value) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "object" && value !== null) {
    const maybeTimestamp = value as {
      toMillis?: () => number;
      seconds?: number;
      nanoseconds?: number;
    };
    if (typeof maybeTimestamp.toMillis === "function") {
      return maybeTimestamp.toMillis();
    }
    if (typeof maybeTimestamp.seconds === "number") {
      return (
        maybeTimestamp.seconds * 1000 +
        Math.floor((maybeTimestamp.nanoseconds ?? 0) / 1_000_000)
      );
    }
  }
  return 0;
};

export const vaultsQuery = (userId: string) => {
  const userVaultsCollection = doc(db, META_COLLECTION, userId);
  return query(
    collection(userVaultsCollection, "vaults"),
    orderBy("createdAt", "asc")
  );
};

export const metaRef = (userId: string) => doc(db, META_COLLECTION, userId);
export const settingsRef = (userId: string) =>
  doc(db, SETTINGS_COLLECTION, userId);
export const vaultRef = (userId: string, vaultId: string) =>
  doc(db, META_COLLECTION, userId, "vaults", vaultId);

export async function getDocCacheFirst(ref: DocumentReference) {
  try {
    return await getDocFromCache(ref);
  } catch {
    return await getDoc(ref);
  }
}

async function getDocsCacheFirst(q: ReturnType<typeof vaultsQuery>) {
  try {
    return await getDocsFromCache(q);
  } catch {
    return await getDocs(q);
  }
}

export function toUserMeta(record: LocalUserMeta): TUserMeta {
  return {
    userId: record.userId,
    salt: record.salt,
    encryptedMasterKeyByPassword: record.encryptedMasterKeyByPassword,
    encryptedMasterKeyByRecoveryKey: record.encryptedMasterKeyByRecoveryKey,
    encryptedUserID: record.encryptedUserID,
  };
}

function defaultSettings(userId: string): LocalSettingsRecord {
  return {
    userId,
    lockPinHash: null,
    autoLockTimeoutMs: DEFAULT_AUTO_LOCK_TIMEOUT_MS,
    biometricCredentialIds: [],
    updatedAt: 0,
    dirty: false,
  };
}

export async function getMetaLocalFirst(
  userId: string
): Promise<TUserMeta | null> {
  const local = await getLocalMeta(userId);
  if (local) {
    return toUserMeta(local);
  }

  const snap = await getDocCacheFirst(metaRef(userId));
  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();
  const record: LocalUserMeta = {
    userId,
    salt: data.salt,
    encryptedMasterKeyByPassword: data.encryptedMasterKeyByPassword,
    encryptedMasterKeyByRecoveryKey: data.encryptedMasterKeyByRecoveryKey,
    encryptedUserID: data.encryptedUserID,
    createdAt: toMillis(data.createdAt) || Date.now(),
    updatedAt: toMillis(data.updatedAt) || Date.now(),
    dirty: false,
  };
  await putLocalMeta(record);
  return toUserMeta(record);
}

export async function saveMetaLocalFirst(
  record: Omit<LocalUserMeta, "dirty"> & { dirty?: boolean }
): Promise<void> {
  const next: LocalUserMeta = { ...record, dirty: true };
  await putLocalMeta(next);
  try {
    await pushMetaRecord(next);
    await putLocalMeta({ ...next, dirty: false });
  } catch {
    // Local write already succeeded; cloud sync retries later.
  }
}

export async function getSettingsLocalFirst(
  userId: string
): Promise<LocalSettingsRecord | null> {
  const local = await getLocalSettings(userId);
  if (local) {
    return local;
  }

  const snap = await getDocCacheFirst(settingsRef(userId));
  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();
  const record: LocalSettingsRecord = {
    userId,
    lockPinHash: data.lockPinHash || null,
    autoLockTimeoutMs:
      typeof data.autoLockTimeoutMs === "number"
        ? data.autoLockTimeoutMs
        : DEFAULT_AUTO_LOCK_TIMEOUT_MS,
    biometricCredentialIds: Array.isArray(data.biometricCredentialIds)
      ? data.biometricCredentialIds
      : [],
    updatedAt: toMillis(data.updatedAt) || Date.now(),
    dirty: false,
  };
  await putLocalSettings(record);
  return record;
}

export async function saveSettingsLocalFirst(
  userId: string,
  patch: Partial<
    Pick<
      LocalSettingsRecord,
      "lockPinHash" | "autoLockTimeoutMs" | "biometricCredentialIds"
    >
  >
): Promise<LocalSettingsRecord> {
  const current = (await getLocalSettings(userId)) ?? defaultSettings(userId);
  const next: LocalSettingsRecord = {
    ...current,
    ...patch,
    userId,
    updatedAt: Date.now(),
    dirty: true,
  };
  await putLocalSettings(next);
  try {
    await pushSettingsRecord(next);
    const clean = { ...next, dirty: false };
    await putLocalSettings(clean);
    return clean;
  } catch {
    return next;
  }
}

export async function pullVaults(userId: string): Promise<void> {
  const snapshot = await getDocsCacheFirst(vaultsQuery(userId));
  const remote = snapshot.docs.map((docSnap) =>
    remoteDocToVault(userId, docSnap.id, docSnap.data())
  );
  await mergeRemoteVaults(userId, remote, {
    pruneMissing: !snapshot.metadata.fromCache,
  });
}

function remoteDocToVault(
  userId: string,
  id: string,
  data: Record<string, unknown>
): LocalVaultRecord {
  const { createdAt, updatedAt, ...payload } = data;
  return {
    userId,
    id,
    payload: payload as Record<string, unknown>,
    createdAt: toMillis(createdAt),
    updatedAt: toMillis(updatedAt) || toMillis(createdAt),
    deleted: false,
    dirty: false,
  };
}

async function mergeRemoteVaults(
  userId: string,
  remoteVaults: LocalVaultRecord[],
  options: { pruneMissing: boolean }
) {
  const localVaults = await listLocalVaults(userId);
  const localById = new Map(localVaults.map((vault) => [vault.id, vault]));
  const remoteIds = new Set(remoteVaults.map((vault) => vault.id));
  const puts: LocalVaultRecord[] = [];
  const deletes: Array<[string, string]> = [];

  for (const remote of remoteVaults) {
    const local = localById.get(remote.id);
    if (!local) {
      puts.push(remote);
      continue;
    }
    if (local.dirty && local.updatedAt >= remote.updatedAt) {
      continue;
    }
    puts.push(remote);
  }

  if (options.pruneMissing) {
    for (const local of localVaults) {
      if (remoteIds.has(local.id) || local.dirty || local.deleted) {
        continue;
      }
      deletes.push([userId, local.id]);
    }
  }

  if (puts.length === 0 && deletes.length === 0) {
    return;
  }

  await applyVaultWrites(userId, puts, deletes);
}

async function mergeRemoteMeta(userId: string, data: Record<string, unknown>) {
  const local = await getLocalMeta(userId);
  const remoteUpdated = toMillis(data.updatedAt) || toMillis(data.createdAt);
  if (local?.dirty && local.updatedAt >= remoteUpdated) {
    return;
  }

  await putLocalMeta({
    userId,
    salt: data.salt as string,
    encryptedMasterKeyByPassword: data.encryptedMasterKeyByPassword as string,
    encryptedMasterKeyByRecoveryKey:
      data.encryptedMasterKeyByRecoveryKey as string,
    encryptedUserID: data.encryptedUserID as string,
    createdAt: toMillis(data.createdAt) || Date.now(),
    updatedAt: remoteUpdated || Date.now(),
    dirty: false,
  });
}

async function mergeRemoteSettings(
  userId: string,
  data: Record<string, unknown>
) {
  const local = await getLocalSettings(userId);
  const remoteUpdated = toMillis(data.updatedAt);
  if (local?.dirty && local.updatedAt >= remoteUpdated) {
    return;
  }

  await putLocalSettings({
    userId,
    lockPinHash: (data.lockPinHash as string) || null,
    autoLockTimeoutMs:
      typeof data.autoLockTimeoutMs === "number"
        ? data.autoLockTimeoutMs
        : DEFAULT_AUTO_LOCK_TIMEOUT_MS,
    biometricCredentialIds: Array.isArray(data.biometricCredentialIds)
      ? data.biometricCredentialIds
      : [],
    updatedAt: remoteUpdated || Date.now(),
    dirty: false,
  });
}

async function pushMetaRecord(record: LocalUserMeta) {
  await setDoc(
    metaRef(record.userId),
    {
      userId: record.userId,
      salt: record.salt,
      encryptedMasterKeyByPassword: record.encryptedMasterKeyByPassword,
      encryptedMasterKeyByRecoveryKey: record.encryptedMasterKeyByRecoveryKey,
      encryptedUserID: record.encryptedUserID,
      createdAt: Timestamp.fromMillis(record.createdAt),
      updatedAt: Timestamp.fromMillis(record.updatedAt),
    },
    { merge: true }
  );
}

async function pushSettingsRecord(record: LocalSettingsRecord) {
  await setDoc(
    settingsRef(record.userId),
    {
      autoLockTimeoutMs: record.autoLockTimeoutMs,
      biometricCredentialIds: record.biometricCredentialIds,
      lockPinHash: record.lockPinHash ?? deleteField(),
      updatedAt: Timestamp.fromMillis(record.updatedAt),
    },
    { merge: true }
  );
}

async function pushVaultRecord(record: LocalVaultRecord) {
  const ref = vaultRef(record.userId, record.id);
  if (record.deleted) {
    await deleteDoc(ref);
    await deleteLocalVault(record.userId, record.id);
    return;
  }

  await setDoc(ref, {
    ...record.payload,
    createdAt: Timestamp.fromMillis(record.createdAt),
    updatedAt: Timestamp.fromMillis(record.updatedAt),
  });
}

export async function pushDirty(userId: string): Promise<void> {
  const meta = await getLocalMeta(userId);
  if (meta?.dirty) {
    try {
      await pushMetaRecord(meta);
      await putLocalMeta({ ...meta, dirty: false });
    } catch {
      // Stay dirty and retry on the next online event.
    }
  }

  const settings = await getLocalSettings(userId);
  if (settings?.dirty) {
    try {
      await pushSettingsRecord(settings);
      await putLocalSettings({ ...settings, dirty: false });
    } catch {
      // Stay dirty.
    }
  }

  const vaults = await listLocalVaults(userId);
  for (const vault of vaults) {
    if (!vault.dirty) continue;
    try {
      await pushVaultRecord(vault);
      if (!vault.deleted) {
        await putLocalVault({ ...vault, dirty: false });
      }
    } catch {
      // Stay dirty.
    }
  }
}

export async function saveVaultLocalFirst(
  record: LocalVaultRecord
): Promise<void> {
  const next = { ...record, dirty: true };
  await putLocalVault(next);
  try {
    await pushVaultRecord(next);
    if (!next.deleted) {
      await putLocalVault({ ...next, dirty: false });
    }
  } catch {
    // Local vault is already updated.
  }
}

export function ensureUserSync(userId: string) {
  if (syncControls.has(userId)) {
    void pushDirty(userId);
    return;
  }

  const unsubscribers: Unsubscribe[] = [];

  unsubscribers.push(
    onSnapshot(
      metaRef(userId),
      (snap) => {
        if (snap.exists()) {
          void mergeRemoteMeta(userId, snap.data());
        }
      },
      () => {
        // Offline or uncached — local meta remains the source of truth.
      }
    )
  );

  unsubscribers.push(
    onSnapshot(
      settingsRef(userId),
      (snap) => {
        if (snap.exists()) {
          void mergeRemoteSettings(userId, snap.data());
        }
      },
      () => {
        // Ignore remote settings errors while offline.
      }
    )
  );

  unsubscribers.push(
    onSnapshot(
      vaultsQuery(userId),
      (snapshot) => {
        const remote = snapshot.docs.map((docSnap) =>
          remoteDocToVault(userId, docSnap.id, docSnap.data())
        );
        void mergeRemoteVaults(userId, remote, {
          pruneMissing: !snapshot.metadata.fromCache,
        });
      },
      () => {
        // Ignore remote vault errors while offline.
      }
    )
  );

  const onOnline = () => {
    void pushDirty(userId);
  };
  if (typeof window !== "undefined") {
    window.addEventListener("online", onOnline);
  }

  void pushDirty(userId);

  syncControls.set(userId, () => {
    unsubscribers.forEach((unsub) => unsub());
    if (typeof window !== "undefined") {
      window.removeEventListener("online", onOnline);
    }
  });
}

export function stopUserSync(userId: string) {
  const stop = syncControls.get(userId);
  if (!stop) return;
  stop();
  syncControls.delete(userId);
}
