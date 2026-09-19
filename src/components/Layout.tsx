import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import { listDomains } from '@/data/catalog'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/cn'
import { Icon } from './ui/Icon'

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      // The label states the action, not the state, so it is unambiguous when read aloud.
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className="flex h-11 w-11 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-surface-2 hover:text-content"
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={20} />
    </button>
  )
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg py-1" aria-label="Scribe Cards, home">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-primary-light">
        <Icon name="book" size={18} />
      </span>
      <span className="font-heading text-2xl leading-none text-content-strong">Scribe Cards</span>
    </Link>
  )
}

/**
 * Moves focus to the main landmark on every navigation. Without this a single-page app
 * leaves focus on the link that was clicked, so keyboard and screen-reader users have
 * to tab back through the header to reach the new page's content.
 */
function useFocusMainOnNavigate() {
  const { pathname } = useLocation()
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    ref.current?.focus()
    window.scrollTo({ top: 0 })
  }, [pathname])

  return ref
}

export function Layout() {
  const mainRef = useFocusMainOnNavigate()
  const domains = listDomains()

  return (
    <div className="flex min-h-dvh flex-col bg-ground">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
        {/*
          Mobile puts the domain nav on its own row (`order-3 w-full`) so a narrow
          screen never squeezes the brand or clips a link; from `sm` up everything
          sits on one line.
        */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:flex-nowrap sm:px-6 lg:px-8">
          <Brand />

          <nav
            aria-label="Domains"
            className="order-3 -mx-1 flex w-full items-center gap-1 overflow-x-auto sm:order-2 sm:mx-0 sm:ml-auto sm:w-auto sm:overflow-visible"
          >
            {domains.map((domain) => (
              <NavLink
                key={domain.id}
                to={`/${domain.id}`}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[44px] shrink-0 items-center rounded-lg px-3 font-body text-sm transition-colors',
                    isActive
                      ? 'bg-brand-fill text-brand'
                      : 'text-content-muted hover:bg-surface-2 hover:text-content',
                  )
                }
              >
                {domain.title}
              </NavLink>
            ))}
          </nav>

          <div className="order-2 ml-auto sm:order-3 sm:ml-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 focus:outline-none sm:px-6 lg:px-8 lg:py-12"
      >
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 font-body text-sm text-content-muted sm:px-6 lg:px-8">
          <p>
            Every card is generated from the Markdown study notes in this repository and cites the
            file it came from.{' '}
            <a
              href="https://github.com/hop-along-polly/collusion"
              className="inline-flex items-center gap-1 text-brand underline-offset-2 hover:underline"
            >
              View the notes
              <Icon name="external" size={14} />
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
