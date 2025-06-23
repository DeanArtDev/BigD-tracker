import { setIsAuth, useMeSuspense } from '@/entity/auth';
import { routes } from '@/shared/lib/routes';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

function InitDataAwaiter({ children }: { children: ReactNode }) {
  const { isSuccess, isError } = useMeSuspense();

  if (isError) {
    setIsAuth(false);
    return <Navigate to={routes.login.path} />;
  }
  if (isSuccess) {
    return children;
  }
}

export { InitDataAwaiter };
