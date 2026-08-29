/**
 * Biometric authentication utilities using WebAuthn API
 * Platform authenticators (Face ID, Touch ID, Windows Hello) are per-device.
 * Each device registers its own passkey and stores PRF-wrapped keys locally.
 */

import { getSettingsLocalFirst, saveSettingsLocalFirst } from "./local-sync";
import {
  clearLocalCredentialId,
  clearMasterKeyLocally,
  hasBiometricSecret,
  loadLocalCredentialId,
  saveLocalCredentialId,
} from "./biometric-storage";

// Check if WebAuthn is available
export const isBiometricAvailable = async (): Promise<boolean> => {
  if (!window.PublicKeyCredential) {
    return false;
  }

  try {
    // Check if platform authenticator is available (Face ID, Touch ID, Windows Hello, etc.)
    const available =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch {
    return false;
  }
};

// Generate a random challenge
const generateChallenge = (): ArrayBuffer => {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  return challenge.buffer as ArrayBuffer;
};

// Convert ArrayBuffer to base64 string
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Convert base64 string to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Add credential ID (supports multiple devices)
export const saveBiometricCredential = async (
  userId: string,
  credentialId: string
): Promise<void> => {
  const settings = await getSettingsLocalFirst(userId);
  const credentialIds = settings?.biometricCredentialIds ?? [];
  if (!credentialIds.includes(credentialId)) {
    credentialIds.push(credentialId);
  }
  await saveSettingsLocalFirst(userId, { biometricCredentialIds: credentialIds });
};

// Load credential IDs that can be used on THIS device only.
export const loadBiometricCredentials = async (
  userId: string
): Promise<string[]> => {
  try {
    const localId = await loadLocalCredentialId(userId);
    if (localId) {
      return [localId];
    }

    // Migration: this device enrolled before local credential IDs were stored.
    if (await hasBiometricSecret(userId)) {
      const settings = await getSettingsLocalFirst(userId);
      return settings?.biometricCredentialIds ?? [];
    }

    return [];
  } catch (error) {
    console.error("Error loading biometric credentials:", error);
    return [];
  }
};

// Disable biometric on this device only; leave other devices enrolled.
export const deleteBiometricCredential = async (
  userId: string
): Promise<void> => {
  const localId = await loadLocalCredentialId(userId);
  await clearLocalCredentialId(userId);
  await clearMasterKeyLocally(userId);

  if (!localId) {
    return;
  }

  const settings = await getSettingsLocalFirst(userId);
  const credentialIds = (settings?.biometricCredentialIds ?? []).filter(
    (id) => id !== localId
  );
  await saveSettingsLocalFirst(userId, { biometricCredentialIds: credentialIds });
};

// Register biometric credential (Face ID/fingerprint enrollment) with PRF support
export const registerBiometric = async (
  userId: string,
  userName: string
): Promise<ArrayBuffer | null> => {
  try {
    const challenge = generateChallenge();

    // Create credential options with PRF extension
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
      {
        challenge,
        rp: {
          name: "Vault",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId).buffer as ArrayBuffer,
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "required",
        },
        extensions: {
          prf: {}, // Request PRF (Pseudo-Random Function) support
        } as any,
        timeout: 60000,
        attestation: "none",
      };

    // Create credential
    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new Error("Failed to create credential");
    }

    // Check if PRF was actually enabled and get results
    const extensionResults = credential.getClientExtensionResults() as any;
    let entropy: ArrayBuffer | null = null;
    
    if (extensionResults.prf && extensionResults.prf.enabled) {
      // In some implementations, the creation ceremony might also return a first result
      // but usually we might need to authenticate immediately after to get it,
      // OR the PRF extension might provide it in 'results' if supported.
      if (extensionResults.prf.results && extensionResults.prf.results.first) {
        entropy = extensionResults.prf.results.first;
      }
    }

    // Store credential ID on this device and in the account registry
    const credentialId = arrayBufferToBase64(credential.rawId);
    await saveLocalCredentialId(userId, credentialId);
    await saveBiometricCredential(userId, credentialId);

    return entropy || new ArrayBuffer(0); // Return empty buffer if PRF enabled but no immediate result
  } catch (error) {
    console.error("Error registering biometric:", error);
    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        throw new Error("Biometric authentication was cancelled");
      }
      if (error.name === "NotSupportedError") {
        throw new Error(
          "Biometric authentication is not supported on this device"
        );
      }
    }
    throw new Error("Failed to register biometric");
  }
};

// Fixed salt for PRF key derivation
const PRF_SALT = new TextEncoder().encode("vault-app-biometric-salt-v1");

// Authenticate using this device's passkey and derive PRF entropy
export const authenticateWithBiometric = async (
  userId: string
): Promise<ArrayBuffer | null> => {
  const credentialIds = await loadBiometricCredentials(userId);
  if (credentialIds.length === 0) {
    return null;
  }

  try {
    const challenge = generateChallenge();

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
      {
        challenge,
        rpId: window.location.hostname,
        allowCredentials: credentialIds.map((credentialId) => ({
          id: base64ToArrayBuffer(credentialId),
          type: "public-key" as const,
          transports: ["internal"],
        })),
        userVerification: "required",
        extensions: {
          prf: {
            eval: {
              first: PRF_SALT,
            },
          },
        } as any,
        timeout: 60000,
      };

    const assertion = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential | null;

    if (!assertion) {
      return null;
    }

    await saveLocalCredentialId(userId, arrayBufferToBase64(assertion.rawId));

    const extensionResults = assertion.getClientExtensionResults() as any;
    if (extensionResults.prf && extensionResults.prf.results) {
      return extensionResults.prf.results.first;
    }

    console.warn("Biometric auth succeeded but PRF results are missing");
    return null;
  } catch (error) {
    console.error("Error authenticating with biometric:", error);
    if (error instanceof Error && error.name === "NotAllowedError") {
      return null;
    }
    throw error;
  }
};

// Get friendly name for biometric type based on platform
export const getBiometricName = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad/.test(userAgent)) {
    return "Face ID";
  }
  if (/macintosh/.test(userAgent)) {
    return "Touch ID";
  }
  if (/android/.test(userAgent)) {
    return "Fingerprint";
  }
  if (/windows/.test(userAgent)) {
    return "Windows Hello";
  }

  return "Biometric";
};
