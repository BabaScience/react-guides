// This file is the route table, not a component module — it exports `router`
// alongside the lazy route components, which is exactly what the fast-refresh
// rule warns about. Editing routes reloads the app anyway.
/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RouteError } from '@/components/layout/RouteError';
import { ProgressDashboard } from '@/components/progress/ProgressDashboard';

/**
 * The dashboard is the landing route, so it stays in the entry chunk. Every
 * other route is split: a reader working through lessons never downloads the
 * exercise runner, and nobody downloads the style guide.
 */
const ModuleView = lazy(() =>
  import('@/components/module/ModuleView').then((m) => ({ default: m.ModuleView }))
);
const StepView = lazy(() =>
  import('@/components/module/StepView').then((m) => ({ default: m.StepView }))
);
const LessonView = lazy(() =>
  import('@/components/lesson/LessonView').then((m) => ({ default: m.LessonView }))
);
const ExerciseView = lazy(() =>
  import('@/components/exercise/ExerciseView').then((m) => ({ default: m.ExerciseView }))
);
const StyleGuide = lazy(() =>
  import('@/components/styleguide/StyleGuide').then((m) => ({ default: m.StyleGuide }))
);
const GlossaryView = lazy(() =>
  import('@/components/glossary/GlossaryView').then((m) => ({ default: m.GlossaryView }))
);

/** Skeleton shown while a route chunk is in flight. */
function RouteFallback() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8" aria-busy="true">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
    </div>
  );
}

const suspended = (node: ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{node}</Suspense>
);

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    // Catches thrown render errors anywhere below, and unmatched URLs via the
    // `*` route. Without it react-router shows its own unstyled stack trace.
    errorElement: <RouteError />,
    children: [
      { index: true, element: <ProgressDashboard /> },
      { path: 'styleguide', element: suspended(<StyleGuide />) },
      { path: 'glossary', element: suspended(<GlossaryView />) },
      { path: 'module/:id', element: suspended(<ModuleView />) },
      { path: 'module/:id/step/:stepIndex', element: suspended(<StepView />) },
      // Legacy routes (still work for direct links)
      { path: 'module/:id/lesson', element: suspended(<LessonView />) },
      { path: 'module/:id/exercise/:exId', element: suspended(<ExerciseView />) },
      {
        path: '*',
        loader: () => {
          throw new Response('Not Found', { status: 404, statusText: 'Not Found' });
        },
        element: null,
      },
    ],
  },
]);
