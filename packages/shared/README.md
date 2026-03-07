# Vault Shared Core 📦

The internal core library for the Vault ecosystem. This package ensures that business logic, security protocols, and data structures are identical across the web app and browser extension.

## 📦 Contents

### 🔐 Security (`src/lib/crypto.ts`)
- AES-256 implementation using Web Crypto API.
- Key derivation logic (PBKDF2).
- IV generation and byte management.

### 🔥 Database (`src/firebase.ts`)
- Centralized Firebase initialization.
- Type-safe helpers for vault crud operations in Firestore.

### 🧩 Logic (`src/lib/`)
- **`actions.ts`**: High-level vault operations (locking, unlocking, setup).
- **`biometric-utils.ts`**: Fingerprint/FaceID integration.
- **`types.ts`**: Common interfaces for Vault items.

## 🛠️ Usage

In other packages within the monorepo:

```json
{
  "dependencies": {
    "@vault/shared": "workspace:*"
  }
}
```

This package is designed to be **platform-agnostic** where possible, relying on standardized browser APIs (Web Crypto, Fetch).
