import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 80,
    host: '0.0.0.0',
  },
  preview: {
    port: 80,
    host: '0.0.0.0',
  },
})
