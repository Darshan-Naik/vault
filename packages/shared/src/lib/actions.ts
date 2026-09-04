import { TVault } from "./types";
import { decryptData, encryptData } from "./crypto";
import { sanitizeCustomFields } from "./configs";
import {
  listActiveLocalVaults,
  subscribeLocalChange,
} from "./local-store";
import {
  ensureUserSync,
  pullVaults,
  saveVaultLocalFirst,
} from "./local-sync";

const newVaultId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;

const toRawVault = (record: {
  id: string;
  payload: Record<string, unknown>;
}) => ({
  ...record.payload,
  id: record.id,
});

export const getVaults = async (userId: string, masterKey: string) => {
  const vaults = await getRawVaults(userId);
  return vaults.map((raw) => decryptData(raw, masterKey)) as TVault[];
};

export const getRawVaults = async (userId: string) => {
  ensureUserSync(userId);
  let records = await listActiveLocalVaults(userId);
  if (records.length === 0) {
    try {
      await pullVaults(userId);
    } catch {
      // Stay on whatever is already local (possibly empty).
    }
    records = await listActiveLocalVaults(userId);
  }
  return records.map(toRawVault);
};

export const subscribeVaults = (
  userId: string,
  masterKey: string,
  onData: (vaults: TVault[]) => void,
  onError?: (error: Error) => void
) => {
  let stopped = false;
  ensureUserSync(userId);

  const emit = async () => {
    if (stopped) return;
    try {
      const records = await listActiveLocalVaults(userId);
      const vaults = records.map((record) =>
        decryptData(toRawVault(record), masterKey)
      ) as TVault[];
      onData(vaults);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  };

  const unsubscribe = subscribeLocalChange("vaults", userId, () => {
    void emit();
  });

  void (async () => {
    const local = await listActiveLocalVaults(userId);
    if (stopped) return;
    if (local.length === 0) {
      try {
        await pullVaults(userId);
      } catch (error) {
        const stillEmpty = (await listActiveLocalVaults(userId)).length === 0;
        if (!stopped && stillEmpty) {
          onError?.(
            error instanceof Error ? error : new Error(String(error))
          );
          return;
        }
      }
    }
    await emit();
  })();

  return () => {
    stopped = true;
    unsubscribe();
  };
};

export const addVault = async (params: {
  userId: string;
  masterKey: string;
  vaultData: Omit<TVault, "id">;
}) => {
  const id = newVaultId();
  const now = Date.now();
  const vaultData = {
    ...params.vaultData,
    customFields: sanitizeCustomFields(params.vaultData.customFields),
  };
  const encrypted = encryptData(vaultData, params.masterKey) as Record<
    string,
    unknown
  >;
  delete encrypted.id;

  await saveVaultLocalFirst({
    userId: params.userId,
    id,
    payload: encrypted,
    createdAt: now,
    updatedAt: now,
    deleted: false,
    dirty: true,
  });

  return { id, ...vaultData };
};

export const updateVault = async (params: {
  userId: string;
  masterKey: string;
  vaultId: string;
  vaultData: Partial<TVault>;
}) => {
  const existing = (await listActiveLocalVaults(params.userId)).find(
    (vault) => vault.id === params.vaultId
  );
  const vaultData = {
    ...params.vaultData,
    customFields: sanitizeCustomFields(params.vaultData.customFields),
  };
  const encrypted = encryptData(vaultData, params.masterKey) as Record<
    string,
    unknown
  >;
  delete encrypted.id;

  await saveVaultLocalFirst({
    userId: params.userId,
    id: params.vaultId,
    payload: {
      ...(existing?.payload ?? {}),
      ...encrypted,
    },
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
    deleted: false,
    dirty: true,
  });

  return { id: params.vaultId, ...vaultData };
};

export const deleteVault = async (params: {
  userId: string;
  vaultId: string;
}) => {
  const existing = (await listActiveLocalVaults(params.userId)).find(
    (vault) => vault.id === params.vaultId
  );

  await saveVaultLocalFirst({
    userId: params.userId,
    id: params.vaultId,
    payload: existing?.payload ?? {},
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
    deleted: true,
    dirty: true,
  });

  return { id: params.vaultId };
};
