import { AppGlobalSidebar } from '@/app/components/global-sidebar';
import { ContentWrapper } from '@/shared/components/content-wrapper';
import { routes } from '@/shared/lib/routes';
import { createBrowserRouter, Outlet, redirect } from 'react-router-dom';
import { App } from './app';
import { ProtectedRoutes } from './components/protected-routes';
import { PublicRoutes } from './components/public-routes';
import { RouterErrorBoundary } from './components/router-error-boundary';

export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <RouterErrorBoundary homeHref={routes.home.path} />,
    children: [
      {
        element: (
          <ProtectedRoutes>
            <AppGlobalSidebar>
              <Outlet />
            </AppGlobalSidebar>
          </ProtectedRoutes>
        ),
        children: [
          {
            path: routes.home.path,
            loader: () => redirect(routes.planner.path),
          },

          /* GYM */
          {
            path: routes.gym.path,
            lazy: () => import('@/page/gym/gym.page'),
          },
          {
            path: routes.gymTrainings.path,
            lazy: () => import('@/page/gym-training'),
          },
          {
            path: routes.gymDashboard.path,
            lazy: () => import('@/page/gym-dashboard.page'),
          },
          {
            path: routes.gymExercises.path,
            lazy: () => import('@/page/gym-exercises'),
          },
          {
            path: routes.gymActiveTraining.path,
            lazy: () => import('@/page/gym-active-training'),
          },
          {
            path: routes.gymPrograms.path,
            lazy: () => import('@/page/gym-programs.page'),
          },

          /* PLANNER */
          {
            path: routes.planner.path,
            lazy: () => import('@/page/planner/planner.page'),
          },
          {
            path: routes.plannerInBox.path,
            lazy: () => import('@/page/planner/inbox/inbox.page'),
          },
          {
            path: routes.plannerGroupList.path,
            lazy: () => import('@/page/planner/group-list'),
          },
          {
            path: routes.plannerGroup.path,
            lazy: () => import('@/page/planner/group'),
          },
          {
            path: routes.plannerDiary.path,
            lazy: () => import('@/page/planner/diary/diary.page'),
          },
          {
            path: routes.plannerTasks.path,
            lazy: () => import('@/page/planner/tasks/tasks.page'),
          },

          /* SYSTEM */
          {
            path: routes.settings.path,
            lazy: () => import('@/page/settings/settings.page'),
          },
        ],
      },

      // Public routes
      {
        element: (
          <ContentWrapper>
            <PublicRoutes />
          </ContentWrapper>
        ),
        children: [
          {
            path: routes.signUp.path,
            lazy: () => import('@/page/sign-up.page'),
          },
          {
            path: routes.login.path,
            lazy: () => import('@/page/login.page'),
          },
        ],
      },

      {
        path: '*',
        lazy: () => import('@/page/404.page'),
      },
    ],
  },
]);
