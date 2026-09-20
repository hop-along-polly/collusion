import { useCallback, useEffect, useState } from 'react'

/**
 * Theme handling, following the style guide's class strategy (§9): an explicit user
 * choice is stored and wins over the OS preference. The initial class is applied by an
 * inline script in `index.html` before first paint, so this hook only has to stay in
 * sync with it — it must never be the thing that first applies the class, or dark mode
 * would flash white on load.
 */

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'scribe-cards.theme'

function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Storage blocked — the toggle still works for this session.
    }
  }, [theme])

  // Follow the OS only while the learner has made no explicit choice.
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      try {
        if (window.localStorage.getItem(STORAGE_KEY)) return
      } catch {
        /* fall through and follow the OS */
      }
      setTheme(event.matches ? 'dark' : 'light')
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggle }
}
