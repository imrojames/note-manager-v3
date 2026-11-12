import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { NotesPage } from '@/pages/NotesPage';
import { NoteEditorPage } from '@/pages/NoteEditorPage';
import { NoteViewPage } from '@/pages/NoteViewPage';
import { NoteTypesPage } from '@/pages/NoteTypesPage';
import { BreakCalculatorPage } from '@/pages/BreakCalculatorPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <NotesPage /> },
          { path: '/notes/new', element: <NoteEditorPage /> },
          { path: '/notes/:id', element: <NoteViewPage /> },
          { path: '/notes/:id/edit', element: <NoteEditorPage /> },
          { path: '/note-types', element: <NoteTypesPage /> },
          { path: '/break-calculator', element: <BreakCalculatorPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
