import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  envDir: "../../",
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      port: 5174
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@vault/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts")
    }
  }
});
