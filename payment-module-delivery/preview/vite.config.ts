import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ensure lucide-react resolves from the preview's node_modules
      // even when imported from source files outside the preview directory
      "lucide-react": path.resolve(__dirname, "node_modules/lucide-react"),
    },
  },
  server: {
    port: 5174,
    host: true,
  },
});
