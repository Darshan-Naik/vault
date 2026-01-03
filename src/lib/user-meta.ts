import { db } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { TUserMeta } from "./types";
import {
  generateMasterKey,
  generateRecoveryKey,
  ganarateSalt,
  hashPassword,
  wrapMasterKey,
  unwrapMasterKey,
} from "./keys";
import { encrypt, decrypt } from "./crypto";

const USER_META_COLLECTION = "vault-db";

/**
 * Fetch user metadata from Firestore
 */
export async function getUserMeta(userId: string): Promise<TUserMeta | null> {
  const docRef = doc(db, USER_META_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docSnap.data() as TUserMeta;
}

/**
 * Create new user metadata during signup
 * Returns the recovery key (user must save it) and master key (to store in memory)
 */
export async function createUserMeta(
  userId: string,
  password: string
): Promise<{ recoveryKey: string; masterKey: string }> {
  // Generate cryptographic materials
  const salt = ganarateSalt();
  const masterKey = generateMasterKey();
  const recoveryKey = generateRecoveryKey();

  // Hash password and recovery key for wrapping the master key
  const hashedPassword = await hashPassword(password, userId, salt);
  const hashedRecoveryKey = await hashPassword(recoveryKey, userId, salt);

  // Wrap (encrypt) master key with both password hash and recovery key hash
  const encryptedMasterKeyByPassword = wrapMasterKey(masterKey, hashedPassword);
  const encryptedMasterKeyByRecoveryKey = wrapMasterKey(
    masterKey,
    hashedRecoveryKey
  );

  // Encrypt userId with master key for verification during unlock
  const encryptedUserID = encrypt(userId, masterKey);

  // Store metadata in Firestore
  const userMeta: TUserMeta = {
    userId,
    salt,
    encryptedMasterKeyByPassword,
    encryptedMasterKeyByRecoveryKey,
    encryptedUserID,
  };

  const docRef = doc(db, USER_META_COLLECTION, userId);
  await setDoc(docRef, {
    ...userMeta,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { recoveryKey, masterKey };
}

/**
 * Unlock vault using password
 * Returns master key if successful, null otherwise
 */
export async function unlockWithPassword(
  userMeta: TUserMeta,
  password: string
): Promise<string | null> {
  try {
    // Hash the provided password
    const hashedPassword = await hashPassword(
      password,
      userMeta.userId,
      userMeta.salt
    );

    // Try to unwrap (decrypt) the master key
    const masterKey = unwrapMasterKey(
      userMeta.encryptedMasterKeyByPassword,
      hashedPassword
    );

    // Verify decryption by checking the encrypted user ID
    const decryptedUserId = decrypt(userMeta.encryptedUserID, masterKey);

    if (decryptedUserId === userMeta.userId) {
      return masterKey;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Unlock vault using recovery key
 * Returns master key if successful, null otherwise
 */
export async function unlockWithRecoveryKey(
  userMeta: TUserMeta,
  recoveryKey: string
): Promise<string | null> {
  try {
    // Hash the recovery key
    const hashedRecoveryKey = await hashPassword(
      recoveryKey,
      userMeta.userId,
      userMeta.salt
    );

    // Try to unwrap (decrypt) the master key
    const masterKey = unwrapMasterKey(
      userMeta.encryptedMasterKeyByRecoveryKey,
      hashedRecoveryKey
    );

    // Verify decryption by checking the encrypted user ID
    const decryptedUserId = decrypt(userMeta.encryptedUserID, masterKey);

    if (decryptedUserId === userMeta.userId) {
      return masterKey;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Change password (requires old password for verification)
 * Updates the encryptedMasterKeyByPassword in Firestore
 * Returns true if successful, false if old password is incorrect
 */
export async function changePassword(
  userMeta: TUserMeta,
  oldPassword: string,
  newPassword: string
): Promise<boolean> {
  // Verify old password first
  const masterKey = await unlockWithPassword(userMeta, oldPassword);
  if (!masterKey) {
    return false;
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(
    newPassword,
    userMeta.userId,
    userMeta.salt
  );

  // Wrap master key with new password hash
  const encryptedMasterKeyByPassword = wrapMasterKey(
    masterKey,
    hashedNewPassword
  );

  // Update in Firestore
  const docRef = doc(db, USER_META_COLLECTION, userMeta.userId);
  await setDoc(
    docRef,
    {
      encryptedMasterKeyByPassword,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return true;
}

/**
 * Reset recovery key (requires password for verification)
 * Generates a new recovery key and updates encryptedMasterKeyByRecoveryKey
 * Returns the new recovery key if successful, null if password is incorrect
 */
export async function resetRecoveryKey(
  userMeta: TUserMeta,
  password: string
): Promise<string | null> {
  // Verify password first
  const masterKey = await unlockWithPassword(userMeta, password);
  if (!masterKey) {
    return null;
  }

  // Generate new recovery key
  const newRecoveryKey = generateRecoveryKey();

  // Hash the new recovery key
  const hashedRecoveryKey = await hashPassword(
    newRecoveryKey,
    userMeta.userId,
    userMeta.salt
  );

  // Wrap master key with new recovery key hash
  const encryptedMasterKeyByRecoveryKey = wrapMasterKey(
    masterKey,
    hashedRecoveryKey
  );

  // Update in Firestore
  const docRef = doc(db, USER_META_COLLECTION, userMeta.userId);
  await setDoc(
    docRef,
    {
      encryptedMasterKeyByRecoveryKey,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return newRecoveryKey;
}
