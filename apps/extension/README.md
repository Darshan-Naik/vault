# Vault Extension 🧩

The official Chrome/Edge extension for Vault. It provides secure autofill, credential detection, and quick-save features using the shared Vault security core.

## 🚀 Features

- **Match Detection**: Automatically detects login fields and prompts for autofill.
- **Compact View**: Minimalist "Simple Prompt" UI when matching credentials are found.
- **Zero-Persistence**: Master keys are kept in the background service worker's memory (RAM only) for maximum security.
- **Unified Logic**: Reuses the exact same encryption and Firestore logic as the main web app via `@vault/shared`.

## 🛠️ Development

Run from the root of the project:
```bash
pnpm dev
```

### Loading in Browser
1. Open Chrome/Edge and go to `chrome://extensions`.
2. Enable "Developer mode".
3. Click "Load unpacked".
4. Select the `apps/extension/dist` folder (ensure you have run `pnpm -r run build` or have the dev server running).

## 📦 Production Build

```bash
pnpm run build
```
The production bundle will be generated in the `dist` folder. Zip this folder for submission to the Web Store.

## 🛡️ Manifest Permissions

- `activeTab` & `host_permissions`: To detect and fill login forms.
- `scripting`: To securely inject autofill data.
- `storage`: To save local preferences.
- `notifications`: Feeeback for save/update actions.
