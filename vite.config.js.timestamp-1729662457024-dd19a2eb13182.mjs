// vite.config.js
import { defineConfig } from "file:///C:/Users/Reny/Desktop/BACKEND%20JHANELY/FRONTEND/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Reny/Desktop/BACKEND%20JHANELY/FRONTEND/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///C:/Users/Reny/Desktop/BACKEND%20JHANELY/FRONTEND/frontend/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  esbuild: {
    target: "esnext"
    // Soporte para top-level await
  },
  build: {
    target: ["esnext"]
    // Configura el target para navegadores modernos
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "robots.txt",
        "apple-touch-icon.png",
        "masked-icon.svg"
      ],
      manifest: {
        name: "Medi-Consulta",
        short_name: "Medi-Consulta",
        description: "Descripci\xF3n de mi aplicaci\xF3n PWA",
        theme_color: "#ffffff",
        icons: [
          {
            src: "192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      devOptions: {
        enabled: false,
        // Activa el PWA en desarrollo si lo deseas
        type: "module",
        navigateFallback: "index.html"
      },
      workbox: {
        globDirectory: "dist",
        globPatterns: ["**/*.{js,css,html,wasm,png,jpg,svg,json}"],
        // Cachear todos los archivos estáticos
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            // Cachea todos los archivos estáticos
            handler: "CacheFirst",
            // Prioriza cache para modo offline
            options: {
              cacheName: "static-assets-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30
                // 30 días
              }
            }
          },
          {
            // Cachea todas las rutas que empiecen con las URLs de tus APIs
            urlPattern: new RegExp(
              `^https://mediconsulta\\.zapto\\.org/(auth|reservas/api|reporte/api|pacientes/api|medicos/api|historiales/api|especialidades/api|consultas/api)`
            ),
            handler: "NetworkFirst",
            // Estrategia NetworkFirst para tener los datos más recientes cuando haya red
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7
                // 1 semana
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxSZW55XFxcXERlc2t0b3BcXFxcQkFDS0VORCBKSEFORUxZXFxcXEZST05URU5EXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxSZW55XFxcXERlc2t0b3BcXFxcQkFDS0VORCBKSEFORUxZXFxcXEZST05URU5EXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9SZW55L0Rlc2t0b3AvQkFDS0VORCUyMEpIQU5FTFkvRlJPTlRFTkQvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIGVzYnVpbGQ6IHtcclxuICAgIHRhcmdldDogJ2VzbmV4dCcsIC8vIFNvcG9ydGUgcGFyYSB0b3AtbGV2ZWwgYXdhaXRcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICB0YXJnZXQ6IFsnZXNuZXh0J10sIC8vIENvbmZpZ3VyYSBlbCB0YXJnZXQgcGFyYSBuYXZlZ2Fkb3JlcyBtb2Rlcm5vc1xyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIFZpdGVQV0Eoe1xyXG4gICAgICByZWdpc3RlclR5cGU6IFwiYXV0b1VwZGF0ZVwiLFxyXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbXHJcbiAgICAgICAgXCJmYXZpY29uLnN2Z1wiLFxyXG4gICAgICAgIFwicm9ib3RzLnR4dFwiLFxyXG4gICAgICAgIFwiYXBwbGUtdG91Y2gtaWNvbi5wbmdcIixcclxuICAgICAgICBcIm1hc2tlZC1pY29uLnN2Z1wiLFxyXG4gICAgICBdLFxyXG4gICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgIG5hbWU6IFwiTWVkaS1Db25zdWx0YVwiLFxyXG4gICAgICAgIHNob3J0X25hbWU6IFwiTWVkaS1Db25zdWx0YVwiLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkRlc2NyaXBjaVx1MDBGM24gZGUgbWkgYXBsaWNhY2lcdTAwRjNuIFBXQVwiLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiBcIiNmZmZmZmZcIixcclxuICAgICAgICBpY29uczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6IFwiMTkyeDE5Mi5wbmdcIixcclxuICAgICAgICAgICAgc2l6ZXM6IFwiMTkyeDE5MlwiLFxyXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiBcIjUxMng1MTIucG5nXCIsXHJcbiAgICAgICAgICAgIHNpemVzOiBcIjUxMng1MTJcIixcclxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogXCI1MTJ4NTEyLnBuZ1wiLFxyXG4gICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXHJcbiAgICAgICAgICAgIHB1cnBvc2U6IFwiYW55IG1hc2thYmxlXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICAgIGRldk9wdGlvbnM6IHtcclxuICAgICAgICBlbmFibGVkOiBmYWxzZSwgLy8gQWN0aXZhIGVsIFBXQSBlbiBkZXNhcnJvbGxvIHNpIGxvIGRlc2Vhc1xyXG4gICAgICAgIHR5cGU6IFwibW9kdWxlXCIsXHJcbiAgICAgICAgbmF2aWdhdGVGYWxsYmFjazogXCJpbmRleC5odG1sXCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIHdvcmtib3g6IHtcclxuICAgICAgICBnbG9iRGlyZWN0b3J5OiBcImRpc3RcIixcclxuICAgICAgICBnbG9iUGF0dGVybnM6IFtcIioqLyoue2pzLGNzcyxodG1sLHdhc20scG5nLGpwZyxzdmcsanNvbn1cIl0sIC8vIENhY2hlYXIgdG9kb3MgbG9zIGFyY2hpdm9zIGVzdFx1MDBFMXRpY29zXHJcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogKHsgdXJsIH0pID0+IHVybC5vcmlnaW4gPT09IHNlbGYubG9jYXRpb24ub3JpZ2luLCAvLyBDYWNoZWEgdG9kb3MgbG9zIGFyY2hpdm9zIGVzdFx1MDBFMXRpY29zXHJcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiQ2FjaGVGaXJzdFwiLCAvLyBQcmlvcml6YSBjYWNoZSBwYXJhIG1vZG8gb2ZmbGluZVxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiBcInN0YXRpYy1hc3NldHMtY2FjaGVcIixcclxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAyMDAsXHJcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzMCwgLy8gMzAgZFx1MDBFRGFzXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIENhY2hlYSB0b2RhcyBsYXMgcnV0YXMgcXVlIGVtcGllY2VuIGNvbiBsYXMgVVJMcyBkZSB0dXMgQVBJc1xyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiBuZXcgUmVnRXhwKFxyXG4gICAgICAgICAgICAgIGBeaHR0cHM6Ly9tZWRpY29uc3VsdGFcXFxcLnphcHRvXFxcXC5vcmcvKGF1dGh8cmVzZXJ2YXMvYXBpfHJlcG9ydGUvYXBpfHBhY2llbnRlcy9hcGl8bWVkaWNvcy9hcGl8aGlzdG9yaWFsZXMvYXBpfGVzcGVjaWFsaWRhZGVzL2FwaXxjb25zdWx0YXMvYXBpKWBcclxuICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgaGFuZGxlcjogXCJOZXR3b3JrRmlyc3RcIiwgLy8gRXN0cmF0ZWdpYSBOZXR3b3JrRmlyc3QgcGFyYSB0ZW5lciBsb3MgZGF0b3MgbVx1MDBFMXMgcmVjaWVudGVzIGN1YW5kbyBoYXlhIHJlZFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiBcImFwaS1jYWNoZVwiLFxyXG4gICAgICAgICAgICAgIG5ldHdvcmtUaW1lb3V0U2Vjb25kczogMTAsXHJcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogMTAwLFxyXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogNywgLy8gMSBzZW1hbmFcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7XHJcbiAgICAgICAgICAgICAgICBzdGF0dXNlczogWzAsIDIwMF0sXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVXLFNBQVMsb0JBQW9CO0FBQ3BZLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFFeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsUUFBUTtBQUFBO0FBQUEsRUFDVjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUSxDQUFDLFFBQVE7QUFBQTtBQUFBLEVBQ25CO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlO0FBQUEsUUFDYjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsU0FBUztBQUFBO0FBQUEsUUFDVCxNQUFNO0FBQUEsUUFDTixrQkFBa0I7QUFBQSxNQUNwQjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1AsZUFBZTtBQUFBLFFBQ2YsY0FBYyxDQUFDLDBDQUEwQztBQUFBO0FBQUEsUUFDekQsZ0JBQWdCO0FBQUEsVUFDZDtBQUFBLFlBQ0UsWUFBWSxDQUFDLEVBQUUsSUFBSSxNQUFNLElBQUksV0FBVyxLQUFLLFNBQVM7QUFBQTtBQUFBLFlBQ3RELFNBQVM7QUFBQTtBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ1AsV0FBVztBQUFBLGNBQ1gsWUFBWTtBQUFBLGdCQUNWLFlBQVk7QUFBQSxnQkFDWixlQUFlLEtBQUssS0FBSyxLQUFLO0FBQUE7QUFBQSxjQUNoQztBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsVUFDQTtBQUFBO0FBQUEsWUFFRSxZQUFZLElBQUk7QUFBQSxjQUNkO0FBQUEsWUFDRjtBQUFBLFlBQ0EsU0FBUztBQUFBO0FBQUEsWUFDVCxTQUFTO0FBQUEsY0FDUCxXQUFXO0FBQUEsY0FDWCx1QkFBdUI7QUFBQSxjQUN2QixZQUFZO0FBQUEsZ0JBQ1YsWUFBWTtBQUFBLGdCQUNaLGVBQWUsS0FBSyxLQUFLLEtBQUs7QUFBQTtBQUFBLGNBQ2hDO0FBQUEsY0FDQSxtQkFBbUI7QUFBQSxnQkFDakIsVUFBVSxDQUFDLEdBQUcsR0FBRztBQUFBLGNBQ25CO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
