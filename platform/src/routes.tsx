import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RouteError } from '@/components/layout/RouteError';
import { ProgressDashboard } from '@/components/progress/ProgressDashboard';
import { ModuleView } from '@/components/module/ModuleView';
import { LessonView } from '@/components/lesson/LessonView';
import { ExerciseView } from '@/components/exercise/ExerciseView';
import { StepView } from '@/components/module/StepView';
import { StyleGuide } from '@/components/styleguide/StyleGuide';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    // Catches thrown render errors anywhere below, and unmatched URLs via the
    // `*` route. Without it react-router shows its own unstyled stack trace.
    errorElement: <RouteError />,
    children: [
      { index: true, element: <ProgressDashboard /> },
      { path: 'styleguide', element: <StyleGuide /> },
      { path: 'module/:id', element: <ModuleView /> },
      { path: 'module/:id/step/:stepIndex', element: <StepView /> },
      // Legacy routes (still work for direct links)
      { path: 'module/:id/lesson', element: <LessonView /> },
      { path: 'module/:id/exercise/:exId', element: <ExerciseView /> },
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
