import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { Spinner } from '@/components/ui';

// Lazy-load pages so each route (and heavy deps like the markdown renderer)
// is a separate chunk, keeping the initial bundle small.
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const NotesPage = lazy(() => import('@/pages/NotesPage').then((m) => ({ default: m.NotesPage })));
const NoteEditorPage = lazy(() =>
  import('@/pages/NoteEditorPage').then((m) => ({ default: m.NoteEditorPage })),
);
const NoteViewPage = lazy(() =>
  import('@/pages/NoteViewPage').then((m) => ({ default: m.NoteViewPage })),
);
const NoteTypesPage = lazy(() =>
  import('@/pages/NoteTypesPage').then((m) => ({ default: m.NoteTypesPage })),
);
const BreakCalculatorPage = lazy(() =>
  import('@/pages/BreakCalculatorPage').then((m) => ({ default: m.BreakCalculatorPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

const s = (el: ReactNode) => <Suspense fallback={<PageFallback />}>{el}</Suspense>;

export const router = createBrowserRouter([
  { path: '/login', element: s(<LoginPage />) },
  { path: '/register', element: s(<RegisterPage />) },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: s(<NotesPage />) },
          { path: '/notes/new', element: s(<NoteEditorPage />) },
          { path: '/notes/:id', element: s(<NoteViewPage />) },
          { path: '/notes/:id/edit', element: s(<NoteEditorPage />) },
          { path: '/note-types', element: s(<NoteTypesPage />) },
          { path: '/break-calculator', element: s(<BreakCalculatorPage />) },
        ],
      },
    ],
  },
  { path: '*', element: s(<NotFoundPage />) },
]);
