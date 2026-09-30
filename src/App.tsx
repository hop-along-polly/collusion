import { Route, Routes } from 'react-router-dom'

import { Layout } from './components/Layout'
import { CoursePage } from './routes/CoursePage'
import { CoursesPage } from './routes/CoursesPage'
import { DomainPage } from './routes/DomainPage'
import { HomePage } from './routes/HomePage'
import { NotePage } from './routes/NotePage'
import { NotesPage } from './routes/NotesPage'
import { NotFoundPage } from './routes/NotFoundPage'
import { QuizPage } from './routes/QuizPage'
import { SetPage } from './routes/SetPage'

/**
 * Three entities, three route families, each mirroring a directory:
 *
 *   /courses/:domainId/:courseId   courses/<domainId>/<courseId>.md
 *   /notes/:domainId/:noteId       notes/<domainId>/<noteId>.md
 *   /:domainId/:setId              flashcards/<domainId>/<setId>.json
 *
 * The card-set family is left unprefixed because those URLs predate the other two and
 * are also the progress storage key. `courses` and `notes` are declared first so they
 * are never mistaken for a domain id.
 */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />

        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:domainId/:courseId" element={<CoursePage />} />

        <Route path="notes" element={<NotesPage />} />
        <Route path="notes/:domainId/:noteId" element={<NotePage />} />

        <Route path=":domainId" element={<DomainPage />} />
        <Route path=":domainId/:setId" element={<SetPage />} />
        <Route path=":domainId/:setId/quiz" element={<QuizPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
