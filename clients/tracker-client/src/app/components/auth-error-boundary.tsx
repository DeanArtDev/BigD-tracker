import { routes } from '@/shared/lib/routes';
import { isExceptionUnauthorized } from '@big-d/api-exceptions';
import { Navigate, useRouteError } from 'react-router-dom';

function AuthErrorBoundary() {
  const error = useRouteError();
  if (isExceptionUnauthorized(error)) return <Navigate to={routes.login.path} />;
  throw error;
}

export { AuthErrorBoundary };
