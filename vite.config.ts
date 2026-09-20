import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub Pages serves project sites from `https://<user>.github.io/<repo>/`, so the
 * bundle needs a matching base path. `BASE_PATH` lets CI (or a fork with a different
 * repo name) override it without editing code; local dev stays at `/`.
 */
const base = process.env.BASE_PATH ?? (process.env.NODE_ENV === 'production' ? '/collusion/' : '/')

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    // Card sets are code-split per set (see src/data/loader.ts), so keep chunk
    // warnings meaningful by lowering the noise floor.
    chunkSizeWarningLimit: 600,
  },
})
