import type { Config } from 'tailwindcss'

/**
 * A CSS custom property holding space-separated RGB channels, exposed to Tailwind so
 * that opacity modifiers resolve. See the comment on the mode-aware colours below.
 */
const channel = (token: string) => `rgb(var(${token}) / <alpha-value>)`

/**
 * CodeScribes Style Guide -> Tailwind.
 *
 * Two kinds of tokens live here on purpose:
 *
 *  1. Literal brand/semantic hexes, copied verbatim from the style guide's
 *     `tailwind.config.ts` appendix. Use these when the guide names an exact value.
 *  2. CSS-variable tokens (`surface`, `ground`, `content`, `brand`, `ok`, `bad`, ...)
 *     whose values flip in `src/styles/index.css` under `.dark`. These encode the
 *     guide's Dark Mode Addendum once, so components never need `dark:` colour pairs
 *     and can't drift from the rules (teal lightens on dark, semantic fills become
 *     transparent tints, elevation comes from surface lightness).
 */
const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- Literal brand values (style guide §2) ---
        primary: {
          DEFAULT: '#1B8996',
          light: '#2BB0BF',
          dark: '#136A74',
          muted: '#E8F6F8',
          foreground: '#FFFFFF',
        },
        ink: '#000000',
        parchment: '#F5F0E8',
        success: { DEFAULT: '#16A34A', light: '#F0FDF4', dark: '#052E16' },
        error: { DEFAULT: '#DC2626', light: '#FEF2F2', dark: '#450A0A' },
        warning: { DEFAULT: '#CA8A04', light: '#FEFCE8', dark: '#422006' },
        info: { DEFAULT: '#1B8996', light: '#E8F6F8', dark: '#0C3A3F' },

        // --- Mode-aware tokens (style guide §9) ---
        //
        // `channel()` wraps a token stored as space-separated RGB components so
        // opacity modifiers (`border-ok/40`) compile. A bare `var(--x)` holding a hex
        // cannot be split into channels and Tailwind emits nothing for the modified
        // utility — silently, which is exactly the kind of bug that ships.
        //
        // The `fill` tokens stay bare because in dark mode they are transparent tints
        // whose alpha belongs to the token; they are only used at full opacity.
        ground: channel('--ground'),
        surface: {
          DEFAULT: channel('--surface-1'),
          2: channel('--surface-2'),
          3: channel('--surface-3'),
        },
        content: {
          DEFAULT: channel('--content'),
          strong: channel('--content-strong'),
          muted: channel('--content-muted'),
          subtle: channel('--content-subtle'),
        },
        line: {
          DEFAULT: channel('--line'),
          strong: channel('--line-strong'),
        },
        brand: {
          DEFAULT: channel('--brand'),
          hover: channel('--brand-hover'),
          active: channel('--brand-active'),
          fill: 'var(--brand-fill)',
        },
        accent: {
          DEFAULT: channel('--accent'),
          border: channel('--accent-border'),
          foreground: channel('--accent-foreground'),
        },
        // `*.text` variants are darkened in light mode so body copy on a semantic
        // fill clears WCAG AA 4.5:1 — the guide's indicator hexes are tuned for
        // icons/borders (3:1) and fall short as small text on their own fills.
        ok: { DEFAULT: channel('--ok'), fill: 'var(--ok-fill)', text: channel('--ok-text') },
        bad: { DEFAULT: channel('--bad'), fill: 'var(--bad-fill)', text: channel('--bad-text') },
        warn: { DEFAULT: channel('--warn'), fill: 'var(--warn-fill)', text: channel('--warn-text') },
      },
      fontFamily: {
        heading: ['Bellefair', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Abel', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Major-third scale (1.250) from style guide §3
        xs: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        sm: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        base: ['1rem', { lineHeight: '1.625', letterSpacing: '0' }],
        lg: ['1.125rem', { lineHeight: '1.556', letterSpacing: '0' }],
        xl: ['1.25rem', { lineHeight: '1.4', letterSpacing: '0' }],
        '2xl': ['1.563rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        '3xl': ['1.953rem', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        '4xl': ['2.441rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        '5xl': ['3.052rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '6xl': ['3.815rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      maxWidth: {
        '7xl': '1280px',
      },
      ringColor: {
        DEFAULT: channel('--ring'),
      },
      ringOffsetColor: {
        DEFAULT: channel('--ground'),
      },
    },
  },
}

export default config
