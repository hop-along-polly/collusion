import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { App } from './App'
import { ProgressProvider } from './hooks/useProgress'
import './styles/index.css'

/**
 * `import.meta.env.BASE_URL` is `/` now that the site has its own domain, and `/<repo>/`
 * for a deployment under a GitHub Pages project path, so the router's basename tracks
 * whatever `vite.config.ts` was told to use rather than assuming either.
 */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

const container = document.getElementById('root')
if (!container) throw new Error('#root element is missing from index.html')

createRoot(container).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </BrowserRouter>
  </StrictMode>,
)
