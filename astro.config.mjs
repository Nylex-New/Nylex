// @ts-check
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://nylex.online",
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("@react-three/drei")) return "drei";
              if (id.includes("@react-three/fiber")) return "fiber";
              if (id.includes("three")) return "three-core";
              if (id.includes("react") || id.includes("react-dom")) return "react";
              if (id.includes("gsap")) return "gsap";
              return "vendor";
            }
          },
        },
      },
    },
  },
  integrations: [react()],
});

