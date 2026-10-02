import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * The site is served from the root of its own domain, `flashcards.codescribes.io`, so the
 * base path is `/`.
 *
 * `BASE_PATH` is kept as an override for a deployment that is not at a domain root: a
 * GitHub Pages project site lives at `https://<owner>.github.io/<repo>/` and needs
 * `/<repo>/` instead, which is what a fork without its own domain would want.
 */
const base = process.env.BASE_PATH ?? '/'

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
