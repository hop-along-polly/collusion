import { Route, Routes } from 'react-router-dom'

import { Layout } from './components/Layout'
import { DomainPage } from './routes/DomainPage'
import { HomePage } from './routes/HomePage'
import { NotFoundPage } from './routes/NotFoundPage'
import { QuizPage } from './routes/QuizPage'
import { SetPage } from './routes/SetPage'

/**
 * Routes mirror the data directory exactly: `/:domainId/:setId` corresponds to
 * `data/<domainId>/<setId>/cards.json`, which is also the progress storage key. Adding
 * a card set therefore needs no route changes.
 */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path=":domainId" element={<DomainPage />} />
        <Route path=":domainId/:setId" element={<SetPage />} />
        <Route path=":domainId/:setId/quiz" element={<QuizPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
