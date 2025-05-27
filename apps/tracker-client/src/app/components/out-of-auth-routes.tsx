import { useAccessTokenStore, useAuthStore, useDropEverything } from '@/entity/auth';
import { routes } from '@/shared/lib/routes';
import { Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

function OutOfAuthRoutes() {
  const isAuth = useAuthStore((state) => state.isAuth);
  const accessToken = useAccessTokenStore((state) => state.accessToken);
  const drop = useDropEverything();
  if (isAuth || accessToken != null) return <Navigate to={routes.gymHome.path} />;
  drop();
  return <Outlet />;
}

export { OutOfAuthRoutes };
