# Vault 🔐

A secure, zero-knowledge password and secrets manager with end-to-end encryption. Your data is encrypted on your device before it ever leaves — we can't read it, and neither can anyone else.

Vault is structured as a **PNPM Monorepo**, sharing a unified security core across the web application and browser extension.

## 🏗️ Monorepo Structure

- **`apps/web`**: The main Vault web application (React + Vite + PWA).
- **`apps/extension`**: The Vault browser extension (Manifest V3) for autofill and secure management.
- **`packages/shared`**: The core library containing encryption, Firebase logic, and state management used by both apps.

## ✨ Features

- **Zero-Knowledge Security** — Your password and recovery key are never stored or transmitted.
- **End-to-End Encryption** — All vault data is encrypted client-side using AES-256-GCM.
- **Compact Auto-Fill Prompt** — Modern, discreet extension UI for lightning-fast logins.
- **Master Key Architecture** — Unique master keys per user, protected by PBKDF2 (310,000 iterations).
- **Zero-Storage Extension** — Sensitive keys stay in RAM only; when the browser closes, the vault locks.
- **Recovery Key Backup** — Secure one-time-use recovery key for password reset.
- **Google Authentication** — Secure sign-in with your Google account.

## 🛠️ Development

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+

### Installation

```bash
# Install dependencies from root
pnpm install

# Build all packages and apps
pnpm -r run build

# Start development for both Web and Extension
pnpm dev
```

### Environment Variables

Create a `.env.local` in `apps/web` and `apps/extension` with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 🚀 Deployment

- **Web App**: Automatically deployed to Firebase Hosting on merge to `main`.
- **Extension**:
  1. Build the production bundle: `pnpm -r run build`
  2. Zip the contents of `apps/extension/dist`
  3. Upload to the Chrome Web Store Developer Console.

## 🔒 Security Summary

- **Encryption**: AES-256 (Web Crypto API).
- **Hashing**: PBKDF2 with 310,000 iterations.
- **Key Derivation**: Salted and generated entirely on the device.
- **Data Persistence**: Only encrypted blobs touch the Firebase database.
