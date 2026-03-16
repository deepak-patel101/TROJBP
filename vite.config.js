import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows external access
    port: 5700, // Specify the port
    strictPort: true, // Use the specified port only
  },
});
