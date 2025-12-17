/**
 * Biometric authentication utilities using WebAuthn API
 * Supports Face ID, Touch ID, Windows Hello, and Android fingerprint
 */

import { db } from "@/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
} from "firebase/firestore";

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

// Get user settings document reference
const getUserSettingsRef = (userId: string) => {
  return doc(db, "user-settings", userId);
};

// Store credential ID in Firestore
export const saveBiometricCredential = async (
  userId: string,
  credentialId: string
): Promise<void> => {
  try {
    const userSettingsRef = getUserSettingsRef(userId);
    await setDoc(
      userSettingsRef,
      { biometricCredentialId: credentialId },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving biometric credential:", error);
    throw new Error("Failed to save biometric credential");
  }
};

// Load credential ID from Firestore
export const loadBiometricCredential = async (
  userId: string
): Promise<string | null> => {
  try {
    const userSettingsRef = getUserSettingsRef(userId);
    const userSettingsSnap = await getDoc(userSettingsRef);

    if (userSettingsSnap.exists()) {
      const data = userSettingsSnap.data();
      return data.biometricCredentialId || null;
    }

    return null;
  } catch (error) {
    console.error("Error loading biometric credential:", error);
    return null;
  }
};

// Delete biometric credential from Firestore
export const deleteBiometricCredential = async (
  userId: string
): Promise<void> => {
  try {
    const userSettingsRef = getUserSettingsRef(userId);
    await updateDoc(userSettingsRef, { biometricCredentialId: deleteField() });
  } catch (error) {
    console.error("Error deleting biometric credential:", error);
    throw new Error("Failed to delete biometric credential");
  }
};

// Register biometric credential (Face ID/fingerprint enrollment)
export const registerBiometric = async (
  userId: string,
  userName: string
): Promise<boolean> => {
  try {
    const challenge = generateChallenge();

    // Create credential options
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
          authenticatorAttachment: "platform", // Use platform authenticator (Face ID, Touch ID, etc.)
          userVerification: "required",
          residentKey: "preferred",
        },
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

    // Store credential ID
    const credentialId = arrayBufferToBase64(credential.rawId);
    await saveBiometricCredential(userId, credentialId);

    return true;
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

// Authenticate using biometric (Face ID/fingerprint verification)
export const authenticateWithBiometric = async (
  credentialId: string
): Promise<boolean> => {
  try {
    const challenge = generateChallenge();

    // Create authentication options
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
      {
        challenge,
        allowCredentials: [
          {
            id: base64ToArrayBuffer(credentialId),
            type: "public-key",
            transports: ["internal"],
          },
        ],
        userVerification: "required",
        timeout: 60000,
      };

    // Get assertion
    const assertion = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential | null;

    if (!assertion) {
      return false;
    }

    // If we got here, biometric verification was successful
    return true;
  } catch (error) {
    console.error("Error authenticating with biometric:", error);
    if (error instanceof Error && error.name === "NotAllowedError") {
      // User cancelled or verification failed
      return false;
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
