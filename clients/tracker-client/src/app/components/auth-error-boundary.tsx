import { isExceptionUnauthorized } from '@/entity/auth/model/errors';
import { ClientTimeoutError } from '@/shared/api/exceptions';
import { routes } from '@/shared/lib/routes';
import { Navigate, useRouteError } from 'react-router-dom';

function AuthErrorBoundary() {
  const error = useRouteError();
  if (isExceptionUnauthorized(error)) return <Navigate to={routes.login.path} />;
  if (error instanceof ClientTimeoutError) return;
  throw error;
}

export { AuthErrorBoundary };
