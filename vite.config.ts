import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: "script",
      includeAssets: ["logo.jpeg"],
      manifest: {
        name: "Vault - Password Manager",
        short_name: "Vault",
        description: "Store your passwords securely",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "logo.jpeg",
            sizes: "any",
            type: "image/jpeg",
          },
          {
            src: "logo.jpeg",
            sizes: "192x192",
            type: "image/jpeg",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        navigationPreload: true,
        globPatterns: ["**/*.{js,css,html}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "fonts",
            },
          },
        ],
      },
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
    },
  }

});
