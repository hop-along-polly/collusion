import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/**
 * Kept separate from `vite.config.ts` on purpose: Vitest ships its own pinned copy of
 * Vite, and merging the two configs makes the plugin types collide. None of the app's
 * build config — base path, chunking — matters here.
 *
 * Two environments: `node` for the pure layers (`*.test.ts`) and `jsdom` for the
 * component integration tests (`*.test.tsx`), selected per file by the
 * `environmentMatchGlobs` entry below.
 */
export default defineConfig({
  // @ts-expect-error - Vitest bundles its own Vite copy, so the plugin types differ
  // nominally from the app's. The plugin itself is the same one the app builds with.
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
    environmentMatchGlobs: [['src/**/*.test.tsx', 'jsdom']],
    setupFiles: ['src/test/setup.ts'],
    globals: false,
    restoreMocks: true,
  },
})
