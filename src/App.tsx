import { Route, Routes } from 'react-router-dom'

import { Layout } from './components/Layout'
import { CoursePage } from './routes/CoursePage'
import { CourseQuizPage } from './routes/CourseQuizPage'
import { CoursesPage } from './routes/CoursesPage'
import { DomainPage } from './routes/DomainPage'
import { HomePage } from './routes/HomePage'
import { NotePage } from './routes/NotePage'
import { NotesPage } from './routes/NotesPage'
import { NotFoundPage } from './routes/NotFoundPage'

/**
 * Two things a learner navigates, each mirroring a directory:
 *
 *   /courses/:domainId/:courseId   courses/<domainId>/<courseId>.md
 *   /notes/:domainId/:noteId       notes/<domainId>/<noteId>.md
 *
 * Flashcards have no route of their own. A card set is an authoring unit, not a
 * destination: cards are only ever launched from a course, so that results are recorded
 * against the certification being studied for. `/:domainId` lists both for one company.
 */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />

        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:domainId/:courseId" element={<CoursePage />} />
        <Route path="courses/:domainId/:courseId/quiz" element={<CourseQuizPage />} />

        <Route path="notes" element={<NotesPage />} />
        <Route path="notes/:domainId/:noteId" element={<NotePage />} />

        <Route path=":domainId" element={<DomainPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
