import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
test: {
    globals: true,
    setupFiles: ['./test/setup.ts'], // adjust path as needed
    environment: 'jsdom',
  },
})
