import { createBrowserRouter, Outlet, redirect } from 'react-router-dom';
import { OutOfAuthRoutes } from '@/app/components/out-of-auth-routes';
import { routes } from '@/shared/lib/routes';
import { AppSidebar } from '@/feature/sidebar';
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
            <AppSidebar>
              <Outlet />
            </AppSidebar>
          </ProtectedRoutes>
        ),
        children: [
          {
            path: routes.home.path,
            lazy: () => import('@/page/home.page'),
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
        Component: OutOfAuthRoutes,
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
