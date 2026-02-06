import { AppMain } from './components/app-main';
import { ContentWrapper } from './components/content-wrapper';
import { OutOfAuthRoutes } from './components/out-of-auth-routes';
import { RouterErrorBoundary } from './components/router-error-boundary';
import { AppSidebar } from '@/feature/sidebar';
import { routes } from '@/shared/lib/routes';
import { createBrowserRouter, Outlet, redirect } from 'react-router-dom';
import { App } from './app';
import { AppHeader } from './components/app-header';
import { AuthErrorBoundary } from './components/auth-error-boundary';
import { ProtectedRoutes } from './components/protected-routes';

export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        errorElement: <AuthErrorBoundary />,
        element: (
          <ProtectedRoutes>
            <AppSidebar />

            <ContentWrapper className="md:pl-0">
              <AppHeader />

              <AppMain>
                <Outlet />
              </AppMain>
            </ContentWrapper>
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
        ],
      },

      // Public routes
      {
        element: (
          <ContentWrapper>
            <OutOfAuthRoutes />
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

          {
            path: '*',
            loader: () => redirect(routes.home.path),
          },
        ],
      },
    ],
  },
]);
