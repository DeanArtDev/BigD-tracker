import { useMe } from '@/entity/auth';
import { routes } from '@/shared/lib/routes';
import { Navigate, Outlet } from 'react-router-dom';
import { PacmanLoader } from 'react-spinners';

function PublicRoutes() {
  const { isSuccess, isError, isLoading } = useMe({ retry: 1, throwOnError: false });

  if (isLoading) {
    return (
      <div className="grow h-full w-full flex flex-col">
        <PacmanLoader className="m-auto" color="#8e51ff" size={35} />
      </div>
    );
  }

  if (isError) {
    return <Outlet />;
  }

  if (isSuccess) {
    return <Navigate to={routes.home.path} replace />;
  }

  return null;
}

export { PublicRoutes };
