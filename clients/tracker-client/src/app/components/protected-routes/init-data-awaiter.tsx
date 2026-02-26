import { setIsAuth, useMe } from '@/entity/auth';
import { routes } from '@/shared/lib/routes';
import { type ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { PacmanLoader } from 'react-spinners';

function InitDataAwaiter({ children }: { children: ReactNode }) {
  const { isSuccess, isLoading, isError } = useMe({ retry: 1 });

  useEffect(() => {
    if (isError) {
      setIsAuth(false);
      return;
    }

    if (isSuccess) {
      setIsAuth(true);
      return;
    }
  }, [isError, isSuccess]);

  if (isLoading) {
    return (
      <div className="grow h-dvh flex flex-col">
        <PacmanLoader className="m-auto" color="#8e51ff" size={35} />
      </div>
    );
  }

  if (isError) {
    return <Navigate to={routes.login.path} replace />;
  }

  if (isSuccess) {
    return children;
  }

  return null;
}

export { InitDataAwaiter };
