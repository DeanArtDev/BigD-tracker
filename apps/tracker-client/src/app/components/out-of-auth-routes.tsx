import { useAccessTokenStore, useAuthStore } from '@/entity/auth';
import { routes } from '@/shared/lib/routes';
import { Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

function OutOfAuthRoutes() {
  const isAuth = useAuthStore((state) => state.isAuth);
  const accessToken = useAccessTokenStore((state) => state.accessToken);

  if (isAuth || accessToken != null) return <Navigate to={routes.gymHome.path} />;
  return <Outlet />;
}

export { OutOfAuthRoutes };
