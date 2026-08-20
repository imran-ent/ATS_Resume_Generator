import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules\/(react|react-dom|react-router|react-router-dom|@remix-run)/,
            },
            {
              name: 'vendor-forms',
              test: /node_modules\/(react-hook-form|@hookform|zod)/,
            },
            {
              name: 'vendor-data',
              test: /node_modules\/(zustand|@tanstack|date-fns)/,
            },
          ],
        },
      },
    },
  },
})