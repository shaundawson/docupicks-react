import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: './runtimeConfig', replacement: './runtimeConfig.browser' },
    ],
  },
  define: {
    global: 'window',
    'process.env': {},
  },
  build: {
    outDir: 'build', // <-- This is the key line
  },
});
