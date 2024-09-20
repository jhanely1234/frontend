import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      manifest: {
        icons: [
          {
            src: "/512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => {
              if (url.protocol === "http:" || url.protocol === "https:") {
                return true;
              }
              return false;
            },
            handler: "CacheFirst" /* or 'StaleWhileRevalidate' */,
            options: {
              cacheName: "api-cache",
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
        ]
      },
    }),
  ],
  build: {
    target: 'esnext', // This enables top-level await
  },
  esbuild: {
    supported: {
      'top-level-await': true // This also helps with top-level await support
    },
  },
});
