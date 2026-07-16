import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose the dev server on the LAN so phones/iPads on the same Wi‑Fi
  // can open it without Cursor port forwarding (which often fails on Windows).
  server: {
    host: true,
    port: 5173,
  },
})
