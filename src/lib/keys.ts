import { decrypt, encrypt, generateUID, hash } from "./crypto";


// Hash password for the vault using salt
export async function hashPassword(
    password: string,
    uid: string,
    salt: string
  ) {
    return hash(password + uid,salt);
  }

  // Wrap master key for the vault using wrapping key (password or recovery key)
  export function wrapMasterKey(
    masterKey: string,
    wrappingKey: string
  ) {
    return encrypt(masterKey,wrappingKey);
  }

  // Unwrap master key for the vault using wrapping key (password or recovery key)
  export function unwrapMasterKey(
    wrappedMasterKey: string,
    wrappingKey: string
  ) {
    return decrypt(wrappedMasterKey,wrappingKey);
  }

  // Generate master key for the vault
  export const generateMasterKey = () => {
    return generateUID();
  }

  // Generate recovery key for the vault
  export const generateRecoveryKey = () => {
    return generateUID();
  }

  // Generate salt for the vault
  export const ganarateSalt = () => {
    return generateUID(12);
  }