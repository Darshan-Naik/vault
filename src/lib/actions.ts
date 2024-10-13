import { db } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { TVault } from "./types";

export const getVaults = async (userId: string) => {
  const vaultCollection = collection(db, "vault-db");
  const userVaultsCollection = doc(vaultCollection, userId);

  const q = query(
    collection(userVaultsCollection, "vaults"),
    orderBy("createdAt", "asc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    return { ...doc.data(), id: doc.id };
  }) as TVault[];
};

export const addVault = async (params: {
  userId: string;
  vaultData: Omit<TVault, "id">;
}) => {
  const vaultCollection = collection(db, "vault-db");
  const userVaultsCollection = doc(vaultCollection, params.userId);
  const userVaultsSubCollection = collection(userVaultsCollection, "vaults");

  const newVaultRef = await addDoc(userVaultsSubCollection, {
    ...params.vaultData,
    createdAt: serverTimestamp(),
  });
  return { id: newVaultRef.id, ...params.vaultData };
};

export const updateVault = async (params: {
  userId: string;
  vaultId: string;
  vaultData: Partial<TVault>;
}) => {
  const vaultCollection = collection(db, "vault-db");
  const userVaultsCollection = doc(vaultCollection, params.userId);
  const vaultsSubCollection = collection(userVaultsCollection, "vaults");
  const vaultDocRef = doc(vaultsSubCollection, params.vaultId);

  await updateDoc(vaultDocRef, {
    ...params.vaultData,
    updatedAt: serverTimestamp(),
  });

  return { id: params.vaultId, ...params.vaultData };
};

export const deleteVault = async (params: {
  userId: string;
  vaultId: string;
}) => {
  const vaultCollection = collection(db, "vault-db");
  const userVaultsCollection = doc(vaultCollection, params.userId);
  const vaultsSubCollection = collection(userVaultsCollection, "vaults");
  const vaultDocRef = doc(vaultsSubCollection, params.vaultId);

  await deleteDoc(vaultDocRef);

  return { id: params.vaultId };
};
