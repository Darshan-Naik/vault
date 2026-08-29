import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: [
        "logo.jpeg",
        "apple-touch-icon.png",
        "favicon.ico",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "pwa-maskable-192x192.png",
        "pwa-maskable-512x512.png",
      ],
      manifest: {
        name: "Vault - Password Manager",
        short_name: "Vault",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "any",
        background_color: "#0f0f0f",
        theme_color: "#0f0f0f",
        description: "Store your passwords securely, including offline",
        categories: ["utilities", "security"],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigationPreload: true,
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,jpeg,jpg,webp,woff,woff2,webmanifest}",
        ],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/__/],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "fonts-stylesheets",
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "fonts-webfonts",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/lh[0-9]\.googleusercontent\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-avatars",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  envDir: "../../",
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@vault/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          crypto: ["crypto-js"],
          ui: ["lucide-react", "clsx", "tailwind-merge"],
        },
      },
    },
  },
});
