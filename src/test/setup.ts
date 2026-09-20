/**
 * jsdom environment shims.
 *
 * jsdom implements no CSS media query engine, so `matchMedia` is missing entirely.
 * The theme hook uses it to follow the OS preference. Stub it as "light, never
 * changes", which is the state component tests should run in.
 */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// jsdom has no layout engine, so scrolling is unimplemented and logs a noisy stack
// every time the layout restores scroll position on navigation.
if (typeof window !== 'undefined') {
  window.scrollTo = () => {}
}
