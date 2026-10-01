import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/**
 * Kept separate from `vite.config.ts` on purpose: Vitest ships its own pinned copy of
 * Vite, and merging the two configs makes the plugin types collide. None of the app's
 * build config - base path, chunking - matters here.
 *
 * Two environments: `node` for the pure layers (`*.test.ts`) and `jsdom` for the
 * component integration tests (`*.test.tsx`). Vitest 4 removed `environmentMatchGlobs`,
 * so the split is expressed as two projects instead. `extends: true` makes each one
 * inherit the plugins, the `@` alias and the setup file from this config rather than
 * repeating them.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    setupFiles: ['src/test/setup.ts'],
    globals: false,
    restoreMocks: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'pure',
          include: ['src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'components',
          include: ['src/**/*.test.tsx'],
          environment: 'jsdom',
        },
      },
    ],
  },
})
