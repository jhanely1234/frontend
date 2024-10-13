import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  esbuild: {
    target: 'esnext' // Soporte para top-level await
  },
  build: {
    target: ['esnext'] // Configura el target para navegadores modernos
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "robots.txt",
        "apple-touch-icon.png",
        "masked-icon.svg",
      ],
      manifest: {
        name: "Medi-Consulta",
        short_name: "Medi-Consulta",
        description: "Descripción de mi aplicación PWA",
        theme_color: "#ffffff",
        icons: [
          {
            src: "192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      devOptions: {
        enabled: false, // Activa el PWA en desarrollo si lo deseas
        type: "module",
        navigateFallback: "index.html",
      },
      workbox: {
        globDirectory: "dist",
        globPatterns: ["**/*.{js,css,html,wasm,png,jpg,svg,json}"], // Ajuste para cachear todos los archivos
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 día
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              !url.pathname.startsWith("/api/"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "assets-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 semana
              },
            },
          },
        ],
      },
    }),
  ],
});
