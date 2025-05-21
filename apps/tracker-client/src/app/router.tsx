import { createBrowserRouter, redirect } from 'react-router-dom';
import { routes } from '@/shared/lib/routes';
import { GlobalErrorBoundary } from './components/global-error-boundary';
import { ProtectedRoutes } from './components/protected-routes';
import { App } from './app';

export const router = createBrowserRouter([
  {
    element: <App />,

    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        Component: ProtectedRoutes,
        children: [
          {
            path: routes.home.path,
            lazy: () => import('@/page/dashboard.page'),
          },
          {
            path: '*',
            loader: () => redirect(routes.home.path),
          },
        ],
      },

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
]);
