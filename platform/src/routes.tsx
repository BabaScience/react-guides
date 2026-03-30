import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProgressDashboard } from '@/components/progress/ProgressDashboard';
import { ModuleView } from '@/components/module/ModuleView';
import { LessonView } from '@/components/lesson/LessonView';
import { ExerciseView } from '@/components/exercise/ExerciseView';
import { StepView } from '@/components/module/StepView';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <ProgressDashboard /> },
      { path: 'module/:id', element: <ModuleView /> },
      { path: 'module/:id/step/:stepIndex', element: <StepView /> },
      // Legacy routes (still work for direct links)
      { path: 'module/:id/lesson', element: <LessonView /> },
      { path: 'module/:id/exercise/:exId', element: <ExerciseView /> },
    ],
  },
]);
