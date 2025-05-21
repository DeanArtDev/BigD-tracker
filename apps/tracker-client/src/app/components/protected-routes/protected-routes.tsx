import { useAccessTokenStore } from '@/entity/auth';
import { routes } from '@/shared/lib/routes';
import { Navigate } from 'react-router-dom';
import { InitDataAwaiter } from './init-data-awaiter';
import { Suspense } from 'react';

function ProtectedRoutes() {
  const accessToken = useAccessTokenStore((state) => state.accessToken);

  if (accessToken == null) return <Navigate to={routes.login.path} />;
  return (
    <Suspense fallback="Какой то заебательский спиннер с Loading ..... ">
      <InitDataAwaiter />
    </Suspense>
  );
}

export { ProtectedRoutes };
