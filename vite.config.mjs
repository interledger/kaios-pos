// vite.config.ts
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "@routes": "/src/routes",
      "@pages": "/src/pages",
      "@components": "/src/components",
      "@state": "/src/state",
      "@services": "/src/services",
      "@lib": "/src/lib",
    },
  },
});
