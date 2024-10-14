import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  esbuild: {
    target: 'esnext', // Soporte para top-level await
  },
  build: {
    target: ['esnext'], // Configura el target para navegadores modernos
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
        globPatterns: ["**/*.{js,css,html,wasm,png,jpg,svg,json}"], // Cachear todos los archivos estáticos
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin, // Cachea todos los archivos estáticos
            handler: "CacheFirst", // Prioriza cache para modo offline
            options: {
              cacheName: "static-assets-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
            },
          },
          {
            // Cachea todas las rutas que empiecen con las URLs de tus APIs
            urlPattern: new RegExp(
              `^https://mediconsulta\\.zapto\\.org/(auth|reservas/api|reporte/api|pacientes/api|medicos/api|historiales/api|especialidades/api|consultas/api)`
            ),
            handler: "NetworkFirst", // Estrategia NetworkFirst para tener los datos más recientes cuando haya red
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 semana
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
