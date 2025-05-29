import { AppMain } from '@/app/components/app-main';
import { ContentWrapper } from '@/app/components/content-wrapper';
import { AuthErrorBoundary } from './components/auth-error-boundary';
import { createBrowserRouter, Outlet, redirect } from 'react-router-dom';
import { OutOfAuthRoutes } from '@/app/components/out-of-auth-routes';
import { routes } from '@/shared/lib/routes';
import { AppSidebar } from '@/feature/sidebar';
import { AppHeader } from './components/app-header';
import { GlobalErrorBoundary } from './components/global-error-boundary';
import { ProtectedRoutes } from './components/protected-routes';
import { App } from './app';

export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
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
        errorElement: <AuthErrorBoundary />,
        children: [
          {
            path: routes.home.path,
            loader: () => redirect(routes.gymHome.path),
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
            path: routes.gymHome.path,
            lazy: () => import('@/page/gym-home.page'),
          },
          {
            path: '*',
            loader: () => redirect(routes.gymHome.path),
          },
        ],
      },

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
            loader: () => redirect(routes.gymHome.path),
          },
        ],
      },
    ],
  },
]);
