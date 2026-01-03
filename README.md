# Vault

A secure, zero-knowledge password and secrets manager with end-to-end encryption. Your data is encrypted on your device before it ever leaves — we can't read it, and neither can anyone else.

## Features

- **Zero-Knowledge Security** — Your password and recovery key are never stored or transmitted
- **End-to-End Encryption** — All vault data is encrypted client-side using AES-256-CBC
- **Master Key Architecture** — A unique master key encrypts your data, protected by your password
- **Recovery Key Backup** — One-time recovery key for password reset (invalidated after use)
- **PIN Quick Unlock** — Fast re-entry after inactivity without re-entering your password
- **Biometric Support** — Use fingerprint or face recognition for quick unlock
- **PWA Ready** — Install as a native-like app on any device
- **Google Authentication** — Secure sign-in with your Google account

## Security Architecture

### How It Works

1. **Account Setup**

   - You create a password (never sent to servers)
   - A unique master key is generated locally
   - Master key is encrypted with your password hash (PBKDF2, 310,000 iterations)
   - A one-time recovery key is generated for password recovery
   - Only encrypted data is stored in the cloud

2. **Unlocking Your Vault**

   - Your password is hashed locally
   - The hash decrypts your master key
   - Master key decrypts your vault data
   - Everything happens on your device

3. **Password Recovery**
   - Recovery key unlocks the master key
   - You set a new password
   - A new recovery key is generated (old one is invalidated)
   - This ensures recovery keys can only be used once

### What We Store

- Encrypted master key (protected by your password hash)
- Encrypted master key (protected by your recovery key hash)
- Your encrypted vault data
- Salt for key derivation

### What We Never Store

- Your password
- Your recovery key
- Your master key (unencrypted)
- Any unencrypted vault data

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Firebase project with Firestore enabled

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd vault

# Install dependencies
bun install
# or
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Firebase config to .env.local

# Start development server
bun dev
# or
npm run dev
```

### Environment Variables

Create a `.env.local` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Building for Production

```bash
bun run build
# or
npm run build
```

## Security Considerations

- All cryptographic operations use the Web Crypto API for non-blocking performance
- Password hashing uses PBKDF2 with 310,000 iterations (OWASP recommendation)
- Master key is AES-256 (256-bit)
- Recovery keys are one-time use only
- No sensitive data is ever logged or stored unencrypted
